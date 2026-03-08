/**
 * Helper de verificação de sessão admin — sem dependências circulares
 * Usado tanto pelo trpc.ts (middleware) quanto pelo adminAuth.ts (router)
 */

import { jwtVerify, SignJWT } from "jose";
import type { Request } from "express";

export const ADMIN_COOKIE = "vibedia_admin_session";

function getAdminSecret(): Uint8Array {
  const base = process.env.JWT_SECRET || "vibedia-admin-secret-key-2026";
  return new TextEncoder().encode(base + "-admin");
}

export async function signAdminToken(username: string): Promise<string> {
  return new SignJWT({ username, role: "admin", type: "vibedia_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(getAdminSecret());
}

export async function verifyAdminToken(
  token: string
): Promise<{ username: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getAdminSecret(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.username === "string" &&
      payload.role === "admin" &&
      payload.type === "vibedia_admin"
    ) {
      return { username: payload.username, role: "admin" };
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyAdminSession(req: Request): Promise<boolean> {
  const cookieHeader = req.headers?.cookie || "";
  const match = cookieHeader.match(
    new RegExp(`${ADMIN_COOKIE}=([^;\\s]+)`)
  );
  const token = match?.[1];
  if (!token) return false;
  const session = await verifyAdminToken(token);
  return session !== null;
}
