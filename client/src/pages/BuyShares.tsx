import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Copy,
  CheckCircle,
  Clock,
  Loader2,
  TrendingUp,
  AlertCircle,
  Lock,
  Unlock,
  DollarSign,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link as WouterLink } from "wouter";

const SHARE_PRICE = 9.90;
const TOTAL_SHARES = 1_000_000;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function BuyShares() {
  const [quantity, setQuantity] = useState(1);
  const [chargeData, setChargeData] = useState<{
    purchaseId: number;
    pixCopyPaste: string;
    pixQrCode: string | null;
    totalAmount: number;
    quantity: number;
    expiresAt: string;
    isDev?: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const utils = trpc.useUtils();
  const { data: stats } = trpc.user.stats.useQuery();
  const { data: purchases } = trpc.shares.myPurchases.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  const totalShares = settings?.find(s => s.key === "total_shares");
  const availableShares = TOTAL_SHARES - (purchases?.filter(p => p.status === "paid").reduce((acc, p) => acc + p.quantity, 0) ?? 0);

  const createCharge = trpc.shares.createCharge.useMutation({
    onSuccess: (data) => {
      setChargeData(data as typeof chargeData);
      toast.success("Cobrança PIX gerada! Escaneie o QR Code ou copie o código.");
    },
    onError: (err) => toast.error(err.message),
  });

  const checkUnlock = trpc.shares.checkUnlock.useMutation({
    onSuccess: (data) => {
      if (data.unlocked > 0) {
        toast.success(`${data.unlocked} compra(s) desbloqueada(s) para venda!`);
        utils.shares.myPurchases.invalidate();
      } else {
        toast.info("Nenhuma cota disponível para desbloqueio ainda.");
      }
    },
  });

  const handleCopy = () => {
    if (chargeData?.pixCopyPaste) {
      navigator.clipboard.writeText(chargeData.pixCopyPaste);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleBuy = () => {
    if (!stats?.profileComplete) {
      toast.error("Complete seu perfil antes de comprar cotas.");
      return;
    }
    createCharge.mutate({ quantity });
  };

  const totalAmount = quantity * SHARE_PRICE;
  const newSharesPercentage = ((stats?.totalShares ?? 0) + quantity) / TOTAL_SHARES * 100;

  return (
    <AppLayout title="Comprar Cotas">
      <div className="container py-8 space-y-6 max-w-4xl">
        {!stats?.profileComplete && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-300">Complete seu perfil primeiro</p>
              <p className="text-xs text-muted-foreground mt-1">
                Você precisa preencher seus dados (CPF, telefone, chave PIX) antes de comprar cotas.
              </p>
            </div>
            <WouterLink href="/perfil">
              <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                Completar Perfil
              </Button>
            </WouterLink>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Buy Form */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold font-display">Comprar Cotas</h2>
                <p className="text-xs text-muted-foreground">R$ 9,90 por cota via PIX</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Quantidade de Cotas
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max="10000"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))}
                    className="bg-secondary border-border text-center text-lg font-bold w-28"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border"
                    onClick={() => setQuantity(Math.min(10000, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Quick select */}
              <div className="flex flex-wrap gap-2">
                {[1, 5, 10, 50, 100].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className={`border-border text-xs ${quantity === q ? "border-primary text-primary bg-primary/10" : ""}`}
                    onClick={() => setQuantity(q)}
                  >
                    {q} cota{q > 1 ? "s" : ""}
                  </Button>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade</span>
                  <span className="font-medium">{quantity} cota{quantity > 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço unitário</span>
                  <span className="font-medium">{formatCurrency(SHARE_PRICE)}</span>
                </div>
                <div className="border-t border-border/50 pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Participação após compra</span>
                  <span className="text-primary">{newSharesPercentage.toFixed(4)}%</span>
                </div>
              </div>

              {/* Lock info */}
              <div className="rounded-lg border border-border/30 p-3 flex items-start gap-2">
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  As cotas ficam bloqueadas por <strong className="text-foreground">12 meses</strong> após a compra.
                  Após esse período, você pode oferecer de volta para a Gluuu recomprar.
                </p>
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm h-12 text-base"
                onClick={handleBuy}
                disabled={createCharge.isPending || !stats?.profileComplete}
              >
                {createCharge.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-2" />
                )}
                Gerar PIX - {formatCurrency(totalAmount)}
              </Button>
            </div>
          </div>

          {/* PIX Payment */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            {chargeData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold font-display">PIX Gerado!</h3>
                </div>

                {chargeData.isDev && (
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-xs text-blue-400">
                    Modo desenvolvimento: Configure a API Woovi para pagamentos reais.
                  </div>
                )}

                <div className="rounded-lg bg-secondary/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total a pagar</p>
                  <p className="text-3xl font-bold font-display text-primary">
                    {formatCurrency(chargeData.totalAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chargeData.quantity} cota{chargeData.quantity > 1 ? "s" : ""}
                  </p>
                </div>

                {chargeData.pixQrCode && (
                  <div className="flex justify-center">
                    <img
                      src={chargeData.pixQrCode}
                      alt="QR Code PIX"
                      className="w-48 h-48 rounded-xl border border-border"
                    />
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Código PIX Copia e Cola</p>
                  <div className="flex gap-2">
                    <Input
                      value={chargeData.pixCopyPaste}
                      readOnly
                      className="bg-secondary border-border text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-border flex-shrink-0"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    Expira em: {new Date(chargeData.expiresAt).toLocaleTimeString("pt-BR")}
                  </span>
                </div>

                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
                  Após o pagamento, suas cotas serão creditadas automaticamente em sua conta.
                  O processo pode levar alguns minutos.
                </div>

                <Button
                  variant="outline"
                  className="w-full border-border"
                  onClick={() => setChargeData(null)}
                >
                  Gerar Novo PIX
                </Button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold font-display mb-2">Pagamento via PIX</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione a quantidade de cotas e clique em "Gerar PIX" para receber o código de pagamento.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Purchase History */}
        {purchases && purchases.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold font-display">Minhas Compras</h2>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-xs"
                onClick={() => checkUnlock.mutate()}
                disabled={checkUnlock.isPending}
              >
                <Unlock className="w-3.5 h-3.5 mr-1.5" />
                Verificar Desbloqueios
              </Button>
            </div>
            <div className="space-y-3">
              {purchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      p.status === "paid" ? "bg-green-500/10" :
                      p.status === "pending" ? "bg-yellow-500/10" : "bg-red-500/10"
                    }`}>
                      {p.status === "paid" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : p.status === "pending" ? (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {p.quantity} cota{p.quantity > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                        {p.lockUntil && ` · Bloqueado até ${new Date(p.lockUntil).toLocaleDateString("pt-BR")}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(Number(p.totalAmount))}</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      {p.canSell ? (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                          <Unlock className="w-3 h-3 mr-1" />
                          Disponível
                        </Badge>
                      ) : p.status === "paid" ? (
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Bloqueado
                        </Badge>
                      ) : (
                        <Badge className={`text-xs ${
                          p.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {p.status === "pending" ? "Aguardando" : "Cancelado"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
