import { trpc } from "@/lib/trpc";

type BannerPosition = "top" | "mid" | "footer";

interface BannerAdProps {
  className?: string;
  /** Posição do banner no layout. Padrão: "mid". Use "footer" para o rodapé. */
  position?: BannerPosition;
}

/**
 * Banner de publicidade padronizado em 320×100 px.
 * Busca o banner ativo da posição especificada no banco de dados.
 * Exibe placeholder discreto quando não há banner cadastrado.
 */
export default function BannerAd({ className = "", position = "mid" }: BannerAdProps) {
  const { data: banner } = trpc.banners.getActive.useQuery(
    { position },
    { staleTime: 5 * 60 * 1000 } // cache 5 min
  );

  const BANNER_W = 320;
  const BANNER_H = 100;

  if (!banner) {
    return (
      <div
        className={`flex items-center justify-center text-xs border border-dashed rounded ${className}`}
        style={{
          width: "100%",
          maxWidth: BANNER_W,
          height: BANNER_H,
          margin: "0 auto",
          borderColor: "rgba(201,168,76,0.25)",
          color: "#B0A090",
          background: "rgba(201,168,76,0.04)",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
        }}
        aria-label="Espaço publicitário"
      >
        PUBLICIDADE
      </div>
    );
  }

  const img = (
    <img
      src={banner.imageUrl}
      alt={banner.altText ?? "Publicidade"}
      width={BANNER_W}
      height={BANNER_H}
      loading="lazy"
      style={{
        width: "100%",
        maxWidth: BANNER_W,
        height: BANNER_H,
        objectFit: "cover",
        display: "block",
        borderRadius: 6,
      }}
    />
  );

  return (
    <div
      className={`flex justify-center ${className}`}
      aria-label="Publicidade"
      style={{ width: "100%", maxWidth: BANNER_W, margin: "0 auto" }}
    >
      {banner.affiliateLink ? (
        <a
          href={banner.affiliateLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{ display: "block", width: "100%" }}
        >
          {img}
        </a>
      ) : (
        <div style={{ width: "100%" }}>{img}</div>
      )}
    </div>
  );
}
