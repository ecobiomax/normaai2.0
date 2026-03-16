import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/mysql-core";

// ─── Usuários ──────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Termos de aceite
  termsAccepted: boolean("termsAccepted").default(false).notNull(),
  termsAcceptedAt: timestamp("termsAcceptedAt"),
  termsVersion: varchar("termsVersion", { length: 16 }).default("1.0"),
  termsIp: varchar("termsIp", { length: 64 }),
  termsUserAgent: text("termsUserAgent"),
  // Plano atual
  planId: int("planId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ─── Planos ────────────────────────────────────────────────────────────────────
export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  priceBrl: decimal("priceBrl", { precision: 10, scale: 2 }).notNull(),
  videosPerMonth: int("videosPerMonth").notNull(),
  maxDurationSec: int("maxDurationSec").notNull(),
  maxVoiceProfiles: int("maxVoiceProfiles").notNull(),
  quality: varchar("quality", { length: 32 }).notNull(),
  storageDays: int("storageDays"), // null = permanente
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Assinaturas ───────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["pending", "active", "cancelled", "expired", "failed"])
    .default("pending")
    .notNull(),
  wooviSubscriptionId: varchar("wooviSubscriptionId", { length: 128 }),
  wooviChargeId: varchar("wooviChargeId", { length: 128 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  creditsRemaining: int("creditsRemaining").default(0).notNull(),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Histórico de cobranças ────────────────────────────────────────────────────
export const billingHistory = mysqlTable("billing_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId").notNull(),
  planId: int("planId").notNull(),
  amountBrl: decimal("amountBrl", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  wooviChargeId: varchar("wooviChargeId", { length: 128 }),
  pixCode: text("pixCode"),
  pixQrCode: text("pixQrCode"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Perfis de Voz ─────────────────────────────────────────────────────────────
export const voiceProfiles = mysqlTable("voice_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  elevenLabsVoiceId: varchar("elevenLabsVoiceId", { length: 128 }),
  audioS3Url: text("audioS3Url"),
  audioS3Key: varchar("audioS3Key", { length: 512 }),
  status: mysqlEnum("status", ["processing", "ready", "failed"]).default("processing").notNull(),
  durationSec: int("durationSec"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Jobs de Vídeo ─────────────────────────────────────────────────────────────
export const videoJobs = mysqlTable("video_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  voiceProfileId: int("voiceProfileId").notNull(),
  photoS3Url: text("photoS3Url"),
  photoS3Key: varchar("photoS3Key", { length: 512 }),
  promptText: text("promptText").notNull(),
  language: varchar("language", { length: 8 }).default("pt-BR").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "tts_processing",
    "tts_done",
    "lipsync_processing",
    "lipsync_done",
    "watermark_processing",
    "completed",
    "failed",
  ])
    .default("pending")
    .notNull(),
  // IDs externos
  didJobId: varchar("didJobId", { length: 256 }),
  audioS3Url: text("audioS3Url"),
  audioS3Key: varchar("audioS3Key", { length: 512 }),
  outputS3Url: text("outputS3Url"),
  outputS3Key: varchar("outputS3Key", { length: 512 }),
  // Metadados
  durationSec: int("durationSec"),
  planQuality: varchar("planQuality", { length: 32 }),
  errorMessage: text("errorMessage"),
  notifyByEmail: boolean("notifyByEmail").default(false).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Log de Termos (auditoria legal) ──────────────────────────────────────────
export const termsLog = mysqlTable("terms_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  termsVersion: varchar("termsVersion", { length: 16 }).default("1.0").notNull(),
});

// ─── Log de auditoria de uploads ──────────────────────────────────────────────
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  resourceType: varchar("resourceType", { length: 64 }),
  resourceId: varchar("resourceId", { length: 128 }),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Types ─────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type VoiceProfile = typeof voiceProfiles.$inferSelect;
export type VideoJob = typeof videoJobs.$inferSelect;
export type TermsLog = typeof termsLog.$inferSelect;
export type BillingHistory = typeof billingHistory.$inferSelect;
