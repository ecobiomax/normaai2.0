import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, CheckCircle2, XCircle, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const PLAN_FEATURES: Record<string, string[]> = {
  semente: ["3 vídeos/mês", "Duração máx. 30s", "1 clone de voz", "HD 720p", "Armazenamento 30 dias"],
  memoria: ["10 vídeos/mês", "Duração máx. 45s", "2 clones de voz", "Full HD 1080p", "Armazenamento 90 dias"],
  presenca: ["30 vídeos/mês", "Duração máx. 60s", "5 clones de voz", "Full HD 1080p", "Armazenamento permanente"],
};

export default function Subscription() {
  const { isAuthenticated, loading } = useAuth();
  const { data: subscription, refetch } = trpc.subscription.current.useQuery(undefined, { enabled: isAuthenticated });
  const { data: history } = trpc.subscription.history.useQuery(undefined, { enabled: isAuthenticated });
  const cancelMutation = trpc.subscription.cancel.useMutation();

  useEffect(() => {
    if (!loading && !isAuthenticated) window.location.href = getLoginUrl();
  }, [loading, isAuthenticated]);

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? O acesso será mantido até o fim do período pago.")) return;
    try {
      await cancelMutation.mutateAsync();
      await refetch();
      toast.success("Assinatura cancelada. Seu acesso continua até o fim do período pago.");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao cancelar assinatura");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const plan = (subscription as any)?.plan;
  const features = plan ? PLAN_FEATURES[plan.slug] ?? [] : [];

  return (
    <AppLayout title="Minha Assinatura">
      {!subscription ? (
        <div className="text-center py-16">
          <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-base font-medium text-foreground mb-2">Sem assinatura ativa</h3>
          <p className="text-sm text-muted-foreground mb-6">Escolha um plano para começar a criar suas memórias</p>
          <Link href="/planos">
            <Button>Ver planos disponíveis</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current plan */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Plano atual</CardTitle>
                <Badge variant={subscription.status === "active" ? "default" : subscription.status === "cancelled" ? "destructive" : "secondary"}>
                  {subscription.status === "active" ? "Ativo" : subscription.status === "cancelled" ? "Cancelado" : "Pendente"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{plan?.name}</span>
                <span className="text-muted-foreground">
                  R$ {Number(plan?.priceBrl ?? 0).toFixed(2).replace(".", ",")}/mês
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Créditos restantes</p>
                  <p className="font-semibold text-foreground text-lg">{subscription.creditsRemaining}</p>
                </div>
                {subscription.currentPeriodEnd && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {subscription.status === "cancelled" ? "Acesso até" : "Próxima renovação"}
                    </p>
                    <p className="font-medium text-foreground">
                      {format(new Date(subscription.currentPeriodEnd), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              {subscription.status === "active" && (
                <div className="flex gap-3 pt-2">
                  <Link href="/planos">
                    <Button variant="outline" size="sm">Mudar plano</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancelar assinatura"}
                  </Button>
                </div>
              )}

              {subscription.status === "cancelled" && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Sua assinatura foi cancelada. Você ainda tem acesso até{" "}
                    {subscription.currentPeriodEnd
                      ? format(new Date(subscription.currentPeriodEnd), "dd/MM/yyyy", { locale: ptBR })
                      : "o fim do período pago"}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing history */}
          {history && history.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Histórico de pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((record) => (
                    <div key={record.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${record.status === "paid" ? "bg-emerald-100" : "bg-muted"}`}>
                          {record.status === "paid" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            R$ {Number(record.amountBrl).toFixed(2).replace(".", ",")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(record.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={record.status === "paid" ? "default" : record.status === "failed" ? "destructive" : "secondary"} className="text-xs">
                        {record.status === "paid" ? "Pago" : record.status === "failed" ? "Falhou" : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
}
