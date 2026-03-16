import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AppLayout } from "@/components/AppLayout";
import { TermsModal } from "@/components/TermsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PlusCircle,
  Video,
  Mic,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getLoginUrl } from "@/const";

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Aguardando", color: "text-amber-500", icon: Clock },
  tts_processing: { label: "Sintetizando voz...", color: "text-blue-500", icon: Loader2 },
  tts_done: { label: "Voz pronta", color: "text-blue-500", icon: CheckCircle2 },
  lipsync_processing: { label: "Animando rosto...", color: "text-violet-500", icon: Loader2 },
  lipsync_done: { label: "Lipsync pronto", color: "text-violet-500", icon: CheckCircle2 },
  watermark_processing: { label: "Finalizando...", color: "text-primary", icon: Loader2 },
  completed: { label: "Concluído", color: "text-emerald-500", icon: CheckCircle2 },
  failed: { label: "Falhou", color: "text-destructive", icon: AlertCircle },
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { data: termsStatus, refetch: refetchTerms } = trpc.terms.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: subscription } = trpc.subscription.current.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: recentVideos } = trpc.videoJobs.list.useQuery(
    { limit: 3 },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Redirecionar para planos se sem assinatura
  if (subscription === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">
            Escolha seu plano
          </h2>
          <p className="text-muted-foreground mb-6">
            Para criar memórias, você precisa de uma assinatura ativa. Escolha o plano ideal para você.
          </p>
          <Link href="/planos">
            <Button size="lg" className="gap-2">
              Ver planos disponíveis
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mostrar modal de termos se necessário
  const needsTerms =
    termsStatus && (!termsStatus.accepted || termsStatus.needsRenewal);

  return (
    <>
      {needsTerms && (
        <TermsModal onAccepted={() => refetchTerms()} />
      )}

      <AppLayout title="Dashboard">
        {/* Welcome card */}
        {subscription && (
          <div className="mb-6 bg-gradient-to-r from-primary/5 to-accent/20 rounded-2xl p-5 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Bem-vindo ao Memórias VIVA
                </h2>
                <p className="text-sm text-muted-foreground">
                  {(subscription as any).plan?.name} •{" "}
                  {subscription.creditsRemaining} crédito(s) restante(s)
                  {subscription.currentPeriodEnd && (
                    <span>
                      {" "}• Renova em{" "}
                      {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </p>
              </div>
              <Link href="/novo-video">
                <Button className="gap-2 shrink-0">
                  <PlusCircle className="w-4 h-4" />
                  Criar novo vídeo
                </Button>
              </Link>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Créditos utilizados</span>
                <span>
                  {((subscription as any).plan?.videosPerMonth ?? 0) -
                    subscription.creditsRemaining}{" "}
                  / {(subscription as any).plan?.videosPerMonth ?? 0}
                </span>
              </div>
              <Progress
                value={
                  (((subscription as any).plan?.videosPerMonth ?? 0) -
                    subscription.creditsRemaining) /
                  ((subscription as any).plan?.videosPerMonth ?? 1) *
                  100
                }
                className="h-2"
              />
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Créditos restantes",
              value: subscription?.creditsRemaining ?? 0,
              icon: Sparkles,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Vídeos gerados",
              value: recentVideos?.filter((v) => v.status === "completed").length ?? 0,
              icon: Video,
              color: "text-violet-600",
              bg: "bg-violet-50",
            },
            {
              label: "Perfis de voz",
              value: 0,
              icon: Mic,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Plano ativo",
              value: (subscription as any)?.plan?.name ?? "—",
              icon: TrendingUp,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              isText: true,
            },
          ].map((stat, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className={`font-bold ${stat.isText ? "text-sm" : "text-2xl"} text-foreground`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent videos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Vídeos recentes</CardTitle>
                  <Link href="/meus-videos">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      Ver todos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {!recentVideos || recentVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum vídeo criado ainda</p>
                    <Link href="/novo-video">
                      <Button size="sm" className="mt-3 gap-2">
                        <PlusCircle className="w-3.5 h-3.5" />
                        Criar primeiro vídeo
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentVideos.map((job) => {
                      const statusInfo = STATUS_MAP[job.status] ?? STATUS_MAP.pending;
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div
                          key={job.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Video className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {job.promptText.slice(0, 40)}
                              {job.promptText.length > 40 ? "..." : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(job.createdAt), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${statusInfo.color}`}>
                            <StatusIcon
                              className={`w-3.5 h-3.5 ${
                                ["tts_processing", "lipsync_processing", "watermark_processing"].includes(
                                  job.status
                                )
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                            <span className="hidden sm:inline">{statusInfo.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Ações rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { href: "/novo-video", icon: PlusCircle, label: "Criar novo vídeo", primary: true },
                  { href: "/perfis-de-voz", icon: Mic, label: "Gerenciar vozes" },
                  { href: "/meus-videos", icon: Video, label: "Meus vídeos" },
                  { href: "/assinatura", icon: CreditCard, label: "Minha assinatura" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Button
                      variant={action.primary ? "default" : "outline"}
                      className="w-full justify-start gap-2 text-sm"
                      size="sm"
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {subscription?.currentPeriodEnd && (
              <Card className="border-border bg-accent/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-accent-foreground">Próxima renovação</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(subscription as any).plan?.priceBrl
                          ? `R$ ${Number((subscription as any).plan.priceBrl).toFixed(2)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
