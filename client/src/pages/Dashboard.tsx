import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PluuuLayout } from "@/components/PluuuLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { VIDEO_STATUS_LABELS, PLANS } from "../../../shared/plans";
import {
  Plus,
  Film,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  CreditCard,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: "Aguardando", className: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
    processing: { label: "Processando", className: "bg-blue-100 text-blue-800", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    analyzing: { label: "Analisando", className: "bg-blue-100 text-blue-800", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    generating: { label: "Gerando clips", className: "bg-purple-100 text-purple-800", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    composing: { label: "Compondo", className: "bg-indigo-100 text-indigo-800", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    ready: { label: "Pronto", className: "bg-green-100 text-green-800", icon: <CheckCircle2 className="w-3 h-3" /> },
    expired: { label: "Expirado", className: "bg-gray-100 text-gray-500", icon: <Clock className="w-3 h-3" /> },
    error: { label: "Erro", className: "bg-red-100 text-red-800", icon: <AlertCircle className="w-3 h-3" /> },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.className}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: dashData, isLoading } = trpc.dashboard.getSummary.useQuery();

  const subscription = dashData?.subscription;
  const recentVideos = dashData?.recentVideos || [];
  const plan = subscription ? PLANS[subscription.plan as keyof typeof PLANS] : null;
  const videosUsed = subscription?.videosUsed || 0;
  const videosLimit = subscription?.videosLimit || 0;
  const videosRemaining = videosLimit === -1 ? Infinity : Math.max(0, videosLimit - videosUsed);
  const progressPct = videosLimit === -1 ? 0 : Math.min(100, (videosUsed / videosLimit) * 100);

  return (
    <PluuuLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Olá, {user?.name?.split(" ")[0] || "Corretor"} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Bem-vindo ao seu painel de vídeos imobiliários
            </p>
          </div>
          <Link href="/dashboard/criar">
            <Button className="bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Criar Vídeo
            </Button>
          </Link>
        </div>

        {/* Subscription card */}
        {isLoading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : subscription ? (
          <motion.div
            className="bg-gradient-to-br from-primary to-[oklch(0.55_0.25_280)] rounded-2xl p-6 text-white shadow-xl shadow-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="bg-white/20 text-white border-0 mb-2">
                  Plano {plan?.name}
                </Badge>
                <p className="text-white/70 text-sm">
                  {subscription.status === "active" ? (
                    <>Renova em {formatDistanceToNow(new Date(subscription.currentPeriodEnd), { locale: ptBR, addSuffix: true })}</>
                  ) : (
                    <span className="text-red-300">Assinatura {subscription.status === "expired" ? "vencida" : "cancelada"}</span>
                  )}
                </p>
              </div>
              <Link href="/dashboard/assinatura">
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  Gerenciar
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Vídeos usados este mês</span>
                <span className="font-semibold">
                  {videosUsed} / {videosLimit === -1 ? "∞" : videosLimit}
                </span>
              </div>
              <Progress value={progressPct} className="h-2 bg-white/20 [&>div]:bg-white" />
              <p className="text-white/60 text-xs">
                {videosLimit === -1
                  ? "Vídeos ilimitados"
                  : `${videosRemaining} vídeos restantes`}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="bg-card rounded-2xl p-6 border border-border text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Sem assinatura ativa</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Assine um plano para começar a criar vídeos profissionais
            </p>
            <Link href="/dashboard/assinatura">
              <Button className="bg-primary text-white">Ver planos</Button>
            </Link>
          </motion.div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total de vídeos", value: dashData?.totalVideos || 0, icon: Film, color: "text-primary" },
            { label: "Prontos", value: dashData?.readyVideos || 0, icon: CheckCircle2, color: "text-green-600" },
            { label: "Processando", value: dashData?.processingVideos || 0, icon: Loader2, color: "text-blue-600" },
            { label: "Expirados", value: dashData?.expiredVideos || 0, icon: Clock, color: "text-muted-foreground" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-card rounded-2xl p-4 border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold text-foreground">{isLoading ? "—" : stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent videos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Vídeos recentes</h2>
            <Link href="/dashboard/videos">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : recentVideos.length === 0 ? (
            <div className="bg-card rounded-2xl p-10 border border-border text-center">
              <Film className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">Nenhum vídeo ainda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro vídeo imobiliário com IA
              </p>
              <Link href="/dashboard/criar">
                <Button className="bg-primary text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Vídeo
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentVideos.map((video: any, i: number) => (
                <motion.div
                  key={video.id}
                  className="bg-card rounded-xl p-4 border border-border flex items-center gap-4 hover:shadow-sm transition-shadow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Film className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(video.createdAt), { locale: ptBR, addSuffix: true })}
                      {video.status === "ready" && video.expiresAt && (
                        <> · expira {formatDistanceToNow(new Date(video.expiresAt), { locale: ptBR, addSuffix: true })}</>
                      )}
                    </p>
                  </div>
                  <StatusBadge status={video.status} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PluuuLayout>
  );
}
