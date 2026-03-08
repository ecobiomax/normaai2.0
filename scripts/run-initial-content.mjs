/**
 * Script de geração inicial de conteúdo — VibeDia
 * Executa: seed de categorias + mensagens (sem imagem) + horóscopo de hoje (sem imagem)
 * Uso: node scripts/run-initial-content.mjs
 */

import { config } from "dotenv";
config({ path: ".env" });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DB_URL = process.env.DATABASE_URL;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!DB_URL) { console.error("❌ DATABASE_URL não configurada"); process.exit(1); }
if (!OPENAI_KEY) { console.error("❌ OPENAI_API_KEY não configurada"); process.exit(1); }

console.log("✅ Variáveis de ambiente OK");

// ─── Database ─────────────────────────────────────────────────────────────────

import mysql from "mysql2/promise";

const conn = await mysql.createConnection(DB_URL);
console.log("✅ Banco de dados conectado");

async function query(sql, params = []) {
  const [rows] = await conn.execute(sql, params);
  return rows;
}

// ─── Categories Seed ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Mensagem de Bom Dia", slug: "mensagem-de-bom-dia", description: "Mensagens inspiradoras para começar o dia com energia e positividade", icon: "🌅" },
  { name: "Mensagem de Boa Tarde", slug: "mensagem-de-boa-tarde", description: "Frases motivadoras para a tarde, renovando as energias do dia", icon: "☀️" },
  { name: "Mensagem de Boa Noite", slug: "mensagem-de-boa-noite", description: "Mensagens tranquilas e reflexivas para encerrar o dia com paz", icon: "🌙" },
  { name: "Mensagem Motivacional", slug: "mensagem-motivacional", description: "Frases poderosas para motivar, inspirar e superar desafios", icon: "💪" },
  { name: "Mensagem de Amor", slug: "mensagem-de-amor", description: "Palavras carinhosas para expressar sentimentos e afeto", icon: "❤️" },
  { name: "Frases de Reflexão", slug: "frases-de-reflexao", description: "Pensamentos profundos para reflexão e crescimento pessoal", icon: "🤔" },
  { name: "Frases Curtas", slug: "frases-curtas", description: "Mensagens breves e impactantes para compartilhar nas redes sociais", icon: "✨" },
  { name: "Frases para WhatsApp", slug: "frases-para-whatsapp", description: "Mensagens especiais para enviar no WhatsApp e alegrar o dia de alguém", icon: "📱" },
];

