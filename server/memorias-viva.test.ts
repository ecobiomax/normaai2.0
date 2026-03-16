import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  getAllPlans: vi.fn().mockResolvedValue([
    { id: 1, name: "Semente", slug: "semente", priceBrl: "24.90", videosPerMonth: 3, maxDurationSec: 30, maxVoiceProfiles: 1, quality: "HD 720p", storageDays: 30, isActive: true },
    { id: 2, name: "Memória", slug: "memoria", priceBrl: "59.90", videosPerMonth: 10, maxDurationSec: 45, maxVoiceProfiles: 2, quality: "Full HD 1080p", storageDays: 90, isActive: true },
    { id: 3, name: "Presença", slug: "presenca", priceBrl: "157.00", videosPerMonth: 30, maxDurationSec: 60, maxVoiceProfiles: 5, quality: "Full HD 1080p", storageDays: null, isActive: true },
  ]),
  getActiveSubscription: vi.fn().mockResolvedValue(null),
  getUserVoiceProfiles: vi.fn().mockResolvedValue([]),
  getUserVideoJobs: vi.fn().mockResolvedValue([]),
  getVideoJobById: vi.fn().mockResolvedValue(null),
  getVoiceProfileById: vi.fn().mockResolvedValue(null),
  createVoiceProfile: vi.fn().mockResolvedValue({ insertId: 1 }),
  deleteVoiceProfile: vi.fn().mockResolvedValue(undefined),
  createVideoJob: vi.fn().mockResolvedValue({ insertId: 1 }),
  deleteVideoJob: vi.fn().mockResolvedValue(undefined),
  getActiveJobsCount: vi.fn().mockResolvedValue(0),
  getUserBillingHistory: vi.fn().mockResolvedValue([]),
  getUserSubscriptions: vi.fn().mockResolvedValue([]),
  logTermsAcceptance: vi.fn().mockResolvedValue(undefined),
  updateUserTerms: vi.fn().mockResolvedValue(undefined),
  createAuditLog: vi.fn().mockResolvedValue(undefined),
  updateVideoJob: vi.fn().mockResolvedValue(undefined),
  getUserById: vi.fn().mockResolvedValue({
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    role: "user",
    termsAccepted: false,
    termsAcceptedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  }),
  updateSubscription: vi.fn().mockResolvedValue(undefined),
  createSubscription: vi.fn().mockResolvedValue({ insertId: 1 }),
  createBillingRecord: vi.fn().mockResolvedValue(undefined),
  updateBillingRecord: vi.fn().mockResolvedValue(undefined),
  getPlanById: vi.fn().mockResolvedValue({ id: 1, name: "Semente", slug: "semente", priceBrl: "24.90", videosPerMonth: 3, maxDurationSec: 30, maxVoiceProfiles: 1, quality: "HD 720p", storageDays: 30, isActive: true }),
  updateUserPlan: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.example.com/test.mp3", key: "test.mp3" }),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

// ─── Plans ────────────────────────────────────────────────────────────────────
describe("plans.list", () => {
  it("returns all 3 plans", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const plans = await caller.plans.list();
    expect(plans).toHaveLength(3);
    expect(plans[0].slug).toBe("semente");
    expect(plans[1].slug).toBe("memoria");
    expect(plans[2].slug).toBe("presenca");
  });

  it("returns correct prices", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const plans = await caller.plans.list();
    expect(plans[0].priceBrl).toBe("24.90");
    expect(plans[1].priceBrl).toBe("59.90");
    expect(plans[2].priceBrl).toBe("157.00");
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const me = await caller.auth.me();
    expect(me).toBeNull();
  });

  it("returns user data for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const me = await caller.auth.me();
    expect(me).toBeTruthy();
    expect(me?.email).toBe("test@example.com");
  });
});

// ─── Terms ────────────────────────────────────────────────────────────────────
describe("terms.status", () => {
  it("returns not accepted for user without terms", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const status = await caller.terms.status();
    expect(status.accepted).toBe(false);
    expect(status.needsRenewal).toBe(true);
  });
});

describe("terms.accept", () => {
  it("accepts terms successfully", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.terms.accept({ userAgent: "test-browser" });
    expect(result.success).toBe(true);
  });
});

// ─── Voice Profiles ───────────────────────────────────────────────────────────
describe("voiceProfiles.list", () => {
  it("returns empty list for new user", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const profiles = await caller.voiceProfiles.list();
    expect(profiles).toHaveLength(0);
  });
});

// ─── Video Jobs ───────────────────────────────────────────────────────────────
describe("videoJobs.list", () => {
  it("returns empty list for new user", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const jobs = await caller.videoJobs.list({ limit: 10 });
    expect(jobs).toHaveLength(0);
  });
});

describe("videoJobs.create", () => {
  it("throws FORBIDDEN when no active subscription", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.videoJobs.create({
        voiceProfileId: 1,
        photoBase64: "dGVzdA==",
        promptText: "Olá, saudades de você.",
      })
    ).rejects.toThrow();
  });
});

// ─── Subscription ─────────────────────────────────────────────────────────────
describe("subscription.current", () => {
  it("returns null when no active subscription", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const sub = await caller.subscription.current();
    expect(sub).toBeNull();
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears cookie and returns success", async () => {
    const ctx = createUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
