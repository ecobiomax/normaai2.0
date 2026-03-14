import { eq, and, lt, desc, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  subscriptions,
  videos,
  payments,
  webhookEvents,
  InsertUser,
  InsertSubscription,
  InsertVideo,
  InsertPayment,
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

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const fields = ["name", "email", "loginMethod", "phone", "image"] as const;
  for (const field of fields) {
    const value = user[field];
    if (value !== undefined) {
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  }

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
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return result[0];
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(subscriptions).values(data);
  return result;
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function incrementVideosUsed(subscriptionId: number) {
  const db = await getDb();
  if (!db) return;
  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1);
  if (sub[0]) {
    await db
      .update(subscriptions)
      .set({ videosUsed: sub[0].videosUsed + 1 })
      .where(eq(subscriptions.id, subscriptionId));
  }
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export async function createVideo(data: InsertVideo) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(videos).values(data);
  return result[0];
}

export async function getVideoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return result[0];
}

export async function getVideosByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(videos)
    .where(eq(videos.userId, userId))
    .orderBy(desc(videos.createdAt));
}

export async function updateVideo(id: number, data: Partial<InsertVideo>) {
  const db = await getDb();
  if (!db) return;
  await db.update(videos).set(data).where(eq(videos.id, id));
}

export async function getExpiredVideos() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db
    .select()
    .from(videos)
    .where(
      and(
        lt(videos.expiresAt, now),
        or(eq(videos.status, "ready"), eq(videos.status, "generating"), eq(videos.status, "composing"))
      )
    );
}

export async function getVideosExpiringIn2Days() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(videos)
    .where(
      and(
        eq(videos.status, "ready"),
        eq(videos.notifiedExpiring, false),
        lt(videos.expiresAt, twoDaysLater)
      )
    );
}

// ─── Payments ────────────────────────────────────────────────────────────────

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(payments).values(data);
}

export async function getPaymentByWooviChargeId(wooviChargeId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.wooviChargeId, wooviChargeId))
    .limit(1);
  return result[0];
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) return;
  await db.update(payments).set(data).where(eq(payments.id, id));
}

export async function getPaymentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
}

// ─── Webhook Events (idempotência) ───────────────────────────────────────────

export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.eventId, eventId))
    .limit(1);
  return result.length > 0;
}

export async function markWebhookEventProcessed(
  eventId: string,
  source: string,
  type: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(webhookEvents).values({ eventId, source, type }).onDuplicateKeyUpdate({
    set: { processedAt: new Date() },
  });
}
