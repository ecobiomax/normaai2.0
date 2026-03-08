import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  date,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  text: text("text").notNull(),
  imageUrl: text("imageUrl"),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Horoscopes ───────────────────────────────────────────────────────────────

export const horoscopes = mysqlTable("horoscopes", {
  id: int("id").autoincrement().primaryKey(),
  sign: mysqlEnum("sign", [
    "aries",
    "touro",
    "gemeos",
    "cancer",
    "leao",
    "virgem",
    "libra",
    "escorpiao",
    "sagitario",
    "capricornio",
    "aquario",
    "peixes",
  ]).notNull(),
  date: date("date").notNull(),
  text: text("text").notNull(),
  loveText: text("loveText"),
  workText: text("workText"),
  energyText: text("energyText"),
  imageUrl: text("imageUrl"),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Horoscope = typeof horoscopes.$inferSelect;
export type InsertHoroscope = typeof horoscopes.$inferInsert;

// ─── Generation Logs ──────────────────────────────────────────────────────────

export const generationLogs = mysqlTable("generationLogs", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["message", "horoscope", "image"]).notNull(),
  status: mysqlEnum("status", ["success", "error"]).notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GenerationLog = typeof generationLogs.$inferSelect;
export type InsertGenerationLog = typeof generationLogs.$inferInsert;
