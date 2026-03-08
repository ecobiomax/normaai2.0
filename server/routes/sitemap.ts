import { Router } from "express";
import { getAllCategories, getAllHoroscopeSlugs, getAllMessageSlugs } from "../db";

const router = Router();
const BASE_URL = "https://www.vibedia.com.br";

const SIGNS = [
  "aries", "touro", "gemeos", "cancer", "leao", "virgem",
  "libra", "escorpiao", "sagitario", "capricornio", "aquario", "peixes",
];

const STATIC_PAGES = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/horoscopo-de-hoje", priority: "1.0", changefreq: "daily" },
  { url: "/mensagem-de-bom-dia", priority: "0.9", changefreq: "hourly" },
  { url: "/mensagem-de-boa-tarde", priority: "0.9", changefreq: "hourly" },
  { url: "/mensagem-de-boa-noite", priority: "0.9", changefreq: "hourly" },
  { url: "/mensagem-motivacional", priority: "0.9", changefreq: "hourly" },
  { url: "/mensagem-de-amor", priority: "0.8", changefreq: "daily" },
  { url: "/frases-de-reflexao", priority: "0.8", changefreq: "daily" },
  { url: "/frases-curtas", priority: "0.8", changefreq: "daily" },
  { url: "/frases-para-whatsapp", priority: "0.8", changefreq: "daily" },
  { url: "/sobre", priority: "0.5", changefreq: "monthly" },
  { url: "/politica-de-privacidade", priority: "0.3", changefreq: "yearly" },
];

function xmlEscape(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

// Sitemap Index
router.get("/sitemap.xml", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemaps/sitemap-estatico.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/sitemap-mensagens.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/sitemap-horoscopo.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/sitemap-categorias.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/sitemap-recentes.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
  res.setHeader("Content-Type", "application/xml");
  res.send(xml);
});

// Static sitemap
router.get("/sitemaps/sitemap-estatico.xml", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const urls = STATIC_PAGES.map(
    (p) => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  res.setHeader("Content-Type", "application/xml");
  res.send(xml);
});

// Messages sitemap
router.get("/sitemaps/sitemap-mensagens.xml", async (req, res) => {
  try {
    const slugs = await getAllMessageSlugs();
    const urls = slugs
      .slice(0, 50000)
      .map(
        (s) => `  <url>
    <loc>${BASE_URL}/mensagem/${xmlEscape(s.slug)}</loc>
    <lastmod>${formatDate(s.updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

// Horoscope sitemap
router.get("/sitemaps/sitemap-horoscopo.xml", async (req, res) => {
  try {
    const slugs = await getAllHoroscopeSlugs();
    const signUrls = SIGNS.map(
      (sign) => `  <url>
    <loc>${BASE_URL}/horoscopo/${sign}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
    ).join("\n");

    const horoUrls = slugs
      .slice(0, 50000)
      .map(
        (s) => `  <url>
    <loc>${BASE_URL}/horoscopo/${xmlEscape(s.slug)}</loc>
    <lastmod>${formatDate(s.updatedAt)}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${signUrls}
${horoUrls}
</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

// Categories sitemap
router.get("/sitemaps/sitemap-categorias.xml", async (req, res) => {
  try {
    const cats = await getAllCategories();
    const today = new Date().toISOString().split("T")[0];
    const urls = cats
      .map(
        (c) => `  <url>
    <loc>${BASE_URL}/${xmlEscape(c.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

// Recent content sitemap
router.get("/sitemaps/sitemap-recentes.xml", async (req, res) => {
  try {
    const [msgSlugs, horoSlugs] = await Promise.all([
      getAllMessageSlugs(),
      getAllHoroscopeSlugs(),
    ]);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const recentMsgs = msgSlugs
      .filter((s) => s.updatedAt >= cutoff)
      .slice(0, 1000)
      .map(
        (s) => `  <url>
    <loc>${BASE_URL}/mensagem/${xmlEscape(s.slug)}</loc>
    <lastmod>${formatDate(s.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("\n");

    const recentHoro = horoSlugs
      .filter((s) => s.updatedAt >= cutoff)
      .slice(0, 1000)
      .map(
        (s) => `  <url>
    <loc>${BASE_URL}/horoscopo/${xmlEscape(s.slug)}</loc>
    <lastmod>${formatDate(s.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${recentMsgs}
${recentHoro}
</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

// RSS Feed
router.get("/feed.xml", async (req, res) => {
  try {
    const [msgs, horoscopes] = await Promise.all([
      getAllMessageSlugs(),
      getAllHoroscopeSlugs(),
    ]);

    const recentMsgs = msgs.slice(0, 20);
    const recentHoro = horoscopes.slice(0, 12);
    const now = new Date().toUTCString();

    const msgItems = recentMsgs
      .map(
        (s) => `    <item>
      <title>Mensagem: ${xmlEscape(s.slug.replace(/-/g, " "))}</title>
      <link>${BASE_URL}/mensagem/${xmlEscape(s.slug)}</link>
      <guid>${BASE_URL}/mensagem/${xmlEscape(s.slug)}</guid>
      <pubDate>${s.updatedAt.toUTCString()}</pubDate>
    </item>`
      )
      .join("\n");

    const horoItems = recentHoro
      .map(
        (s) => `    <item>
      <title>Horóscopo: ${xmlEscape(s.slug.replace(/-/g, " "))}</title>
      <link>${BASE_URL}/horoscopo/${xmlEscape(s.slug)}</link>
      <guid>${BASE_URL}/horoscopo/${xmlEscape(s.slug)}</guid>
      <pubDate>${s.updatedAt.toUTCString()}</pubDate>
    </item>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VibeDia - Frases e Horóscopo</title>
    <link>${BASE_URL}</link>
    <description>Portal de mensagens motivacionais, frases inspiracionais e horóscopo diário</description>
    <language>pt-BR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${msgItems}
${horoItems}
  </channel>
</rss>`;
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating RSS feed");
  }
});

// Robots.txt
router.get("/robots.txt", (req, res) => {
  const txt = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemaps/sitemap-mensagens.xml
Sitemap: ${BASE_URL}/sitemaps/sitemap-horoscopo.xml
Sitemap: ${BASE_URL}/sitemaps/sitemap-categorias.xml
`;
  res.setHeader("Content-Type", "text/plain");
  res.send(txt);
});

export default router;
