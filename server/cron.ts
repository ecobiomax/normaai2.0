/**
 * Cron Jobs para geração automática de conteúdo
 * - Horóscopo: todos os dias às 06:00 BRT
 * - Mensagens: a cada 2 horas
 */

import { invokeLLM } from "./_core/llm";
import {
  getAllCategories,
  insertGenerationLog,
  insertHoroscope,
  insertMessage,
} from "./db";

const SIGNS = [
  "aries", "touro", "gemeos", "cancer", "leao", "virgem",
  "libra", "escorpiao", "sagitario", "capricornio", "aquario", "peixes",
] as const;

const SIGN_NAMES: Record<string, string> = {
  aries: "Áries", touro: "Touro", gemeos: "Gêmeos", cancer: "Câncer",
  leao: "Leão", virgem: "Virgem", libra: "Libra", escorpiao: "Escorpião",
  sagitario: "Sagitário", capricornio: "Capricórnio", aquario: "Aquário", peixes: "Peixes",
};

const SIGN_DATES: Record<string, string> = {
  aries: "21 de março a 19 de abril",
  touro: "20 de abril a 20 de maio",
  gemeos: "21 de maio a 20 de junho",
  cancer: "21 de junho a 22 de julho",
  leao: "23 de julho a 22 de agosto",
  virgem: "23 de agosto a 22 de setembro",
  libra: "23 de setembro a 22 de outubro",
  escorpiao: "23 de outubro a 21 de novembro",
  sagitario: "22 de novembro a 21 de dezembro",
  capricornio: "22 de dezembro a 19 de janeiro",
  aquario: "20 de janeiro a 18 de fevereiro",
  peixes: "19 de fevereiro a 20 de março",
};

function getTodayBRT(): string {
  const now = new Date();
  const brt = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return brt.toISOString().split("T")[0];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

async function generateMessageText(categorySlug: string, categoryName: string): Promise<string> {
  const prompts: Record<string, string> = {
    "mensagem-de-bom-dia": "Crie uma mensagem de bom dia inspiradora em português brasileiro. Máximo 25 palavras, tom alegre, 1-2 emojis. Retorne apenas a mensagem.",
    "mensagem-de-boa-tarde": "Crie uma mensagem de boa tarde animada em português brasileiro. Máximo 25 palavras, tom energético, 1-2 emojis. Retorne apenas a mensagem.",
    "mensagem-de-boa-noite": "Crie uma mensagem de boa noite tranquila em português brasileiro. Máximo 25 palavras, tom sereno, 1-2 emojis. Retorne apenas a mensagem.",
    "mensagem-motivacional": "Crie uma frase motivacional poderosa em português brasileiro. Máximo 25 palavras, tom inspirador, 1 emoji. Retorne apenas a frase.",
    "mensagem-de-amor": "Crie uma mensagem de amor romântica em português brasileiro. Máximo 25 palavras, tom carinhoso, 1-2 emojis. Retorne apenas a mensagem.",
    "frases-de-reflexao": "Crie uma frase de reflexão profunda em português brasileiro. Máximo 25 palavras, tom contemplativo, 1 emoji. Retorne apenas a frase.",
    "frases-curtas": "Crie uma frase curta e impactante em português brasileiro. Máximo 15 palavras, tom positivo, 1 emoji. Retorne apenas a frase.",
    "frases-para-whatsapp": "Crie uma mensagem criativa para status de WhatsApp em português brasileiro. Máximo 20 palavras, tom descontraído, 1-2 emojis. Retorne apenas a mensagem.",
  };

  const prompt = prompts[categorySlug] || `Crie uma mensagem sobre "${categoryName}". Máximo 25 palavras, tom positivo, emojis. Retorne apenas a mensagem.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Você cria mensagens inspiradoras em português brasileiro. Retorne apenas a mensagem, sem aspas." },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  return typeof raw === "string" ? raw.trim() : "Cada dia é uma nova oportunidade! ✨";
}

async function generateHoroscopeForSign(sign: string, date: string) {
  const signName = SIGN_NAMES[sign] || sign;
  const signDates = SIGN_DATES[sign] || "";

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Você é um astrólogo que escreve horóscopos em português brasileiro. Retorne JSON válido." },
      {
        role: "user",
        content: `Horóscopo para ${signName} (${signDates}) em ${date}. JSON: {"text":"80-120 palavras, tom místico","loveText":"30-40 palavras amor","workText":"30-40 palavras trabalho","energyText":"20-30 palavras energia"}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "horoscope",
        strict: true,
        schema: {
          type: "object",
          properties: {
            text: { type: "string" },
            loveText: { type: "string" },
            workText: { type: "string" },
            energyText: { type: "string" },
          },
          required: ["text", "loveText", "workText", "energyText"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (typeof raw !== "string") throw new Error("Empty response");
  return JSON.parse(raw);
}

// ─── Job: Generate Messages ───────────────────────────────────────────────────

export async function runMessageGenerationJob() {
  console.log("[Cron] Starting message generation job...");
  try {
    const cats = await getAllCategories();
    let total = 0;

    for (const cat of cats) {
      try {
        const text = await generateMessageText(cat.slug, cat.name);
        const baseSlug = slugify(text);
        const uniqueSlug = `${baseSlug}-${Date.now()}`;
        await insertMessage({ categoryId: cat.id, text, slug: uniqueSlug, active: true });
        await insertGenerationLog({ type: "message", status: "success", details: `Category: ${cat.slug}` });
        total++;
      } catch (err: any) {
        console.error(`[Cron] Error generating message for ${cat.slug}:`, err?.message);
        await insertGenerationLog({ type: "message", status: "error", details: `${cat.slug}: ${err?.message}` });
      }
    }

    console.log(`[Cron] Message generation complete: ${total} messages created`);
  } catch (err: any) {
    console.error("[Cron] Message generation job failed:", err?.message);
  }
}

// ─── Job: Generate Horoscopes ─────────────────────────────────────────────────

export async function runHoroscopeGenerationJob() {
  const date = getTodayBRT();
  console.log(`[Cron] Starting horoscope generation for ${date}...`);

  for (const sign of SIGNS) {
    try {
      const content = await generateHoroscopeForSign(sign, date);
      const slug = `horoscopo-${sign}-${date}`;
      await insertHoroscope({
        sign: sign as any,
        date: date as any,
        text: content.text,
        loveText: content.loveText,
        workText: content.workText,
        energyText: content.energyText,
        slug,
      });
      await insertGenerationLog({ type: "horoscope", status: "success", details: `Sign: ${sign}, Date: ${date}` });
      console.log(`[Cron] Horoscope generated for ${sign}`);
    } catch (err: any) {
      console.error(`[Cron] Error generating horoscope for ${sign}:`, err?.message);
      await insertGenerationLog({ type: "horoscope", status: "error", details: `${sign}: ${err?.message}` });
    }
  }

  console.log("[Cron] Horoscope generation complete");
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

export function startCronJobs() {
  console.log("[Cron] Starting cron jobs...");

  // Check every minute
  setInterval(async () => {
    const now = new Date();
    const brtNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const hours = brtNow.getHours();
    const minutes = brtNow.getMinutes();

    // Horoscope: every day at 06:00 BRT
    if (hours === 6 && minutes === 0) {
      await runHoroscopeGenerationJob();
    }

    // Messages: every 2 hours at minute 0
    if (minutes === 0 && hours % 2 === 0) {
      await runMessageGenerationJob();
    }
  }, 60 * 1000);

  console.log("[Cron] Cron jobs scheduled: horoscope at 06:00 BRT, messages every 2 hours");
}
