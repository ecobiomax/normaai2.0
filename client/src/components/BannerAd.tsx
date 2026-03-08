interface BannerAdProps {
  position?: "top" | "mid" | "footer" | "inline";
  affiliateLink?: string;
  className?: string;
}

/**
 * BannerAd — Espaço para anúncio 320×100px
 * Substitua o conteúdo interno pelo código do Google AdSense ou seu link de afiliado.
 */
export default function BannerAd({ position = "inline", affiliateLink, className = "" }: BannerAdProps) {
  const sizeClass = position === "top" ? "banner-top" : position === "footer" ? "banner-footer" : "banner-mid";

  // Se tiver link de afiliado, renderiza como link rastreável
  if (affiliateLink) {
    return (
      <div className={`${sizeClass} banner-slot ${className}`} style={{ maxWidth: "320px", height: "100px", margin: "0 auto" }}>
        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", textDecoration: "none" }}
          onClick={() => {
            // Rastreamento de clique via cookie
            document.cookie = `vd_aff_click=${Date.now()};path=/;max-age=2592000;SameSite=Lax`;
          }}
        >
          <span style={{ color: "#7A8AAA", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Publicidade 320×100
          </span>
        </a>
      </div>
    );
  }

  // Espaço reservado para AdSense
  return (
    <div className={`${sizeClass} banner-slot ${className}`} style={{ maxWidth: "320px", height: "100px", margin: "0 auto" }}>
      {/* 
        Insira aqui o código do Google AdSense:
        <ins className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
      */}
      <span>Publicidade 320×100</span>
    </div>
  );
}
