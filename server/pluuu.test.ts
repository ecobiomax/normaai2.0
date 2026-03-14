import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { PLANS, VIDEO_STYLES, VIDEO_EXPIRY_DAYS, MUSIC_TRACKS } from "../shared/plans";

// ─── Mock helpers ─────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  getSubscriptionByUserId: vi.fn(),
  getVideosByUserId: vi.fn(),
  getVideoById: vi.fn(),
  createVideo: vi.fn(),
  updateVideo: vi.fn(),
  getPaymentsByUserId: vi.fn(),
  createPayment: vi.fn(),
  getPaymentByWooviChargeId: vi.fn(),
  updatePayment: vi.fn(),
  createSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  incrementVideosUsed: vi.fn(),
  isWebhookEventProcessed: vi.fn().mockResolvedValue(false),
  markWebhookEventProcessed: vi.fn(),
  getExpiredVideos: vi.fn().mockResolvedValue([]),
  getVideosExpiringIn2Days: vi.fn().mockResolvedValue([]),
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./queue", () => ({
  videoQueue: {
    add: vi.fn().mockResolvedValue({ id: "test-job-id" }),
  },
}));

vi.mock("./woovi", () => ({
  createWooviCharge: vi.fn().mockResolvedValue({
    correlationID: "test-correlation-id",
    status: "ACTIVE",
    brCode: "00020126test",
    qrCodeImage: "https://example.com/qr.png",
    expiresDate: new Date(Date.now() + 3600000).toISOString(),
  }),
}));

vi.mock("./email", () => ({
  sendVideoReadyEmail: vi.fn(),
  sendSubscriptionConfirmedEmail: vi.fn(),
  sendSubscriptionExpiredEmail: vi.fn(),
  sendVideoExpiringEmail: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test/key.jpg" }),
  storageGet: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.mp4" }),
}));

// ─── Import mocked modules ────────────────────────────────────────────────────
import * as db from "./db";
import * as queue from "./queue";
import * as woovi from "./woovi";

// ─── Context factories ────────────────────────────────────────────────────────
function createAuthContext(overrides: Partial<NonNullable<TrpcContext["user"]>> = {}): TrpcContext {
  const clearedCookies: any[] = [];
  return {
    user: {
      id: 1,
      openId: "test-user-openid",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: any) => clearedCookies.push({ name, options }),
    } as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as TrpcContext["res"],
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns user when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.email).toBe("test@example.com");
  });

  it("me returns null when unauthenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("logout clears session cookie", async () => {
    const clearedCookies: any[] = [];
    const ctx = createAuthContext();
    ctx.res.clearCookie = (name: string, options: any) => clearedCookies.push({ name, options });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

// ─── Plans constants tests ────────────────────────────────────────────────────
describe("PLANS constants", () => {
  it("has exactly 3 plans", () => {
    expect(Object.keys(PLANS)).toHaveLength(3);
  });

  it("basico plan has correct values", () => {
    expect(PLANS.basico.name).toBe("Básico");
    expect(PLANS.basico.price).toBe(97);
    expect(PLANS.basico.videosPerMonth).toBe(5);
  });

  it("profissional plan has correct values", () => {
    expect(PLANS.profissional.name).toBe("Profissional");
    expect(PLANS.profissional.price).toBe(197);
    expect(PLANS.profissional.videosPerMonth).toBe(15);
  });

  it("agencia plan has correct values", () => {
    expect(PLANS.agencia.name).toBe("Agência");
    expect(PLANS.agencia.price).toBe(497);
    expect(PLANS.agencia.videosPerMonth).toBe(50);
  });
});

// ─── Video styles tests ───────────────────────────────────────────────────────
describe("VIDEO_STYLES constants", () => {
  it("has exactly 5 styles", () => {
    expect(VIDEO_STYLES).toHaveLength(5);
  });

  it("contains all required style names", () => {
    const styleIds = VIDEO_STYLES.map((s) => s.id);
    expect(styleIds).toContain("Moderno");
    expect(styleIds).toContain("Luxo");
    expect(styleIds).toContain("Aconchegante");
    expect(styleIds).toContain("Minimalista");
    expect(styleIds).toContain("Classico");
  });

  it("each style has music track mapping", () => {
    VIDEO_STYLES.forEach((style) => {
      expect(MUSIC_TRACKS[style.id]).toBeDefined();
      expect(MUSIC_TRACKS[style.id]).toMatch(/\.mp3$/);
    });
  });
});

// ─── Video expiry tests ───────────────────────────────────────────────────────
describe("VIDEO_EXPIRY_DAYS", () => {
  it("is 7 days", () => {
    expect(VIDEO_EXPIRY_DAYS).toBe(7);
  });
});

// ─── Dashboard router tests ───────────────────────────────────────────────────
describe("dashboard.getSummary", () => {
  beforeEach(() => {
    vi.mocked(db.getSubscriptionByUserId).mockResolvedValue(null);
    vi.mocked(db.getVideosByUserId).mockResolvedValue([]);
  });

  it("returns summary with no subscription and no videos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.getSummary();
    expect(result.totalVideos).toBe(0);
    expect(result.readyVideos).toBe(0);
    expect(result.subscription).toBeNull();
  });

  it("counts videos by status correctly", async () => {
    vi.mocked(db.getVideosByUserId).mockResolvedValue([
      { id: 1, status: "ready", userId: 1, title: "V1", propertyType: "apartamento", videoStyle: "Moderno", photosCount: 3, progress: 100, notifiedReady: false, notifiedExpiring: false, expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date() } as any,
      { id: 2, status: "analyzing", userId: 1, title: "V2", propertyType: "casa", videoStyle: "Luxo", photosCount: 5, progress: 30, notifiedReady: false, notifiedExpiring: false, expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date() } as any,
      { id: 3, status: "expired", userId: 1, title: "V3", propertyType: "comercial", videoStyle: "Classico", photosCount: 2, progress: 100, notifiedReady: false, notifiedExpiring: false, expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date() } as any,
    ]);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.getSummary();
    expect(result.totalVideos).toBe(3);
    expect(result.readyVideos).toBe(1);
    expect(result.processingVideos).toBe(1);
    expect(result.expiredVideos).toBe(1);
  });
});

