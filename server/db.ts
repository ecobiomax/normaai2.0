import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Banner,
  Category,
  GenerationLog,
  Horoscope,
  InsertBanner,
  InsertCategory,
  InsertGenerationLog,
  InsertHoroscope,
  InsertMessage,
  InsertUser,
  Message,
  banners,
  categories,
  generationLogs,
  horoscopes,
  messages,
  users,
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

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
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
  return result.length > 0 ? result[0] : undefined;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.active, true)).orderBy(categories.name);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function upsertCategory(data: InsertCategory): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(categories).values(data).onDuplicateKeyUpdate({ set: { name: data.name, description: data.description } });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getMessagesByCategory(
  categorySlug: string,
  limit = 20,
  offset = 0
): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  const cat = await getCategoryBySlug(categorySlug);
  if (!cat) return [];
  return db
    .select()
    .from(messages)
    .where(and(eq(messages.categoryId, cat.id), eq(messages.active, true)))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getMessageBySlug(slug: string): Promise<Message | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(messages).where(eq(messages.slug, slug)).limit(1);
  return result[0];
}

export async function getMessageBySlugWithCategory(
  slug: string
): Promise<(Message & { categoryName: string; categorySlug: string }) | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({
      id: messages.id,
      categoryId: messages.categoryId,
      text: messages.text,
      imageUrl: messages.imageUrl,
      slug: messages.slug,
      active: messages.active,
      createdAt: messages.createdAt,
      updatedAt: messages.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(messages)
    .innerJoin(categories, eq(messages.categoryId, categories.id))
    .where(eq(messages.slug, slug))
    .limit(1);
  return result[0] as any;
}

export async function getRecentMessages(limit = 10): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.active, true)).orderBy(desc(messages.createdAt)).limit(limit);
}

export async function insertMessage(data: InsertMessage): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(messages).values(data);
}

export async function countMessages(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(messages);
  return result[0]?.count ?? 0;
}

export async function getAllMessageSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select({ slug: messages.slug, updatedAt: messages.updatedAt }).from(messages).where(eq(messages.active, true));
}

// ─── Horoscopes ───────────────────────────────────────────────────────────────

export async function getHoroscopeBySignAndDate(
  sign: string,
  date: string
): Promise<Horoscope | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(horoscopes)
    .where(and(eq(horoscopes.sign, sign as any), sql`DATE(${horoscopes.date}) = ${date}`))
    .limit(1);
  return result[0];
}

export async function getTodayHoroscopes(date: string): Promise<Horoscope[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(horoscopes).where(sql`DATE(${horoscopes.date}) = ${date}`).orderBy(horoscopes.sign);
}

export async function getRecentHoroscopes(limit = 12): Promise<Horoscope[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(horoscopes).orderBy(desc(horoscopes.createdAt)).limit(limit);
}

export async function insertHoroscope(data: InsertHoroscope): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(horoscopes).values(data).onDuplicateKeyUpdate({
    set: { text: data.text, loveText: data.loveText, workText: data.workText, energyText: data.energyText, updatedAt: new Date() },
  });
}

export async function countHoroscopes(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(horoscopes);
  return result[0]?.count ?? 0;
}

export async function getAllHoroscopeSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select({ slug: horoscopes.slug, updatedAt: horoscopes.updatedAt }).from(horoscopes);
}

// ─── Generation Logs ──────────────────────────────────────────────────────────

export async function insertGenerationLog(data: InsertGenerationLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(generationLogs).values(data);
}

export async function getRecentGenerationLogs(limit = 20): Promise<GenerationLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generationLogs).orderBy(desc(generationLogs.createdAt)).limit(limit);
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export async function getAllBanners(): Promise<Banner[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(banners).orderBy(desc(banners.createdAt));
}

export async function getActiveBannerByPosition(position: "top" | "mid" | "footer"): Promise<Banner | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(banners)
    .where(and(eq(banners.position, position), eq(banners.active, true)))
    .orderBy(desc(banners.createdAt))
    .limit(1);
  return result[0];
}

export async function insertBanner(data: InsertBanner): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(banners).values(data);
  return (result as any)[0]?.insertId ?? 0;
}

export async function updateBanner(id: number, data: Partial<InsertBanner>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(banners).set(data).where(eq(banners.id, id));
}

export async function deleteBanner(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(banners).where(eq(banners.id, id));
}
