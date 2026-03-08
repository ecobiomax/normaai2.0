/**
 * OpenAI helper para VibeDia
 * - Geração de texto via GPT-4o
 * - Geração de imagens via DALL-E 3
 * - Salva imagens no S3
 */

import { storagePut } from "./storage";

function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY não configurada");
  return key;
}

// ─── Text Generation ──────────────────────────────────────────────────────────

export type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAITextOptions = {
  messages: OpenAIMessage[];
  model?: string;
  maxTokens?: number;
  responseFormat?: { type: "json_object" } | { type: "text" };
};

export async function generateText(options: OpenAITextOptions): Promise<string> {
  const key = getOpenAIKey();

  const payload: Record<string, unknown> = {
    model: options.model ?? "gpt-4o-mini",
    messages: options.messages,
    max_tokens: options.maxTokens ?? 512,
  };

  if (options.responseFormat) {
    payload.response_format = options.responseFormat;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`OpenAI text generation failed (${response.status}): ${err}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content ?? "";
  return content.trim();
}

// ─── Image Generation (DALL-E 3) ─────────────────────────────────────────────

export type GenerateImageOptions = {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
};

export async function generateImageWithDallE(
  options: GenerateImageOptions
): Promise<string> {
  const key = getOpenAIKey();

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: options.prompt,
      n: 1,
      size: options.size ?? "1024x1024",
      quality: options.quality ?? "standard",
      style: options.style ?? "vivid",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`DALL-E 3 generation failed (${response.status}): ${err}`);
  }

  const data = (await response.json()) as {
    data: Array<{ b64_json: string }>;
  };

  const b64 = data.data[0]?.b64_json;
  if (!b64) throw new Error("DALL-E 3 returned empty image");

  // Save to S3
  const buffer = Buffer.from(b64, "base64");
  const key2 = `vibedia/images/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const { url } = await storagePut(key2, buffer, "image/png");

  return url;
}

// ─── Prompt Builders ─────────────────────────────────────────────────────────

const CATEGORY_PROMPTS: Record<string, string> = {
  "mensagem-de-bom-dia": `Crie uma mensagem de bom dia inspiradora e positiva em português brasileiro.
Regras: máximo 25 palavras, linguagem simples e calorosa, tom alegre e esperançoso, inclua 1-2 emojis relevantes.
Retorne apenas a mensagem, sem aspas ou explicações.`,

  "mensagem-de-boa-tarde": `Crie uma mensagem de boa tarde animada e positiva em português brasileiro.
Regras: máximo 25 palavras, linguagem simples, tom energético e motivador, inclua 1-2 emojis.
Retorne apenas a mensagem.`,

  "mensagem-de-boa-noite": `Crie uma mensagem de boa noite tranquila e reconfortante em português brasileiro.
Regras: máximo 25 palavras, linguagem suave e acolhedora, tom sereno e carinhoso, inclua 1-2 emojis.
Retorne apenas a mensagem.`,

  "mensagem-motivacional": `Crie uma frase motivacional poderosa e única em português brasileiro.
Regras: máximo 25 palavras, linguagem direta e impactante, tom inspirador e determinado, inclua 1 emoji.
Retorne apenas a frase.`,

  "mensagem-de-amor": `Crie uma mensagem de amor romântica e sincera em português brasileiro.
Regras: máximo 25 palavras, linguagem poética e carinhosa, tom romântico e apaixonado, inclua 1-2 emojis.
Retorne apenas a mensagem.`,

  "frases-de-reflexao": `Crie uma frase de reflexão profunda e significativa em português brasileiro.
Regras: máximo 25 palavras, linguagem filosófica mas acessível, tom contemplativo, inclua 1 emoji sutil.
Retorne apenas a frase.`,

  "frases-curtas": `Crie uma frase curta e impactante em português brasileiro.
Regras: máximo 15 palavras, linguagem direta e memorável, tom positivo, inclua 1 emoji.
Retorne apenas a frase.`,

  "frases-para-whatsapp": `Crie uma mensagem criativa para status de WhatsApp em português brasileiro.
Regras: máximo 20 palavras, linguagem jovem e descontraída, tom positivo e compartilhável, inclua 1-2 emojis.
Retorne apenas a mensagem.`,
};

export function getMessagePrompt(categorySlug: string, categoryName: string): string {
  return CATEGORY_PROMPTS[categorySlug]
    ?? `Crie uma mensagem inspiradora sobre "${categoryName}" em português brasileiro. Máximo 25 palavras, tom positivo, inclua emojis. Retorne apenas a mensagem.`;
}

// ─── Image Prompts ────────────────────────────────────────────────────────────

const CATEGORY_IMAGE_PROMPTS: Record<string, string> = {
  "mensagem-de-bom-dia": "Serene sunrise over golden fields, warm morning light, soft watercolor style, peaceful and uplifting atmosphere, no text",
  "mensagem-de-boa-tarde": "Bright afternoon sky with soft clouds, golden sunlight through trees, warm and energetic mood, watercolor illustration, no text",
  "mensagem-de-boa-noite": "Peaceful night sky with stars and crescent moon, soft blue and purple tones, tranquil and dreamy atmosphere, watercolor style, no text",
  "mensagem-motivacional": "Abstract geometric shapes in gold and navy blue, dynamic upward movement, powerful and inspiring composition, modern art style, no text",
  "mensagem-de-amor": "Soft romantic composition with rose petals, warm pink and gold tones, delicate watercolor hearts, elegant and tender mood, no text",
  "frases-de-reflexao": "Misty forest path at dawn, philosophical and contemplative mood, soft light filtering through trees, watercolor style, no text",
  "frases-curtas": "Minimalist geometric design with gold accents on cream background, elegant and impactful composition, no text",
  "frases-para-whatsapp": "Vibrant colorful abstract pattern, modern and youthful design, bright cheerful colors, social media aesthetic, no text",
};

export function getMessageImagePrompt(categorySlug: string): string {
  const base = CATEGORY_IMAGE_PROMPTS[categorySlug]
    ?? "Inspirational abstract art, warm golden tones, elegant composition, no text";
  return `${base}. Style: elegant, sophisticated, sacred geometry elements, golden ratio composition. High quality, 1024x1024.`;
}

const SIGN_IMAGE_PROMPTS: Record<string, string> = {
  aries: "Aries zodiac symbol, ram constellation, bold red and gold colors, sacred geometry, mystical cosmic art, no text",
  touro: "Taurus zodiac symbol, bull constellation, earth tones green and gold, sacred geometry, mystical cosmic art, no text",
  gemeos: "Gemini zodiac symbol, twins constellation, dual yellow and silver colors, sacred geometry, mystical cosmic art, no text",
  cancer: "Cancer zodiac symbol, crab constellation, silver and blue moonlit colors, sacred geometry, mystical cosmic art, no text",
  leao: "Leo zodiac symbol, lion constellation, royal gold and orange colors, sacred geometry, mystical cosmic art, no text",
  virgem: "Virgo zodiac symbol, maiden constellation, soft green and white colors, sacred geometry, mystical cosmic art, no text",
  libra: "Libra zodiac symbol, scales constellation, blue and gold balanced colors, sacred geometry, mystical cosmic art, no text",
  escorpiao: "Scorpio zodiac symbol, scorpion constellation, deep red and black colors, sacred geometry, mystical cosmic art, no text",
  sagitario: "Sagittarius zodiac symbol, archer constellation, purple and gold colors, sacred geometry, mystical cosmic art, no text",
  capricornio: "Capricorn zodiac symbol, sea-goat constellation, dark brown and silver colors, sacred geometry, mystical cosmic art, no text",
  aquario: "Aquarius zodiac symbol, water bearer constellation, electric blue and silver colors, sacred geometry, mystical cosmic art, no text",
  peixes: "Pisces zodiac symbol, fish constellation, ocean blue and seafoam colors, sacred geometry, mystical cosmic art, no text",
};

export function getHoroscopeImagePrompt(sign: string): string {
  const base = SIGN_IMAGE_PROMPTS[sign]
    ?? `${sign} zodiac constellation, mystical cosmic art, sacred geometry, golden accents, no text`;
  return `${base}. Watercolor and digital art fusion, elegant, sophisticated, cosmic atmosphere, stars and nebula background. High quality.`;
}
