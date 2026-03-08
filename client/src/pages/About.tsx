import { Link } from "wouter";
import SEOHead, { webPageSchema, breadcrumbSchema } from "@/components/SEOHead";
import { Home, ChevronRight, Star, Sparkles, Heart, Zap } from "lucide-react";

export default function About() {
  const schema = {
    "@graph": [
      webPageSchema(
        "Sobre o VibeDia — Portal de Mensagens e Horóscopo",
        "Conheça o VibeDia, portal de mensagens motivacionais e horóscopo diário gerado por inteligência artificial.",
        "/sobre"
      ),
      breadcrumbSchema([
        { name: "Início", url: "/" },
        { name: "Sobre", url: "/sobre" },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title="Sobre o VibeDia — Portal de Mensagens e Horóscopo"
        description="Conheça o VibeDia, o portal de mensagens motivacionais, frases inspiracionais e horóscopo diário gerado por inteligência artificial. Nossa missão é inspirar pessoas todos os dias."
        canonical="/sobre"
        schema={schema}
      />

      <main>
        {/* Header */}
        <section style={{
          background: "linear-gradient(135deg, #1A2744 0%, #243358 100%)",
          padding: "2.5rem 0 2rem",
        }}>
          <div className="container">
            <nav className="breadcrumb" style={{ marginBottom: "1rem" }}>
              <Link href="/" style={{ color: "#9AAAC0", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Home size={13} /> Início
              </Link>
              <ChevronRight size={13} style={{ color: "#4A5F8A" }} />
              <span style={{ color: "#C9A84C" }}>Sobre</span>
            </nav>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700,
              color: "#F8F4ED",
              marginBottom: "0.5rem",
            }}>
              Sobre o VibeDia
            </h1>
            <p style={{ color: "#9AAAC0", fontSize: "1rem" }}>
              Conheça nossa missão e como funcionamos
            </p>
          </div>
        </section>

        <div className="gold-divider-thick" />

        <div className="container" style={{ padding: "3rem 1rem" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>

            {/* Mission */}
            <div className="vibe-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{
                  width: "44px", height: "44px",
                  background: "linear-gradient(135deg, #A07830, #C9A84C)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Star size={20} color="#1A2744" fill="#1A2744" />
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1A2744" }}>
                  Nossa Missão
                </h2>
              </div>
              <p style={{ color: "#4A5F8A", lineHeight: 1.8, fontSize: "1rem", marginBottom: "1rem" }}>
                O <strong style={{ color: "#1A2744" }}>VibeDia</strong> nasceu com uma missão simples e poderosa: inspirar pessoas todos os dias. Acreditamos que uma mensagem no momento certo pode mudar o humor, motivar uma ação ou simplesmente trazer um sorriso ao rosto de alguém.
              </p>
              <p style={{ color: "#4A5F8A", lineHeight: 1.8, fontSize: "1rem" }}>
                Somos um portal de conteúdo dinâmico que utiliza <strong style={{ color: "#1A2744" }}>inteligência artificial</strong> para gerar mensagens motivacionais, frases inspiracionais, mensagens de bom dia, boa tarde e boa noite, além de horóscopo diário personalizado para todos os 12 signos do zodíaco.
              </p>
            </div>

            {/* How it works */}
            <div className="vibe-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1A2744", marginBottom: "1.5rem" }}>
                Como Funciona
              </h2>
              <div style={{ display: "grid", gap: "1.25rem" }}>
                {[
                  {
                    icon: <Zap size={20} />,
                    color: "#C9A84C",
                    title: "Geração Automática por IA",
                    text: "Utilizamos modelos avançados de linguagem (LLM) para gerar conteúdo único e personalizado. Cada mensagem é criada especialmente, garantindo originalidade e qualidade.",
                  },
                  {
                    icon: <Sparkles size={20} />,
                    color: "#6366F1",
                    title: "Atualização Diária",
                    text: "Nosso sistema gera novos conteúdos automaticamente: horóscopo todos os dias às 06h00 (horário de Brasília) e novas mensagens a cada 2 horas, garantindo sempre conteúdo fresco.",
                  },
                  {
                    icon: <Heart size={20} />,
                    color: "#EC4899",
                    title: "Conteúdo Positivo",
                    text: "Todo o conteúdo do VibeDia é cuidadosamente orientado para ser positivo, inspirador e construtivo. Nossa IA é treinada para criar mensagens que elevam o espírito e motivam as pessoas.",
                  },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", gap: "1rem" }}>
                    <div style={{
                      width: "40px", height: "40px",
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}40`,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.color,
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, color: "#1A2744", marginBottom: "0.375rem", fontSize: "1rem" }}>{item.title}</h3>
                      <p style={{ color: "#4A5F8A", lineHeight: 1.7, fontSize: "0.9375rem" }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content categories */}
            <div className="vibe-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1A2744", marginBottom: "1.25rem" }}>
                Nosso Conteúdo
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.875rem" }}>
                {[
                  { label: "Mensagens de Bom Dia", href: "/mensagem-de-bom-dia" },
                  { label: "Mensagens de Boa Tarde", href: "/mensagem-de-boa-tarde" },
                  { label: "Mensagens de Boa Noite", href: "/mensagem-de-boa-noite" },
                  { label: "Mensagens Motivacionais", href: "/mensagem-motivacional" },
                  { label: "Mensagens de Amor", href: "/mensagem-de-amor" },
                  { label: "Frases de Reflexão", href: "/frases-de-reflexao" },
                  { label: "Frases Curtas", href: "/frases-curtas" },
                  { label: "Frases para WhatsApp", href: "/frases-para-whatsapp" },
                  { label: "Horóscopo Diário", href: "/horoscopo-de-hoje" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      background: "#F5E6B8",
                      color: "#A07830",
                      borderRadius: "0.5rem",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      border: "1px solid rgba(201,168,76,0.3)",
                      transition: "all 0.2s",
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="vibe-card" style={{ padding: "2rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1A2744", marginBottom: "1rem" }}>
                Contato
              </h2>
              <p style={{ color: "#4A5F8A", lineHeight: 1.7, marginBottom: "1rem" }}>
                Tem dúvidas, sugestões ou deseja entrar em contato conosco? Estamos sempre abertos para ouvir nossos leitores.
              </p>
              <p style={{ color: "#4A5F8A" }}>
                E-mail:{" "}
                <a href="mailto:jrmemachado@gmail.com" style={{ color: "#A07830", fontWeight: 600, textDecoration: "none" }}>
                  jrmemachado@gmail.com
                </a>
              </p>
              <p style={{ color: "#4A5F8A", marginTop: "0.5rem" }}>
                Site:{" "}
                <a href="https://www.vibedia.com.br" style={{ color: "#A07830", fontWeight: 600, textDecoration: "none" }}>
                  www.vibedia.com.br
                </a>
              </p>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
