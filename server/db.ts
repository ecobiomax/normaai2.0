import { and, desc, eq, gte, lte, sql, sum, count, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  sharesPurchases,
  dailyEarnings,
  shareholderEarnings,
  withdrawals,
  affiliateLinks,
  notifications,
  platformSettings,
  InsertUser,
  InsertSharesPurchase,
  InsertWithdrawal,
  InsertAffiliateLink,
  InsertNotification,
  InsertDailyEarning,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? undefined;
}

export async function updateUserProfile(
  userId: number,
  data: {
    fullName?: string;
    cpf?: string;
    phone?: string;
    pixKey?: string;
    pixKeyType?: "cpf" | "email" | "phone" | "random";
    profileComplete?: boolean;
    joinedWhatsapp?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      fullName: users.fullName,
      email: users.email,
      cpf: users.cpf,
      phone: users.phone,
      totalShares: users.totalShares,
      availableBalance: users.availableBalance,
      totalEarned: users.totalEarned,
      profileComplete: users.profileComplete,
      pixKey: users.pixKey,
      pixKeyType: users.pixKeyType,
      joinedWhatsapp: users.joinedWhatsapp,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function getAllUsers(page: number = 1, limit: number = 20) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  const offset = (page - 1) * limit;
  const [userList, totalResult] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        fullName: users.fullName,
        email: users.email,
        totalShares: users.totalShares,
        availableBalance: users.availableBalance,
        totalEarned: users.totalEarned,
        profileComplete: users.profileComplete,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.totalShares))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(users),
  ]);
  return { users: userList, total: totalResult[0]?.count ?? 0 };
}

// ============ SHARES HELPERS ============

export async function createSharesPurchase(data: Omit<InsertSharesPurchase, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sharesPurchases).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateSharesPurchaseStatus(
  id: number,
  data: {
    wooviChargeId?: string;
    pixQrCode?: string;
    pixCopyPaste?: string;
    status?: "pending" | "paid" | "expired" | "cancelled";
    paidAt?: Date;
    lockUntil?: Date;
    canSell?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(sharesPurchases).set(data).where(eq(sharesPurchases.id, id));
}

export async function getSharesPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(sharesPurchases)
    .where(eq(sharesPurchases.userId, userId))
    .orderBy(desc(sharesPurchases.createdAt));
}

export async function confirmSharesPurchase(correlationId: string) {
  const db = await getDb();
  if (!db) return null;

  const purchases = await db
    .select()
    .from(sharesPurchases)
    .where(eq(sharesPurchases.wooviCorrelationId, correlationId))
    .limit(1);

  const purchase = purchases[0];
  if (!purchase || purchase.status === "paid") return purchase;

  const now = new Date();
  const lockUntil = new Date(now);
  lockUntil.setMonth(lockUntil.getMonth() + 12);

  await db
    .update(sharesPurchases)
    .set({ status: "paid", paidAt: now, lockUntil })
    .where(eq(sharesPurchases.id, purchase.id));

  // Update user's total shares
  await db
    .update(users)
    .set({ totalShares: sql`${users.totalShares} + ${purchase.quantity}` })
    .where(eq(users.id, purchase.userId));

  // Create notification
  await createNotification({
    userId: purchase.userId,
    type: "share_purchase_confirmed",
    title: "Compra de Cotas Confirmada!",
    message: `Sua compra de ${purchase.quantity} cota(s) foi confirmada. Bem-vindo(a) à Gluuu!`,
  });

  return purchase;
}

export async function checkAndUnlockShares(userId: number) {
  const db = await getDb();
  if (!db) return { unlocked: 0 };

  const now = new Date();
  const lockedPurchases = await db
    .select()
    .from(sharesPurchases)
    .where(
      and(
        eq(sharesPurchases.userId, userId),
        eq(sharesPurchases.status, "paid"),
        eq(sharesPurchases.canSell, false),
        lte(sharesPurchases.lockUntil, now)
      )
    );

  if (lockedPurchases.length === 0) return { unlocked: 0 };

  for (const purchase of lockedPurchases) {
    await db
      .update(sharesPurchases)
      .set({ canSell: true })
      .where(eq(sharesPurchases.id, purchase.id));
  }

  return { unlocked: lockedPurchases.length };
}

