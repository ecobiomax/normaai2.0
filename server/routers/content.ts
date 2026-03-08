import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  countHoroscopes,
  countMessages,
  getAllCategories,
  getAllHoroscopeSlugs,
  getAllMessageSlugs,
  getCategoryBySlug,
  getHoroscopeBySignAndDate,
  getMessageBySlug,
  getMessageBySlugWithCategory,
  getMessagesByCategory,
  getRecentHoroscopes,
  getRecentMessages,
  getTodayHoroscopes,
  insertGenerationLog,
  insertHoroscope,
  insertMessage,
  upsertCategory,
  getRecentGenerationLogs,
} from "../db";
import {
  generateText,
  generateImageWithDallE,
  getMessagePrompt,
  getMessageImagePrompt,
  getHoroscopeImagePrompt,
} from "../openai";
import { adminLocalProcedure, publicProcedure, router } from "../_core/trpc";

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

const CATEGORIES_SEED = [
  { name: "Mensagem de Bom Dia", slug: "mensagem-de-bom-dia", description: "Mensagens positivas para começar o dia com energia e alegria", icon: "☀️" },
  { name: "Mensagem de Boa Tarde", slug: "mensagem-de-boa-tarde", description: "Mensagens calorosas para o meio do dia", icon: "🌤️" },
  { name: "Mensagem de Boa Noite", slug: "mensagem-de-boa-noite", description: "Mensagens tranquilas para encerrar o dia com paz", icon: "🌙" },
  { name: "Mensagem Motivacional", slug: "mensagem-motivacional", description: "Frases que inspiram e motivam a superar desafios", icon: "💪" },
  { name: "Mensagem de Amor", slug: "mensagem-de-amor", description: "Mensagens românticas e carinhosas para quem você ama", icon: "❤️" },
  { name: "Frases de Reflexão", slug: "frases-de-reflexao", description: "Pensamentos profundos para refletir sobre a vida", icon: "🌿" },
  { name: "Frases Curtas", slug: "frases-curtas", description: "Frases impactantes e diretas para compartilhar", icon: "✨" },
  { name: "Frases para WhatsApp", slug: "frases-para-whatsapp", description: "Mensagens perfeitas para status e conversas no WhatsApp", icon: "💬" },
];

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

async function generateMessageContent(categorySlug: string, categoryName: string): Promise<string> {
  const prompt = getMessagePrompt(categorySlug, categoryName);
  const text = await generateText({
    messages: [
      { role: "system", content: "Você é um especialista em criar mensagens inspiradoras e positivas em português brasileiro. Crie conteúdo único, autêntico e emocionalmente ressonante. Nunca repita mensagens anteriores." },
      { role: "user", content: prompt },
    ],
    model: "gpt-4o-mini",
    maxTokens: 100,
  });
  return text || "Cada dia é uma nova oportunidade de ser melhor! ✨";
}

async function generateMessageImage(categorySlug: string): Promise<string | null> {
  try {
    const prompt = getMessageImagePrompt(categorySlug);
    const url = await generateImageWithDallE({ prompt, size: "1024x1024", quality: "standard" });
    return url;
  } catch (err: any) {
    console.error(`[Image] Failed to generate image for ${categorySlug}:`, err?.message);
    return null;
  }
}

async function generateHoroscopeImage(sign: string): Promise<string | null> {
  try {
    const prompt = getHoroscopeImagePrompt(sign);
    const url = await generateImageWithDallE({ prompt, size: "1024x1024", quality: "standard" });
    return url;
  } catch (err: any) {
    console.error(`[Image] Failed to generate horoscope image for ${sign}:`, err?.message);
    return null;
  }
}

