import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Clock,
  Smartphone,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface CheckoutProps {
  params: { slug: string };
}

export default function Checkout({ params }: CheckoutProps) {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [pixCopied, setPixCopied] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    subscriptionId: number;
    pixCode: string | null;
    pixQrCode: string | null;
    amount: string | number;
    planName: string;
    demo: boolean;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const checkoutMutation = trpc.subscription.createCheckout.useMutation();
  const { data: subscription, refetch: refetchSub } = trpc.subscription.current.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/api/oauth/callback";
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !checkoutData && !isCreating) {
      setIsCreating(true);
      checkoutMutation
        .mutateAsync({ planSlug: params.slug })
        .then((data) => {
          setCheckoutData(data as any);
          setIsCreating(false);
        })
        .catch((err) => {
          toast.error(err?.message ?? "Erro ao criar cobrança");
          setIsCreating(false);
        });
    }
  }, [isAuthenticated, params.slug]);

  // Polling para verificar pagamento
  useEffect(() => {
    if (!checkoutData) return;
    const interval = setInterval(async () => {
      await refetchSub();
      if (subscription?.status === "active") {
        clearInterval(interval);
        toast.success("Pagamento confirmado! Bem-vindo ao Memórias VIVA!");
        navigate("/dashboard");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [checkoutData, subscription]);

  const copyPixCode = () => {
    if (checkoutData?.pixCode) {
      navigator.clipboard.writeText(checkoutData.pixCode);
      setPixCopied(true);
      toast.success("Código Pix copiado!");
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  if (loading || isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Gerando seu QR Code Pix...</p>
        </div>
      </div>
    );
  }

  if (subscription?.status === "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">
            Pagamento confirmado!
          </h2>
          <p className="text-muted-foreground mb-6">
            Sua assinatura está ativa. Você já pode criar suas memórias.
          </p>
          <Link href="/dashboard">
            <Button size="lg">Ir para o dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm px-4 py-4">
        <div className="container max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/planos">
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

      <div className="container max-w-lg mx-auto py-10 px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 text-xs">
            Pagamento seguro via Pix
          </Badge>
          <h1 className="text-2xl font-serif font-semibold text-foreground mb-2">
            Finalize sua assinatura
          </h1>
          {checkoutData && (
            <p className="text-muted-foreground">
              {checkoutData.planName} —{" "}
              <strong>
                R$ {Number(checkoutData.amount).toFixed(2).replace(".", ",")}
              </strong>
              /mês
            </p>
          )}
        </div>

        {checkoutData && (
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              {checkoutData.demo && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  <strong>Modo demonstração:</strong> Configure a chave WOOVI_API_KEY para ativar o
                  pagamento real via Pix.
                </div>
              )}

              {/* QR Code placeholder */}
              <div className="flex justify-center mb-6">
                <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center border border-border">
                  {checkoutData.pixQrCode ? (
                    <img
                      src={checkoutData.pixQrCode}
                      alt="QR Code Pix"
                      className="w-full h-full rounded-xl"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Smartphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">QR Code Pix</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Disponível com Woovi configurado
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pix code */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Ou copie o código Pix abaixo:
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-xs font-mono text-muted-foreground truncate border border-border">
                    {checkoutData.pixCode?.slice(0, 50)}...
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPixCode}
                    className="shrink-0 gap-1.5"
                  >
                    {pixCopied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {pixCopied ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-medium text-foreground">Como pagar:</p>
                {[
                  "Abra o app do seu banco",
                  "Acesse a área Pix",
                  "Escaneie o QR Code ou cole o código",
                  "Confirme o pagamento",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                      {i + 1}
                    </div>
                    {step}
                  </div>
                ))}
              </div>

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>O QR Code expira em 30 minutos</span>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Após a confirmação do pagamento, você será redirecionado automaticamente para o dashboard.
        </p>
      </div>
    </div>
  );
}
