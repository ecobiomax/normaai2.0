import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(cookieHeader = ""): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { cookie: cookieHeader },
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("adminAuth.login", () => {
  it("rejects wrong credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminAuth.login({ username: "hacker", password: "wrong" })
    ).rejects.toThrow();
  });

  it("rejects correct username but wrong password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminAuth.login({ username: "jrmemachado", password: "wrongpassword" })
    ).rejects.toThrow();
  });

  it("accepts correct credentials jrmemachado/davilorena", async () => {
    let cookieSet = false;
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        cookie: (_name: string, _value: string, _opts: unknown) => {
          cookieSet = true;
        },
        clearCookie: () => {},
      } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.adminAuth.login({
      username: "jrmemachado",
      password: "davilorena",
    });

    expect(result.success).toBe(true);
    expect(result.username).toBe("jrmemachado");
    expect(cookieSet).toBe(true);
  });

  it("returns null session when no admin cookie present", async () => {
    const ctx = createPublicContext("");
    const caller = appRouter.createCaller(ctx);
    const session = await caller.adminAuth.me();
    expect(session).toBeNull();
  });

  it("blocks content generation without admin session", async () => {
    const ctx = createPublicContext("");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.content.seedCategories()
    ).rejects.toThrow();
  });
});
