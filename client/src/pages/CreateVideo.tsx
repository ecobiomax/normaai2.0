import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PluuuLayout } from "@/components/PluuuLayout";
import { trpc } from "@/lib/trpc";
import { VIDEO_STYLES, PROPERTY_TYPES } from "../../../shared/plans";
import {
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Film,
  Loader2,
  GripVertical,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Fotos", description: "Upload das fotos" },
  { id: 2, title: "Estilo", description: "Escolha o estilo" },
  { id: 3, title: "Detalhes", description: "Informações do imóvel" },
  { id: 4, title: "Confirmar", description: "Revisar e criar" },
];

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  url?: string;
  uploading?: boolean;
  error?: string;
}

// ─── Step 1: Photo Upload ─────────────────────────────────────────────────────
function PhotoUploadStep({
  photos,
  setPhotos,
}: {
  photos: PhotoItem[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
}) {
  const [dragOver, setDragOver] = useState(false);
  const uploadMutation = trpc.videos.uploadPhoto.useMutation();

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = 10 - photos.length;
      const toProcess = fileArray.slice(0, remaining);

      if (toProcess.length === 0) {
        toast.error("Limite de 10 fotos atingido");
        return;
      }

      const newPhotos: PhotoItem[] = toProcess.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        uploading: true,
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);

      // Upload each photo
      for (const photo of newPhotos) {
        try {
          const base64 = await fileToBase64(photo.file);
          const result = await uploadMutation.mutateAsync({
            filename: photo.file.name,
            contentType: photo.file.type,
            base64,
          });

          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photo.id ? { ...p, url: result.url, uploading: false } : p
            )
          );
        } catch (err: any) {
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photo.id
                ? { ...p, uploading: false, error: err.message || "Erro ao enviar" }
                : p
            )
          );
        }
      }
    },
    [photos.length, uploadMutation, setPhotos]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Upload das fotos</h2>
        <p className="text-muted-foreground text-sm">
          Envie de 1 a 10 fotos do imóvel. Arraste para reordenar a sequência.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/jpeg,image/png,image/webp";
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) processFiles(files);
          };
          input.click();
        }}
      >
        <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="font-medium text-foreground mb-1">
          Arraste as fotos aqui ou clique para selecionar
        </p>
        <p className="text-sm text-muted-foreground">
          JPEG, PNG, WebP • Máx. 10MB por foto • Até 10 fotos
        </p>
        <p className="text-xs text-primary mt-2 font-medium">
          {photos.length}/10 fotos selecionadas
        </p>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group rounded-xl overflow-hidden aspect-square bg-muted"
            >
              <img
                src={photo.preview}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Order badge */}
              <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Loading overlay */}
              {photo.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}

              {/* Error overlay */}
              {photo.error && (
                <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              )}

              {/* Remove button */}
              {!photo.uploading && (
                <button
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Style Selection ──────────────────────────────────────────────────
function StyleStep({
  selectedStyle,
  setSelectedStyle,
}: {
  selectedStyle: string;
  setSelectedStyle: (s: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Estilo cinematográfico</h2>
        <p className="text-muted-foreground text-sm">
          O estilo define os movimentos de câmera, atmosfera e trilha sonora do vídeo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VIDEO_STYLES.map((style) => (
          <motion.button
            key={style.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStyle(style.id)}
            className={cn(
              "relative p-5 rounded-2xl border-2 text-left transition-all",
              selectedStyle === style.id
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            {selectedStyle === style.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="text-3xl mb-3">{style.icon}</div>
            <h3 className="font-semibold text-foreground mb-1">{style.label}</h3>
            <p className="text-sm text-muted-foreground">{style.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Details ──────────────────────────────────────────────────────────
function DetailsStep({
  title,
  setTitle,
  propertyType,
  setPropertyType,
  specialHighlight,
  setSpecialHighlight,
}: {
  title: string;
  setTitle: (s: string) => void;
  propertyType: string;
  setPropertyType: (s: string) => void;
  specialHighlight: string;
  setSpecialHighlight: (s: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Detalhes do imóvel</h2>
        <p className="text-muted-foreground text-sm">
          Essas informações ajudam a IA a criar prompts mais precisos para o seu imóvel.
        </p>
      </div>

      <div className="space-y-5 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="title">Título do vídeo *</Label>
          <Input
            id="title"
            placeholder="Ex: Apartamento 3 quartos - Jardins SP"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">{title.length}/300 caracteres</p>
        </div>

        <div className="space-y-2">
          <Label>Tipo de imóvel *</Label>
          <div className="grid grid-cols-2 gap-3">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setPropertyType(type.id)}
                className={cn(
                  "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                  propertyType === type.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="highlight">Destaque especial (opcional)</Label>
          <Textarea
            id="highlight"
            placeholder="Ex: Vista para o mar, piscina aquecida, churrasqueira, 3 vagas de garagem..."
            value={specialHighlight}
            onChange={(e) => setSpecialHighlight(e.target.value)}
            rows={3}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            A IA usará essas informações para criar movimentos de câmera que destacam os pontos fortes do imóvel.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Confirm ──────────────────────────────────────────────────────────
function ConfirmStep({
  photos,
  selectedStyle,
  title,
  propertyType,
  specialHighlight,
}: {
  photos: PhotoItem[];
  selectedStyle: string;
  title: string;
  propertyType: string;
  specialHighlight: string;
}) {
  const styleInfo = VIDEO_STYLES.find((s) => s.id === selectedStyle);
  const typeInfo = PROPERTY_TYPES.find((t) => t.id === propertyType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Confirmar e criar</h2>
        <p className="text-muted-foreground text-sm">
          Revise as informações antes de iniciar a geração do vídeo.
        </p>
      </div>

      <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Título</p>
            <p className="font-medium text-foreground">{title}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Tipo</p>
            <p className="font-medium text-foreground">{typeInfo?.label}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Estilo</p>
            <p className="font-medium text-foreground">
              {styleInfo?.icon} {styleInfo?.label}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Fotos</p>
            <p className="font-medium text-foreground">{photos.length} fotos</p>
          </div>
          {specialHighlight && (
            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Destaque</p>
              <p className="font-medium text-foreground">{specialHighlight}</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo preview strip */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Fotos ({photos.length})</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
              <img src={photo.preview} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">⏱ Tempo estimado: 10-20 minutos</p>
        <p className="text-blue-700">
          Você receberá um email quando o vídeo estiver pronto. Pode fechar esta página.
        </p>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function CreateVideo() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("Moderno");
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("apartamento");
  const [specialHighlight, setSpecialHighlight] = useState("");

  const createMutation = trpc.videos.create.useMutation({
    onSuccess: (data) => {
      toast.success("Vídeo em processamento! Você receberá um email quando estiver pronto.");
      navigate("/dashboard/videos");
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao criar vídeo");
    },
  });

  const canProceed = () => {
    if (currentStep === 1) return photos.length > 0 && photos.every((p) => !p.uploading && !p.error);
    if (currentStep === 2) return !!selectedStyle;
    if (currentStep === 3) return title.trim().length > 0 && !!propertyType;
    return true;
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleCreate = () => {
    const uploadedPhotos = photos.filter((p) => p.url);
    if (uploadedPhotos.length === 0) {
      toast.error("Aguarde o upload das fotos");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      propertyType: propertyType as any,
      videoStyle: selectedStyle as any,
      specialHighlight: specialHighlight.trim() || undefined,
      photosUrls: uploadedPhotos.map((p) => p.url!),
    });
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <PluuuLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Criar Novo Vídeo</h1>
          <p className="text-muted-foreground text-sm">
            Siga os passos para gerar seu vídeo imobiliário com IA
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    i < STEPS.length - 1 ? "flex-1" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                      currentStep > step.id
                        ? "bg-primary text-white"
                        : currentStep === step.id
                        ? "bg-primary text-white ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn(
                      "text-xs font-medium",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-px mx-3 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Step content */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <PhotoUploadStep photos={photos} setPhotos={setPhotos} />
              )}
              {currentStep === 2 && (
                <StyleStep selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />
              )}
              {currentStep === 3 && (
                <DetailsStep
                  title={title}
                  setTitle={setTitle}
                  propertyType={propertyType}
                  setPropertyType={setPropertyType}
                  specialHighlight={specialHighlight}
                  setSpecialHighlight={setSpecialHighlight}
                />
              )}
              {currentStep === 4 && (
                <ConfirmStep
                  photos={photos}
                  selectedStyle={selectedStyle}
                  title={title}
                  propertyType={propertyType}
                  specialHighlight={specialHighlight}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="h-11 px-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-primary text-white hover:bg-primary/90 h-11 px-6"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !canProceed()}
              className="bg-primary text-white hover:bg-primary/90 h-11 px-8"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 mr-2" />
                  Criar Vídeo
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </PluuuLayout>
  );
}

// Helper
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
