import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead, { webPageSchema, breadcrumbSchema } from "@/components/SEOHead";
import BannerAd from "@/components/BannerAd";
import ShareButtons from "@/components/ShareButtons";
import { Home, ChevronRight, Star } from "lucide-react";

const SIGNS = [
  { slug: "aries", name: "Áries", symbol: "♈", emoji: "🐏", dates: "21 mar – 19 abr" },
  { slug: "touro", name: "Touro", symbol: "♉", emoji: "🐂", dates: "20 abr – 20 mai" },
  { slug: "gemeos", name: "Gêmeos", symbol: "♊", emoji: "👯", dates: "21 mai – 20 jun" },
  { slug: "cancer", name: "Câncer", symbol: "♋", emoji: "🦀", dates: "21 jun – 22 jul" },
  { slug: "leao", name: "Leão", symbol: "♌", emoji: "🦁", dates: "23 jul – 22 ago" },
  { slug: "virgem", name: "Virgem", symbol: "♍", emoji: "🌾", dates: "23 ago – 22 set" },
  { slug: "libra", name: "Libra", symbol: "♎", emoji: "⚖️", dates: "23 set – 22 out" },
  { slug: "escorpiao", name: "Escorpião", symbol: "♏", emoji: "🦂", dates: "23 out – 21 nov" },
  { slug: "sagitario", name: "Sagitário", symbol: "♐", emoji: "🏹", dates: "22 nov – 21 dez" },
  { slug: "capricornio", name: "Capricórnio", symbol: "♑", emoji: "🐐", dates: "22 dez – 19 jan" },
  { slug: "aquario", name: "Aquário", symbol: "♒", emoji: "🏺", dates: "20 jan – 18 fev" },
  { slug: "peixes", name: "Peixes", symbol: "♓", emoji: "🐟", dates: "19 fev – 20 mar" },
];

