import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AppLayout } from "@/components/AppLayout";
import { TermsModal } from "@/components/TermsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Download,
  Share2,
  Trash2,
  Play,
  Pause,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Aguardando", variant: "outline" },
  tts_processing: { label: "Sintetizando voz...", variant: "secondary" },
  tts_done: { label: "Voz pronta", variant: "secondary" },
  lipsync_processing: { label: "Animando rosto...", variant: "secondary" },
  lipsync_done: { label: "Lipsync pronto", variant: "secondary" },
  watermark_processing: { label: "Finalizando...", variant: "secondary" },
  completed: { label: "Concluído", variant: "default" },
  failed: { label: "Falhou", variant: "destructive" },
};

const PROCESSING_STATUSES = [
  "pending",
  "tts_processing",
  "tts_done",
  "lipsync_processing",
  "lipsync_done",
  "watermark_processing",
];

export default function MyVideos() {
  const { isAuthenticated, loading } = useAuth();
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "processing" | "failed">("all");

  const { data: termsStatus, refetch: refetchTerms } = trpc.terms.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const {
    data: videos,
    isLoading: videosLoading,
    refetch: refetchVideos,
  } = trpc.videoJobs.list.useQuery({ limit: 50 }, { enabled: isAuthenticated });
  const deleteMutation = trpc.videoJobs.delete.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  // Auto-refresh quando há vídeos em processamento
  useEffect(() => {
    const hasProcessing = videos?.some((v) => PROCESSING_STATUSES.includes(v.status));
    if (!hasProcessing) return;
    const interval = setInterval(() => refetchVideos(), 8000);
    return () => clearInterval(interval);
  }, [videos]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      utils.videoJobs.list.invalidate();
      toast.success("Vídeo excluído");
    } catch {
      toast.error("Erro ao excluir vídeo");
    }
  };

  const handleShare = (job: any) => {
    if (!job.outputS3Url) {
      toast.error("Vídeo ainda não está disponível para compartilhar");
      return;
    }
    navigator.clipboard.writeText(job.outputS3Url);
    toast.success("Link copiado para a área de transferência");
  };

  const handleDownload = (job: any) => {
    if (!job.outputS3Url) {
      toast.error("Vídeo ainda não está disponível para download");
      return;
    }
    const a = document.createElement("a");
    a.href = job.outputS3Url;
    a.download = `memoria-viva-${job.id}.mp4`;
    a.click();
  };

  const filteredVideos = videos?.filter((v) => {
    if (filter === "all") return true;
    if (filter === "completed") return v.status === "completed";
    if (filter === "processing") return PROCESSING_STATUSES.includes(v.status);
    if (filter === "failed") return v.status === "failed";
    return true;
  });

  const needsTerms = termsStatus && (!termsStatus.accepted || termsStatus.needsRenewal);

  return (
    <>
      {needsTerms && <TermsModal onAccepted={() => refetchTerms()} />}

      <AppLayout title="Meus Vídeos">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "Todos" },
            { key: "completed", label: "Concluídos" },
            { key: "processing", label: "Em processamento" },
            { key: "failed", label: "Com erro" },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key as any)}
              className="text-xs h-8"
            >
              {f.label}
              {f.key !== "all" && (
                <span className="ml-1.5 text-xs opacity-60">
                  {videos?.filter((v) => {
                    if (f.key === "completed") return v.status === "completed";
                    if (f.key === "processing") return PROCESSING_STATUSES.includes(v.status);
                    if (f.key === "failed") return v.status === "failed";
                    return true;
                  }).length ?? 0}
                </span>
              )}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchVideos()}
            className="text-xs h-8 ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Atualizar
          </Button>
        </div>

        {videosLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !filteredVideos || filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-base font-medium text-foreground mb-2">
              {filter === "all" ? "Nenhum vídeo criado ainda" : "Nenhum vídeo nesta categoria"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {filter === "all"
                ? "Crie seu primeiro vídeo e preserve uma memória especial"
                : "Tente outro filtro"}
            </p>
            {filter === "all" && (
              <Link href="/novo-video">
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Criar primeiro vídeo
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((job) => {
              const statusInfo = STATUS_MAP[job.status] ?? STATUS_MAP.pending;
              const isProcessing = PROCESSING_STATUSES.includes(job.status);
              const isExpired =
                job.expiresAt && new Date(job.expiresAt) < new Date();

              return (
                <Card key={job.id} className="border-border overflow-hidden">
                  {/* Video thumbnail / player */}
                  <div className="relative aspect-video bg-muted">
                    {job.status === "completed" && job.outputS3Url ? (
                      <>
                        {playingId === job.id ? (
                          <video
                            src={job.outputS3Url}
                            autoPlay
                            controls
                            className="w-full h-full object-cover"
                            onEnded={() => setPlayingId(null)}
                          />
                        ) : (
                          <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                            onClick={() => setPlayingId(job.id)}
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : isProcessing ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <p className="text-xs text-muted-foreground">{statusInfo.label}</p>
                      </div>
                    ) : job.status === "failed" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-destructive mb-2" />
                        <p className="text-xs text-destructive">Processamento falhou</p>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}

                    {isExpired && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="text-center p-4">
                          <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Expirado</p>
                          <Link href="/assinatura">
                            <Button size="sm" variant="outline" className="mt-2 text-xs h-7">
                              Fazer upgrade
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                        {job.promptText.slice(0, 60)}
                        {job.promptText.length > 60 ? "..." : ""}
                      </p>
                      <Badge variant={statusInfo.variant} className="text-xs shrink-0">
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {format(new Date(job.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {job.expiresAt && !isExpired && (
                        <span className="ml-2">
                          · Expira em{" "}
                          {format(new Date(job.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs h-8"
                        onClick={() => handleDownload(job)}
                        disabled={job.status !== "completed" || !!isExpired}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs h-8"
                        onClick={() => handleShare(job)}
                        disabled={job.status !== "completed" || !!isExpired}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Compartilhar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </AppLayout>
    </>
  );
}
