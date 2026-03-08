/**
 * Cron Jobs para geração automática de conteúdo — VibeDia
 *
 * Agendamento:
 *  - Horóscopo (texto + imagem DALL-E 3): todos os dias às 06:00 BRT
 *  - Mensagens (texto + imagem DALL-E 3): a cada 2 horas
 *
 * Imagens são geradas automaticamente e salvas no S3.
 * Para desativar imagens, defina CRON_WITH_IMAGES=false no ambiente.
 */

import {
  generateText,
  generateImageWithDallE,
  getMessagePrompt,
  getMessageImagePrompt,
  getHoroscopeImagePrompt,
} from "./openai";
import {
  getAllCategories,
  insertGenerationLog,
  insertHoroscope,
  insertMessage,
} from "./db";
import { storagePut } from "./storage";

// ─── Configuração ─────────────────────────────────────────────────────────────

// Por padrão, gera imagens nos cron jobs. Defina CRON_WITH_IMAGES=false para desativar.
const CRON_WITH_IMAGES = process.env.CRON_WITH_IMAGES !== "false";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

async function generateAndSaveImage(prompt: string): Promise<string | null> {
  try {
    // generateImageWithDallE já salva no S3 internamente e retorna a URL
    const url = await generateImageWithDallE({ prompt, size: "1024x1024", quality: "standard", style: "vivid" });
    return url || null;
  } catch (err: any) {
    console.error(`[Cron] Failed to generate image:`, err?.message);
    return null;
  }
}

// ─── Job: Generate Messages ───────────────────────────────────────────────────

export async function runMessageGenerationJob() {
  console.log(`[Cron] Starting message generation job (withImages: ${CRON_WITH_IMAGES})...`);
  try {
    const cats = await getAllCategories();
    let total = 0;

    for (const cat of cats) {
      try {
        const prompt = getMessagePrompt(cat.slug, cat.name);
        const text = await generateText({
          messages: [
            {
              role: "system",
              content: "Você é um especialista em criar mensagens inspiradoras em português brasileiro. Crie conteúdo único e autêntico. Nunca repita mensagens anteriores.",
            },
            { role: "user", content: prompt },
          ],
          model: "gpt-4o-mini",
          maxTokens: 100,
        });

        const messageText = text || "Cada dia é uma nova oportunidade! ✨";
        const baseSlug = slugify(messageText);
        const uniqueSlug = `${baseSlug}-${Date.now()}`;

        let imageUrl: string | null = null;
        if (CRON_WITH_IMAGES) {
          const imagePrompt = getMessageImagePrompt(cat.slug);
          imageUrl = await generateAndSaveImage(imagePrompt);
        }

        await insertMessage({
          categoryId: cat.id,
          text: messageText,
          slug: uniqueSlug,
          active: true,
          imageUrl,
        });

        await insertGenerationLog({
          type: "message",
          status: "success",
          details: `Category: ${cat.slug}${imageUrl ? " (com imagem)" : ""}`,
        });

        total++;
        console.log(`[Cron] Message generated for ${cat.slug}${imageUrl ? " + image" : ""}`);
      } catch (err: any) {
        console.error(`[Cron] Error generating message for ${cat.slug}:`, err?.message);
        await insertGenerationLog({
          type: "message",
          status: "error",
          details: `${cat.slug}: ${err?.message}`,
        });
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
  console.log(`[Cron] Starting horoscope generation for ${date} (withImages: ${CRON_WITH_IMAGES})...`);

  for (const sign of SIGNS) {
    try {
      const signName = SIGN_NAMES[sign] || sign;
      const signDates = SIGN_DATES[sign] || "";

      const content = await generateText({
        messages: [
          {
            role: "system",
            content: "Você é um astrólogo que escreve horóscopos em português brasileiro. Retorne APENAS JSON válido, sem markdown.",
          },
          {
            role: "user",
            content: `Horóscopo para ${signName} (${signDates}) em ${date}. JSON: {"text":"80-120 palavras gerais","loveText":"30-40 palavras amor","workText":"30-40 palavras trabalho","energyText":"20-30 palavras energia"}`,
          },
        ],
        model: "gpt-4o-mini",
        maxTokens: 600,
        responseFormat: { type: "json_object" },
      });

      if (!content) throw new Error("Empty response from LLM");
      const parsed = JSON.parse(content);

      let imageUrl: string | null = null;
      if (CRON_WITH_IMAGES) {
        const imagePrompt = getHoroscopeImagePrompt(sign);
        imageUrl = await generateAndSaveImage(imagePrompt);
      }

      const slug = `horoscopo-${sign}-${date}`;
      await insertHoroscope({
        sign: sign as any,
        date: date as any,
        text: parsed.text,
        loveText: parsed.loveText,
        workText: parsed.workText,
        energyText: parsed.energyText,
        slug,
        imageUrl,
      });

      await insertGenerationLog({
        type: "horoscope",
        status: "success",
        details: `Sign: ${sign}, Date: ${date}${imageUrl ? " (com imagem)" : ""}`,
      });

      console.log(`[Cron] Horoscope generated for ${sign}${imageUrl ? " + image" : ""}`);
    } catch (err: any) {
      console.error(`[Cron] Error generating horoscope for ${sign}:`, err?.message);
      await insertGenerationLog({
        type: "horoscope",
        status: "error",
        details: `${sign}: ${err?.message}`,
      });
    }
  }

  console.log("[Cron] Horoscope generation complete");
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

export function startCronJobs() {
  console.log(`[Cron] Starting cron jobs (CRON_WITH_IMAGES=${CRON_WITH_IMAGES})...`);

  // Verifica a cada minuto
  setInterval(async () => {
    const now = new Date();
    const brtNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const hours = brtNow.getHours();
    const minutes = brtNow.getMinutes();

    // Horóscopo: todos os dias às 06:00 BRT
    if (hours === 6 && minutes === 0) {
      await runHoroscopeGenerationJob();
    }

    // Mensagens: a cada 2 horas no minuto 0
    if (minutes === 0 && hours % 2 === 0) {
      await runMessageGenerationJob();
    }
  }, 60 * 1000);

  console.log("[Cron] Scheduled: horoscope at 06:00 BRT daily, messages every 2 hours");
}
