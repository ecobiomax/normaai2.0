import { trpc } from "@/lib/trpc";

type BannerPosition = "top" | "mid" | "footer";

interface BannerAdProps {
  position?: BannerPosition;
  className?: string;
}

/** Dimensões padrão por posição */
const DIMENSIONS: Record<BannerPosition, { w: number; h: number; label: string }> = {
  top:    { w: 320, h: 50,  label: "320×50" },
  mid:    { w: 320, h: 100, label: "320×100" },
  footer: { w: 728, h: 90,  label: "728×90" },
};

export default function BannerAd({ position = "mid", className = "" }: BannerAdProps) {
  const { data: banner } = trpc.banners.getActive.useQuery(
    { position },
    { staleTime: 5 * 60 * 1000 } // cache 5 min
  );

  const dim = DIMENSIONS[position];

  // Se não há banner cadastrado, exibe placeholder discreto
  if (!banner) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded bg-gray-50 ${className}`}
        style={{ minHeight: dim.h, maxWidth: dim.w === 728 ? "100%" : dim.w, margin: "0 auto" }}
        aria-label="Espaço publicitário"
      >
        Publicidade {dim.label}
      </div>
    );
  }

  const img = (
    <img
      src={banner.imageUrl}
      alt={banner.altText ?? "Publicidade"}
      width={dim.w}
      height={dim.h}
      loading="lazy"
      style={{ width: "100%", height: "auto", display: "block", borderRadius: 6 }}
    />
  );

  return (
    <div
      className={`flex justify-center ${className}`}
      aria-label="Publicidade"
      style={{ maxWidth: dim.w === 728 ? "100%" : dim.w, margin: "0 auto" }}
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
