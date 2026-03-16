import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

export default function PrivacyPage() {
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
        <h1>Política de Privacidade</h1>
        <p><em>Última atualização: março de 2025</em></p>
        <p>Esta Política descreve como o <strong>Memórias VIVA</strong> coleta, usa e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
        <h2>1. Dados Coletados</h2>
        <ul>
          <li><strong>Dados de cadastro:</strong> nome, e-mail, método de login;</li>
          <li><strong>Dados biométricos:</strong> voz e imagem enviadas para clonagem (tratados como dados sensíveis);</li>
          <li><strong>Dados de uso:</strong> endereço IP, user-agent, histórico de ações, timestamps;</li>
          <li><strong>Dados de pagamento:</strong> informações de transação Pix (não armazenamos dados de cartão).</li>
        </ul>
        <h2>2. Finalidade do Tratamento</h2>
        <ul>
          <li>Prestação do serviço de geração de vídeos;</li>
          <li>Cumprimento de obrigações legais;</li>
          <li>Prevenção de fraudes e uso indevido;</li>
          <li>Melhoria contínua do serviço.</li>
        </ul>
        <h2>3. Compartilhamento de Dados</h2>
        <p>Seus dados podem ser compartilhados com:</p>
        <ul>
          <li><strong>ElevenLabs:</strong> para processamento de clonagem de voz;</li>
          <li><strong>D-ID:</strong> para geração de lipsync;</li>
          <li><strong>Woovi:</strong> para processamento de pagamentos;</li>
          <li><strong>Autoridades competentes:</strong> mediante ordem judicial.</li>
        </ul>
        <h2>4. Retenção de Dados</h2>
        <p>Os dados são retidos conforme o plano contratado. Após o cancelamento, os dados são mantidos por 90 dias para fins legais e depois excluídos permanentemente.</p>
        <h2>5. Seus Direitos (LGPD)</h2>
        <ul>
          <li>Acesso, correção e portabilidade dos seus dados;</li>
          <li>Exclusão dos dados (exceto quando necessário por obrigação legal);</li>
          <li>Revogação do consentimento;</li>
          <li>Oposição ao tratamento.</li>
        </ul>
        <p>Para exercer seus direitos: <a href="mailto:privacidade@memoriasviva.com.br">privacidade@memoriasviva.com.br</a></p>
        <h2>6. Segurança</h2>
        <p>Utilizamos criptografia em trânsito (TLS) e em repouso, controle de acesso baseado em funções e logs de auditoria completos.</p>
        <h2>7. Encarregado (DPO)</h2>
        <p>Contato: <a href="mailto:dpo@memoriasviva.com.br">dpo@memoriasviva.com.br</a></p>
      </div>
    </div>
  );
}
