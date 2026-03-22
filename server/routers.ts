import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import {
  getUserByOpenId,
  upsertUser,
  updateUserProfile,
  getUserStats,
  getShareholderEarnings,
  getWithdrawals,
  getSharesPurchases,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getPlatformStats,
  getAllUsers,
  getDailyEarnings,
  createDailyEarning,
  distributeEarnings,
  createWithdrawal,
  updateWithdrawalStatus,
  getAffiliateLinks,
  createAffiliateLink,
  updateAffiliateLink,
  incrementLinkClick,
  getPlatformSettings,
  updatePlatformSetting,
  createSharesPurchase,
  updateSharesPurchaseStatus,
  checkAndUnlockShares,
} from "./db";
import { notifyOwner } from "./_core/notification";

// Admin middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // User profile
  user: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return user;
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        fullName: z.string().min(3).max(255),
        cpf: z.string().min(11).max(14),
        phone: z.string().min(10).max(20),
        pixKey: z.string().min(1).max(255),
        pixKeyType: z.enum(["cpf", "email", "phone", "random"]),
        joinedWhatsapp: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, {
          ...input,
          profileComplete: true,
        });
        return { success: true };
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return getUserStats(ctx.user.id);
    }),
  }),

  // Shares (cotas)
  shares: router({
    myPurchases: protectedProcedure.query(async ({ ctx }) => {
      return getSharesPurchases(ctx.user.id);
    }),

    createCharge: protectedProcedure
      .input(z.object({
        quantity: z.number().int().min(1).max(10000),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check profile completeness
        const user = await getUserByOpenId(ctx.user.openId);
        if (!user?.profileComplete) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Complete seu perfil antes de comprar cotas",
          });
        }

        const pricePerShare = 9.90;
        const totalAmount = input.quantity * pricePerShare;
        const correlationId = `gluuu-${ctx.user.id}-${Date.now()}`;

        // Create pending purchase in DB
        const purchase = await createSharesPurchase({
          userId: ctx.user.id,
          quantity: input.quantity,
          pricePerShare: pricePerShare.toString(),
          totalAmount: totalAmount.toString(),
          wooviCorrelationId: correlationId,
          status: "pending",
        });

        // Try to create Woovi charge
        const wooviApiKey = process.env.WOOVI_API_KEY;
        if (wooviApiKey) {
          try {
            const response = await fetch("https://api.woovi.com/api/v1/charge", {
              method: "POST",
              headers: {
                "Authorization": wooviApiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                correlationID: correlationId,
                value: Math.round(totalAmount * 100), // in cents
                comment: `Gluuu - ${input.quantity} cota(s) @ R$ ${pricePerShare}`,
                expiresIn: 3600, // 1 hour
                customer: {
                  name: user.fullName || user.name || "Acionista Gluuu",
                  taxID: { taxID: user.cpf?.replace(/\D/g, "") || "", type: "BR:CPF" },
                  phone: user.phone?.replace(/\D/g, "") || "",
                  email: user.email || "",
                },
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const charge = data.charge;
              await updateSharesPurchaseStatus(purchase.id, {
                wooviChargeId: charge.identifier,
                pixQrCode: charge.qrCodeImage,
                pixCopyPaste: charge.brCode,
              });

              return {
                purchaseId: purchase.id,
                pixQrCode: charge.qrCodeImage,
                pixCopyPaste: charge.brCode,
                totalAmount,
                quantity: input.quantity,
                correlationId,
                expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
              };
            }
          } catch (err) {
            console.error("[Woovi] Error creating charge:", err);
          }
        }

        // Fallback: return mock PIX data for development
        return {
          purchaseId: purchase.id,
          pixQrCode: null,
          pixCopyPaste: `00020126580014br.gov.bcb.pix0136${correlationId}5204000053039865802BR5925GLUUU PLATAFORMA6009SAO PAULO62070503***6304ABCD`,
          totalAmount,
          quantity: input.quantity,
          correlationId,
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          isDev: !wooviApiKey,
        };
      }),

    checkPayment: protectedProcedure
      .input(z.object({ purchaseId: z.number() }))
      .query(async ({ ctx, input }) => {
        const purchases = await getSharesPurchases(ctx.user.id);
        const purchase = purchases.find(p => p.id === input.purchaseId);
        if (!purchase) throw new TRPCError({ code: "NOT_FOUND" });
        return purchase;
      }),

    checkUnlock: protectedProcedure.mutation(async ({ ctx }) => {
      return checkAndUnlockShares(ctx.user.id);
    }),
  }),

  // Earnings
  earnings: router({
    myEarnings: protectedProcedure
      .input(z.object({
        period: z.enum(["7d", "30d", "90d", "365d", "all"]).default("30d"),
      }))
      .query(async ({ ctx, input }) => {
        return getShareholderEarnings(ctx.user.id, input.period);
      }),

    summary: protectedProcedure.query(async ({ ctx }) => {
      return getUserStats(ctx.user.id);
    }),
  }),

  // Withdrawals
  withdrawals: router({
    myWithdrawals: protectedProcedure.query(async ({ ctx }) => {
      return getWithdrawals(ctx.user.id);
    }),

    request: protectedProcedure
      .input(z.object({
        amount: z.number().min(10), // Minimum R$ 10
        pixKey: z.string().min(1),
        pixKeyType: z.enum(["cpf", "email", "phone", "random"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const stats = await getUserStats(ctx.user.id);
        const amountCents = Math.round(input.amount * 100);

        if (amountCents > (stats?.availableBalance || 0)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Saldo insuficiente para saque",
          });
        }

        const correlationId = `withdrawal-${ctx.user.id}-${Date.now()}`;

        const withdrawal = await createWithdrawal({
          userId: ctx.user.id,
          amount: input.amount.toString(),
          amountCents,
          pixKey: input.pixKey,
          pixKeyType: input.pixKeyType,
          wooviCorrelationId: correlationId,
          status: "pending",
        });

        // Notify admin
        await notifyOwner({
          title: "Nova Solicitação de Saque",
          content: `Acionista ID ${ctx.user.id} solicitou saque de R$ ${input.amount.toFixed(2)}`,
        });

        return { success: true, withdrawalId: withdrawal.id };
      }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotifications(ctx.user.id);
    }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, ctx.user.id);
        return { success: true };
      }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // Affiliate links
  affiliateLinks: router({
    list: publicProcedure.query(async () => {
      return getAffiliateLinks();
    }),

    trackClick: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await incrementLinkClick(input.id);
        return { success: true };
      }),
  }),

  // Platform settings (public read)
  settings: router({
    get: publicProcedure.query(async () => {
      return getPlatformSettings();
    }),
  }),

  // Admin routes
  admin: router({
    // Dashboard stats
    stats: adminProcedure.query(async () => {
      return getPlatformStats();
    }),

    // Daily earnings
    dailyEarnings: adminProcedure
      .input(z.object({
        limit: z.number().default(30),
      }))
      .query(async ({ input }) => {
        return getDailyEarnings(input.limit);
      }),

    launchDailyEarning: adminProcedure
      .input(z.object({
        date: z.string(), // YYYY-MM-DD
        totalCommission: z.number().min(0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createDailyEarning({
          date: input.date,
          totalCommission: input.totalCommission,
          notes: input.notes,
          createdBy: ctx.user.id,
        });

        // Distribute earnings to shareholders
        await distributeEarnings(result.id);

        return { success: true, earningId: result.id };
      }),

    // Users management
    users: adminProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return getAllUsers(input.page, input.limit);
      }),

    // Withdrawals management
    pendingWithdrawals: adminProcedure.query(async () => {
      return getWithdrawals(undefined, "pending");
    }),

    processWithdrawal: adminProcedure
      .input(z.object({
        withdrawalId: z.number(),
        action: z.enum(["approve", "reject"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const status = input.action === "approve" ? "processing" : "failed";
        await updateWithdrawalStatus(input.withdrawalId, {
          status,
          failureReason: input.reason,
          processedAt: new Date(),
        });
        return { success: true };
      }),

    // Affiliate links management
    createLink: adminProcedure
      .input(z.object({
        platform: z.enum(["shopee", "mercadolivre"]),
        url: z.string().url(),
        title: z.string().optional(),
        description: z.string().optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createAffiliateLink({
          ...input,
          createdBy: ctx.user.id,
          validFrom: input.validFrom ? (new Date(input.validFrom) as unknown as Date) : undefined,
          validUntil: input.validUntil ? (new Date(input.validUntil) as unknown as Date) : undefined,
        });
        return { success: true };
      }),

    updateLink: adminProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean().optional(),
        url: z.string().url().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateAffiliateLink(id, data);
        return { success: true };
      }),

    // Platform settings
    updateSetting: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        await updatePlatformSetting(input.key, input.value);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
