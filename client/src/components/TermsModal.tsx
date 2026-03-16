import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";

const CHECKBOXES = [
  "Declaro que possuo autorização legal para usar a voz e imagem que serei enviadas",
  "Estou ciente que o uso indevido pode resultar em processo judicial e prisão",
  "Sei que a plataforma entrega meus dados às autoridades em caso de denúncia",
  "Li e aceito integralmente os Termos de Uso e a Política de Privacidade",
];

interface TermsModalProps {
  onAccepted: () => void;
}

export function TermsModal({ onAccepted }: TermsModalProps) {
  const [checked, setChecked] = useState<boolean[]>(new Array(CHECKBOXES.length).fill(false));
  const acceptMutation = trpc.terms.accept.useMutation();

  const allChecked = checked.every(Boolean);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const handleAccept = async () => {
    if (!allChecked) return;
    try {
      await acceptMutation.mutateAsync({
        ipAddress: undefined,
        userAgent: navigator.userAgent,
      });
      onAccepted();
    } catch {
      toast.error("Erro ao registrar aceite. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-foreground text-base">
              TERMO DE RESPONSABILIDADE E USO ÉTICO — LEITURA OBRIGATÓRIA
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Este pop-up deve ser lido integralmente antes de usar a plataforma
            </p>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-80 px-6 py-4">
          <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="font-medium text-foreground mb-2">
                ATENÇÃO: Leia com atenção antes de usar a plataforma.
              </p>
              <p>
                Ao utilizar o <strong>Memórias VIVA</strong>, você declara expressamente que:
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">
                1. DIREITO DE USO SOBRE VOZ E IMAGEM
              </h3>
              <p className="mb-2">
                Você possui autorização legal para usar a voz e a imagem da pessoa que será
                clonada. Isso inclui:
              </p>
              <ul className="space-y-1 pl-4 text-muted-foreground">
                <li>• Ser familiar direto de pessoa falecida (cônjuge, filho, pai, mãe, irmão); OU</li>
                <li>• Possuir autorização expressa e documentada da pessoa viva retratada; OU</li>
                <li>• Ser a própria pessoa cujas voz e imagem serão clonadas.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">2. PROIBIÇÕES EXPRESSAS</h3>
              <p className="mb-2 text-destructive font-medium">
                É estritamente proibido e constitui crime:
              </p>
              <ul className="space-y-1 pl-4 text-muted-foreground">
                <li>• Clonar voz ou imagem de terceiros sem autorização;</li>
                <li>• Usar os vídeos gerados para enganar, difamar, chantagear ou prejudicar;</li>
                <li>• Usar os vídeos para criar conteúdo falso (deepfake) com finalidade fraudulenta;</li>
                <li>• Usar os vídeos para fins políticos, comerciais ou publicitários sem autorização.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">3. RESPONSABILIDADE LEGAL</h3>
              <p className="mb-2">O uso indevido pode configurar crimes previstos em:</p>
              <ul className="space-y-1 pl-4 text-muted-foreground text-xs">
                <li>
                  • <strong>LGPD — Lei nº 13.709/2018:</strong> uso não autorizado de dados
                  biométricos, multa de até R$ 50 milhões por infração.
                </li>
                <li>
                  • <strong>Código Penal — Art. 307 (Falsa Identidade):</strong> detenção de 3
                  meses a 1 ano.
                </li>
                <li>
                  • <strong>Lei nº 14.155/2021 (Crimes Cibernéticos):</strong> estelionato digital
                  com penas de 4 a 8 anos.
                </li>
                <li>
                  • <strong>Código Civil — Art. 20:</strong> violação do direito de imagem,
                  indenização por danos morais e materiais.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">
                4. COOPERAÇÃO COM AUTORIDADES
              </h3>
              <p>
                O <strong>Memórias VIVA</strong> registra todos os acessos, uploads e atividades.{" "}
                <strong>Em caso de denúncia formal ou ordem judicial</strong>, a plataforma
                entregará integralmente às autoridades todos os dados do usuário, incluindo dados
                cadastrais, endereço IP, arquivos enviados e histórico completo de uso.
              </p>
              <p className="mt-2 font-medium text-foreground">
                A plataforma não garante anonimato e coopera plenamente com investigações do
                Ministério Público, Polícia Federal e Polícia Civil.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Checkboxes */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 space-y-3">
          {CHECKBOXES.map((label, i) => (
            <label
              key={i}
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => toggle(i)}
            >
              <Checkbox
                checked={checked[i]}
                onCheckedChange={() => toggle(i)}
                className="mt-0.5 shrink-0"
              />
              <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                {label}
              </span>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>Seu aceite é registrado com IP e data/hora</span>
          </div>
          <Button
            onClick={handleAccept}
            disabled={!allChecked || acceptMutation.isPending}
            className="gap-2 min-w-[180px]"
          >
            {acceptMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              "✓ Aceitar e continuar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