// ============ EARNINGS HELPERS ============

export async function createDailyEarning(data: {
  date: string;
  totalCommission: number;
  notes?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const distributedAmount = data.totalCommission * 0.95;
  const retainedAmount = data.totalCommission * 0.05;

  // Count total sold shares and active shareholders
  const sharesResult = await db
    .select({ total: sum(users.totalShares), shareholders: count() })
    .from(users)
    .where(gte(users.totalShares, 1));

  const totalShares = Number(sharesResult[0]?.total ?? 0);
  const activeShareholders = Number(sharesResult[0]?.shareholders ?? 0);

  const result = await db.insert(dailyEarnings).values({
    date: data.date as unknown as Date,
    totalCommission: distributedAmount.toFixed(2) as unknown as string,
    distributedAmount: distributedAmount.toFixed(2) as unknown as string,
    retainedAmount: retainedAmount.toFixed(2) as unknown as string,
    totalSharesAtTime: totalShares,
    activeShareholdersAtTime: activeShareholders,
    notes: data.notes,
    createdBy: data.createdBy,
  });

  return { id: Number(result[0].insertId), totalShares, activeShareholders, distributedAmount };
}

export async function distributeEarnings(dailyEarningId: number) {
  const db = await getDb();
  if (!db) return;

  const earningResult = await db
    .select()
    .from(dailyEarnings)
    .where(eq(dailyEarnings.id, dailyEarningId))
    .limit(1);

  const earning = earningResult[0];
  if (!earning) return;

  const distributedAmount = Number(earning.distributedAmount);
  const totalShares = earning.totalSharesAtTime;

  if (totalShares === 0) return;

  // Get all shareholders with shares
  const shareholders = await db
    .select({ id: users.id, totalShares: users.totalShares })
    .from(users)
    .where(gte(users.totalShares, 1));

  for (const shareholder of shareholders) {
    const percentage = shareholder.totalShares / totalShares;
    const amount = distributedAmount * percentage;
    const amountCents = Math.round(amount * 100);

    if (amountCents <= 0) continue;

    // Insert earning record
    await db.insert(shareholderEarnings).values({
      userId: shareholder.id,
      dailyEarningId,
      date: earning.date,
      sharesAtTime: shareholder.totalShares,
      percentageAtTime: percentage.toFixed(6) as unknown as string,
      amount: amount.toFixed(4) as unknown as string,
      amountCents,
    });

    // Update user balance
    await db
      .update(users)
      .set({
        availableBalance: sql`${users.availableBalance} + ${amountCents}`,
        totalEarned: sql`${users.totalEarned} + ${amountCents}`,
      })
      .where(eq(users.id, shareholder.id));

    // Create notification
    await createNotification({
      userId: shareholder.id,
      type: "earning_credited",
      title: "Lucros Creditados!",
      message: `R$ ${amount.toFixed(2)} foram creditados na sua conta referente ao dia ${earning.date}.`,
      metadata: JSON.stringify({ earningId: dailyEarningId, amount }),
    });
  }
}

export async function getShareholderEarnings(userId: number, period: string) {
  const db = await getDb();
  if (!db) return [];

  let dateFilter: Date | undefined;
  const now = new Date();

  if (period === "7d") {
    dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "30d") {
    dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (period === "90d") {
    dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else if (period === "365d") {
    dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }

  const query = db
    .select()
    .from(shareholderEarnings)
    .where(
      dateFilter
        ? and(eq(shareholderEarnings.userId, userId), gte(shareholderEarnings.date, dateFilter))
        : eq(shareholderEarnings.userId, userId)
    )
    .orderBy(desc(shareholderEarnings.date));

  return query;
}

export async function getDailyEarnings(limit: number = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dailyEarnings)
    .orderBy(desc(dailyEarnings.date))
    .limit(limit);
}

// ============ WITHDRAWALS HELPERS ============

export async function createWithdrawal(data: Omit<InsertWithdrawal, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deduct from available balance
  await db
    .update(users)
    .set({ availableBalance: sql`${users.availableBalance} - ${data.amountCents}` })
    .where(eq(users.id, data.userId));

  const result = await db.insert(withdrawals).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateWithdrawalStatus(
  id: number,
  data: {
    status?: "pending" | "processing" | "completed" | "failed" | "cancelled";
    wooviPaymentId?: string;
    processedAt?: Date;
    failureReason?: string;
  }
) {
  const db = await getDb();
  if (!db) return;

  // If failed, refund balance
  if (data.status === "failed" || data.status === "cancelled") {
    const withdrawal = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, id))
      .limit(1);

    if (withdrawal[0]) {
      await db
        .update(users)
        .set({ availableBalance: sql`${users.availableBalance} + ${withdrawal[0].amountCents}` })
        .where(eq(users.id, withdrawal[0].userId));
    }
  }

  await db.update(withdrawals).set(data).where(eq(withdrawals.id, id));
}

export async function getWithdrawals(userId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (userId !== undefined) conditions.push(eq(withdrawals.userId, userId));
  if (status) conditions.push(eq(withdrawals.status, status as "pending" | "processing" | "completed" | "failed" | "cancelled"));

  const query = db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt));

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}

