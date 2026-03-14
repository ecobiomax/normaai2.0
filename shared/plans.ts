// Planos de assinatura Pluuu
export const PLANS = {
  basico: {
    id: "basico",
    name: "Básico",
    price: 97,
    videosPerMonth: 5,
    photosPerVideo: 10,
    description: "Ideal para corretores autônomos",
    features: [
      "5 vídeos por mês",
      "Até 10 fotos por vídeo",
      "5 estilos cinematográficos",
      "Download em HD (1080p)",
      "Suporte por email",
    ],
  },
  profissional: {
    id: "profissional",
    name: "Profissional",
    price: 197,
    videosPerMonth: 15,
    photosPerVideo: 10,
    description: "Para corretores de alta performance",
    features: [
      "15 vídeos por mês",
      "Até 10 fotos por vídeo",
      "5 estilos cinematográficos",
      "Download em HD (1080p)",
      "Trilha sonora premium",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  agencia: {
    id: "agencia",
    name: "Agência",
    price: 497,
    videosPerMonth: 50,
    photosPerVideo: 10,
    description: "Para imobiliárias e equipes",
    features: [
      "50 vídeos por mês",
      "Até 10 fotos por vídeo",
      "5 estilos cinematográficos",
      "Download em HD (1080p)",
      "Trilha sonora premium",
      "Suporte dedicado",
      "Relatório mensal",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Estilos de vídeo
export const VIDEO_STYLES = [
  {
    id: "Moderno",
    label: "Moderno",
    description: "Movimentos rápidos e dinâmicos, cortes modernos",
    icon: "⚡",
  },
  {
    id: "Luxo",
    label: "Luxo",
    description: "Movimentos lentos e elegantes, iluminação dourada",
    icon: "✨",
  },
  {
    id: "Aconchegante",
    label: "Aconchegante",
    description: "Atmosfera quente e familiar, movimentos suaves",
    icon: "🏡",
  },
  {
    id: "Minimalista",
    label: "Minimalista",
    description: "Composição limpa, foco nos detalhes arquitetônicos",
    icon: "◻",
  },
  {
    id: "Classico",
    label: "Clássico",
    description: "Estilo atemporal, movimentos tradicionais de câmera",
    icon: "🎬",
  },
] as const;

export type VideoStyle = "Moderno" | "Luxo" | "Aconchegante" | "Minimalista" | "Classico";

// Tipos de imóvel
export const PROPERTY_TYPES = [
  { id: "apartamento", label: "Apartamento" },
  { id: "casa", label: "Casa" },
  { id: "comercial", label: "Comercial" },
  { id: "terreno", label: "Terreno" },
] as const;

// Status de vídeo
export const VIDEO_STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando",
  processing: "Processando",
  analyzing: "Analisando fotos",
  generating: "Gerando clips",
  composing: "Compondo vídeo",
  ready: "Pronto",
  expired: "Expirado",
  error: "Erro",
};

// Músicas disponíveis por estilo
export const MUSIC_TRACKS: Record<string, string> = {
  Moderno: "track_modern.mp3",
  Luxo: "track_luxury.mp3",
  Aconchegante: "track_cozy.mp3",
  Minimalista: "track_minimal.mp3",
  Classico: "track_classic.mp3",
};

// Dias de expiração dos vídeos
export const VIDEO_EXPIRY_DAYS = 7;
