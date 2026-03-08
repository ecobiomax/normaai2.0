import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead, { webPageSchema } from "@/components/SEOHead";
import ShareButtons from "@/components/ShareButtons";
import BannerAd from "@/components/BannerAd";
import { Star, ArrowRight, Sun, Moon, Sunset, Heart, Sparkles, MessageCircle } from "lucide-react";

const SIGNS = [
  { slug: "aries", name: "Áries", symbol: "♈", emoji: "🐏" },
  { slug: "touro", name: "Touro", symbol: "♉", emoji: "🐂" },
  { slug: "gemeos", name: "Gêmeos", symbol: "♊", emoji: "👯" },
  { slug: "cancer", name: "Câncer", symbol: "♋", emoji: "🦀" },
  { slug: "leao", name: "Leão", symbol: "♌", emoji: "🦁" },
  { slug: "virgem", name: "Virgem", symbol: "♍", emoji: "🌾" },
  { slug: "libra", name: "Libra", symbol: "♎", emoji: "⚖️" },
  { slug: "escorpiao", name: "Escorpião", symbol: "♏", emoji: "🦂" },
  { slug: "sagitario", name: "Sagitário", symbol: "♐", emoji: "🏹" },
  { slug: "capricornio", name: "Capricórnio", symbol: "♑", emoji: "🐐" },
  { slug: "aquario", name: "Aquário", symbol: "♒", emoji: "🏺" },
  { slug: "peixes", name: "Peixes", symbol: "♓", emoji: "🐟" },
];

const CATEGORIES = [
  { slug: "mensagem-de-bom-dia", name: "Bom Dia", icon: <Sun size={22} />, color: "#F59E0B", desc: "Comece o dia com energia" },
  { slug: "mensagem-de-boa-tarde", name: "Boa Tarde", icon: <Sunset size={22} />, color: "#EA580C", desc: "Mensagens para o meio do dia" },
  { slug: "mensagem-de-boa-noite", name: "Boa Noite", icon: <Moon size={22} />, color: "#6366F1", desc: "Encerre o dia com paz" },
  { slug: "mensagem-motivacional", name: "Motivação", icon: <Sparkles size={22} />, color: "#C9A84C", desc: "Inspire-se e supere desafios" },
  { slug: "mensagem-de-amor", name: "Amor", icon: <Heart size={22} />, color: "#EC4899", desc: "Mensagens românticas" },
  { slug: "frases-para-whatsapp", name: "WhatsApp", icon: <MessageCircle size={22} />, color: "#25D366", desc: "Perfeitas para status" },
];