// ─── Videos router tests ──────────────────────────────────────────────────────
describe("videos.create", () => {
  beforeEach(() => {
    vi.mocked(db.getVideosByUserId).mockResolvedValue([
      { id: 99, status: "pending", userId: 1, title: "Test", propertyType: "apartamento", videoStyle: "Moderno", photosCount: 2, progress: 0, notifiedReady: false, notifiedExpiring: false, expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date() } as any,
    ]);
    vi.mocked(db.createVideo).mockResolvedValue(undefined);
    vi.mocked(db.incrementVideosUsed).mockResolvedValue(undefined);
  });

  it("throws FORBIDDEN when no active subscription", async () => {
    vi.mocked(db.getSubscriptionByUserId).mockResolvedValue(null);
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.videos.create({
        title: "Test Video",
        propertyType: "apartamento",
        videoStyle: "Moderno",
        photosUrls: ["https://example.com/photo1.jpg"],
      })
    ).rejects.toThrow("Assinatura inativa");
  });

  it("throws FORBIDDEN when credit limit reached", async () => {
    vi.mocked(db.getSubscriptionByUserId).mockResolvedValue({
      id: 1,
      userId: 1,
      plan: "basico",
      status: "active",
      videosLimit: 5,
      videosUsed: 5,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.videos.create({
        title: "Test Video",
        propertyType: "apartamento",
        videoStyle: "Moderno",
        photosUrls: ["https://example.com/photo1.jpg"],
      })
    ).rejects.toThrow("Limite de vídeos atingido");
  });

  it("creates video and enqueues job when subscription is active", async () => {
    vi.mocked(db.getSubscriptionByUserId).mockResolvedValue({
      id: 1,
      userId: 1,
      plan: "profissional",
      status: "active",
      videosLimit: 15,
      videosUsed: 3,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.videos.create({
      title: "Apartamento Moderno",
      propertyType: "apartamento",
      videoStyle: "Moderno",
      photosUrls: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    });

    expect(result.success).toBe(true);
    expect(result.videoId).toBeDefined();
    expect(queue.videoQueue.add).toHaveBeenCalledWith(
      "generate-video",
      expect.objectContaining({
        videoStyle: "Moderno",
        title: "Apartamento Moderno",
        musicTrack: "track_modern.mp3",
      })
    );
    expect(db.incrementVideosUsed).toHaveBeenCalledWith(1);
  });
});

// ─── Subscription router tests ────────────────────────────────────────────────
describe("subscription.createCharge", () => {
  beforeEach(() => {
    vi.mocked(db.getUserById).mockResolvedValue({
      id: 1,
      openId: "test",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any);
    vi.mocked(db.createPayment).mockResolvedValue(undefined);
  });

  it("creates a Woovi charge for basico plan", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.subscription.createCharge({ plan: "basico" });

    expect(result.qrCode).toBeDefined();
    expect(result.qrCodeText).toBeDefined();
    expect(result.chargeId).toBeDefined();
    expect(woovi.createWooviCharge).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 9700, // R$97.00 in cents
      })
    );
  });

  it("creates a Woovi charge for agencia plan with correct amount", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await caller.subscription.createCharge({ plan: "agencia" });

    expect(woovi.createWooviCharge).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 49700, // R$497.00 in cents
      })
    );
  });
});

// ─── Profile router tests ─────────────────────────────────────────────────────
describe("profile", () => {
  it("get returns user profile", async () => {
    vi.mocked(db.getUserById).mockResolvedValue({
      id: 1,
      openId: "test",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.get();
    expect(result?.name).toBe("Test User");
  });

  it("update saves profile changes", async () => {
    vi.mocked(db.updateUser).mockResolvedValue(undefined);
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.update({ name: "New Name" });
    expect(result.success).toBe(true);
    expect(db.updateUser).toHaveBeenCalledWith(1, { name: "New Name" });
  });
});

// ─── Photo upload tests ───────────────────────────────────────────────────────
describe("videos.uploadPhoto", () => {
  it("uploads a valid JPEG photo", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a minimal base64 JPEG
    const base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=";

    const result = await caller.videos.uploadPhoto({
      filename: "test.jpg",
      contentType: "image/jpeg",
      base64,
    });

    expect(result.url).toBeDefined();
    expect(result.key).toBeDefined();
  });

  it("rejects non-image files", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.videos.uploadPhoto({
        filename: "test.pdf",
        contentType: "application/pdf",
        base64: "dGVzdA==",
      })
    ).rejects.toThrow("Tipo de arquivo não permitido");
  });
});
