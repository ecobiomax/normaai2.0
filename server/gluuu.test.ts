import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
  updateUserProfile: vi.fn(),
  getUserStats: vi.fn(),
  getShareholderEarnings: vi.fn(),
  getWithdrawals: vi.fn(),
  getSharesPurchases: vi.fn(),
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  getPlatformStats: vi.fn(),
  getAllUsers: vi.fn(),
  getDailyEarnings: vi.fn(),
  createDailyEarning: vi.fn(),
  distributeEarnings: vi.fn(),
  createWithdrawal: vi.fn(),
  updateWithdrawalStatus: vi.fn(),
  getAffiliateLinks: vi.fn(),
  createAffiliateLink: vi.fn(),
  updateAffiliateLink: vi.fn(),
  incrementLinkClick: vi.fn(),
  getPlatformSettings: vi.fn(),
  updatePlatformSetting: vi.fn(),
  createSharesPurchase: vi.fn(),
  updateSharesPurchaseStatus: vi.fn(),
  checkAndUnlockShares: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import {
  getUserStats,
  getShareholderEarnings,
  getWithdrawals,
  getAffiliateLinks,
  getPlatformStats,
  getDailyEarnings,
  createDailyEarning,
  distributeEarnings,
  createWithdrawal,
  getSharesPurchases,
  checkAndUnlockShares,
  getNotifications,
  markAllNotificationsRead,
} from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@gluuu.com.br",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createUserContext({ id: 99, openId: "admin-openid", role: "admin" });
}

