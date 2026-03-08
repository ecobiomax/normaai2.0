import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead, { articleSchema, breadcrumbSchema } from "@/components/SEOHead";
import ShareButtons from "@/components/ShareButtons";
import BannerAd from "@/components/BannerAd";
import { Home, ChevronRight, Star, Calendar } from "lucide-react";

const SIGN_DATA: Record<string, {
  name: string; symbol: string; emoji: string; dates: string; element: string;
  ruling: string; description: string;
}> = {
  aries: { name: "Áries", symbol: "♈", emoji: "🐏", dates: "21 de março a 19 de abril", element: "Fogo", ruling: "Marte", description: "Áries é o primeiro signo do zodíaco, representando energia, coragem e iniciativa." },
  touro: { name: "Touro", symbol: "♉", emoji: "🐂", dates: "20 de abril a 20 de maio", element: "Terra", ruling: "Vênus", description: "Touro é um signo de terra conhecido pela determinação, praticidade e amor pelo conforto." },
  gemeos: { name: "Gêmeos", symbol: "♊", emoji: "👯", dates: "21 de maio a 20 de junho", element: "Ar", ruling: "Mercúrio", description: "Gêmeos é um signo de ar curioso, comunicativo e adaptável, sempre em busca de novas experiências." },
  cancer: { name: "Câncer", symbol: "♋", emoji: "🦀", dates: "21 de junho a 22 de julho", element: "Água", ruling: "Lua", description: "Câncer é um signo de água sensível, intuitivo e profundamente ligado ao lar e à família." },
  leao: { name: "Leão", symbol: "♌", emoji: "🦁", dates: "23 de julho a 22 de agosto", element: "Fogo", ruling: "Sol", description: "Leão é um signo de fogo carismático, criativo e natural líder, que brilha onde quer que vá." },
  virgem: { name: "Virgem", symbol: "♍", emoji: "🌾", dates: "23 de agosto a 22 de setembro", element: "Terra", ruling: "Mercúrio", description: "Virgem é um signo de terra analítico, perfeccionista e dedicado ao serviço e à saúde." },
  libra: { name: "Libra", symbol: "♎", emoji: "⚖️", dates: "23 de setembro a 22 de outubro", element: "Ar", ruling: "Vênus", description: "Libra é um signo de ar diplomático, justo e apreciador da beleza e do equilíbrio." },
  escorpiao: { name: "Escorpião", symbol: "♏", emoji: "🦂", dates: "23 de outubro a 21 de novembro", element: "Água", ruling: "Plutão", description: "Escorpião é um signo de água intenso, misterioso e transformador, com grande profundidade emocional." },
  sagitario: { name: "Sagitário", symbol: "♐", emoji: "🏹", dates: "22 de novembro a 21 de dezembro", element: "Fogo", ruling: "Júpiter", description: "Sagitário é um signo de fogo aventureiro, filosófico e otimista, sempre em busca de novos horizontes." },
  capricornio: { name: "Capricórnio", symbol: "♑", emoji: "🐐", dates: "22 de dezembro a 19 de janeiro", element: "Terra", ruling: "Saturno", description: "Capricórnio é um signo de terra ambicioso, disciplinado e responsável, com grande capacidade de realização." },
  aquario: { name: "Aquário", symbol: "♒", emoji: "🏺", dates: "20 de janeiro a 18 de fevereiro", element: "Ar", ruling: "Urano", description: "Aquário é um signo de ar inovador, humanitário e independente, sempre à frente do seu tempo." },
  peixes: { name: "Peixes", symbol: "♓", emoji: "🐟", dates: "19 de fevereiro a 20 de março", element: "Água", ruling: "Netuno", description: "Peixes é um signo de água sonhador, empático e espiritual, com grande sensibilidade artística." },
};

const OTHER_SIGNS = Object.keys(SIGN_DATA);

