import axios from "axios";
import crypto from "crypto";

const WOOVI_API_KEY = process.env.WOOVI_API_KEY || "";
const WOOVI_BASE_URL = "https://api.woovi.com/api/v1";

interface WooviCustomer {
  name: string;
  email: string;
  taxID?: string;
  phone?: string;
}

interface WooviChargeInput {
  value: number; // in cents
  correlationID: string;
  comment?: string;
  customer?: WooviCustomer;
  expiresIn?: number; // seconds
}

interface WooviChargeResponse {
  correlationID: string;
  status: string;
  brCode?: string;
  qrCodeImage?: string;
  expiresDate?: string;
  value?: number;
}

export async function createWooviCharge(input: WooviChargeInput): Promise<WooviChargeResponse> {
  if (!WOOVI_API_KEY) {
    // Mock response for development
    console.warn("[Woovi] API key not set, returning mock charge");
    return {
      correlationID: input.correlationID,
      status: "ACTIVE",
      brCode: `00020126580014BR.GOV.BCB.PIX0136${input.correlationID}5204000053039865802BR5925PLUUU PAGAMENTOS LTDA6009SAO PAULO62070503***6304ABCD`,
      qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(input.correlationID)}`,
      expiresDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      value: input.value,
    };
  }

  try {
    const response = await axios.post(
      `${WOOVI_BASE_URL}/charge`,
      {
        value: input.value,
        correlationID: input.correlationID,
        comment: input.comment,
        customer: input.customer,
        expiresIn: input.expiresIn || 3600,
      },
      {
        headers: {
          Authorization: WOOVI_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const charge = response.data.charge || response.data;
    return {
      correlationID: charge.correlationID || input.correlationID,
      status: charge.status,
      brCode: charge.brCode,
      qrCodeImage: charge.qrCodeImage,
      expiresDate: charge.expiresDate,
      value: charge.value,
    };
  } catch (err: any) {
    console.error("[Woovi] Failed to create charge:", err?.response?.data || err.message);
    throw new Error(`Woovi charge creation failed: ${err?.response?.data?.message || err.message}`);
  }
}

export async function getWooviCharge(correlationID: string): Promise<WooviChargeResponse> {
  if (!WOOVI_API_KEY) {
    return { correlationID, status: "ACTIVE" };
  }

  const response = await axios.get(`${WOOVI_BASE_URL}/charge?correlationID=${correlationID}`, {
    headers: { Authorization: WOOVI_API_KEY },
  });

  return response.data.charge || response.data;
}

/**
 * Validate Woovi webhook signature using HMAC SHA256
 */
export function validateWooviWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) return true; // Skip validation in development
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSig, "hex")
  );
}
