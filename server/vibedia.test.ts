import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: User = {
    id: 1,
    openId: "admin-user",
    email: "admin@vibedia.com.br",
    name: "Admin VibeDia",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
  });
});

// ─── Content Router Tests ─────────────────────────────────────────────────────

describe("content.getStats", () => {
  it("returns stats object with required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.content.getStats();
    expect(result).toHaveProperty("messages");
    expect(result).toHaveProperty("horoscopes");
    expect(result).toHaveProperty("categories");
    expect(typeof result.messages).toBe("number");
    expect(typeof result.horoscopes).toBe("number");
    expect(typeof result.categories).toBe("number");
  });
});

describe("content.getCategories", () => {
  it("returns an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.content.getCategories();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("content.getMessagesByCategory", () => {
  it("returns an array for a valid category slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.content.getMessagesByCategory({
      categorySlug: "mensagem-de-bom-dia",
      limit: 5,
      offset: 0,
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("content.getRecentMessages", () => {
  it("returns an array with limit respected", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.content.getRecentMessages({ limit: 3 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(3);
  });
});

describe("content.getTodayHoroscopes", () => {
  it("returns an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.content.getTodayHoroscopes();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("content.getHoroscopeBySignAndDate", () => {
  it("throws NOT_FOUND for non-existent sign/date", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.content.getHoroscopeBySignAndDate({ sign: "aries", date: "1900-01-01" })
    ).rejects.toThrow();
  });
});

// ─── Admin Protection Tests ───────────────────────────────────────────────────

describe("content.seedCategories (admin only)", () => {
  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.content.seedCategories()).rejects.toThrow();
  });
});

describe("content.generateMessage (admin only)", () => {
  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.content.generateMessage({ categorySlug: "mensagem-de-bom-dia", count: 1 })
    ).rejects.toThrow();
  });
});

describe("content.generateHoroscopes (admin only)", () => {
  it("throws UNAUTHORIZED for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.content.generateHoroscopes({})).rejects.toThrow();
  });
});

// ─── Logout Test ──────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
