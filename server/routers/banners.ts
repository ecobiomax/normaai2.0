import { z } from "zod";
import {
  getAllBanners,
  getActiveBannerByPosition,
  insertBanner,
  updateBanner,
  deleteBanner,
} from "../db";
import { storagePut } from "../storage";
import { adminLocalProcedure, publicProcedure, router } from "../_core/trpc";
import { nanoid } from "nanoid";

export const bannersRouter = router({
  /** Público: busca o banner ativo por posição (top, mid, footer) */
  getActive: publicProcedure
    .input(z.object({ position: z.enum(["top", "mid", "footer"]) }))
    .query(async ({ input }) => {
      return getActiveBannerByPosition(input.position) ?? null;
    }),

  /** Admin: lista todos os banners */
  getAll: adminLocalProcedure.query(async () => {
    return getAllBanners();
  }),

  /** Admin: faz upload de imagem para S3 e salva o banner no banco */
  upload: adminLocalProcedure
    .input(
      z.object({
        /** Base64 da imagem */
        imageBase64: z.string(),
        /** MIME type: image/webp, image/png, image/jpeg */
        mimeType: z.string().default("image/webp"),
        /** Link de afiliado (ex: Shopee) */
        affiliateLink: z.string().url().optional(),
        /** Texto alternativo */
        altText: z.string().optional(),
        /** Posição no layout */
        position: z.enum(["top", "mid", "footer"]).default("mid"),
      })
    )
    .mutation(async ({ input }) => {
      const suffix = nanoid(8);
      const ext = input.mimeType.split("/")[1] ?? "webp";
      const fileKey = `banners/banner-${suffix}.${ext}`;

      // Converte base64 para Buffer
      const base64Data = input.imageBase64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Faz upload para S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Salva no banco
      const id = await insertBanner({
        position: input.position,
        imageUrl: url,
        fileKey,
        affiliateLink: input.affiliateLink ?? null,
        altText: input.altText ?? "Publicidade",
        active: true,
      });

      return { id, imageUrl: url, fileKey };
    }),

  /** Admin: atualiza link de afiliado, altText ou status ativo */
  update: adminLocalProcedure
    .input(
      z.object({
        id: z.number(),
        affiliateLink: z.string().url().nullable().optional(),
        altText: z.string().optional(),
        active: z.boolean().optional(),
        position: z.enum(["top", "mid", "footer"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateBanner(id, data as any);
      return { success: true };
    }),

  /** Admin: remove banner */
  delete: adminLocalProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteBanner(input.id);
      return { success: true };
    }),
});
