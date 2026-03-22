import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageCircle,
  Percent,
  DollarSign,
  Link,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link as WouterLink } from "wouter";
import { toast } from "sonner";

const TOTAL_SHARES = 1_000_000;

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatCurrencyFromReais(reais: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(reais);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "365d" | "all">("30d");

  const { data: stats, isLoading: statsLoading } = trpc.user.stats.useQuery();
  const { data: earnings, isLoading: earningsLoading } = trpc.earnings.myEarnings.useQuery({ period });
  const { data: withdrawals } = trpc.withdrawals.myWithdrawals.useQuery();
  const { data: purchases } = trpc.shares.myPurchases.useQuery();

  const sharesPercentage = useMemo(() => {
    if (!stats?.totalShares) return 0;
    return (stats.totalShares / TOTAL_SHARES) * 100;
  }, [stats?.totalShares]);

  const chartData = useMemo(() => {
    if (!earnings) return [];
    return earnings.map((e) => ({
      date: new Date(e.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      ganho: Number(e.amount),
      ganhoFormatted: formatCurrencyFromReais(Number(e.amount)),
    })).reverse();
  }, [earnings]);

  const totalEarningsPeriod = useMemo(() => {
    return earnings?.reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  }, [earnings]);

  const recentTransactions = useMemo(() => {
    const earningTx = (earnings ?? []).slice(0, 5).map((e) => ({
      type: "earning" as const,
      amount: Number(e.amount),
      date: new Date(e.date),
      description: `Lucros do dia ${new Date(e.date).toLocaleDateString("pt-BR")}`,
    }));
    const withdrawalTx = (withdrawals ?? []).slice(0, 5).map((w) => ({
      type: "withdrawal" as const,
      amount: -Number(w.amount),
      date: new Date(w.createdAt),
      description: `Saque via PIX (${w.status === "completed" ? "Concluído" : w.status === "pending" ? "Pendente" : "Processando"})`,
      status: w.status,
    }));
    return [...earningTx, ...withdrawalTx]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }, [earnings, withdrawals]);

  const profileComplete = stats?.profileComplete;
  const hasShares = (stats?.totalShares ?? 0) > 0;
  const joinedWhatsapp = stats?.joinedWhatsapp;

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Welcome + Alerts */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display">
              Olá, {user?.name?.split(" ")[0] || "Acionista"}! 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Acompanhe seus ganhos e participação na Gluuu
            </p>
          </div>
          <WouterLink href="/comprar-cotas">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Comprar Cotas
            </Button>
          </WouterLink>
        </div>

        {/* Alerts */}
        {!profileComplete && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-300">Complete seu perfil</p>
              <p className="text-xs text-muted-foreground mt-1">
                Preencha seus dados (CPF, telefone, chave PIX) para poder comprar cotas e receber saques.
              </p>
            </div>
            <WouterLink href="/perfil">
              <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 flex-shrink-0">
                Completar
              </Button>
            </WouterLink>
          </div>
        )}

        {!joinedWhatsapp && hasShares && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-300">Entre na Comunidade WhatsApp!</p>
              <p className="text-xs text-muted-foreground mt-1">
                <strong className="text-foreground">Compromisso do Acionista:</strong> Sempre que for comprar no Shopee ou Mercado Livre,
                use os links da Gluuu disponíveis no grupo. Sem isso, não há comissão e ninguém ganha.
              </p>
            </div>
            <a href="https://chat.whatsapp.com/gluuu" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0">
                Entrar
              </Button>
            </a>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Saldo Disponível</span>
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-display text-primary">
              {statsLoading ? "..." : formatCurrency(stats?.availableBalance ?? 0)}
            </div>
            <WouterLink href="/perfil">
              <p className="text-xs text-muted-foreground mt-1 hover:text-primary cursor-pointer transition-colors">
                Solicitar saque →
              </p>
            </WouterLink>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Total Ganho</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold font-display text-foreground">
              {statsLoading ? "..." : formatCurrency(stats?.totalEarned ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Desde o início</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Minhas Cotas</span>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-display text-foreground">
              {statsLoading ? "..." : (stats?.totalShares ?? 0).toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sharesPercentage.toFixed(4)}% do total
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Ganhos ({period})</span>
              <DollarSign className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold font-display text-foreground">
              {earningsLoading ? "..." : formatCurrencyFromReais(totalEarningsPeriod)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </div>
        </div>

        {/* Shares Progress */}
        {hasShares && (
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold font-display">Participação na Gluuu</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {(stats?.totalShares ?? 0).toLocaleString("pt-BR")} de {TOTAL_SHARES.toLocaleString("pt-BR")} cotas
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-display text-primary">
                  {sharesPercentage.toFixed(4)}%
                </div>
                <p className="text-xs text-muted-foreground">do total</p>
              </div>
            </div>
            <Progress
              value={Math.min(sharesPercentage * 100, 100)}
              className="h-3 bg-secondary"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>0%</span>
              <span>100% (1.000.000 cotas)</span>
            </div>
          </div>
        )}

        {/* Earnings Chart */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-semibold font-display">Histórico de Ganhos</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Total no período: <span className="text-primary font-medium">{formatCurrencyFromReais(totalEarningsPeriod)}</span>
              </p>
            </div>
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger className="w-36 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="365d">1 ano</SelectItem>
                <SelectItem value="all">Tudo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {earningsLoading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Carregando...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <BarChart3 className="w-10 h-10 opacity-30" />
              <p className="text-sm">Nenhum ganho registrado ainda</p>
              <p className="text-xs">Os ganhos aparecem após o admin lançar as comissões diárias</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGanho" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.2 155)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.2 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 240)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "oklch(0.60 0.01 240)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "oklch(0.60 0.01 240)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.14 0.01 240)",
                    border: "1px solid oklch(0.22 0.01 240)",
                    borderRadius: "8px",
                    color: "oklch(0.97 0.005 240)",
                  }}
                  formatter={(value: number) => [formatCurrencyFromReais(value), "Ganho"]}
                />
                <Area
                  type="monotone"
                  dataKey="ganho"
                  stroke="oklch(0.65 0.2 155)"
                  strokeWidth={2}
                  fill="url(#colorGanho)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h3 className="font-semibold font-display mb-4">Extrato Recente</h3>
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Nenhuma transação ainda
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === "earning" ? "bg-green-500/10" : "bg-red-500/10"
                    }`}>
                      {tx.type === "earning" ? (
                        <ArrowDownRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.date.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold font-display ${
                    tx.type === "earning" ? "text-green-400" : "text-red-400"
                  }`}>
                    {tx.type === "earning" ? "+" : ""}
                    {formatCurrencyFromReais(Math.abs(tx.amount))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {!hasShares && profileComplete && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4 opacity-60" />
            <h3 className="font-semibold font-display mb-2">Comece a Ganhar Hoje!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você ainda não tem cotas. Compre sua primeira cota por R$ 9,90 e comece a receber lucros diários.
            </p>
            <WouterLink href="/comprar-cotas">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Comprar Minha Primeira Cota
              </Button>
            </WouterLink>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
