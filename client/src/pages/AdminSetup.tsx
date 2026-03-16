import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Heart, Settings } from "lucide-react";
import { Link } from "wouter";

const REQUIRED_ENVS = [
  { key: "ELEVENLABS_API_KEY", label: "ElevenLabs API Key", description: "Para clonagem de voz e TTS", docs: "https://elevenlabs.io" },
  { key: "DID_API_KEY", label: "D-ID API Key", description: "Para geração de lipsync", docs: "https://www.d-id.com" },
  { key: "WOOVI_API_KEY", label: "Woovi API Key", description: "Para pagamentos via Pix recorrente", docs: "https://woovi.com" },
];

export default function AdminSetup() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="text-foreground font-medium">Acesso negado</p>
          <Link href="/"><Button variant="outline" className="mt-4">Voltar ao início</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-2xl mx-auto py-12">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-primary fill-primary/20" />
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            Memórias <span className="text-primary">VIVA</span> — Setup
          </h1>
          <Badge variant="secondary">Admin</Badge>
        </div>

        <Card className="border-border mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Chaves de API Necessárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {REQUIRED_ENVS.map((env) => (
              <div key={env.key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{env.key}</code>
                  </div>
                  <p className="text-sm text-foreground">{env.label}</p>
                  <p className="text-xs text-muted-foreground">{env.description}</p>
                  <a href={env.docs} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    Documentação →
                  </a>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Como configurar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Acesse o painel de administração do Manus</p>
            <p>2. Vá em <strong>Settings → Secrets</strong></p>
            <p>3. Adicione cada chave listada acima</p>
            <p>4. Reinicie o servidor para aplicar as mudanças</p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
              <strong>Nota:</strong> Sem as chaves configuradas, a plataforma funciona em modo demonstração com dados simulados.
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-3">
          <Link href="/dashboard">
            <Button>Ir para o dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Página inicial</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
