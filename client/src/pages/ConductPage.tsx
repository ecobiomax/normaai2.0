import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

export default function ConductPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-4 py-4">
        <div className="container max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/"><Button variant="ghost" size="icon" className="w-8 h-8"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/20" />
            <span className="font-semibold text-foreground">Memórias <span className="text-primary">VIVA</span></span>
          </div>
        </div>
      </div>
      <div className="container max-w-3xl mx-auto py-12 px-4 prose prose-sm max-w-none">
        <h1>Política de Uso Aceitável</h1>
        <p><em>Última atualização: março de 2025</em></p>
        <p>Esta política define o que é e o que não é permitido ao usar o <strong>Memórias VIVA</strong>.</p>
        <h2>Usos Permitidos</h2>
        <ul>
          <li>Criar vídeos de memória com voz e imagem de entes queridos falecidos (com autorização familiar);</li>
          <li>Criar vídeos com sua própria voz e imagem;</li>
          <li>Criar vídeos com autorização expressa da pessoa retratada;</li>
          <li>Uso pessoal e privado dos vídeos gerados.</li>
        </ul>
        <h2>Usos Proibidos</h2>
        <ul>
          <li>Clonagem não autorizada de voz ou imagem de terceiros;</li>
          <li>Criação de deepfakes para fins fraudulentos;</li>
          <li>Conteúdo difamatório, ofensivo ou que viole direitos de terceiros;</li>
          <li>Uso comercial sem autorização prévia;</li>
          <li>Conteúdo que viole leis brasileiras ou internacionais;</li>
          <li>Assédio, intimidação ou chantagem;</li>
          <li>Conteúdo que envolva menores de idade.</li>
        </ul>
        <h2>Consequências de Violação</h2>
        <p>Violações desta política resultam em:</p>
        <ul>
          <li>Suspensão imediata da conta sem reembolso;</li>
          <li>Reporte às autoridades competentes;</li>
          <li>Ação civil e/ou criminal conforme a gravidade.</li>
        </ul>
        <h2>Denúncias</h2>
        <p>Para reportar uso indevido: <a href="mailto:denuncia@memoriasviva.com.br">denuncia@memoriasviva.com.br</a></p>
        <p>Respondemos a todas as denúncias em até 48 horas úteis.</p>
      </div>
    </div>
  );
}