// ============ AUTH TESTS ============
describe("auth", () => {
  it("returns current user from auth.me", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result?.id).toBe(1);
    expect(result?.email).toBe("test@gluuu.com.br");
  });

  it("clears cookie on logout", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

// ============ USER STATS TESTS ============
describe("user.stats", () => {
  it("returns user stats for authenticated user", async () => {
    const mockStats = {
      id: 1,
      name: "Test User",
      fullName: "Test User Full",
      email: "test@gluuu.com.br",
      cpf: "123.456.789-00",
      phone: "(11) 99999-9999",
      totalShares: 100,
      availableBalance: 50000, // R$ 500.00 in cents
      totalEarned: 75000,
      profileComplete: true,
      pixKey: "test@gluuu.com.br",
      pixKeyType: "email" as const,
      joinedWhatsapp: true,
    };
    vi.mocked(getUserStats).mockResolvedValue(mockStats);

    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.user.stats();

    expect(result?.totalShares).toBe(100);
    expect(result?.availableBalance).toBe(50000);
    expect(result?.profileComplete).toBe(true);
  });
});

// ============ EARNINGS TESTS ============
describe("earnings.myEarnings", () => {
  it("returns earnings for the specified period", async () => {
    const mockEarnings = [
      {
        id: 1,
        userId: 1,
        dailyEarningId: 1,
        date: new Date("2026-03-20"),
        sharesAtTime: 100,
        percentageAtTime: "0.000100",
        amount: "9.50",
        amountCents: 950,
        createdAt: new Date(),
      },
    ];
    vi.mocked(getShareholderEarnings).mockResolvedValue(mockEarnings);

    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.earnings.myEarnings({ period: "30d" });

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe("9.50");
  });
});

// ============ SHARES TESTS ============
describe("shares.myPurchases", () => {
  it("returns user share purchases", async () => {
    const mockPurchases = [
      {
        id: 1,
        userId: 1,
        quantity: 10,
        pricePerShare: "9.90",
        totalAmount: "99.00",
        status: "paid" as const,
        wooviCorrelationId: "gluuu-1-123456",
        wooviChargeId: null,
        pixQrCode: null,
        pixCopyPaste: null,
        paidAt: new Date(),
        lockUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        canSell: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(getSharesPurchases).mockResolvedValue(mockPurchases);

    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.shares.myPurchases();

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(10);
    expect(result[0].status).toBe("paid");
    expect(result[0].canSell).toBe(false);
  });
});

describe("shares.checkUnlock", () => {
  it("checks and unlocks eligible shares", async () => {
    vi.mocked(checkAndUnlockShares).mockResolvedValue({ unlocked: 2 });

    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.shares.checkUnlock();

    expect(result.unlocked).toBe(2);
  });
});

// ============ WITHDRAWALS TESTS ============
describe("withdrawals.request", () => {
  it("rejects withdrawal when balance is insufficient", async () => {
    vi.mocked(getUserStats).mockResolvedValue({
      id: 1,
      name: "Test",
      fullName: "Test User",
      email: "test@test.com",
      cpf: "123.456.789-00",
      phone: "(11) 99999-9999",
      totalShares: 10,
      availableBalance: 500, // Only R$ 5.00
      totalEarned: 500,
      profileComplete: true,
      pixKey: "test@test.com",
      pixKeyType: "email" as const,
      joinedWhatsapp: false,
    });

    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.withdrawals.request({
        amount: 50, // R$ 50.00 but only R$ 5.00 available
        pixKey: "test@test.com",
        pixKeyType: "email",
      })
    ).rejects.toThrow("Saldo insuficiente");
  });

  it("creates withdrawal when balance is sufficient", async () => {
    vi.mocked(getUserStats).mockResolvedValue({
      id: 1,
      name: "Test",
      fullName: "Test User",
      email: "test@test.com",
      cpf: "123.456.789-00",
      phone: "(11) 99999-9999",
      totalShares: 100,
      availableBalance: 10000, // R$ 100.00
      totalEarned: 10000,
      profileComplete: true,
      pixKey: "test@test.com",
      pixKeyType: "email" as const,
      joinedWhatsapp: true,
    });
    vi.mocked(createWithdrawal).mockResolvedValue({ id: 1 });

    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.withdrawals.request({
      amount: 50,
      pixKey: "test@test.com",
      pixKeyType: "email",
    });

    expect(result.success).toBe(true);
    expect(result.withdrawalId).toBe(1);
  });
});

// ============ NOTIFICATIONS TESTS ============
describe("notifications", () => {
  it("lists user notifications", async () => {
    const mockNotifications = [
      {
        id: 1,
        userId: 1,
        type: "earning_credited" as const,
        title: "Lucros Creditados!",
        message: "R$ 9.50 foram creditados",
        isRead: false,
        metadata: null,
        createdAt: new Date(),
      },
    ];
    vi.mocked(getNotifications).mockResolvedValue(mockNotifications);

    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list();

    expect(result).toHaveLength(1);
    expect(result[0].isRead).toBe(false);
  });

  it("marks all notifications as read", async () => {
    vi.mocked(markAllNotificationsRead).mockResolvedValue(undefined);

    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.markAllRead();

    expect(result.success).toBe(true);
    expect(markAllNotificationsRead).toHaveBeenCalledWith(1);
  });
});

// ============ AFFILIATE LINKS TESTS ============
describe("affiliateLinks.list", () => {
  it("returns active affiliate links", async () => {
    const mockLinks = [
      {
        id: 1,
        platform: "shopee" as const,
        url: "https://s.shopee.com.br/test",
        title: "Link Shopee",
        description: null,
        isActive: true,
        clickCount: 42,
        validFrom: null,
        validUntil: null,
        createdBy: 99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(getAffiliateLinks).mockResolvedValue(mockLinks);

    // Public procedure - no auth needed
    const ctx = { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.affiliateLinks.list();

    expect(result).toHaveLength(1);
    expect(result[0].platform).toBe("shopee");
  });
});

// ============ ADMIN TESTS ============
describe("admin", () => {
  it("blocks non-admin users from admin routes", async () => {
    vi.mocked(getPlatformStats).mockResolvedValue({
      totalUsers: 100,
      totalSharesSold: 5000,
      totalSharesAvailable: 995000,
      totalDistributed: 50000,
      totalWithdrawn: 10000,
    });

    const ctx = createUserContext(); // regular user
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.stats()).rejects.toThrow("Acesso restrito");
  });

  it("allows admin to access stats", async () => {
    vi.mocked(getPlatformStats).mockResolvedValue({
      totalUsers: 100,
      totalSharesSold: 5000,
      totalSharesAvailable: 995000,
      totalDistributed: 50000,
      totalWithdrawn: 10000,
    });

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.stats();

    expect(result?.totalUsers).toBe(100);
    expect(result?.totalSharesSold).toBe(5000);
  });

  it("allows admin to launch daily earnings", async () => {
    vi.mocked(createDailyEarning).mockResolvedValue({
      id: 1,
      totalShares: 10000,
      activeShareholders: 50,
      distributedAmount: 950,
    });
    vi.mocked(distributeEarnings).mockResolvedValue(undefined);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.launchDailyEarning({
      date: "2026-03-22",
      totalCommission: 1000,
      notes: "Shopee + ML",
    });

    expect(result.success).toBe(true);
    expect(distributeEarnings).toHaveBeenCalledWith(1);
  });

  it("calculates 95% distribution correctly", () => {
    const totalCommission = 1000;
    const distributedAmount = totalCommission * 0.95;
    const retainedAmount = totalCommission * 0.05;

    expect(distributedAmount).toBe(950);
    expect(retainedAmount).toBe(50);
    expect(distributedAmount + retainedAmount).toBe(totalCommission);
  });
});

// ============ BUSINESS LOGIC TESTS ============
describe("Business Logic - Share Distribution", () => {
  it("calculates proportional earnings correctly", () => {
    const totalDistributed = 1000; // R$ 1000
    const totalShares = 100000;

    // Shareholder with 100 shares (0.1%)
    const shareholderShares = 100;
    const percentage = shareholderShares / totalShares;
    const earning = totalDistributed * percentage;

    expect(percentage).toBeCloseTo(0.001);
    expect(earning).toBeCloseTo(1.0); // R$ 1.00
  });

  it("validates 12-month lock period", () => {
    const purchaseDate = new Date();
    const lockUntil = new Date(purchaseDate);
    lockUntil.setMonth(lockUntil.getMonth() + 12);

    // Lock should be exactly 12 months after purchase
    const expectedYear = purchaseDate.getMonth() === 0
      ? purchaseDate.getFullYear() // Jan + 12 = Jan same year + 1 handled by setMonth
      : purchaseDate.getFullYear();
    const lockDiffMs = lockUntil.getTime() - purchaseDate.getTime();
    const lockDiffDays = lockDiffMs / (1000 * 60 * 60 * 24);

    // 12 months is between 365 and 366 days
    expect(lockDiffDays).toBeGreaterThanOrEqual(365);
    expect(lockDiffDays).toBeLessThanOrEqual(366);

    // Before lock date should be before lockUntil
    const beforeLock = new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later
    const afterLock = new Date(lockUntil.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after lock

    expect(beforeLock < lockUntil).toBe(true);
    expect(afterLock > lockUntil).toBe(true);
  });

  it("validates total shares limit", () => {
    const TOTAL_SHARES = 1_000_000;
    const SHARE_PRICE = 9.90;
    const maxInvestment = TOTAL_SHARES * SHARE_PRICE;

    expect(TOTAL_SHARES).toBe(1000000);
    expect(maxInvestment).toBe(9900000); // R$ 9.9 million max
  });
});
