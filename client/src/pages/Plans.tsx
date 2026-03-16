import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const PLAN_FEATURES = {
  semente: ["3 vídeos por mês", "Duração máx. 30 segundos", "1 clone de voz", "HD 720p", "Armazenamento 30 dias", "Pix recorrente"],
  memoria: ["10 vídeos por mês", "Duração máx. 45 segundos", "2 clones de voz", "Full HD 1080p", "Armazenamento 90 dias", "Pix recorrente"],
  presenca: ["30 vídeos por mês", "Duração máx. 60 segundos", "5 clones de voz", "Full HD 1080p", "Armazenamento permanente", "Pix recorrente"],
};

export default function Plans() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { data: plans, isLoading: plansLoading } = trpc.plans.list.useQuery();
  const { data: subscription } = trpc.subscription.current.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const checkoutMutation = trpc.subscription.createCheckout.useMutation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/api/oauth/callback";
    }
  }, [loading, isAuthenticated]);

  const handleSelectPlan = async (slug: string) => {
    try {
      const result = await checkoutMutation.mutateAsync({ planSlug: slug });
      navigate(`/checkout/${slug}?subId=${result.subscriptionId}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao iniciar checkout");
    }
  };

  if (loading || plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm px-4 py-4">
        <div className="container max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/20" />
            <span className="font-semibold text-foreground">
              Memórias <span className="text-primary">VIVA</span>
            </span>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-xs">
            Pix recorrente — sem cartão de crédito
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-4">
            Escolha seu plano
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Acesso completo imediatamente após o pagamento confirmado. Sem período de teste.
          </p>
        </div>

        {subscription?.status === "active" && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-sm text-emerald-700 font-medium">
              Você já possui uma assinatura ativa:{" "}
              <strong>{(subscription as any).plan?.name}</strong>
            </p>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="mt-2">
                Ir para o dashboard
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => {
            const features = PLAN_FEATURES[plan.slug as keyof typeof PLAN_FEATURES] ?? [];
            const isHighlight = plan.slug === "memoria";

            return (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl border-2 p-6 flex flex-col transition-all duration-300 hover:shadow-lg ${
                  isHighlight
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border hover:-translate-y-1"
                }`}
              >
                {isHighlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-medium">
                      Mais popular
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-bold text-foreground">
                      R$ {Number(plan.priceBrl).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isHighlight ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleSelectPlan(plan.slug)}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Assinar com Pix"
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Cancele quando quiser. Acesso mantido até o fim do período pago. Sem reembolso proporcional.
        </p>
      </div>
    </div>
  );
}
