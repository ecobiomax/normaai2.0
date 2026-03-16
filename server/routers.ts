import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod/v4";
import {
  getAllPlans,
  getActiveSubscription,
  getUserVoiceProfiles,
  getUserVideoJobs,
  getVideoJobById,
  getVoiceProfileById,
  createVoiceProfile,
  deleteVoiceProfile,
  createVideoJob,
  deleteVideoJob,
  getActiveJobsCount,
  getUserBillingHistory,
  getUserSubscriptions,
  logTermsAcceptance,
  updateUserTerms,
  createAuditLog,
  updateVideoJob,
  getUserById,
  updateSubscription,
  createSubscription,
  createBillingRecord,
  updateBillingRecord,
  getPlanById,
  updateUserPlan,
} from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

// ─── Sub-routers ────────────────────────────────────────────────────────────────

const plansRouter = router({
  list: publicProcedure.query(async () => {
    return getAllPlans();
  }),
});

const subscriptionRouter = router({
  current: protectedProcedure.query(async ({ ctx }) => {
    const sub = await getActiveSubscription(ctx.user.id);
    if (!sub) return null;
    const plan = await getPlanById(sub.planId);
    return { ...sub, plan };
  }),

  history: protectedProcedure.query(async ({ ctx }) => {
    return getUserBillingHistory(ctx.user.id);
  }),

  allSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return getUserSubscriptions(ctx.user.id);
  }),

  // Inicia checkout Woovi — retorna dados do Pix
  createCheckout: protectedProcedure
    .input(z.object({ planSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await getPlanById(
        input.planSlug === "semente" ? 1 : input.planSlug === "memoria" ? 2 : 3
      );
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plano não encontrado" });

      const wooviApiKey = process.env.WOOVI_API_KEY;
      if (!wooviApiKey) {
        // Modo demo: retorna dados simulados
        const subResult = await createSubscription({
          userId: ctx.user.id,
          planId: plan.id,
          status: "pending",
          creditsRemaining: 0,
        });
        const subId = (subResult as any)?.insertId ?? 0;
        await createBillingRecord({
          userId: ctx.user.id,
          subscriptionId: subId,
          planId: plan.id,
          amountBrl: String(plan.priceBrl),
          status: "pending",
          pixCode: "00020126580014BR.GOV.BCB.PIX0136demo-pix-code-memorias-viva5204000053039865802BR5925Memorias VIVA Ltda6009SAO PAULO62070503***6304DEMO",
          pixQrCode: "data:image/png;base64,demo",
        });
        return {
          subscriptionId: subId,
          pixCode: "00020126580014BR.GOV.BCB.PIX0136demo-pix-code-memorias-viva5204000053039865802BR5925Memorias VIVA Ltda6009SAO PAULO62070503***6304DEMO",
          pixQrCode: null,
          amount: plan.priceBrl,
          planName: plan.name,
          demo: true,
        };
      }

      // Integração real Woovi
      try {
        const response = await fetch("https://api.woovi.com/api/v1/charge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: wooviApiKey,
          },
          body: JSON.stringify({
            correlationID: `sub-${ctx.user.id}-${Date.now()}`,
            value: Math.round(Number(plan.priceBrl) * 100),
            comment: `Assinatura ${plan.name} — Memórias VIVA`,
            customer: {
              name: ctx.user.name ?? "Usuário",
              email: ctx.user.email ?? "",
            },
          }),
        });
        const data = await response.json();
        const subResult = await createSubscription({
          userId: ctx.user.id,
          planId: plan.id,
          status: "pending",
          wooviChargeId: data.charge?.correlationID,
          creditsRemaining: 0,
        });
        const subId = (subResult as any)?.insertId ?? 0;
        await createBillingRecord({
          userId: ctx.user.id,
          subscriptionId: subId,
          planId: plan.id,
          amountBrl: String(plan.priceBrl),
          wooviChargeId: data.charge?.correlationID,
          pixCode: data.charge?.brCode,
          pixQrCode: data.charge?.qrCodeImage,
          status: "pending",
        });
        return {
          subscriptionId: subId,
          pixCode: data.charge?.brCode,
          pixQrCode: data.charge?.qrCodeImage,
          amount: plan.priceBrl,
          planName: plan.name,
          demo: false,
        };
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar cobrança Pix" });
      }
    }),

  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const sub = await getActiveSubscription(ctx.user.id);
    if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });
    await updateSubscription(sub.id, {
      status: "cancelled",
      cancelledAt: new Date(),
    });
    return { success: true };
  }),
});

