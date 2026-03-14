import type { Express, Request, Response } from "express";
import {
  getPaymentByWooviChargeId,
  updatePayment,
  getSubscriptionByUserId,
  createSubscription,
  updateSubscription,
  getUserById,
  isWebhookEventProcessed,
  markWebhookEventProcessed,
} from "./db";
import { validateWooviWebhookSignature } from "./woovi";
import { sendSubscriptionConfirmedEmail, sendSubscriptionExpiredEmail } from "./email";
import { PLANS } from "../shared/plans";

const WOOVI_WEBHOOK_SECRET = process.env.WOOVI_WEBHOOK_SECRET || "";

export function registerWooviWebhook(app: Express) {
  app.post("/api/webhooks/woovi", async (req: Request, res: Response) => {
    try {
      const rawBody = JSON.stringify(req.body);
      const signature = req.headers["x-webhook-signature"] as string || "";

      // Validate HMAC signature
      if (WOOVI_WEBHOOK_SECRET && signature) {
        const isValid = validateWooviWebhookSignature(rawBody, signature, WOOVI_WEBHOOK_SECRET);
        if (!isValid) {
          console.warn("[Webhook] Invalid signature");
          return res.status(401).json({ error: "Invalid signature" });
        }
      }

      const event = req.body;
      const eventId = event.event?.id || event.id || `${event.type}_${Date.now()}`;
      const eventType = event.type || event.event?.type;

      // Idempotency check
      if (await isWebhookEventProcessed(eventId)) {
        console.log(`[Webhook] Event ${eventId} already processed`);
        return res.json({ ok: true, duplicate: true });
      }

      console.log(`[Webhook] Processing event: ${eventType} (${eventId})`);

      const charge = event.charge || event;
      const correlationID = charge.correlationID;

      if (!correlationID) {
        return res.status(400).json({ error: "Missing correlationID" });
      }

      // Find payment
      const payment = await getPaymentByWooviChargeId(correlationID);

      if (eventType === "OPENPIX:CHARGE_COMPLETED" || eventType === "payment.confirmed") {
        if (payment) {
          await updatePayment(payment.id, {
            status: "confirmed",
            paidAt: new Date(),
          });

          // Activate/renew subscription
          const userId = payment.userId;
          const planId = payment.plan as keyof typeof PLANS;
          const planConfig = PLANS[planId];

          if (planConfig) {
            const existingSub = await getSubscriptionByUserId(userId);
            const now = new Date();
            const periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            if (existingSub) {
              await updateSubscription(existingSub.id, {
                plan: planId,
                status: "active",
                videosLimit: planConfig.videosPerMonth,
                videosUsed: 0,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
              });
            } else {
              await createSubscription({
                userId,
                plan: planId,
                status: "active",
                videosLimit: planConfig.videosPerMonth,
                videosUsed: 0,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
              });
            }

            // Send confirmation email
            const user = await getUserById(userId);
            if (user?.email) {
              await sendSubscriptionConfirmedEmail(user.email, user.name || "Corretor", {
                name: planConfig.name,
                videosPerMonth: planConfig.videosPerMonth,
                price: planConfig.price,
              });
            }
          }
        }
      } else if (eventType === "OPENPIX:CHARGE_EXPIRED" || eventType === "payment.failed") {
        if (payment) {
          await updatePayment(payment.id, { status: "failed" });
        }
      } else if (eventType === "OPENPIX:SUBSCRIPTION_CANCELLED" || eventType === "subscription.cancelled") {
        if (payment) {
          const sub = await getSubscriptionByUserId(payment.userId);
          if (sub) {
            await updateSubscription(sub.id, {
              status: "cancelled",
              cancelledAt: new Date(),
            });
            const user = await getUserById(payment.userId);
            if (user?.email) {
              await sendSubscriptionExpiredEmail(user.email, user.name || "Corretor");
            }
          }
        }
      }

      // Mark event as processed
      await markWebhookEventProcessed(eventId, "woovi", eventType || "unknown");

      res.json({ ok: true });
    } catch (err) {
      console.error("[Webhook] Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