export default function SignPage() {
  const params = useParams<{ sign: string; date?: string }>();
  const sign = params.sign || "";
  const dateParam = params.date;
  const today = new Date().toISOString().split("T")[0];
  const targetDate = dateParam || today;

  const signInfo = SIGN_DATA[sign];

  const { data: horoscope, isLoading } = trpc.content.getHoroscopeBySignAndDate.useQuery(
    { sign, date: targetDate },
    { enabled: !!sign, retry: false }
  );

  if (!signInfo) {
    return (
      <div className="container" style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744" }}>Signo não encontrado</h1>
        <Link href="/horoscopo-de-hoje" style={{ color: "#A07830" }}>Ver todos os signos</Link>
      </div>
    );
  }

  const displayDate = new Date(targetDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const schema = {
    "@graph": [
      articleSchema(
        `Horóscopo ${signInfo.name} — ${displayDate}`,
        `Horóscopo completo de ${signInfo.name} para ${displayDate}. Previsões de amor, trabalho e energia do dia.`,
        `/horoscopo/${sign}`,
        targetDate
      ),
      breadcrumbSchema([
        { name: "Início", url: "/" },
        { name: "Horóscopo de Hoje", url: "/horoscopo-de-hoje" },
        { name: signInfo.name, url: `/horoscopo/${sign}` },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title={`Horóscopo ${signInfo.name} Hoje — ${displayDate} | VibeDia`}
        description={`Horóscopo de ${signInfo.name} para ${displayDate}. Previsões de amor, trabalho e energia do dia para o signo de ${signInfo.name} (${signInfo.dates}).`}
        canonical={`/horoscopo/${sign}`}
        keywords={`horóscopo ${signInfo.name.toLowerCase()}, ${signInfo.name.toLowerCase()} hoje, previsão ${signInfo.name.toLowerCase()}, signo ${signInfo.name.toLowerCase()}`}
        ogType="article"
        schema={schema}
      />

      <main>
        {/* Header */}
        <section style={{
          background: "linear-gradient(135deg, #1A2744 0%, #2E4070 50%, #1A2744 100%)",
          padding: "2.5rem 0 2rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle at 70% 30%, rgba(201,168,76,0.1) 0%, transparent 60%)",
          }} />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <nav className="breadcrumb" style={{ marginBottom: "1rem" }}>
              <Link href="/" style={{ color: "#9AAAC0", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Home size={13} /> Início
              </Link>
              <ChevronRight size={13} style={{ color: "#4A5F8A" }} />
              <Link href="/horoscopo-de-hoje" style={{ color: "#9AAAC0", textDecoration: "none" }}>Horóscopo</Link>
              <ChevronRight size={13} style={{ color: "#4A5F8A" }} />
              <span style={{ color: "#C9A84C" }}>{signInfo.name}</span>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              <div style={{
                width: "72px", height: "72px",
                background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.1))",
                border: "2px solid rgba(201,168,76,0.4)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem",
                flexShrink: 0,
              }}>
                {signInfo.emoji}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "#C9A84C", fontSize: "1.5rem", fontWeight: 700 }}>{signInfo.symbol}</span>
                  <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                    fontWeight: 700,
                    color: "#F8F4ED",
                  }}>
                    {signInfo.name}
                  </h1>
                </div>
                <p style={{ color: "#9AAAC0", fontSize: "0.9375rem" }}>{signInfo.dates}</p>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.75rem", color: "#C9A84C", background: "rgba(201,168,76,0.15)", padding: "0.2rem 0.6rem", borderRadius: "9999px", border: "1px solid rgba(201,168,76,0.3)" }}>
                    🔥 {signInfo.element}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#C9A84C", background: "rgba(201,168,76,0.15)", padding: "0.2rem 0.6rem", borderRadius: "9999px", border: "1px solid rgba(201,168,76,0.3)" }}>
                    ⭐ {signInfo.ruling}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-divider-thick" />

        <div className="container" style={{ padding: "2rem 1rem" }}>
          <BannerAd />

          <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
            {/* Date display */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              marginBottom: "1.5rem",
              padding: "0.75rem 1rem",
              background: "#F5E6B8",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "0.5rem",
            }}>
              <Calendar size={16} style={{ color: "#A07830" }} />
              <span style={{ color: "#A07830", fontWeight: 600, fontSize: "0.9375rem", textTransform: "capitalize" }}>
                {displayDate}
              </span>
            </div>

            {isLoading ? (
              <div>
                <div className="skeleton" style={{ height: "200px", marginBottom: "1rem" }} />
                <div className="skeleton" style={{ height: "100px" }} />
              </div>
            ) : horoscope ? (
              <article>
                <div className="vibe-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
                  {horoscope.imageUrl && (
                    <div style={{ marginBottom: "1.5rem", borderRadius: "10px", overflow: "hidden" }}>
                      <img
                        src={horoscope.imageUrl}
                        alt={`Arte mística para ${signInfo.name}`}
                        style={{ width: "100%", height: "auto", display: "block", maxHeight: "360px", objectFit: "cover" }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                    <Star size={18} style={{ color: "#C9A84C" }} fill="#C9A84C" />
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.25rem",
                      color: "#1A2744",
                    }}>
                      Horóscopo do Dia
                    </h2>
                  </div>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.1875rem",
                    lineHeight: 1.8,
                    color: "#243358",
                    fontStyle: "italic",
                    marginBottom: "1.5rem",
                  }}>
                    {horoscope.text}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                    {horoscope.loveText && (
                      <div style={{
                        background: "linear-gradient(135deg, #FFF0F6, #FDF0F8)",
                        border: "1px solid rgba(236,72,153,0.2)",
                        borderRadius: "0.75rem",
                        padding: "1rem",
                      }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#EC4899", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>❤️ Amor</div>
                        <p style={{ fontSize: "0.9375rem", color: "#4A5F8A", lineHeight: 1.6 }}>{horoscope.loveText}</p>
                      </div>
                    )}
                    {horoscope.workText && (
                      <div style={{
                        background: "linear-gradient(135deg, #EFF6FF, #F0F7FF)",
                        border: "1px solid rgba(59,130,246,0.2)",
                        borderRadius: "0.75rem",
                        padding: "1rem",
                      }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>💼 Trabalho</div>
                        <p style={{ fontSize: "0.9375rem", color: "#4A5F8A", lineHeight: 1.6 }}>{horoscope.workText}</p>
                      </div>
                    )}
                    {horoscope.energyText && (
                      <div style={{
                        background: "linear-gradient(135deg, #FFFBEB, #FEF9E7)",
                        border: "1px solid rgba(201,168,76,0.3)",
                        borderRadius: "0.75rem",
                        padding: "1rem",
                      }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#A07830", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>⚡ Energia</div>
                        <p style={{ fontSize: "0.9375rem", color: "#4A5F8A", lineHeight: 1.6 }}>{horoscope.energyText}</p>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: "1px solid rgba(201,168,76,0.2)", paddingTop: "1.25rem" }}>
                    <p style={{ fontSize: "0.8125rem", color: "#7A8AAA", marginBottom: "0.75rem" }}>Compartilhar este horóscopo:</p>
                    <ShareButtons
                      text={`Horóscopo ${signInfo.name} — ${displayDate}: ${horoscope.text}`}
                      url={`/horoscopo/${sign}`}
                      title={`Horóscopo ${signInfo.name} — VibeDia`}
                    />
                  </div>
                </div>
              </article>
            ) : (
              <div className="vibe-card" style={{ padding: "2.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{signInfo.emoji}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744", marginBottom: "0.75rem" }}>
                  Horóscopo sendo preparado
                </h3>
                <p style={{ color: "#7A8AAA", marginBottom: "1.5rem" }}>
                  O horóscopo de {signInfo.name} para hoje está sendo gerado pela nossa IA. Volte em alguns minutos!
                </p>
                <p style={{ fontSize: "0.875rem", color: "#4A5F8A" }}>{signInfo.description}</p>
              </div>
            )}

            <BannerAd />

            {/* About the sign */}
            <div className="vibe-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", color: "#1A2744", marginBottom: "0.75rem" }}>
                Sobre {signInfo.name}
              </h3>
              <p style={{ color: "#4A5F8A", lineHeight: 1.7, marginBottom: "1rem" }}>{signInfo.description}</p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <span className="badge-gold">Elemento: {signInfo.element}</span>
                <span className="badge-gold">Regente: {signInfo.ruling}</span>
                <span className="badge-gold">{signInfo.dates}</span>
              </div>
            </div>
          </div>

          {/* Other Signs */}
          <section style={{ marginTop: "3rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1A2744", marginBottom: "1.25rem" }}>
              Outros Signos
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {OTHER_SIGNS.filter(s => s !== sign).map((s) => {
                const sd = SIGN_DATA[s];
                return (
                  <Link
                    key={s}
                    href={`/horoscopo/${s}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.375rem",
                      padding: "0.5rem 1rem",
                      background: "#F5E6B8",
                      color: "#A07830",
                      borderRadius: "9999px",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      border: "1px solid rgba(201,168,76,0.3)",
                    }}
                  >
                    {sd.emoji} {sd.name}
                  </Link>
                );
              })}
            </div>
          </section>

          <BannerAd />
        </div>
      </main>
    </>
  );
}
