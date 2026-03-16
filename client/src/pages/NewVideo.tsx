import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AppLayout } from "@/components/AppLayout";
import { TermsModal } from "@/components/TermsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  Image,
  MessageSquare,
  Video,
  ChevronRight,
  ChevronLeft,
  Upload,
  Play,
  Pause,
  Check,
  Loader2,
  PlusCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const STEPS = [
  { id: 1, label: "Perfil de Voz", icon: Mic },
  { id: 2, label: "Foto", icon: Image },
  { id: 3, label: "Mensagem", icon: MessageSquare },
  { id: 4, label: "Gerar", icon: Video },
];

const SUGGESTIONS = [
  "Estou muito orgulhoso de você. Você cresceu tanto e me faz feliz todos os dias.",
  "Saudades de você todos os dias. Você está sempre no meu coração.",
  "Feliz aniversário, meu amor. Que este dia seja tão especial quanto você é para mim.",
  "Obrigado por tudo que você fez por mim. Você foi a melhor pessoa da minha vida.",
  "Não tenha medo. Você é mais forte do que imagina e eu sempre acreditei em você.",
];

export default function NewVideo() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [generatedJobId, setGeneratedJobId] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [newVoiceName, setNewVoiceName] = useState("");
  const [newVoiceAudio, setNewVoiceAudio] = useState<{ base64: string; mime: string } | null>(null);
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);
  const [showNewVoiceForm, setShowNewVoiceForm] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const { data: termsStatus, refetch: refetchTerms } = trpc.terms.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: subscription } = trpc.subscription.current.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: voiceProfiles, refetch: refetchProfiles } = trpc.voiceProfiles.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const createVoiceMutation = trpc.voiceProfiles.create.useMutation();
  const createVideoMutation = trpc.videoJobs.create.useMutation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A foto deve ter no máximo 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoPreview(result);
      setPhotoBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("O áudio deve ter no máximo 50MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setNewVoiceAudio({ base64: result.split(",")[1], mime: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleCreateVoice = async () => {
    if (!newVoiceName.trim()) {
      toast.error("Digite um nome para o perfil");
      return;
    }
    setIsCreatingVoice(true);
    try {
      const result = await createVoiceMutation.mutateAsync({
        name: newVoiceName,
        audioBase64: newVoiceAudio?.base64,
        audioMimeType: newVoiceAudio?.mime,
      });
      await refetchProfiles();
      setSelectedVoiceId(result.id);
      setShowNewVoiceForm(false);
      setNewVoiceName("");
      setNewVoiceAudio(null);
      toast.success("Perfil de voz criado com sucesso!");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar perfil de voz");
    } finally {
      setIsCreatingVoice(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedVoiceId || !photoBase64 || !message.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    setIsGenerating(true);
    setGeneratingStep(1);

    const steps = [
      { label: "Sintetizando voz...", duration: 2000 },
      { label: "Animando o rosto...", duration: 3000 },
      { label: "Finalizando o vídeo...", duration: 1500 },
    ];

    // Simular progresso visual
    for (let i = 0; i < steps.length; i++) {
      setGeneratingStep(i + 1);
      await new Promise((r) => setTimeout(r, steps[i].duration));
    }

    try {
      const result = await createVideoMutation.mutateAsync({
        voiceProfileId: selectedVoiceId,
        photoBase64,
        photoMimeType: "image/jpeg",
        promptText: message,
        language,
        notifyByEmail,
      });
      setGeneratedJobId(result.id);
      toast.success("Vídeo em processamento! Você será notificado quando estiver pronto.");
      navigate("/meus-videos");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao gerar vídeo");
      setIsGenerating(false);
      setGeneratingStep(0);
    }
  };

  const maxChars = (subscription as any)?.plan?.maxDurationSec
    ? (subscription as any).plan.maxDurationSec * 15
    : 450;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const needsTerms = termsStatus && (!termsStatus.accepted || termsStatus.needsRenewal);

  return (
    <>
      {needsTerms && <TermsModal onAccepted={() => refetchTerms()} />}

      <AppLayout title="Criar Novo Vídeo">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-border -z-0" />
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-xs hidden sm:block ${
                      active ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={(step / STEPS.length) * 100} className="mt-4 h-1.5" />
        </div>

        {/* Generating overlay */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="text-center max-w-sm px-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                Criando sua memória...
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Isso pode levar entre 1 e 3 minutos
              </p>
              <div className="space-y-3">
                {["Sintetizando voz...", "Animando o rosto...", "Finalizando o vídeo..."].map(
                  (label, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        generatingStep === i + 1
                          ? "bg-primary/10 border border-primary/20"
                          : generatingStep > i + 1
                          ? "bg-muted/50"
                          : "opacity-40"
                      }`}
                    >
                      {generatingStep > i + 1 ? (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      ) : generatingStep === i + 1 ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          generatingStep === i + 1
                            ? "text-primary font-medium"
                            : generatingStep > i + 1
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Voice Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Selecione um perfil de voz
              </h2>
              <p className="text-sm text-muted-foreground">
                Escolha um clone de voz existente ou crie um novo
              </p>
            </div>

            {voiceProfiles && voiceProfiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {voiceProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedVoiceId(profile.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedVoiceId === profile.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{profile.name}</p>
                        <Badge
                          variant={profile.status === "ready" ? "secondary" : "outline"}
                          className="text-xs mt-0.5"
                        >
                          {profile.status === "ready" ? "Pronto" : profile.status === "processing" ? "Processando..." : "Falhou"}
                        </Badge>
                      </div>
                      {selectedVoiceId === profile.id && (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New voice form */}
            {showNewVoiceForm ? (
              <Card className="border-border">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-medium text-foreground text-sm">Criar novo perfil de voz</h3>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Nome do perfil (ex: "Papai", "Vovó Maria")
                    </Label>
                    <Input
                      placeholder="Nome do perfil de voz"
                      value={newVoiceName}
                      onChange={(e) => setNewVoiceName(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Áudio de referência (MP3, WAV, M4A — máx 50MB, mín 30s recomendado)
                    </Label>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/*"
                      className="hidden"
                      onChange={handleAudioUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-sm"
                      onClick={() => audioInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      {newVoiceAudio ? "Áudio selecionado ✓" : "Selecionar áudio"}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowNewVoiceForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleCreateVoice}
                      disabled={isCreatingVoice || !newVoiceName.trim()}
                    >
                      {isCreatingVoice ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Criar clone de voz"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={() => setShowNewVoiceForm(true)}
              >
                <PlusCircle className="w-4 h-4" />
                Criar novo perfil de voz
              </Button>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedVoiceId}
                className="gap-2"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Photo */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Envie uma foto</h2>
              <p className="text-sm text-muted-foreground">
                A foto deve mostrar o rosto com clareza, de frente, com boa iluminação
              </p>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full max-w-sm mx-auto rounded-2xl object-cover aspect-square border border-border shadow-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm"
                  onClick={() => photoInputRef.current?.click()}
                >
                  Trocar foto
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() => photoInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Clique para enviar uma foto
                </p>
                <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP — máx 10MB</p>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Para melhores resultados: rosto centralizado, frente para a câmera, boa iluminação,
                sem óculos escuros ou objetos cobrindo o rosto.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button onClick={() => setStep(3)} disabled={!photoBase64} className="gap-2">
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Message */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Escreva a mensagem</h2>
              <p className="text-sm text-muted-foreground">
                O que você gostaria que essa pessoa dissesse?
              </p>
            </div>

            <div>
              <Textarea
                placeholder="Escreva aqui o que a pessoa irá falar no vídeo..."
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                className="min-h-[140px] text-sm resize-none"
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-xs text-muted-foreground">
                  Tempo estimado: ~{Math.round(message.length / 15)}s
                </p>
                <p
                  className={`text-xs ${
                    message.length > maxChars * 0.9 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {message.length}/{maxChars}
                </p>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Sugestões de mensagens:
              </p>
              <div className="space-y-2">
                {SUGGESTIONS.slice(0, 3).map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(sug)}
                    className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border text-xs text-muted-foreground hover:text-foreground transition-all leading-relaxed"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button onClick={() => setStep(4)} disabled={!message.trim()} className="gap-2">
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Generate */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Revisar e gerar</h2>
              <p className="text-sm text-muted-foreground">
                Confirme os detalhes antes de gerar o vídeo
              </p>
            </div>

            <Card className="border-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-4">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Foto"
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Mic className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {voiceProfiles?.find((v) => v.id === selectedVoiceId)?.name ?? "—"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      "{message.slice(0, 120)}{message.length > 120 ? "..." : ""}"
                    </p>
                  </div>
                </div>

                <div className="bg-accent/30 rounded-lg p-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-foreground shrink-0" />
                  <p className="text-xs text-accent-foreground">
                    Este vídeo consumirá <strong>1 crédito</strong>. Você tem{" "}
                    <strong>{subscription?.creditsRemaining ?? 0}</strong> crédito(s) restante(s).
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (subscription?.creditsRemaining ?? 0) <= 0}
                className="gap-2 px-6"
                size="lg"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Gerar vídeo
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
}
