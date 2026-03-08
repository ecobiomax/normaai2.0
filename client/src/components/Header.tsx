import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Star } from "lucide-react";
import BannerAd from "./BannerAd";

const NAV_LINKS = [
  { href: "/mensagem-de-bom-dia", label: "Bom Dia" },
  { href: "/mensagem-motivacional", label: "Motivação" },
  { href: "/mensagem-de-amor", label: "Amor" },
  { href: "/horoscopo-de-hoje", label: "Horóscopo" },
  { href: "/frases-para-whatsapp", label: "WhatsApp" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <header
      style={{
        background: "linear-gradient(135deg, #1A2744 0%, #243358 60%, #1A2744 100%)",
        borderBottom: "2px solid rgba(201,168,76,0.4)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 24px rgba(26,39,68,0.3)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Top Banner Ad — 320×100 dinâmico do banco */}
      <div style={{ background: "rgba(0,0,0,0.2)", padding: "6px 0" }}>
        <BannerAd />
      </div>

      {/* Nav container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
          boxSizing: "border-box",
        }}
      >
        {/* Nav row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 0",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                background: "linear-gradient(135deg, #A07830, #C9A84C, #E8C96A)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Star size={16} color="#1A2744" fill="#1A2744" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "#F8F4ED",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                VibeDia
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "0.625rem",
                  color: "#C9A84C",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Frases & Horóscopo
              </div>
            </div>
          </Link>

          {/* Desktop Navigation — visível apenas em telas >= 768px */}
          {isDesktop && (
            <nav style={{ display: "flex", alignItems: "center", gap: "0.125rem" }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: location === link.href ? "#C9A84C" : "#D4C9B0",
                    fontWeight: 500,
                    fontSize: "0.8125rem",
                    textDecoration: "none",
                    padding: "0.375rem 0.625rem",
                    borderRadius: "0.375rem",
                    transition: "all 0.2s ease",
                    background:
                      location === link.href
                        ? "rgba(201,168,76,0.12)"
                        : "transparent",
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Mobile Menu Toggle — visível apenas em telas < 768px */}
          {!isDesktop && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "0.5rem",
                padding: "0.5rem",
                color: "#C9A84C",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {!isDesktop && menuOpen && (
          <div
            style={{
              borderTop: "1px solid rgba(201,168,76,0.2)",
              paddingBottom: "0.75rem",
              paddingTop: "0.5rem",
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  color: location === link.href ? "#C9A84C" : "#D4C9B0",
                  fontWeight: 500,
                  fontSize: "1rem",
                  textDecoration: "none",
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  background:
                    location === link.href
                      ? "rgba(201,168,76,0.12)"
                      : "transparent",
                  fontFamily: "'Inter', sans-serif",
                  marginBottom: "0.125rem",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