const termsRouter = router({
  accept: protectedProcedure
    .input(
      z.object({
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      await updateUserTerms(ctx.user.id, {
        termsAccepted: true,
        termsAcceptedAt: now,
        termsVersion: "1.0",
        termsIp: input.ipAddress,
        termsUserAgent: input.userAgent,
      });
      await logTermsAcceptance({
        userId: ctx.user.id,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        termsVersion: "1.0",
      });
      return { success: true };
    }),

  status: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user) return { accepted: false, needsRenewal: false };
    const accepted = user.termsAccepted ?? false;
    const acceptedAt = user.termsAcceptedAt;
    const needsRenewal = acceptedAt
      ? Date.now() - acceptedAt.getTime() > 90 * 24 * 60 * 60 * 1000
      : true;
    return { accepted, needsRenewal, acceptedAt };
  }),
});

const voiceProfilesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserVoiceProfiles(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(128),
        audioBase64: z.string().optional(),
        audioMimeType: z.string().optional(),
        durationSec: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar limite do plano
      const sub = await getActiveSubscription(ctx.user.id);
      if (!sub) throw new TRPCError({ code: "FORBIDDEN", message: "Assinatura ativa necessária" });
      const plan = await getPlanById(sub.planId);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      const profiles = await getUserVoiceProfiles(ctx.user.id);
      if (profiles.length >= plan.maxVoiceProfiles) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Seu plano permite no máximo ${plan.maxVoiceProfiles} perfil(is) de voz`,
        });
      }

      let audioS3Url: string | undefined;
      let audioS3Key: string | undefined;

      if (input.audioBase64) {
        const buffer = Buffer.from(input.audioBase64, "base64");
        const key = `voice-profiles/${ctx.user.id}/${Date.now()}-audio.mp3`;
        const { url } = await storagePut(key, buffer, input.audioMimeType ?? "audio/mpeg");
        audioS3Url = url;
        audioS3Key = key;
      }

      const result = await createVoiceProfile({
        userId: ctx.user.id,
        name: input.name,
        audioS3Url,
        audioS3Key,
        durationSec: input.durationSec,
      });

      await createAuditLog({
        userId: ctx.user.id,
        action: "voice_profile_created",
        resourceType: "voice_profile",
        resourceId: String((result as any)?.insertId),
      });

      return { id: (result as any)?.insertId, success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteVoiceProfile(input.id, ctx.user.id);
      return { success: true };
    }),
});

const videoJobsRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return getUserVideoJobs(ctx.user.id, input.limit ?? 20);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const job = await getVideoJobById(input.id, ctx.user.id);
      if (!job) throw new TRPCError({ code: "NOT_FOUND" });
      return job;
    }),

  create: protectedProcedure
    .input(
      z.object({
        voiceProfileId: z.number(),
        photoBase64: z.string(),
        photoMimeType: z.string().optional(),
        promptText: z.string().min(1).max(2000),
        language: z.string().optional(),
        notifyByEmail: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar assinatura ativa
      const sub = await getActiveSubscription(ctx.user.id);
      if (!sub || sub.creditsRemaining <= 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: sub ? "Créditos esgotados para este mês" : "Assinatura ativa necessária",
        });
      }

      // Rate limiting: máx 2 jobs simultâneos
      const activeCount = await getActiveJobsCount(ctx.user.id);
      if (activeCount >= 2) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Você já tem 2 vídeos em processamento. Aguarde a conclusão.",
        });
      }

      // Verificar perfil de voz
      const voiceProfile = await getVoiceProfileById(input.voiceProfileId, ctx.user.id);
      if (!voiceProfile) throw new TRPCError({ code: "NOT_FOUND", message: "Perfil de voz não encontrado" });

      // Upload da foto
      const photoBuffer = Buffer.from(input.photoBase64, "base64");
      const photoKey = `video-jobs/${ctx.user.id}/${Date.now()}-photo.jpg`;
      const { url: photoUrl } = await storagePut(
        photoKey,
        photoBuffer,
        input.photoMimeType ?? "image/jpeg"
      );

      // Calcular data de expiração baseada no plano
      const plan = await getPlanById(sub.planId);
      let expiresAt: Date | undefined;
      if (plan?.storageDays) {
        expiresAt = new Date(Date.now() + plan.storageDays * 24 * 60 * 60 * 1000);
      }

      const result = await createVideoJob({
        userId: ctx.user.id,
        voiceProfileId: input.voiceProfileId,
        photoS3Url: photoUrl,
        photoS3Key: photoKey,
        promptText: input.promptText,
        language: input.language ?? "pt-BR",
        planQuality: plan?.quality,
        notifyByEmail: input.notifyByEmail ?? false,
        expiresAt,
      });

      const jobId = (result as any)?.insertId;

      await createAuditLog({
        userId: ctx.user.id,
        action: "video_job_created",
        resourceType: "video_job",
        resourceId: String(jobId),
      });

      // Iniciar pipeline assíncrono
      processVideoJob(jobId, ctx.user.id, voiceProfile, input.promptText, photoUrl, plan?.quality ?? "HD 720p").catch(
        (err) => console.error("[VideoJob] Pipeline error:", err)
      );

      return { id: jobId, success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteVideoJob(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── Pipeline assíncrono de geração de vídeo ──────────────────────────────────
async function processVideoJob(
  jobId: number,
  userId: number,
  voiceProfile: { id: number; elevenLabsVoiceId: string | null; name: string },
  promptText: string,
  photoUrl: string,
  quality: string
) {
  try {
    // Etapa 1: TTS com ElevenLabs
    await updateVideoJob(jobId, { status: "tts_processing" });
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    let audioUrl: string;
    let audioKey: string;

    if (elevenLabsKey && voiceProfile.elevenLabsVoiceId) {
      const ttsRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceProfile.elevenLabsVoiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenLabsKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: promptText,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        }
      );
      if (!ttsRes.ok) throw new Error(`ElevenLabs TTS error: ${ttsRes.status}`);
      const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
      audioKey = `video-jobs/${userId}/${jobId}-audio.mp3`;
      const { url } = await storagePut(audioKey, audioBuffer, "audio/mpeg");
      audioUrl = url;
    } else {
      // Demo mode: usar áudio placeholder
      audioKey = `demo-audio-${jobId}`;
      audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    }

    await updateVideoJob(jobId, { status: "tts_done", audioS3Url: audioUrl, audioS3Key: audioKey });

    // Etapa 2: Lip sync com D-ID
    await updateVideoJob(jobId, { status: "lipsync_processing" });
    const didKey = process.env.DID_API_KEY;
    let outputUrl: string;
    let outputKey: string;

    if (didKey) {
      const didRes = await fetch("https://api.d-id.com/talks", {
        method: "POST",
        headers: {
          Authorization: `Basic ${didKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_url: photoUrl,
          script: {
            type: "audio",
            audio_url: audioUrl,
          },
          config: {
            result_format: "mp4",
            fluent: true,
          },
        }),
      });
      if (!didRes.ok) throw new Error(`D-ID error: ${didRes.status}`);
      const didData = await didRes.json();
      const didJobId = didData.id;
      await updateVideoJob(jobId, { didJobId });

      // Polling D-ID
      let videoUrl = "";
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const pollRes = await fetch(`https://api.d-id.com/talks/${didJobId}`, {
          headers: { Authorization: `Basic ${didKey}` },
        });
        const pollData = await pollRes.json();
        if (pollData.status === "done") {
          videoUrl = pollData.result_url;
          break;
        }
        if (pollData.status === "error") throw new Error("D-ID processing failed");
      }
      if (!videoUrl) throw new Error("D-ID timeout");

      // Download e re-upload para S3
      const videoRes = await fetch(videoUrl);
      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
      outputKey = `video-jobs/${userId}/${jobId}-output.mp4`;
      const { url } = await storagePut(outputKey, videoBuffer, "video/mp4");
      outputUrl = url;
    } else {
      // Demo mode
      outputKey = `demo-video-${jobId}`;
      outputUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
    }

    await updateVideoJob(jobId, { status: "lipsync_done", outputS3Url: outputUrl, outputS3Key: outputKey });

    // Etapa 3: Marca d'água (quando disponível)
    await updateVideoJob(jobId, { status: "watermark_processing" });
    // A marca d'água será aplicada quando o arquivo marcadagua.webp for fornecido
    // Por ora, o vídeo final é o mesmo do lipsync
    await updateVideoJob(jobId, { status: "completed" });

    // Decrementar crédito
    const sub = await (await import("./db")).getActiveSubscription(userId);
    if (sub) {
      await (await import("./db")).updateSubscription(sub.id, {
        creditsRemaining: Math.max(0, sub.creditsRemaining - 1),
      });
    }
  } catch (err: any) {
    console.error("[VideoJob] Error:", err);
    await updateVideoJob(jobId, {
      status: "failed",
      errorMessage: err?.message ?? "Erro desconhecido",
    });
  }
}

// ─── App Router ────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async (opts) => {
      if (!opts.ctx.user) return null;
      const user = await getUserById(opts.ctx.user.id);
      return user ?? opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  plans: plansRouter,
  subscription: subscriptionRouter,
  terms: termsRouter,
  voiceProfiles: voiceProfilesRouter,
  videoJobs: videoJobsRouter,
});

export type AppRouter = typeof appRouter;
