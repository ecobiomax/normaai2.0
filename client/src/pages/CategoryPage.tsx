import { useState } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead, { articleSchema, breadcrumbSchema } from "@/components/SEOHead";
import ShareButtons from "@/components/ShareButtons";
import BannerAd from "@/components/BannerAd";
import { ChevronRight, RefreshCw, Home } from "lucide-react";

const CATEGORY_META: Record<string, { title: string; description: string; keywords: string; h1: string }> = {
  "mensagem-de-bom-dia": {
    title: "Mensagens de Bom Dia — Frases Lindas para Começar o Dia",
    description: "As melhores mensagens de bom dia para enviar no WhatsApp, Facebook e Instagram. Frases bonitas, motivacionais e carinhosas para alegrar a manhã de quem você ama.",
    keywords: "mensagem de bom dia, bom dia linda, bom dia motivacional, bom dia whatsapp, frases bom dia",
    h1: "Mensagens de Bom Dia",
  },
  "mensagem-de-boa-tarde": {
    title: "Mensagens de Boa Tarde — Frases Animadas para o Meio do Dia",
    description: "Mensagens de boa tarde carinhosas e animadas para enviar para amigos e família. Frases positivas para alegrar o meio do dia.",
    keywords: "mensagem de boa tarde, boa tarde linda, boa tarde motivacional, frases boa tarde",
    h1: "Mensagens de Boa Tarde",
  },
  "mensagem-de-boa-noite": {
    title: "Mensagens de Boa Noite — Frases Tranquilas para Encerrar o Dia",
    description: "Mensagens de boa noite reconfortantes e serenas para enviar antes de dormir. Frases carinhosas para desejar uma boa noite.",
    keywords: "mensagem de boa noite, boa noite linda, boa noite carinhosa, frases boa noite",
    h1: "Mensagens de Boa Noite",
  },
  "mensagem-motivacional": {
    title: "Mensagens Motivacionais — Frases Inspiradoras para se Motivar",
    description: "As melhores frases motivacionais para inspirar e motivar. Mensagens poderosas para superar desafios e alcançar seus objetivos.",
    keywords: "mensagens motivacionais, frases motivacionais, motivação, inspiração, frases de motivação",
    h1: "Mensagens Motivacionais",
  },
  "mensagem-de-amor": {
    title: "Mensagens de Amor — Frases Românticas e Apaixonadas",
    description: "As mais lindas mensagens de amor para declarar seus sentimentos. Frases românticas, apaixonadas e carinhosas para quem você ama.",
    keywords: "mensagens de amor, frases de amor, mensagem romântica, declaração de amor, frases apaixonadas",
    h1: "Mensagens de Amor",
  },
  "frases-de-reflexao": {
    title: "Frases de Reflexão — Pensamentos Profundos sobre a Vida",
    description: "Frases de reflexão profundas e significativas para pensar sobre a vida, o amor e a existência. Pensamentos filosóficos e inspiradores.",
    keywords: "frases de reflexão, pensamentos profundos, frases filosóficas, reflexão sobre a vida",
    h1: "Frases de Reflexão",
  },
  "frases-curtas": {
    title: "Frases Curtas — Mensagens Impactantes e Diretas",
    description: "As melhores frases curtas e impactantes para compartilhar nas redes sociais. Mensagens diretas, positivas e memoráveis.",
    keywords: "frases curtas, frases impactantes, frases diretas, frases para compartilhar",
    h1: "Frases Curtas",
  },
  "frases-para-whatsapp": {
    title: "Frases para WhatsApp — Status e Mensagens Criativas",
    description: "As melhores frases para status do WhatsApp e mensagens criativas para enviar nos grupos. Conteúdo divertido e positivo.",
    keywords: "frases para whatsapp, status whatsapp, frases status, mensagens whatsapp",
    h1: "Frases para WhatsApp",
  },
};

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const { data: category, isLoading: catLoading } = trpc.content.getCategoryBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: messages, isLoading: msgsLoading } = trpc.content.getMessagesByCategory.useQuery(
    { categorySlug: slug, limit: LIMIT, offset },
    { enabled: !!slug }
  );

  const meta = CATEGORY_META[slug] || {
    title: `${category?.name || "Mensagens"} — VibeDia`,
    description: category?.description || "Mensagens inspiracionais geradas por IA.",
    keywords: slug.replace(/-/g, ", "),
    h1: category?.name || "Mensagens",
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: meta.title,
    description: meta.description,
    url: `https://www.vibedia.com.br/${slug}`,
    inLanguage: "pt-BR",
  };

  const breadcrumbs = breadcrumbSchema([
    { name: "Início", url: "/" },
    { name: meta.h1, url: `/${slug}` },
  ]);

  if (catLoading) {
    return (
      <div className="container" style={{ padding: "3rem 1rem" }}>
        <div style={{ display: "grid", gap: "1rem" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "100px" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={meta.title}
        description={meta.description}
        canonical={`/${slug}`}
        keywords={meta.keywords}
        ogType="article"
        schema={{ "@graph": [schema, breadcrumbs] }}
      />

      <main>
        {/* Page Header */}
        <section style={{
          background: "linear-gradient(135deg, #1A2744 0%, #243358 100%)",
          padding: "2.5rem 0 2rem",
        }}>
          <div className="container">
            {/* Breadcrumb */}
            <nav className="breadcrumb" style={{ marginBottom: "1rem" }}>
              <Link href="/" style={{ color: "#9AAAC0", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Home size={13} /> Início
              </Link>
              <ChevronRight size={13} style={{ color: "#4A5F8A" }} />
              <span style={{ color: "#C9A84C" }}>{meta.h1}</span>
            </nav>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700,
              color: "#F8F4ED",
              marginBottom: "0.75rem",
            }}>
              {meta.h1}
            </h1>
            <p style={{ color: "#9AAAC0", fontSize: "1rem", maxWidth: "600px" }}>
              {meta.description}
            </p>
          </div>
        </section>

        <div className="gold-divider-thick" />

        <div className="container" style={{ padding: "2rem 1rem" }}>
          {/* Banner Top */}
          <BannerAd position="top" />

          <div style={{ marginTop: "2rem" }}>
            {msgsLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: "150px" }} />
                ))}
              </div>
            ) : messages && messages.length > 0 ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
                  {messages.map((msg, idx) => (
                    <div key={msg.id}>
                      <article className="message-card">
                        <p style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.25rem",
                          lineHeight: 1.65,
                          color: "#1A2744",
                          marginBottom: "1.25rem",
                          fontStyle: "italic",
                        }}>
                          "{msg.text}"
                        </p>
                        <div style={{ marginBottom: "0.875rem" }}>
                          <ShareButtons
                            text={msg.text}
                            url={`/mensagem/${msg.slug}`}
                            title={`${meta.h1} — VibeDia`}
                          />
                        </div>
                        <Link
                          href={`/mensagem/${msg.slug}`}
                          style={{ fontSize: "0.8125rem", color: "#A07830", textDecoration: "none", fontWeight: 500 }}
                        >
                          Ver página completa →
                        </Link>
                      </article>
                      {/* Banner after every 6 messages */}
                      {(idx + 1) % 6 === 0 && <BannerAd position="mid" />}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2.5rem" }}>
                  {offset > 0 && (
                    <button
                      onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                      className="btn-navy"
                    >
                      ← Anterior
                    </button>
                  )}
                  {messages.length === LIMIT && (
                    <button
                      onClick={() => setOffset(offset + LIMIT)}
                      className="btn-gold"
                    >
                      Próximas →
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "4rem 0" }}>
                <RefreshCw size={40} style={{ color: "#C9A84C", margin: "0 auto 1rem" }} />
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744", marginBottom: "0.5rem" }}>
                  Conteúdo sendo gerado
                </h3>
                <p style={{ color: "#7A8AAA" }}>
                  Novas mensagens serão geradas automaticamente em breve. Volte mais tarde!
                </p>
              </div>
            )}
          </div>

          {/* Banner Footer */}
          <BannerAd position="footer" />

          {/* Related Categories */}
          <section style={{ marginTop: "3rem" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.5rem",
              color: "#1A2744",
              marginBottom: "1.25rem",
            }}>
              Outras Categorias
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
              {Object.entries(CATEGORY_META)
                .filter(([s]) => s !== slug)
                .map(([s, m]) => (
                  <Link
                    key={s}
                    href={`/${s}`}
                    style={{
                      display: "inline-block",
                      padding: "0.5rem 1rem",
                      background: "#F5E6B8",
                      color: "#A07830",
                      borderRadius: "9999px",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      border: "1px solid rgba(201,168,76,0.3)",
                      transition: "all 0.2s",
                    }}
                  >
                    {m.h1}
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
