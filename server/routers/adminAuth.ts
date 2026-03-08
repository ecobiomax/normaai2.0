/**
 * Autenticação exclusiva do painel admin VibeDia
 * Login por usuário + senha — independente do OAuth Manus
 * Apenas jrmemachado/davilorena é autorizado
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getSessionCookieOptions } from "../_core/cookies";
import {
  ADMIN_COOKIE,
  signAdminToken,
  verifyAdminToken,
} from "../_core/adminSession";

// Credenciais fixas do admin (podem ser sobrescritas por env vars)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "jrmemachado";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "davilorena";

export const adminAuthRouter = router({
  // Login com usuário/senha
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificação estrita: apenas jrmemachado/davilorena
      if (
        input.username !== ADMIN_USERNAME ||
        input.password !== ADMIN_PASSWORD
      ) {
        // Delay para dificultar brute-force
        await new Promise((r) => setTimeout(r, 800));
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário ou senha incorretos.",
        });
      }

      const token = await signAdminToken(input.username);
      const cookieOptions = getSessionCookieOptions(ctx.req);

      ctx.res.cookie(ADMIN_COOKIE, token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 24h
      });

      return { success: true, username: input.username };
    }),

  // Verificar sessão admin
  me: publicProcedure.query(async ({ ctx }) => {
    const cookieHeader = ctx.req.headers.cookie || "";
    const match = cookieHeader.match(
      new RegExp(`${ADMIN_COOKIE}=([^;\\s]+)`)
    );
    const token = match?.[1];
    if (!token) return null;
    return verifyAdminToken(token);
  }),

  // Logout admin
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(ADMIN_COOKIE, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
});
