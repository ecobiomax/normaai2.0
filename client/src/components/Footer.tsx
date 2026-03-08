import { Link } from "wouter";
import { Star } from "lucide-react";

const SIGNS = [
  { slug: "aries", name: "Áries" }, { slug: "touro", name: "Touro" },
  { slug: "gemeos", name: "Gêmeos" }, { slug: "cancer", name: "Câncer" },
  { slug: "leao", name: "Leão" }, { slug: "virgem", name: "Virgem" },
  { slug: "libra", name: "Libra" }, { slug: "escorpiao", name: "Escorpião" },
  { slug: "sagitario", name: "Sagitário" }, { slug: "capricornio", name: "Capricórnio" },
  { slug: "aquario", name: "Aquário" }, { slug: "peixes", name: "Peixes" },
];

const CATEGORIES = [
  { slug: "mensagem-de-bom-dia", name: "Bom Dia" },
  { slug: "mensagem-de-boa-tarde", name: "Boa Tarde" },
  { slug: "mensagem-de-boa-noite", name: "Boa Noite" },
  { slug: "mensagem-motivacional", name: "Motivação" },
  { slug: "mensagem-de-amor", name: "Amor" },
  { slug: "frases-de-reflexao", name: "Reflexão" },
  { slug: "frases-curtas", name: "Frases Curtas" },
  { slug: "frases-para-whatsapp", name: "WhatsApp" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: "linear-gradient(135deg, #1A2744 0%, #243358 100%)",
      color: "#D4C9B0",
      marginTop: "4rem",
    }}>
      {/* Banner Footer */}
      <div style={{ borderBottom: "1px solid rgba(201,168,76,0.15)", padding: "1rem 0" }}>
        <div className="container">
          <div className="banner-slot banner-footer" style={{ maxWidth: "320px", margin: "0 auto" }}>
            <span>Publicidade 320×100</span>
          </div>
        </div>
      </div>

      <div className="gold-divider-thick" style={{ opacity: 0.4 }} />

      <div className="container" style={{ padding: "3rem 1rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", marginBottom: "2.5rem" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <div style={{
                width: "32px", height: "32px",
                background: "linear-gradient(135deg, #A07830, #C9A84C)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Star size={16} color="#1A2744" fill="#1A2744" />
              </div>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: "1.25rem",
                color: "#F8F4ED",
              }}>VibeDia</span>
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#9AAAC0", marginBottom: "1rem" }}>
              Portal de mensagens inspiracionais e horóscopo diário gerado por inteligência artificial.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <a href="/feed.xml" style={{ fontSize: "0.75rem", color: "#C9A84C", textDecoration: "none" }}>RSS Feed</a>
              <span style={{ color: "#4A5F8A" }}>·</span>
              <a href="/sitemap.xml" style={{ fontSize: "0.75rem", color: "#C9A84C", textDecoration: "none" }}>Sitemap</a>
            </div>
          </div>

          {/* Mensagens */}
          <div>
            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#C9A84C",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.875rem",
            }}>Mensagens</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {CATEGORIES.map((cat) => (
                <li key={cat.slug} style={{ marginBottom: "0.375rem" }}>
                  <Link
                    href={`/${cat.slug}`}
                    style={{ color: "#9AAAC0", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Horóscopo */}
          <div>
            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#C9A84C",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.875rem",
            }}>Horóscopo</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {SIGNS.slice(0, 6).map((sign) => (
                <li key={sign.slug} style={{ marginBottom: "0.375rem" }}>
                  <Link
                    href={`/horoscopo/${sign.slug}`}
                    style={{ color: "#9AAAC0", fontSize: "0.875rem", textDecoration: "none" }}
                  >
                    {sign.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mais Signos + Links */}
          <div>
            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#C9A84C",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.875rem",
            }}>Mais Signos</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: "1.5rem" }}>
              {SIGNS.slice(6).map((sign) => (
                <li key={sign.slug} style={{ marginBottom: "0.375rem" }}>
                  <Link
                    href={`/horoscopo/${sign.slug}`}
                    style={{ color: "#9AAAC0", fontSize: "0.875rem", textDecoration: "none" }}
                  >
                    {sign.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#C9A84C",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}>Institucional</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.375rem" }}>
                <Link href="/sobre" style={{ color: "#9AAAC0", fontSize: "0.875rem", textDecoration: "none" }}>Sobre</Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade" style={{ color: "#9AAAC0", fontSize: "0.875rem", textDecoration: "none" }}>Política de Privacidade</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="gold-divider" style={{ marginBottom: "1.5rem" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.8125rem", color: "#6A7A9A" }}>
            © {currentYear} VibeDia. Todos os direitos reservados.
          </p>
          <p style={{ fontSize: "0.75rem", color: "#4A5F8A" }}>
            Conteúdo gerado por Inteligência Artificial · www.vibedia.com.br
          </p>
        </div>
      </div>
    </footer>
  );
}