async function generateHoroscopeContent(sign: string, dateStr: string): Promise<{
  text: string; loveText: string; workText: string; energyText: string;
}> {
  const signName = SIGN_NAMES[sign] || sign;
  const signDates = SIGN_DATES[sign] || "";

  const content = await generateText({
    messages: [
      {
        role: "system",
        content: "Você é um astrólogo experiente que escreve horóscopos diários em português brasileiro. Seu estilo é místico, inspirador e positivo. Retorne APENAS JSON válido, sem markdown.",
      },
      {
        role: "user",
        content: `Horóscopo para ${signName} (${signDates}) em ${dateStr}. Retorne JSON: {"text":"80-120 palavras gerais","loveText":"30-40 palavras amor","workText":"30-40 palavras trabalho","energyText":"20-30 palavras energia do dia"}`,
      },
    ],
    model: "gpt-4o-mini",
    maxTokens: 600,
    responseFormat: { type: "json_object" },
  });

  if (!content) throw new Error("Empty LLM response");
  return JSON.parse(content);
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const contentRouter = router({
  // Seed categories
  seedCategories: adminLocalProcedure.mutation(async () => {
    for (const cat of CATEGORIES_SEED) {
      await upsertCategory(cat);
    }
    return { success: true, count: CATEGORIES_SEED.length };
  }),

  // Categories
  getCategories: publicProcedure.query(async () => {
    return getAllCategories();
  }),

  getCategoryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const cat = await getCategoryBySlug(input.slug);
      if (!cat) throw new TRPCError({ code: "NOT_FOUND" });
      return cat;
    }),

  // Messages
  getMessagesByCategory: publicProcedure
    .input(z.object({ categorySlug: z.string(), limit: z.number().default(20), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return getMessagesByCategory(input.categorySlug, input.limit, input.offset);
    }),

  getMessageBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const msg = await getMessageBySlugWithCategory(input.slug);
      if (!msg) throw new TRPCError({ code: "NOT_FOUND" });
      return msg;
    }),

  getRecentMessages: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return getRecentMessages(input.limit);
    }),

  // Horoscopes
  getTodayHoroscopes: publicProcedure.query(async () => {
    const today = getTodayBRT();
    return getTodayHoroscopes(today);
  }),

  getHoroscopeBySignAndDate: publicProcedure
    .input(z.object({ sign: z.string(), date: z.string().optional() }))
    .query(async ({ input }) => {
      const date = input.date || getTodayBRT();
      const horoscope = await getHoroscopeBySignAndDate(input.sign, date);
      if (!horoscope) throw new TRPCError({ code: "NOT_FOUND", message: "Horóscopo não encontrado para esta data" });
      return horoscope;
    }),

  getRecentHoroscopes: publicProcedure
    .input(z.object({ limit: z.number().default(12) }))
    .query(async ({ input }) => {
      return getRecentHoroscopes(input.limit);
    }),

  // Stats
  getStats: publicProcedure.query(async () => {
    const [msgCount, horoCount, cats] = await Promise.all([
      countMessages(),
      countHoroscopes(),
      getAllCategories(),
    ]);
    return { messages: msgCount, horoscopes: horoCount, categories: cats.length };
  }),

  // Generation logs
  getGenerationLogs: adminLocalProcedure.query(async () => {
    return getRecentGenerationLogs(30);
  }),

  // Generate messages (with optional image)
  generateMessage: adminLocalProcedure
    .input(z.object({
      categorySlug: z.string(),
      count: z.number().min(1).max(20).default(5),
      withImage: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const cat = await getCategoryBySlug(input.categorySlug);
      if (!cat) throw new TRPCError({ code: "NOT_FOUND", message: "Categoria não encontrada" });

      const generated: string[] = [];
      for (let i = 0; i < input.count; i++) {
        try {
          const text = await generateMessageContent(cat.slug, cat.name);
          const baseSlug = slugify(text);
          const uniqueSlug = `${baseSlug}-${Date.now()}-${i}`;
          let imageUrl: string | null = null;
          if (input.withImage) {
            imageUrl = await generateMessageImage(cat.slug);
          }
          await insertMessage({ categoryId: cat.id, text, slug: uniqueSlug, active: true, imageUrl });
          generated.push(text);
          await insertGenerationLog({ type: "message", status: "success", details: `Category: ${cat.slug}${imageUrl ? " (com imagem)" : ""}` });
        } catch (err: any) {
          await insertGenerationLog({ type: "message", status: "error", details: err?.message });
        }
      }
      return { success: true, generated };
    }),

  // Generate horoscope for all signs (with optional image)
  generateHoroscopes: adminLocalProcedure
    .input(z.object({
      date: z.string().optional(),
      withImage: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const date = input.date || getTodayBRT();
      const results: { sign: string; success: boolean }[] = [];

      for (const sign of SIGNS) {
        try {
          const content = await generateHoroscopeContent(sign, date);
          const slug = `horoscopo-${sign}-${date}`;
          let imageUrl: string | null = null;
          if (input.withImage) {
            imageUrl = await generateHoroscopeImage(sign);
          }
          await insertHoroscope({
            sign: sign as any,
            date: date as any,
            text: content.text,
            loveText: content.loveText,
            workText: content.workText,
            energyText: content.energyText,
            slug,
            imageUrl,
          });
          await insertGenerationLog({ type: "horoscope", status: "success", details: `Sign: ${sign}, Date: ${date}${imageUrl ? " (com imagem)" : ""}` });
          results.push({ sign, success: true });
        } catch (err: any) {
          await insertGenerationLog({ type: "horoscope", status: "error", details: `Sign: ${sign} - ${err?.message}` });
          results.push({ sign, success: false });
        }
      }
      return { success: true, date, results };
    }),

  // Bulk generate messages for all categories (with optional image)
  generateAllMessages: adminLocalProcedure
    .input(z.object({
      countPerCategory: z.number().min(1).max(10).default(3),
      withImage: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const cats = await getAllCategories();
      let total = 0;
      for (const cat of cats) {
        for (let i = 0; i < input.countPerCategory; i++) {
          try {
            const text = await generateMessageContent(cat.slug, cat.name);
            const baseSlug = slugify(text);
            const uniqueSlug = `${baseSlug}-${Date.now()}-${i}`;
            let imageUrl: string | null = null;
            if (input.withImage) {
              imageUrl = await generateMessageImage(cat.slug);
            }
            await insertMessage({ categoryId: cat.id, text, slug: uniqueSlug, active: true, imageUrl });
            await insertGenerationLog({ type: "message", status: "success", details: `Category: ${cat.slug}${imageUrl ? " (com imagem)" : ""}` });
            total++;
          } catch (err: any) {
            await insertGenerationLog({ type: "message", status: "error", details: err?.message });
          }
        }
      }
      return { success: true, total };
    }),

  // Sitemap data
  getSitemapData: publicProcedure.query(async () => {
    const [msgSlugs, horoSlugs, cats] = await Promise.all([
      getAllMessageSlugs(),
      getAllHoroscopeSlugs(),
      getAllCategories(),
    ]);
    return { messages: msgSlugs, horoscopes: horoSlugs, categories: cats };
  }),

  // Signs list
  getSigns: publicProcedure.query(() => {
    return SIGNS.map((sign) => ({
      slug: sign,
      name: SIGN_NAMES[sign],
      dates: SIGN_DATES[sign],
    }));
  }),
});
