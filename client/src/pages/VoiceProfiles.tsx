import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AppLayout } from "@/components/AppLayout";
import { TermsModal } from "@/components/TermsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mic, Upload, Trash2, PlusCircle, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function VoiceProfiles() {
  const { isAuthenticated, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [audioFile, setAudioFile] = useState<{ base64: string; mime: string; name: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const { data: termsStatus, refetch: refetchTerms } = trpc.terms.status.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscription } = trpc.subscription.current.useQuery(undefined, { enabled: isAuthenticated });
  const { data: profiles, refetch: refetchProfiles, isLoading } = trpc.voiceProfiles.list.useQuery(undefined, { enabled: isAuthenticated });
  const createMutation = trpc.voiceProfiles.create.useMutation();
  const deleteMutation = trpc.voiceProfiles.delete.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!loading && !isAuthenticated) window.location.href = getLoginUrl();
  }, [loading, isAuthenticated]);

  const maxProfiles = (subscription as any)?.plan?.maxVoiceProfiles ?? 1;
  const canCreate = (profiles?.length ?? 0) < maxProfiles;

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("Arquivo muito grande. Máx 50MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAudioFile({ base64: result.split(",")[1], mime: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Digite um nome para o perfil"); return; }
    setIsCreating(true);
    try {
      await createMutation.mutateAsync({ name, audioBase64: audioFile?.base64, audioMimeType: audioFile?.mime });
      await refetchProfiles();
      setShowForm(false);
      setName("");
      setAudioFile(null);
      toast.success("Perfil de voz criado com sucesso!");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar perfil");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este perfil de voz? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      utils.voiceProfiles.list.invalidate();
      toast.success("Perfil excluído");
    } catch { toast.error("Erro ao excluir perfil"); }
  };

  const needsTerms = termsStatus && (!termsStatus.accepted || termsStatus.needsRenewal);

  const STATUS_CONFIG = {
    pending: { label: "Aguardando", variant: "outline" as const, icon: Loader2 },
    processing: { label: "Processando...", variant: "secondary" as const, icon: Loader2 },
    ready: { label: "Pronto", variant: "default" as const, icon: CheckCircle2 },
    failed: { label: "Falhou", variant: "destructive" as const, icon: AlertCircle },
  };

  return (
    <>
      {needsTerms && <TermsModal onAccepted={() => refetchTerms()} />}
      <AppLayout title="Perfis de Voz">
        {/* Usage info */}
        <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Perfis utilizados</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {profiles?.length ?? 0} de {maxProfiles} disponíveis no plano {(subscription as any)?.plan?.name ?? "—"}
            </p>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {profiles?.length ?? 0}<span className="text-muted-foreground text-base font-normal">/{maxProfiles}</span>
          </div>
        </div>

        {/* Profile list */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : profiles && profiles.length > 0 ? (
          <div className="space-y-3 mb-6">
            {profiles.map((profile) => {
              const sc = STATUS_CONFIG[profile.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
              const Icon = sc.icon;
              return (
                <Card key={profile.id} className="border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mic className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground text-sm">{profile.name}</p>
                        <Badge variant={sc.variant} className="text-xs gap-1">
                          <Icon className={`w-3 h-3 ${profile.status === "processing" ? "animate-spin" : ""}`} />
                          {sc.label}
                        </Badge>
                      </div>
                      {profile.elevenLabsVoiceId && (
                        <p className="text-xs text-muted-foreground">ID ElevenLabs: {profile.elevenLabsVoiceId.slice(0, 12)}...</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Criado em {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDelete(profile.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 mb-6">
            <Mic className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum perfil de voz criado ainda</p>
          </div>
        )}

        {/* Create form */}
        {canCreate && (
          showForm ? (
            <Card className="border-border">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-foreground">Criar novo perfil de voz</h3>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Nome do perfil</Label>
                  <Input placeholder='Ex: "Papai", "Vovó Maria"' value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Áudio de referência (MP3, WAV, M4A — mín. 30s recomendado)
                  </Label>
                  <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioChange} />
                  <Button variant="outline" className="w-full gap-2" onClick={() => audioInputRef.current?.click()}>
                    <Upload className="w-4 h-4" />
                    {audioFile ? `${audioFile.name} ✓` : "Selecionar áudio"}
                  </Button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                  <strong>Importante:</strong> Use apenas áudios de pessoas que você tem autorização legal para clonar.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button className="flex-1 gap-2" onClick={handleCreate} disabled={isCreating || !name.trim()}>
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar clone de voz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setShowForm(true)}>
              <PlusCircle className="w-4 h-4" />
              Criar novo perfil de voz
            </Button>
          )
        )}

        {!canCreate && (
          <div className="p-4 bg-muted/50 rounded-xl border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Você atingiu o limite de {maxProfiles} perfil(is) do seu plano.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/assinatura">Fazer upgrade</a>
            </Button>
          </div>
        )}
      </AppLayout>
    </>
  );
}
