import { and, desc, eq, gte, lte, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  auditLog,
  billingHistory,
  plans,
  subscriptions,
  termsLog,
  users,
  videoJobs,
  voiceProfiles,
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

// ─── Users ─────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
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

export async function updateUserTerms(
  userId: number,
  data: { termsAccepted: boolean; termsAcceptedAt: Date; termsVersion: string; termsIp?: string; termsUserAgent?: string }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function updateUserPlan(userId: number, planId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ planId }).where(eq(users.id, userId));
}

// ─── Plans ─────────────────────────────────────────────────────────────────────
export async function getAllPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(plans).where(eq(plans.isActive, true));
}

export async function getPlanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  return result[0];
}

export async function getPlanBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(plans).where(eq(plans.slug, slug)).limit(1);
  return result[0];
}

// ─── Subscriptions ─────────────────────────────────────────────────────────────
export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return result[0];
}

export async function getSubscriptionByWooviId(wooviSubscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.wooviSubscriptionId, wooviSubscriptionId))
    .limit(1);
  return result[0];
}

export async function createSubscription(data: {
  userId: number;
  planId: number;
  wooviSubscriptionId?: string;
  wooviChargeId?: string;
  status?: "pending" | "active" | "cancelled" | "expired" | "failed";
  creditsRemaining?: number;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(subscriptions).values(data);
  return result;
}

export async function updateSubscription(
  id: number,
  data: Partial<{
    status: "pending" | "active" | "cancelled" | "expired" | "failed";
    creditsRemaining: number;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    wooviSubscriptionId: string;
    wooviChargeId: string;
    cancelledAt: Date;
  }>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function decrementCredits(userId: number) {
  const db = await getDb();
  if (!db) return;
  const sub = await getActiveSubscription(userId);
  if (!sub || sub.creditsRemaining <= 0) return false;
  await db
    .update(subscriptions)
    .set({ creditsRemaining: sub.creditsRemaining - 1 })
    .where(eq(subscriptions.id, sub.id));
  return true;
}

export async function getUserSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt));
}

// ─── Billing History ───────────────────────────────────────────────────────────
export async function createBillingRecord(data: {
  userId: number;
  subscriptionId: number;
  planId: number;
  amountBrl: string;
  wooviChargeId?: string;
  pixCode?: string;
  pixQrCode?: string;
  status?: "pending" | "paid" | "failed" | "refunded";
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(billingHistory).values(data);
}

export async function getUserBillingHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(billingHistory)
    .where(eq(billingHistory.userId, userId))
    .orderBy(desc(billingHistory.createdAt))
    .limit(20);
}

export async function updateBillingRecord(
  wooviChargeId: string,
  data: { status: "pending" | "paid" | "failed" | "refunded"; paidAt?: Date }
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(billingHistory)
    .set(data)
    .where(eq(billingHistory.wooviChargeId, wooviChargeId));
}

// ─── Voice Profiles ────────────────────────────────────────────────────────────
export async function getUserVoiceProfiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(voiceProfiles)
    .where(eq(voiceProfiles.userId, userId))
    .orderBy(desc(voiceProfiles.createdAt));
}

export async function getVoiceProfileById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(voiceProfiles)
    .where(and(eq(voiceProfiles.id, id), eq(voiceProfiles.userId, userId)))
    .limit(1);
  return result[0];
}

export async function createVoiceProfile(data: {
  userId: number;
  name: string;
  audioS3Url?: string;
  audioS3Key?: string;
  durationSec?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(voiceProfiles).values({ ...data, status: "processing" });
  return result;
}

export async function updateVoiceProfile(
  id: number,
  data: Partial<{
    elevenLabsVoiceId: string;
    status: "processing" | "ready" | "failed";
    audioS3Url: string;
    audioS3Key: string;
  }>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(voiceProfiles).set(data).where(eq(voiceProfiles.id, id));
}

export async function deleteVoiceProfile(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(voiceProfiles)
    .where(and(eq(voiceProfiles.id, id), eq(voiceProfiles.userId, userId)));
}

// ─── Video Jobs ────────────────────────────────────────────────────────────────
export async function getUserVideoJobs(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(videoJobs)
    .where(eq(videoJobs.userId, userId))
    .orderBy(desc(videoJobs.createdAt))
    .limit(limit);
}

export async function getVideoJobById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(videoJobs)
    .where(and(eq(videoJobs.id, id), eq(videoJobs.userId, userId)))
    .limit(1);
  return result[0];
}

export async function getActiveJobsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select()
    .from(videoJobs)
    .where(
      and(
        eq(videoJobs.userId, userId),
        or(
          eq(videoJobs.status, "pending"),
          eq(videoJobs.status, "tts_processing"),
          eq(videoJobs.status, "tts_done"),
          eq(videoJobs.status, "lipsync_processing"),
          eq(videoJobs.status, "lipsync_done"),
          eq(videoJobs.status, "watermark_processing")
        )
      )
    );
  return result.length;
}

export async function createVideoJob(data: {
  userId: number;
  voiceProfileId: number;
  photoS3Url?: string;
  photoS3Key?: string;
  promptText: string;
  language?: string;
  planQuality?: string;
  notifyByEmail?: boolean;
  expiresAt?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(videoJobs).values({ ...data, status: "pending" });
  return result;
}

export async function updateVideoJob(
  id: number,
  data: Partial<{
    status: "pending" | "tts_processing" | "tts_done" | "lipsync_processing" | "lipsync_done" | "watermark_processing" | "completed" | "failed";
    didJobId: string;
    audioS3Url: string;
    audioS3Key: string;
    outputS3Url: string;
    outputS3Key: string;
    durationSec: number;
    errorMessage: string;
  }>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(videoJobs).set(data).where(eq(videoJobs.id, id));
}

export async function deleteVideoJob(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(videoJobs)
    .where(and(eq(videoJobs.id, id), eq(videoJobs.userId, userId)));
}

// ─── Terms Log ─────────────────────────────────────────────────────────────────
export async function logTermsAcceptance(data: {
  userId: number;
  ipAddress?: string;
  userAgent?: string;
  termsVersion?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(termsLog).values({ ...data, termsVersion: data.termsVersion ?? "1.0" });
}

// ─── Audit Log ─────────────────────────────────────────────────────────────────
export async function createAuditLog(data: {
  userId: number;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values(data);
}