export default function HoroscopeToday() {
  const { data: horoscopes, isLoading } = trpc.content.getTodayHoroscopes.useQuery();

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const todayISO = new Date().toISOString().split("T")[0];

  const schema = {
    "@graph": [
      webPageSchema(
        "Horóscopo de Hoje — Todos os Signos | VibeDia",
        "Horóscopo diário completo para todos os 12 signos do zodíaco. Previsões de amor, trabalho e energia do dia.",
        "/horoscopo-de-hoje"
      ),
      breadcrumbSchema([
        { name: "Início", url: "/" },
        { name: "Horóscopo de Hoje", url: "/horoscopo-de-hoje" },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title="Horóscopo de Hoje — Todos os Signos | VibeDia"
        description={`Horóscopo de hoje (${today}) para todos os 12 signos do zodíaco. Previsões de amor, trabalho e energia do dia geradas por IA.`}
        canonical="/horoscopo-de-hoje"
        keywords="horóscopo de hoje, horóscopo diário, signos do zodíaco, previsão astrológica, amor trabalho energia"
        ogType="article"
        schema={schema}
      />

      <main>
        {/* Page Header */}
        <section style={{
          background: "linear-gradient(135deg, #1A2744 0%, #2E4070 50%, #1A2744 100%)",
          padding: "2.5rem 0 2rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 60%), radial-gradient(circle at 70% 20%, rgba(201,168,76,0.06) 0%, transparent 50%)",
          }} />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <nav className="breadcrumb" style={{ marginBottom: "1rem" }}>
              <Link href="/" style={{ color: "#9AAAC0", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Home size={13} /> Início
              </Link>
              <ChevronRight size={13} style={{ color: "#4A5F8A" }} />
              <span style={{ color: "#C9A84C" }}>Horóscopo de Hoje</span>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <Star size={28} style={{ color: "#C9A84C" }} fill="#C9A84C" />
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 700,
                color: "#F8F4ED",
              }}>
                Horóscopo de Hoje
              </h1>
            </div>
            <p style={{ color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.125rem", fontStyle: "italic", textTransform: "capitalize" }}>
              {today}
            </p>
            <p style={{ color: "#9AAAC0", fontSize: "0.9375rem", marginTop: "0.5rem" }}>
              Previsões completas para todos os 12 signos do zodíaco
            </p>
          </div>
        </section>

        <div className="gold-divider-thick" />

        <div className="container" style={{ padding: "2rem 1rem" }}>
          <BannerAd />

          {/* Signs Quick Nav */}
          <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.25rem",
              color: "#1A2744",
              marginBottom: "1rem",
            }}>
              Escolha seu Signo
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {SIGNS.map((sign) => (
                <a
                  key={sign.slug}
                  href={`#${sign.slug}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.375rem",
                    padding: "0.375rem 0.875rem",
                    background: "#F5E6B8",
                    color: "#A07830",
                    borderRadius: "9999px",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    border: "1px solid rgba(201,168,76,0.3)",
                  }}
                >
                  {sign.emoji} {sign.name}
                </a>
              ))}
            </div>
          </div>

          {/* Horoscopes */}
          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "200px" }} />
              ))}
            </div>
          ) : horoscopes && horoscopes.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {SIGNS.map((sign) => {
                const horo = horoscopes.find(h => h.sign === sign.slug);
                return (
                  <article
                    key={sign.slug}
                    id={sign.slug}
                    className="vibe-card"
                    style={{ padding: "1.5rem", scrollMarginTop: "80px" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div style={{
                        width: "48px", height: "48px",
                        background: "linear-gradient(135deg, #1A2744, #243358)",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.375rem",
                        flexShrink: 0,
                        border: "1px solid rgba(201,168,76,0.3)",
                      }}>
                        {sign.emoji}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <span style={{ color: "#C9A84C", fontSize: "1.125rem", fontWeight: 700 }}>{sign.symbol}</span>
                          <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            color: "#1A2744",
                          }}>
                            {sign.name}
                          </h3>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#7A8AAA" }}>{sign.dates}</span>
                      </div>
                    </div>

                    {horo ? (
                      <>
                        <p style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.0625rem",
                          lineHeight: 1.7,
                          color: "#243358",
                          marginBottom: "1rem",
                          fontStyle: "italic",
                        }}>
                          {horo.text}
                        </p>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                          {horo.loveText && (
                            <div style={{
                              flex: "1", minWidth: "120px",
                              background: "#FFF0F6",
                              border: "1px solid rgba(236,72,153,0.2)",
                              borderRadius: "0.5rem",
                              padding: "0.625rem",
                            }}>
                              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#EC4899", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>❤️ Amor</div>
                              <p style={{ fontSize: "0.8125rem", color: "#4A5F8A", lineHeight: 1.5 }}>{horo.loveText}</p>
                            </div>
                          )}
                          {horo.workText && (
                            <div style={{
                              flex: "1", minWidth: "120px",
                              background: "#F0F7FF",
                              border: "1px solid rgba(59,130,246,0.2)",
                              borderRadius: "0.5rem",
                              padding: "0.625rem",
                            }}>
                              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>💼 Trabalho</div>
                              <p style={{ fontSize: "0.8125rem", color: "#4A5F8A", lineHeight: 1.5 }}>{horo.workText}</p>
                            </div>
                          )}
                        </div>
                        {horo.energyText && (
                          <div style={{
                            background: "linear-gradient(135deg, #F5E6B8, #FDF8E8)",
                            border: "1px solid rgba(201,168,76,0.3)",
                            borderRadius: "0.5rem",
                            padding: "0.625rem",
                            marginBottom: "1rem",
                          }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#A07830", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>⚡ Energia do Dia</div>
                            <p style={{ fontSize: "0.8125rem", color: "#4A5F8A", lineHeight: 1.5 }}>{horo.energyText}</p>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                          <ShareButtons text={`${sign.name}: ${horo.text}`} url={`/horoscopo/${sign.slug}`} compact />
                          <Link href={`/horoscopo/${sign.slug}`} style={{ fontSize: "0.8125rem", color: "#A07830", textDecoration: "none", fontWeight: 500 }}>
                            Ver completo →
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                        <p style={{ color: "#7A8AAA", fontSize: "0.875rem" }}>Horóscopo sendo gerado...</p>
                        <Link
                          href={`/horoscopo/${sign.slug}`}
                          style={{ display: "inline-block", marginTop: "0.75rem", fontSize: "0.875rem", color: "#A07830", textDecoration: "none" }}
                        >
                          Ver página do signo →
                        </Link>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <Star size={48} style={{ color: "#C9A84C", margin: "0 auto 1rem" }} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744", marginBottom: "0.5rem" }}>
                Horóscopo sendo preparado
              </h3>
              <p style={{ color: "#7A8AAA", marginBottom: "1.5rem" }}>
                Os horóscopos de hoje estão sendo gerados pela IA. Volte em alguns minutos!
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.875rem" }}>
                {SIGNS.map((sign) => (
                  <Link key={sign.slug} href={`/horoscopo/${sign.slug}`} className="sign-card" style={{ textDecoration: "none" }}>
                    <div style={{ fontSize: "1.5rem" }}>{sign.emoji}</div>
                    <div style={{ color: "#C9A84C", fontWeight: 700 }}>{sign.symbol}</div>
                    <div style={{ color: "#F8F4ED", fontSize: "0.875rem", fontFamily: "'Playfair Display', serif" }}>{sign.name}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <BannerAd />
        </div>
      </main>
    </>
  );
}