// ============ NOTIFICATIONS HELPERS ============

export async function createNotification(data: Omit<InsertNotification, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

// ============ AFFILIATE LINKS HELPERS ============

export async function getAffiliateLinks(activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(affiliateLinks).orderBy(desc(affiliateLinks.createdAt));
  if (activeOnly) {
    return query.where(eq(affiliateLinks.isActive, true));
  }
  return query;
}

export async function createAffiliateLink(data: Omit<InsertAffiliateLink, "id" | "createdAt" | "updatedAt" | "clickCount">) {
  const db = await getDb();
  if (!db) return;
  await db.insert(affiliateLinks).values(data);
}

export async function updateAffiliateLink(id: number, data: Partial<InsertAffiliateLink>) {
  const db = await getDb();
  if (!db) return;
  await db.update(affiliateLinks).set(data).where(eq(affiliateLinks.id, id));
}

export async function incrementLinkClick(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(affiliateLinks)
    .set({ clickCount: sql`${affiliateLinks.clickCount} + 1` })
    .where(eq(affiliateLinks.id, id));
}

// ============ PLATFORM SETTINGS HELPERS ============

export async function getPlatformSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(platformSettings);
}

export async function getPlatformSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, key))
    .limit(1);
  return result[0]?.value ?? null;
}

export async function updatePlatformSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(platformSettings)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

// ============ PLATFORM STATS ============

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return null;

  const [
    userStats,
    sharesStats,
    earningsStats,
    withdrawalStats,
  ] = await Promise.all([
    db.select({ total: count(), withShares: sum(users.totalShares) }).from(users),
    db
      .select({ totalSold: sum(sharesPurchases.quantity) })
      .from(sharesPurchases)
      .where(eq(sharesPurchases.status, "paid")),
    db.select({ totalDistributed: sum(dailyEarnings.distributedAmount) }).from(dailyEarnings),
    db
      .select({ totalWithdrawn: sum(withdrawals.amount) })
      .from(withdrawals)
      .where(eq(withdrawals.status, "completed")),
  ]);

  return {
    totalUsers: Number(userStats[0]?.total ?? 0),
    totalSharesSold: Number(sharesStats[0]?.totalSold ?? 0),
    totalSharesAvailable: 1000000 - Number(sharesStats[0]?.totalSold ?? 0),
    totalDistributed: Number(earningsStats[0]?.totalDistributed ?? 0),
    totalWithdrawn: Number(withdrawalStats[0]?.totalWithdrawn ?? 0),
  };
}
