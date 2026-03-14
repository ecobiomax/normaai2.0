import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PLANS } from "../../../shared/plans";
import {
  Check,
  CreditCard,
  Clock,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Star,
  Loader2,
  Film,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── QR Code Dialog ───────────────────────────────────────────────────────────
function QRCodeDialog({
  open,
  onClose,
  qrCode,
  qrCodeText,
  planName,
  price,
}: {
  open: boolean;
  onClose: () => void;
  qrCode: string;
  qrCodeText: string;
  planName: string;
  price: number;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(qrCodeText);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-lg">💚</span>
            </div>
            Pagar com Pix
          </DialogTitle>
          <DialogDescription>
            Plano {planName} — R$ {price}/mês
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
              {qrCode ? (
                <img src={qrCode} alt="QR Code Pix" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Copy code */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Ou use o código Pix copia e cola:
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground truncate">
                {qrCodeText || "Gerando código..."}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyCode}
                className="flex-shrink-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
            <p className="font-medium mb-1">⏱ Aguardando confirmação</p>
            <p>Após o pagamento, sua assinatura será ativada automaticamente em até 1 minuto.</p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Fechar (verificar depois)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  isCurrentPlan,
  onSelect,
  loading,
}: {
  plan: (typeof PLANS)[keyof typeof PLANS];
  isCurrentPlan: boolean;
  onSelect: () => void;
  loading: boolean;
}) {
  const highlighted = "highlighted" in plan && plan.highlighted;

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border p-6 flex flex-col",
        highlighted
          ? "border-primary shadow-xl shadow-primary/10 bg-primary text-white"
          : "border-border bg-card",
        isCurrentPlan && !highlighted && "border-green-500 bg-green-50"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-[oklch(0.85_0.15_75)] text-[oklch(0.20_0.05_75)] border-0 shadow-md">
            <Star className="w-3 h-3 mr-1" />
            Mais popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-600 text-white border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Plano atual
          </Badge>
        </div>
      )}

      <div className="mb-4">
        <h3 className={cn("text-lg font-bold mb-1", highlighted ? "text-white" : "text-foreground")}>
          {plan.name}
        </h3>
        <p className={cn("text-sm", highlighted ? "text-white/70" : "text-muted-foreground")}>
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className={cn("text-sm", highlighted ? "text-white/70" : "text-muted-foreground")}>R$</span>
          <span className={cn("text-3xl font-bold", highlighted ? "text-white" : "text-foreground")}>
            {plan.price}
          </span>
          <span className={cn("text-sm", highlighted ? "text-white/70" : "text-muted-foreground")}>/mês</span>
        </div>
        <p className={cn("text-sm mt-1 font-medium", highlighted ? "text-white/80" : "text-primary")}>
          {plan.videosPerMonth} vídeos/mês
        </p>
      </div>

      <ul className="space-y-2 flex-1 mb-6">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className={cn("w-4 h-4 flex-shrink-0", highlighted ? "text-white" : "text-primary")} />
            <span className={highlighted ? "text-white/85" : "text-foreground"}>{f}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        disabled={loading || isCurrentPlan}
        className={cn(
          "w-full h-10 font-semibold",
          highlighted
            ? "bg-white text-primary hover:bg-white/90"
            : isCurrentPlan
            ? "bg-green-100 text-green-700 cursor-default"
            : "bg-primary text-white hover:bg-primary/90"
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isCurrentPlan ? (
          "Plano ativo"
        ) : (
          `Assinar ${plan.name}`
        )}
      </Button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Subscription() {
  const [qrDialog, setQrDialog] = useState<{
    open: boolean;
    qrCode: string;
    qrCodeText: string;
    planName: string;
    price: number;
  }>({ open: false, qrCode: "", qrCodeText: "", planName: "", price: 0 });

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: subscription, isLoading: subLoading } = trpc.subscription.get.useQuery();
  const { data: payments, isLoading: paymentsLoading } = trpc.subscription.getPayments.useQuery();

  const createChargeMutation = trpc.subscription.createCharge.useMutation({
    onSuccess: (data, variables) => {
      const plan = PLANS[variables.plan];
      setQrDialog({
        open: true,
        qrCode: data.qrCode || "",
        qrCodeText: data.qrCodeText || "",
        planName: plan.name,
        price: plan.price,
      });
      setLoadingPlan(null);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao gerar cobrança");
      setLoadingPlan(null);
    },
  });

  const cancelMutation = trpc.subscription.cancel.useMutation({
    onSuccess: () => {
      toast.success("Assinatura cancelada");
      utils.subscription.get.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSelectPlan = (planId: string) => {
    setLoadingPlan(planId);
    createChargeMutation.mutate({ plan: planId as any });
  };

  const planList = Object.values(PLANS);
  const videosUsed = subscription?.videosUsed || 0;
  const videosLimit = subscription?.videosLimit || 0;
  const progressPct = videosLimit === -1 ? 0 : Math.min(100, (videosUsed / videosLimit) * 100);

  return (
    <PluuuLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assinatura</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seu plano e histórico de pagamentos
          </p>
        </div>

        {/* Current subscription status */}
        {subLoading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : subscription ? (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-foreground">
                    Plano {PLANS[subscription.plan as keyof typeof PLANS]?.name}
                  </h2>
                  <Badge
                    className={cn(
                      "text-xs",
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : subscription.status === "cancelled"
                        ? "bg-gray-100 text-gray-600 border-gray-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    )}
                  >
                    {subscription.status === "active" ? "Ativo" : subscription.status === "cancelled" ? "Cancelado" : "Vencido"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription.status === "active" ? (
                    <>
                      Renova {formatDistanceToNow(new Date(subscription.currentPeriodEnd), { locale: ptBR, addSuffix: true })}
                      {" "}({format(new Date(subscription.currentPeriodEnd), "dd/MM/yyyy")})
                    </>
                  ) : (
                    <>Venceu em {format(new Date(subscription.currentPeriodEnd), "dd/MM/yyyy")}</>
                  )}
                </p>
              </div>

              {subscription.status === "active" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      Cancelar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você perderá acesso aos créditos restantes ao final do período atual.
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground"
                        onClick={() => cancelMutation.mutate()}
                      >
                        Confirmar cancelamento
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Credits usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vídeos usados este mês</span>
                <span className="font-medium text-foreground">
                  {videosUsed} / {videosLimit === -1 ? "∞" : videosLimit}
                </span>
              </div>
              <Progress value={progressPct} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {videosLimit === -1
                  ? "Vídeos ilimitados"
                  : `${Math.max(0, videosLimit - videosUsed)} vídeos restantes neste mês`}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Sem assinatura ativa</h3>
            <p className="text-sm text-muted-foreground">
              Escolha um plano abaixo para começar a criar vídeos
            </p>
          </div>
        )}

        {/* Plans */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {subscription ? "Alterar plano" : "Escolher plano"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planList.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={subscription?.plan === plan.id && subscription?.status === "active"}
                onSelect={() => handleSelectPlan(plan.id)}
                loading={loadingPlan === plan.id}
              />
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Pagamento via Pix recorrente • Cancele quando quiser • Sem fidelidade
          </p>
        </div>

        {/* Payment history */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Histórico de pagamentos</h2>
          {paymentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhum pagamento registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    payment.status === "confirmed" ? "bg-green-100" : payment.status === "failed" ? "bg-red-100" : "bg-yellow-100"
                  )}>
                    {payment.status === "confirmed" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : payment.status === "failed" ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">
                      Plano {PLANS[payment.plan as keyof typeof PLANS]?.name || payment.plan}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">R$ {payment.amount}</p>
                    <Badge
                      className={cn(
                        "text-xs",
                        payment.status === "confirmed" ? "bg-green-100 text-green-800 border-green-200" :
                        payment.status === "failed" ? "bg-red-100 text-red-800 border-red-200" :
                        "bg-yellow-100 text-yellow-800 border-yellow-200"
                      )}
                    >
                      {payment.status === "confirmed" ? "Confirmado" : payment.status === "failed" ? "Falhou" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Dialog */}
      <QRCodeDialog
        open={qrDialog.open}
        onClose={() => setQrDialog((d) => ({ ...d, open: false }))}
        qrCode={qrDialog.qrCode}
        qrCodeText={qrDialog.qrCodeText}
        planName={qrDialog.planName}
        price={qrDialog.price}
      />
    </PluuuLayout>
  );
}
