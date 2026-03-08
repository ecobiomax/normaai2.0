import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead, { articleSchema, breadcrumbSchema } from "@/components/SEOHead";
import ShareButtons from "@/components/ShareButtons";
import BannerAd from "@/components/BannerAd";
import { Home, ChevronRight } from "lucide-react";

export default function MessagePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: message, isLoading } = trpc.content.getMessageBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="container" style={{ padding: "3rem 1rem" }}>
        <div className="skeleton" style={{ height: "200px" }} />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="container" style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744" }}>Mensagem não encontrada</h2>
        <Link href="/" style={{ color: "#A07830" }}>← Voltar ao início</Link>
      </div>
    );
  }

  const datePublished = new Date(message.createdAt).toISOString();
  const categoryName = message.categoryName || "Mensagens";
  const categorySlug = message.categorySlug || "/";

  const schema = {
    "@graph": [
      articleSchema(
        `${message.text.substring(0, 60)}... | VibeDia`,
        message.text,
        `/mensagem/${slug}`,
        datePublished
      ),
      breadcrumbSchema([
        { name: "Início", url: "/" },
        { name: categoryName, url: `/${categorySlug}` },
        { name: message.text.substring(0, 40) + "...", url: `/mensagem/${slug}` },
      ]),
    ],
  };

  return (
    <>
      <SEOHead
        title={`${message.text.substring(0, 55)}... | VibeDia`}
        description={`${message.text} — Compartilhe esta mensagem inspiracional no WhatsApp, Facebook e Instagram.`}
        canonical={`/mensagem/${slug}`}
        ogType="article"
        schema={schema}
      />

      <main>
        <section style={{
          background: "linear-gradient(135deg, #1A2744 0%, #243358 100%)",
          padding: "2rem 0",
        }}>
          <div className="container">
            <nav className="breadcrumb">
              <Link href="/" style={{ color: "#9AAAC0", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Home size={13} /> Início
              </Link>
              <ChevronRight size={13} style={{ color: "#4A5F8A" }} />
              <Link href={`/${categorySlug}`} style={{ color: "#9AAAC0", textDecoration: "none" }}>{categoryName}</Link>
              <ChevronRight size={13} style={{ color: "#4A5F8A" }} />
              <span style={{ color: "#C9A84C" }}>Mensagem</span>
            </nav>
          </div>
        </section>

        <div className="gold-divider-thick" />

        <div className="container" style={{ padding: "2rem 1rem" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <BannerAd />

            <article className="vibe-card" style={{ padding: "2.5rem", marginTop: "2rem", marginBottom: "2rem" }}>
              {message.imageUrl && (
                <div style={{ marginBottom: "1.75rem", borderRadius: "12px", overflow: "hidden" }}>
                  <img
                    src={message.imageUrl}
                    alt={`Imagem para: ${message.text.substring(0, 60)}`}
                    style={{ width: "100%", height: "auto", display: "block", maxHeight: "420px", objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
              )}
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <span className="badge-gold" style={{ marginBottom: "1.25rem", display: "inline-block" }}>{categoryName}</span>
                <blockquote style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
                  lineHeight: 1.7,
                  color: "#1A2744",
                  fontStyle: "italic",
                  margin: 0,
                  padding: "0 1rem",
                  borderLeft: "3px solid #C9A84C",
                  textAlign: "left",
                }}>
                  "{message.text}"
                </blockquote>
              </div>

              <div className="gold-divider" style={{ marginBottom: "1.5rem" }} />

              <div>
                <p style={{ fontSize: "0.8125rem", color: "#7A8AAA", marginBottom: "0.875rem" }}>
                  Compartilhe esta mensagem:
                </p>
                <ShareButtons
                  text={message.text}
                  url={`/mensagem/${slug}`}
                  title={`${categoryName} — VibeDia`}
                />
              </div>
            </article>

            <BannerAd />

            <div style={{ marginTop: "2rem" }}>
              <Link
                href={`/${categorySlug}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  color: "#A07830", textDecoration: "none", fontWeight: 500,
                }}
              >
                ← Ver mais mensagens de {categoryName}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
