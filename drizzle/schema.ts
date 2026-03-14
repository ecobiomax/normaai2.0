import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  float,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  image: text("image"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  userType: mysqlEnum("userType", ["corretor", "imobiliaria"]).default("corretor").notNull(),
  creci: varchar("creci", { length: 50 }),
  companyName: varchar("companyName", { length: 200 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Subscriptions ───────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["basico", "profissional", "agencia"]).notNull(),
  status: mysqlEnum("status", ["active", "pending", "expired", "cancelled"]).default("pending").notNull(),
  videosLimit: int("videosLimit").notNull(), // -1 = ilimitado
  videosUsed: int("videosUsed").default(0).notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  wooviSubscriptionId: varchar("wooviSubscriptionId", { length: 200 }),
  wooviCustomerId: varchar("wooviCustomerId", { length: 200 }),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── Videos ──────────────────────────────────────────────────────────────────
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  propertyType: mysqlEnum("propertyType", ["apartamento", "casa", "comercial", "terreno"]).notNull(),
  videoStyle: mysqlEnum("videoStyle", ["Moderno", "Luxo", "Aconchegante", "Minimalista", "Classico"]).notNull(),
  specialHighlight: text("specialHighlight"),
  status: mysqlEnum("status", [
    "pending",
    "processing",
    "analyzing",
    "generating",
    "composing",
    "ready",
    "expired",
    "error",
  ]).default("pending").notNull(),
  progress: int("progress").default(0).notNull(),
  photosCount: int("photosCount").notNull(),
  photosUrls: json("photosUrls").notNull(), // string[]
  clipsUrls: json("clipsUrls"), // string[]
  promptsJson: json("promptsJson"), // array of {foto_index, prompt, camera_movement}
  finalVideoUrl: text("finalVideoUrl"),
  finalVideoKey: text("finalVideoKey"),
  errorMessage: text("errorMessage"),
  musicTrack: varchar("musicTrack", { length: 100 }),
  expiresAt: timestamp("expiresAt").notNull(),
  notifiedReady: boolean("notifiedReady").default(false).notNull(),
  notifiedExpiring: boolean("notifiedExpiring").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

// ─── Payments ────────────────────────────────────────────────────────────────
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  amount: float("amount").notNull(),
  type: mysqlEnum("type", ["subscription", "extra_video"]).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  plan: varchar("plan", { length: 50 }),
  wooviChargeId: varchar("wooviChargeId", { length: 200 }).notNull().unique(),
  wooviQrCode: text("wooviQrCode"),
  wooviQrCodeText: text("wooviQrCodeText"), // copia-e-cola
  paidAt: timestamp("paidAt"),
  idempotencyKey: varchar("idempotencyKey", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ─── Webhook Events (idempotência) ───────────────────────────────────────────
export const webhookEvents = mysqlTable("webhookEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 200 }).notNull().unique(),
  source: varchar("source", { length: 50 }).notNull(), // woovi
  type: varchar("type", { length: 100 }).notNull(),
  processedAt: timestamp("processedAt").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
