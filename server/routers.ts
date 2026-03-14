import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getUserById,
  updateUser,
  getSubscriptionByUserId,
  getVideosByUserId,
  getVideoById,
  createVideo,
  updateVideo,
  getPaymentsByUserId,
  createPayment,
  getPaymentByWooviChargeId,
  updatePayment,
  createSubscription,
  updateSubscription,
  incrementVideosUsed,
  isWebhookEventProcessed,
  markWebhookEventProcessed,
} from "./db";
import { storagePut, storageGet } from "./storage";
import { PLANS, VIDEO_EXPIRY_DAYS, MUSIC_TRACKS } from "../shared/plans";
import { videoQueue } from "./queue";
import { createWooviCharge } from "./woovi";
import { sendVideoReadyEmail, sendSubscriptionConfirmedEmail } from "./email";
import crypto from "crypto";

// ─── Auth Router ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── Dashboard Router ─────────────────────────────────────────────────────────
const dashboardRouter = router({
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const [subscription, videos] = await Promise.all([
      getSubscriptionByUserId(userId),
      getVideosByUserId(userId),
    ]);

    const totalVideos = videos.length;
    const readyVideos = videos.filter((v) => v.status === "ready").length;
    const processingVideos = videos.filter((v) =>
      ["processing", "analyzing", "generating", "composing"].includes(v.status)
    ).length;
    const expiredVideos = videos.filter((v) => v.status === "expired").length;
    const recentVideos = videos.slice(0, 3);

    return {
      subscription,
      recentVideos,
      totalVideos,
      readyVideos,
      processingVideos,
      expiredVideos,
    };
  }),
});

// ─── Videos Router ────────────────────────────────────────────────────────────
const videosRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const videos = await getVideosByUserId(ctx.user.id);
      if (input?.status && input.status !== "all") {
        return videos.filter((v) => v.status === input.status);
      }
      return videos;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const video = await getVideoById(input.id);
      if (!video || video.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return video;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(300),
        propertyType: z.enum(["apartamento", "casa", "comercial", "terreno"]),
        videoStyle: z.enum(["Moderno", "Luxo", "Aconchegante", "Minimalista", "Classico"]),
        specialHighlight: z.string().optional(),
        photosUrls: z.array(z.string()).min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check subscription
      const subscription = await getSubscriptionByUserId(userId);
      if (!subscription || subscription.status !== "active") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Assinatura inativa. Assine um plano para criar vídeos.",
        });
      }

      // Check credits
      if (
        subscription.videosLimit !== -1 &&
        subscription.videosUsed >= subscription.videosLimit
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Limite de vídeos atingido. Faça upgrade do seu plano.",
        });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + VIDEO_EXPIRY_DAYS);

      const musicTrack = MUSIC_TRACKS[input.videoStyle] || "track_modern.mp3";

      await createVideo({
        userId,
        title: input.title,
        propertyType: input.propertyType,
        videoStyle: input.videoStyle,
        specialHighlight: input.specialHighlight,
        photosCount: input.photosUrls.length,
        photosUrls: input.photosUrls as any,
        status: "pending",
        progress: 0,
        expiresAt,
        musicTrack,
        notifiedReady: false,
        notifiedExpiring: false,
      });

      // Get the created video ID
      const videos = await getVideosByUserId(userId);
      const video = videos[0];

      // Increment usage
      await incrementVideosUsed(subscription.id);

      // Enqueue video generation job
      await videoQueue.add("generate-video", {
        videoId: video.id,
        userId,
        photosUrls: input.photosUrls,
        videoStyle: input.videoStyle,
        propertyType: input.propertyType,
        title: input.title,
        specialHighlight: input.specialHighlight,
        musicTrack,
      });

      return { videoId: video.id, success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const video = await getVideoById(input.id);
      if (!video || video.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await updateVideo(input.id, { status: "expired" });
      return { success: true };
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const video = await getVideoById(input.id);
      if (!video || video.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (video.status !== "ready" || !video.finalVideoKey) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Vídeo não está pronto" });
      }
      const { url } = await storageGet(video.finalVideoKey);
      return { url };
    }),

  uploadPhoto: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        base64: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(input.contentType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tipo de arquivo não permitido" });
      }

      const base64Data = input.base64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      if (buffer.length > 10 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Arquivo muito grande (máx 10MB)" });
      }

      const ext = input.contentType.split("/")[1] || "jpg";
      const key = `photos/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, buffer, input.contentType);

      return { url, key };
    }),
});

// ─── Subscription Router ──────────────────────────────────────────────────────
const subscriptionRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getSubscriptionByUserId(ctx.user.id);
  }),

  getPayments: protectedProcedure.query(async ({ ctx }) => {
    return getPaymentsByUserId(ctx.user.id);
  }),

  createCharge: protectedProcedure
    .input(z.object({ plan: z.enum(["basico", "profissional", "agencia"]) }))
    .mutation(async ({ ctx, input }) => {
      const planConfig = PLANS[input.plan];
      const userId = ctx.user.id;
      const user = await getUserById(userId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const charge = await createWooviCharge({
        value: Math.round(planConfig.price * 100),
        correlationID: `sub_${userId}_${Date.now()}`,
        comment: `Pluuu - Plano ${planConfig.name}`,
        customer: {
          name: user.name || "Cliente",
          email: user.email || "",
        },
      });

      await createPayment({
        userId,
        amount: planConfig.price,
        type: "subscription",
        status: "pending",
        plan: input.plan,
        wooviChargeId: charge.correlationID,
        wooviQrCode: charge.brCode || charge.qrCodeImage,
        wooviQrCodeText: charge.brCode,
        idempotencyKey: charge.correlationID,
      });

      return {
        qrCode: charge.qrCodeImage,
        qrCodeText: charge.brCode,
        chargeId: charge.correlationID,
        expiresAt: charge.expiresDate,
      };
    }),

  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await getSubscriptionByUserId(ctx.user.id);
    if (!subscription) throw new TRPCError({ code: "NOT_FOUND" });
    await updateSubscription(subscription.id, {
      status: "cancelled",
      cancelledAt: new Date(),
    });
    return { success: true };
  }),
});

// ─── Profile Router ───────────────────────────────────────────────────────────
const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getUserById(ctx.user.id);
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200).optional(),
        phone: z.string().max(20).optional(),
        userType: z.enum(["corretor", "imobiliaria"]).optional(),
        creci: z.string().max(50).optional(),
        companyName: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUser(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  dashboard: dashboardRouter,
  videos: videosRouter,
  subscription: subscriptionRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
