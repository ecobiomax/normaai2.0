import { Router } from "express";
import { confirmSharesPurchase, updateWithdrawalStatus, getWithdrawals, createNotification } from "./db";

export function registerWebhookRoutes(app: Router) {
  // Woovi Webhook for charge confirmations (PIX payment received)
  app.post("/api/webhooks/woovi", async (req, res) => {
    try {
      const body = req.body;
      console.log("[Woovi Webhook]", JSON.stringify(body, null, 2));

      // Woovi sends event type in body
      const eventType = body.event || body.type;
      const charge = body.charge || body;

      if (eventType === "OPENPIX:CHARGE_COMPLETED" || eventType === "charge.completed") {
        const correlationID = charge.correlationID || charge.correlationId;
        if (!correlationID) {
          return res.status(400).json({ error: "Missing correlationID" });
        }

        // Check if it's a share purchase (starts with 'gluuu-')
        if (correlationID.startsWith("gluuu-")) {
          const purchase = await confirmSharesPurchase(correlationID);
          if (purchase) {
            console.log(`[Woovi] Share purchase confirmed: ${correlationID}`);
          }
        }

        return res.json({ success: true });
      }

      if (eventType === "OPENPIX:TRANSACTION_RECEIVED" || eventType === "transaction.received") {
        // Handle incoming transaction
        const correlationID = charge.correlationID || charge.correlationId;
        if (correlationID?.startsWith("gluuu-")) {
          await confirmSharesPurchase(correlationID);
        }
        return res.json({ success: true });
      }

      if (eventType === "OPENPIX:PAYMENT_CONFIRMED" || eventType === "payment.confirmed") {
        // Withdrawal payment confirmed
        const correlationID = charge.correlationID || charge.correlationId;
        if (correlationID?.startsWith("withdrawal-")) {
          const withdrawals = await getWithdrawals(undefined, "processing");
          const withdrawal = withdrawals.find(w => w.wooviCorrelationId === correlationID);
          if (withdrawal) {
            await updateWithdrawalStatus(withdrawal.id, {
              status: "completed",
              processedAt: new Date(),
            });
            await createNotification({
              userId: withdrawal.userId,
              type: "withdrawal_processed",
              title: "Saque Realizado!",
              message: `Seu saque de R$ ${Number(withdrawal.amount).toFixed(2)} foi processado com sucesso.`,
            });
          }
        }
        return res.json({ success: true });
      }

      if (eventType === "OPENPIX:PAYMENT_FAILED" || eventType === "payment.failed") {
        const correlationID = charge.correlationID || charge.correlationId;
        if (correlationID?.startsWith("withdrawal-")) {
          const withdrawals = await getWithdrawals(undefined, "processing");
          const withdrawal = withdrawals.find(w => w.wooviCorrelationId === correlationID);
          if (withdrawal) {
            await updateWithdrawalStatus(withdrawal.id, {
              status: "failed",
              failureReason: body.reason || "Falha no processamento",
            });
            await createNotification({
              userId: withdrawal.userId,
              type: "withdrawal_failed" as const,
              title: "Saque Falhou",
              message: `Seu saque de R$ ${Number(withdrawal.amount).toFixed(2)} não pôde ser processado. O valor foi estornado ao seu saldo.`,
            });
          }
        }
        return res.json({ success: true });
      }

      // Unknown event - just acknowledge
      res.json({ success: true, event: eventType });
    } catch (error) {
      console.error("[Woovi Webhook] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