async function seedCategories() {
  console.log("\n\uD83D\uDCC2 Criando categorias...");
  for (const cat of CATEGORIES) {
    await query(
      `INSERT INTO categories (name, slug, description, icon, active, createdAt)
       VALUES (?, ?, ?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), icon=VALUES(icon)`,
      [cat.name, cat.slug, cat.description, cat.icon]
    );
    console.log(`  \u2705 ${cat.name}`);
  }
  console.log("\u2705 Categorias criadas!");
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────

async function callOpenAI(messages, options = {}) {
  const payload = {
    model: options.model || "gpt-4o-mini",
    messages,
    max_tokens: options.maxTokens || 150,
    ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

// ─── Message Prompts ──────────────────────────────────────────────────────────

const MESSAGE_PROMPTS = {
  "mensagem-de-bom-dia": "Crie uma mensagem de bom dia inspiradora em português brasileiro. Máximo 25 palavras, tom alegre, inclua 1-2 emojis.",
  "mensagem-de-boa-tarde": "Crie uma mensagem de boa tarde motivadora em português brasileiro. Máximo 25 palavras, tom positivo, inclua 1-2 emojis.",
  "mensagem-de-boa-noite": "Crie uma mensagem de boa noite tranquila em português brasileiro. Máximo 25 palavras, tom sereno, inclua 1-2 emojis.",
  "mensagem-motivacional": "Crie uma frase motivacional poderosa em português brasileiro. Máximo 30 palavras, impactante e inspiradora.",
  "mensagem-de-amor": "Crie uma mensagem de amor carinhosa em português brasileiro. Máximo 25 palavras, tom afetuoso e sincero.",
  "frases-de-reflexao": "Crie uma frase de reflexão profunda em português brasileiro. Máximo 30 palavras, filosófica e instigante.",
  "frases-curtas": "Crie uma frase curta e impactante em português brasileiro. Máximo 15 palavras, direta e memorável.",
  "frases-para-whatsapp": "Crie uma mensagem para WhatsApp em português brasileiro. Máximo 25 palavras, informal e calorosa, inclua emojis.",
};

function slugify(text) {
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

async function generateMessages(count = 3) {
  console.log(`\n💬 Gerando ${count} mensagens por categoria...`);
  const cats = await query("SELECT id, name, slug FROM categories WHERE active = 1");

  let total = 0;
  for (const cat of cats) {
    const prompt = MESSAGE_PROMPTS[cat.slug] || `Crie uma mensagem inspiradora sobre ${cat.name} em português brasileiro. Máximo 25 palavras.`;

    for (let i = 0; i < count; i++) {
      try {
        const text = await callOpenAI([
          { role: "system", content: "Você é especialista em criar mensagens inspiradoras em português brasileiro. Crie conteúdo único. Responda APENAS com a mensagem, sem aspas, sem explicações." },
          { role: "user", content: prompt },
        ], { maxTokens: 100 });

        const baseSlug = slugify(text);
        const uniqueSlug = `${baseSlug}-${Date.now()}-${i}`;

        await query(
          `INSERT INTO messages (categoryId, text, slug, active, createdAt, updatedAt)
           VALUES (?, ?, ?, 1, NOW(), NOW())
           ON DUPLICATE KEY UPDATE text=VALUES(text)`,
          [cat.id, text, uniqueSlug]
        );

        total++;
        process.stdout.write(`  ✅ [${cat.slug}] ${text.substring(0, 60)}...\n`);
      } catch (err) {
        console.error(`  ❌ Erro em ${cat.slug}: ${err.message}`);
      }

      // Pequeno delay para não sobrecarregar a API
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`✅ ${total} mensagens geradas!`);
}

// ─── Horoscope Generation ─────────────────────────────────────────────────────

const SIGNS = [
  { slug: "aries", name: "Áries", dates: "21 de março a 19 de abril" },
  { slug: "touro", name: "Touro", dates: "20 de abril a 20 de maio" },
  { slug: "gemeos", name: "Gêmeos", dates: "21 de maio a 20 de junho" },
  { slug: "cancer", name: "Câncer", dates: "21 de junho a 22 de julho" },
  { slug: "leao", name: "Leão", dates: "23 de julho a 22 de agosto" },
  { slug: "virgem", name: "Virgem", dates: "23 de agosto a 22 de setembro" },
  { slug: "libra", name: "Libra", dates: "23 de setembro a 22 de outubro" },
  { slug: "escorpiao", name: "Escorpião", dates: "23 de outubro a 21 de novembro" },
  { slug: "sagitario", name: "Sagitário", dates: "22 de novembro a 21 de dezembro" },
  { slug: "capricornio", name: "Capricórnio", dates: "22 de dezembro a 19 de janeiro" },
  { slug: "aquario", name: "Aquário", dates: "20 de janeiro a 18 de fevereiro" },
  { slug: "peixes", name: "Peixes", dates: "19 de fevereiro a 20 de março" },
];

function getTodayBRT() {
  const now = new Date();
  const brt = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return brt.toISOString().split("T")[0];
}

async function generateHoroscopes() {
  const date = getTodayBRT();
  console.log(`\n⭐ Gerando horóscopo para ${date}...`);

  let total = 0;
  for (const sign of SIGNS) {
    try {
      const content = await callOpenAI([
        { role: "system", content: "Você é um astrólogo que escreve horóscopos em português brasileiro. Retorne APENAS JSON válido, sem markdown, sem explicações." },
        {
          role: "user",
          content: `Horóscopo para ${sign.name} (${sign.dates}) em ${date}. Retorne JSON: {"text":"previsão geral de 80-120 palavras","loveText":"amor em 30-40 palavras","workText":"trabalho em 30-40 palavras","energyText":"energia em 20-30 palavras"}`,
        },
      ], { maxTokens: 600, responseFormat: { type: "json_object" } });

      const parsed = JSON.parse(content);
      const slug = `horoscopo-${sign.slug}-${date}`;

      await query(
        `INSERT INTO horoscopes (sign, date, text, loveText, workText, energyText, slug, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE text=VALUES(text), loveText=VALUES(loveText), workText=VALUES(workText), energyText=VALUES(energyText)`,
        [sign.slug, date, parsed.text, parsed.loveText, parsed.workText, parsed.energyText, slug]
      );

      total++;
      console.log(`  ✅ ${sign.name}: ${parsed.text.substring(0, 60)}...`);
    } catch (err) {
      console.error(`  ❌ Erro em ${sign.name}: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`✅ ${total}/12 horóscopos gerados para ${date}!`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log("\n🚀 VibeDia — Geração inicial de conteúdo");
console.log("==========================================");

await seedCategories();
await generateMessages(3); // 3 mensagens por categoria = 24 mensagens
await generateHoroscopes(); // 12 signos

await conn.end();
console.log("\n🎉 Geração inicial concluída com sucesso!");
console.log("   O site já está populado com conteúdo real.");