export default function Home() {
  const { data: recentMessages } = trpc.content.getRecentMessages.useQuery({ limit: 6 });
  const { data: todayHoroscopes } = trpc.content.getTodayHoroscopes.useQuery();
  const { data: stats } = trpc.content.getStats.useQuery();

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <SEOHead
        title="VibeDia — Mensagens Motivacionais e Horóscopo Diário"
        description="Portal de mensagens inspiracionais, frases motivacionais, mensagens de bom dia e horóscopo diário para todos os signos. Conteúdo gerado por IA, atualizado diariamente."
        canonical="/"
        ogType="website"
        keywords="mensagens motivacionais, bom dia, horóscopo, frases inspiracionais, horóscopo diário, signos"
        schema={webPageSchema(
          "VibeDia — Mensagens Motivacionais e Horóscopo Diário",
          "Portal de mensagens inspiracionais e horóscopo diário para todos os signos.",
          "/"
        )}
      />

      <main>
        {/* Hero Section */}
        <section className="golden-pattern" style={{
          background: "linear-gradient(160deg, #1A2744 0%, #243358 50%, #1A2744 100%)",
          padding: "4rem 0 3rem",
          position: "relative",
        }}>
          <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <span className="badge-gold" style={{ background: "rgba(201,168,76,0.2)", color: "#E8C96A", border: "1px solid rgba(201,168,76,0.4)" }}>
                ✨ Conteúdo gerado por IA
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: "#F8F4ED",
              lineHeight: 1.15,
              marginBottom: "1rem",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}>
              Inspire-se Todos os Dias
            </h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
              color: "#C9A84C",
              marginBottom: "0.75rem",
              fontStyle: "italic",
              letterSpacing: "0.02em",
            }}>
              Mensagens motivacionais e horóscopo diário para todos os signos
            </p>
            <p style={{ color: "#9AAAC0", fontSize: "0.9375rem", marginBottom: "2rem", textTransform: "capitalize" }}>
              {today}
            </p>

            <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/mensagem-de-bom-dia" className="btn-gold" style={{ textDecoration: "none" }}>
                <Sun size={16} /> Ver Mensagens de Hoje
              </Link>
              <Link href="/horoscopo-de-hoje" className="btn-navy" style={{
                textDecoration: "none",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#F8F4ED",
              }}>
                <Star size={16} /> Horóscopo de Hoje
              </Link>
            </div>

            {/* Stats */}
            {stats && (
              <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginTop: "2.5rem", flexWrap: "wrap" }}>
                {[
                  { label: "Mensagens", value: stats.messages.toLocaleString("pt-BR") },
                  { label: "Horóscopos", value: stats.horoscopes.toLocaleString("pt-BR") },
                  { label: "Categorias", value: stats.categories.toString() },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, color: "#C9A84C" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#6A7A9A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="gold-divider-thick" />

        {/* Banner Top */}
        <div className="container" style={{ padding: "1.5rem 1rem 0" }}>
          <BannerAd position="top" />
        </div>

        {/* Categories Grid */}
        <section style={{ padding: "3rem 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <span className="badge-gold">Categorias</span>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "#1A2744",
                marginTop: "0.75rem",
                marginBottom: "0.5rem",
              }}>
                Escolha sua Mensagem
              </h2>
              <div className="gold-divider" style={{ maxWidth: "120px", margin: "0 auto" }} />
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "1rem",
            }}>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="vibe-card" style={{
                    padding: "1.25rem 1rem",
                    textAlign: "center",
                    cursor: "pointer",
                  }}>
                    <div style={{
                      width: "48px", height: "48px",
                      background: `${cat.color}18`,
                      border: `1px solid ${cat.color}40`,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 0.75rem",
                      color: cat.color,
                    }}>
                      {cat.icon}
                    </div>
                    <div style={{ fontWeight: 600, color: "#1A2744", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#7A8AAA" }}>{cat.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Messages */}
        {recentMessages && recentMessages.length > 0 && (
          <section style={{ padding: "2rem 0 3rem", background: "#FDFAF5" }}>
            <div className="container">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <span className="badge-gold">Recentes</span>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(1.375rem, 2.5vw, 2rem)",
                    color: "#1A2744",
                    marginTop: "0.5rem",
                  }}>
                    Mensagens do Dia
                  </h2>
                </div>
                <Link href="/mensagem-motivacional" style={{
                  display: "flex", alignItems: "center", gap: "0.375rem",
                  color: "#A07830", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600,
                }}>
                  Ver todas <ArrowRight size={14} />
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="message-card">
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.1875rem",
                      lineHeight: 1.6,
                      color: "#1A2744",
                      marginBottom: "1.25rem",
                      fontStyle: "italic",
                    }}>
                      "{msg.text}"
                    </p>
                    <ShareButtons text={msg.text} url={`/mensagem/${msg.slug}`} compact />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Banner Mid */}
        <div className="container">
          <BannerAd position="mid" />
        </div>

        {/* Horoscope Section */}
        <section style={{ padding: "3rem 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <span className="badge-gold">Astrologia</span>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "#1A2744",
                marginTop: "0.75rem",
                marginBottom: "0.5rem",
              }}>
                Horóscopo de Hoje
              </h2>
              <div className="gold-divider" style={{ maxWidth: "120px", margin: "0 auto 0.75rem" }} />
              <p style={{ color: "#4A5F8A", fontSize: "0.9375rem" }}>
                Descubra o que os astros reservam para o seu signo
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "0.875rem",
            }}>
              {SIGNS.map((sign) => (
                <Link key={sign.slug} href={`/horoscopo/${sign.slug}`} className="sign-card" style={{ textDecoration: "none" }}>
                  <div style={{ fontSize: "1.75rem", marginBottom: "0.375rem" }}>{sign.emoji}</div>
                  <div style={{ fontSize: "1.125rem", color: "#C9A84C", fontWeight: 700, marginBottom: "0.125rem" }}>
                    {sign.symbol}
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#F8F4ED",
                  }}>
                    {sign.name}
                  </div>
                  {todayHoroscopes?.find(h => h.sign === sign.slug) && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <span style={{
                        fontSize: "0.65rem",
                        background: "rgba(201,168,76,0.25)",
                        color: "#E8C96A",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        border: "1px solid rgba(201,168,76,0.3)",
                      }}>
                        ✓ Disponível
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link href="/horoscopo-de-hoje" className="btn-gold" style={{ textDecoration: "none" }}>
                <Star size={16} /> Ver Horóscopo Completo
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="golden-pattern" style={{
          background: "linear-gradient(135deg, #1A2744 0%, #243358 100%)",
          padding: "3.5rem 0",
        }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              color: "#F8F4ED",
              marginBottom: "1rem",
            }}>
              Conteúdo Único, Gerado por IA
            </h2>
            <p style={{
              color: "#9AAAC0",
              fontSize: "1rem",
              maxWidth: "600px",
              margin: "0 auto 1.5rem",
              lineHeight: 1.7,
            }}>
              O VibeDia utiliza inteligência artificial para criar mensagens únicas e personalizadas todos os dias.
              Cada frase é gerada especialmente para inspirar, motivar e trazer positividade ao seu dia.
            </p>
            <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/sobre" style={{
                textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1.5rem",
                borderRadius: "9999px",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#C9A84C",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "all 0.2s",
              }}>
                Saiba mais sobre nós
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
