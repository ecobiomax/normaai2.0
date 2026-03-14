import cron from "node-cron";
import { getExpiredVideos, updateVideo, getVideosExpiringIn2Days, getUserById, getDb } from "./db";
import { sendVideoExpiringEmail } from "./email";
import { videos, subscriptions } from "../drizzle/schema";
import { lt, eq, and } from "drizzle-orm";

export function startCronJobs() {
  // ─── Daily cleanup at 03:00 ─────────────────────────────────────────────────
  cron.schedule("0 0 3 * * *", async () => {
    console.log("[Cron] Starting daily cleanup job...");
    try {
      const expiredVideos = await getExpiredVideos();
      let deletedCount = 0;

      for (const video of expiredVideos) {
        try {
          // Mark as expired (S3 cleanup would happen here with actual S3 client)
          await updateVideo(video.id, {
            status: "expired",
            finalVideoUrl: null as any,
            finalVideoKey: null as any,
            clipsUrls: null as any,
          });
          deletedCount++;
        } catch (err) {
          console.error(`[Cron] Failed to expire video ${video.id}:`, err);
        }
      }

      console.log(`[Cron] Cleanup complete: ${deletedCount} videos expired`);
    } catch (err) {
      console.error("[Cron] Cleanup job failed:", err);
    }
  });

  // ─── Daily expiring notification at 09:00 ───────────────────────────────────
  cron.schedule("0 0 9 * * *", async () => {
    console.log("[Cron] Checking for expiring videos...");
    try {
      const expiringVideos = await getVideosExpiringIn2Days();

      for (const video of expiringVideos) {
        try {
          const user = await getUserById(video.userId);
          if (user?.email && video.finalVideoUrl) {
            await sendVideoExpiringEmail(user.email, user.name || "Corretor", {
              title: video.title,
              downloadUrl: video.finalVideoUrl,
              expiresAt: video.expiresAt,
            });
            await updateVideo(video.id, { notifiedExpiring: true });
          }
        } catch (err) {
          console.error(`[Cron] Failed to notify expiring video ${video.id}:`, err);
        }
      }

      console.log(`[Cron] Expiring notifications sent: ${expiringVideos.length}`);
    } catch (err) {
      console.error("[Cron] Expiring notification job failed:", err);
    }
  });

  // ─── Monthly credit reset at 00:00 ──────────────────────────────────────────
  cron.schedule("0 0 0 1 * *", async () => {
    console.log("[Cron] Starting monthly credit reset...");
    try {
      const db = await getDb();
      if (!db) return;

      const now = new Date();
      // Reset videosUsed for subscriptions whose period has ended
      const expiredSubs = await db
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.status, "active"), lt(subscriptions.currentPeriodEnd, now)));

      for (const sub of expiredSubs) {
        const newPeriodStart = new Date(sub.currentPeriodEnd);
        const newPeriodEnd = new Date(newPeriodStart);
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

        await db
          .update(subscriptions)
          .set({
            videosUsed: 0,
            currentPeriodStart: newPeriodStart,
            currentPeriodEnd: newPeriodEnd,
          })
          .where(eq(subscriptions.id, sub.id));
      }

      console.log(`[Cron] Monthly reset complete: ${expiredSubs.length} subscriptions reset`);
    } catch (err) {
      console.error("[Cron] Monthly reset job failed:", err);
    }
  });

  console.log("[Cron] All cron jobs scheduled");
}
