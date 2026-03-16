import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

export default function TermsPage() {
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
        <h1>Termos de Uso</h1>
        <p><em>Última atualização: março de 2025</em></p>
        <p>Ao usar o <strong>Memórias VIVA</strong>, você concorda integralmente com estes Termos de Uso. Leia com atenção antes de prosseguir.</p>
        <h2>1. Descrição do Serviço</h2>
        <p>O Memórias VIVA é uma plataforma SaaS que permite a criação de vídeos personalizados com clonagem de voz e sincronização labial (lipsync), destinados exclusivamente a uso pessoal e memorialístico.</p>
        <h2>2. Elegibilidade</h2>
        <p>O uso da plataforma é restrito a maiores de 18 anos. Ao se cadastrar, você declara ter capacidade legal para celebrar contratos.</p>
        <h2>3. Uso Autorizado</h2>
        <p>Você pode usar a plataforma para criar vídeos com voz e imagem de:</p>
        <ul>
          <li>Você mesmo;</li>
          <li>Familiares falecidos de quem você é herdeiro legal direto;</li>
          <li>Terceiros que forneceram autorização expressa e documentada.</li>
        </ul>
        <h2>4. Usos Proibidos</h2>
        <p>É expressamente proibido:</p>
        <ul>
          <li>Clonar voz ou imagem de terceiros sem autorização;</li>
          <li>Criar conteúdo falso, enganoso, difamatório ou fraudulento;</li>
          <li>Usar os vídeos para fins políticos, comerciais ou publicitários sem autorização;</li>
          <li>Compartilhar vídeos de terceiros sem consentimento;</li>
          <li>Usar a plataforma para assédio, chantagem ou intimidação.</li>
        </ul>
        <h2>5. Responsabilidade do Usuário</h2>
        <p>O usuário é integralmente responsável pelo conteúdo que cria e compartilha. O Memórias VIVA não se responsabiliza por uso indevido da plataforma.</p>
        <h2>6. Assinatura e Pagamento</h2>
        <p>A assinatura é cobrada mensalmente via Pix recorrente. Não há período de teste gratuito. O cancelamento pode ser feito a qualquer momento, com acesso mantido até o fim do período pago. Não há reembolso proporcional.</p>
        <h2>7. Propriedade Intelectual</h2>
        <p>Os vídeos gerados são de propriedade do usuário. O Memórias VIVA retém o direito de usar dados anonimizados para melhoria do serviço.</p>
        <h2>8. Cooperação com Autoridades</h2>
        <p>O Memórias VIVA coopera plenamente com investigações do Ministério Público, Polícia Federal e Polícia Civil, fornecendo todos os dados solicitados mediante ordem judicial.</p>
        <h2>9. Rescisão</h2>
        <p>O Memórias VIVA reserva-se o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio e sem direito a reembolso.</p>
        <h2>10. Foro</h2>
        <p>Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>
        <h2>11. Contato</h2>
        <p>Dúvidas: <a href="mailto:juridico@memoriasviva.com.br">juridico@memoriasviva.com.br</a></p>
      </div>
    </div>
  );
}
