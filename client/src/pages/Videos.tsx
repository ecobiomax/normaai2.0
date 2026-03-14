import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PluuuLayout } from "@/components/PluuuLayout";
import { trpc } from "@/lib/trpc";
import {
  Film,
  Plus,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { VIDEO_STYLES } from "../../../shared/plans";

// ─── Status helpers ───────────────────────────────────────────────────────────
function StatusBadge({ status, progress }: { status: string; progress: number }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: "Aguardando", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="w-3 h-3" /> },
    processing: { label: "Processando", className: "bg-blue-100 text-blue-800 border-blue-200", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    analyzing: { label: "Analisando fotos", className: "bg-blue-100 text-blue-800 border-blue-200", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    generating: { label: "Gerando clips", className: "bg-purple-100 text-purple-800 border-purple-200", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    composing: { label: "Compondo vídeo", className: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    ready: { label: "Pronto", className: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    expired: { label: "Expirado", className: "bg-gray-100 text-gray-500 border-gray-200", icon: <Clock className="w-3 h-3" /> },
    error: { label: "Erro", className: "bg-red-100 text-red-800 border-red-200", icon: <AlertCircle className="w-3 h-3" /> },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.className}`}>
      {s.icon}
      {s.label}
      {["analyzing", "generating", "composing", "processing"].includes(status) && progress > 0 && (
        <span className="font-normal">({progress}%)</span>
      )}
    </span>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoCard({ video, onDelete, onDownload }: {
  video: any;
  onDelete: (id: number) => void;
  onDownload: (id: number) => void;
}) {
  const isProcessing = ["pending", "processing", "analyzing", "generating", "composing"].includes(video.status);
  const styleInfo = VIDEO_STYLES.find((s) => s.id === video.videoStyle);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all"
    >
      {/* Thumbnail area */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        <Film className="w-12 h-12 text-primary/30" />
        {video.status === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Eye className="w-5 h-5 text-primary" />
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={video.status} progress={video.progress} />
        </div>
        {styleInfo && (
          <div className="absolute top-3 left-3">
            <span className="text-lg">{styleInfo.icon}</span>
          </div>
        )}
      </div>

      {/* Progress bar for processing */}
      {isProcessing && (
        <Progress value={video.progress} className="h-1 rounded-none" />
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground truncate mb-1">{video.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span>{video.photosCount} fotos</span>
          <span>•</span>
          <span>{styleInfo?.label || video.videoStyle}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(video.createdAt), { locale: ptBR, addSuffix: true })}</span>
        </div>

        {video.status === "ready" && video.expiresAt && (
          <p className="text-xs text-amber-600 mb-3">
            Expira {formatDistanceToNow(new Date(video.expiresAt), { locale: ptBR, addSuffix: true })}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {video.status === "ready" && (
            <Button
              size="sm"
              className="flex-1 bg-primary text-white hover:bg-primary/90 h-8"
              onClick={() => onDownload(video.id)}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Baixar
            </Button>
          )}

          {video.status === "error" && (
            <p className="text-xs text-red-600 flex-1 truncate">{video.errorMessage || "Erro ao gerar"}</p>
          )}

          {isProcessing && (
            <div className="flex-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processando...
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deletar vídeo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O vídeo será removido permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground"
                  onClick={() => onDelete(video.id)}
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Videos() {
  const [statusFilter, setStatusFilter] = useState("all");
  const utils = trpc.useUtils();

  const { data: videos, isLoading, refetch } = trpc.videos.list.useQuery(
    { status: statusFilter },
    { refetchInterval: 10000 } // Poll every 10s for processing videos
  );

  const deleteMutation = trpc.videos.delete.useMutation({
    onSuccess: () => {
      toast.success("Vídeo removido");
      utils.videos.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const downloadQuery = trpc.videos.getDownloadUrl.useQuery(
    { id: 0 },
    { enabled: false }
  );

  const handleDownload = async (videoId: number) => {
    try {
      const result = await utils.videos.getDownloadUrl.fetch({ id: videoId });
      window.open(result.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Erro ao obter link de download");
    }
  };

  // WebSocket for real-time updates
  useEffect(() => {
    const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "video_progress") {
            utils.videos.list.invalidate();
            utils.dashboard.getSummary.invalidate();
          }
        } catch {}
      };
    } catch {}

    return () => ws?.close();
  }, []);

  const filteredVideos = videos || [];

  return (
    <PluuuLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Vídeos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredVideos.length} vídeo{filteredVideos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ready">Prontos</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
                <SelectItem value="error">Com erro</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-9 w-9 p-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link href="/dashboard/criar">
              <Button className="bg-primary text-white hover:bg-primary/90 h-9">
                <Plus className="w-4 h-4 mr-2" />
                Criar Vídeo
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-card rounded-2xl p-16 border border-border text-center">
            <Film className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {statusFilter === "all" ? "Nenhum vídeo ainda" : "Nenhum vídeo encontrado"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              {statusFilter === "all"
                ? "Crie seu primeiro vídeo imobiliário com IA em minutos"
                : "Tente outro filtro de status"}
            </p>
            {statusFilter === "all" && (
              <Link href="/dashboard/criar">
                <Button className="bg-primary text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Vídeo
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video: any) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onDelete={(id) => deleteMutation.mutate({ id })}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </PluuuLayout>
  );
}
