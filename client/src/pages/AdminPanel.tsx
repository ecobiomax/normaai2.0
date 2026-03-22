import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  BarChart3,
  Link,
  Settings,
  Plus,
  AlertCircle,
  ShoppingBag,
  Store,
  Clock,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect non-admins
  if (user && user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();
  const { data: dailyEarnings } = trpc.admin.dailyEarnings.useQuery({ limit: 30 });
  const { data: pendingWithdrawals } = trpc.admin.pendingWithdrawals.useQuery();
  const { data: allUsers } = trpc.admin.users.useQuery({ page: 1, limit: 20 });
  const { data: affiliateLinks } = trpc.affiliateLinks.list.useQuery();

  // Launch earnings form
  const [earningDate, setEarningDate] = useState(new Date().toISOString().split("T")[0]);
  const [earningAmount, setEarningAmount] = useState("");
  const [earningNotes, setEarningNotes] = useState("");

  // New link form
  const [newLinkPlatform, setNewLinkPlatform] = useState<"shopee" | "mercadolivre">("shopee");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkDesc, setNewLinkDesc] = useState("");

  const launchEarning = trpc.admin.launchDailyEarning.useMutation({
    onSuccess: () => {
      toast.success("Ganhos lançados e distribuídos com sucesso!");
      setEarningAmount("");
      setEarningNotes("");
      utils.admin.stats.invalidate();
      utils.admin.dailyEarnings.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const processWithdrawal = trpc.admin.processWithdrawal.useMutation({
    onSuccess: (_, vars) => {
      toast.success(vars.action === "approve" ? "Saque aprovado!" : "Saque rejeitado.");
      utils.admin.pendingWithdrawals.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createLink = trpc.admin.createLink.useMutation({
    onSuccess: () => {
      toast.success("Link criado com sucesso!");
      setNewLinkUrl("");
      setNewLinkTitle("");
      setNewLinkDesc("");
      utils.affiliateLinks.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleLink = trpc.admin.updateLink.useMutation({
    onSuccess: () => utils.affiliateLinks.list.invalidate(),
  });

  const chartData = useMemo(() => {
    if (!dailyEarnings) return [];
    return dailyEarnings
      .slice(0, 14)
      .reverse()
      .map((e) => ({
        date: new Date(e.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        total: Number(e.totalCommission),
        distribuido: Number(e.distributedAmount),
      }));
  }, [dailyEarnings]);

  const handleLaunchEarning = () => {
    if (!earningAmount || parseFloat(earningAmount) <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    launchEarning.mutate({
      date: earningDate,
      totalCommission: parseFloat(earningAmount),
      notes: earningNotes || undefined,
    });
  };

  return (
    <AppLayout title="Painel Administrativo">
      <div className="container py-8 space-y-6">
        {/* Admin badge */}
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">Acesso restrito — Administrador</span>
          <Badge className="bg-primary/20 text-primary border-primary/30">Admin</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total de Usuários",
              value: statsLoading ? "..." : (stats?.totalUsers ?? 0).toLocaleString("pt-BR"),
              icon: Users,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              label: "Cotas Vendidas",
              value: statsLoading ? "..." : (stats?.totalSharesSold ?? 0).toLocaleString("pt-BR"),
              icon: BarChart3,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Total Distribuído",
              value: statsLoading ? "..." : formatCurrency(stats?.totalDistributed ?? 0),
              icon: TrendingUp,
              color: "text-green-400",
              bg: "bg-green-400/10",
            },
            {
              label: "Saques Realizados",
              value: statsLoading ? "..." : formatCurrency(stats?.totalWithdrawn ?? 0),
              icon: ArrowUpRight,
              color: "text-yellow-400",
              bg: "bg-yellow-400/10",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/50 bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold font-display">{s.value}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="earnings">
          <TabsList className="bg-secondary border-border w-full sm:w-auto">
            <TabsTrigger value="earnings" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Ganhos
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Saques
              {(pendingWithdrawals?.length ?? 0) > 0 && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs ml-1">
                  {pendingWithdrawals?.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <Link className="w-4 h-4" />
              Links
            </TabsTrigger>
          </TabsList>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6 mt-6">
            {/* Launch form */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Lançar Ganhos do Dia
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={earningDate}
                    onChange={(e) => setEarningDate(e.target.value)}
                    className="bg-secondary border-border mt-1"
                  />
                </div>
                <div>
                  <Label>Total de Comissões (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={earningAmount}
                    onChange={(e) => setEarningAmount(e.target.value)}
                    className="bg-secondary border-border mt-1"
                  />
                </div>
                <div>
                  <Label>Observações (opcional)</Label>
                  <Input
                    placeholder="Ex: Shopee + ML"
                    value={earningNotes}
                    onChange={(e) => setEarningNotes(e.target.value)}
                    className="bg-secondary border-border mt-1"
                  />
                </div>
              </div>
              {earningAmount && parseFloat(earningAmount) > 0 && (
                <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de comissões:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(earningAmount))}</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>95% para distribuição:</span>
                    <span className="font-bold">{formatCurrency(parseFloat(earningAmount) * 0.95)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>5% retido (Gluuu):</span>
                    <span>{formatCurrency(parseFloat(earningAmount) * 0.05)}</span>
                  </div>
                </div>
              )}
              <Button
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleLaunchEarning}
                disabled={launchEarning.isPending}
              >
                {launchEarning.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Lançar e Distribuir
              </Button>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold font-display mb-4">Histórico de Comissões (14 dias)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 240)" />
                    <XAxis dataKey="date" tick={{ fill: "oklch(0.60 0.01 240)", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "oklch(0.60 0.01 240)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "oklch(0.14 0.01 240)", border: "1px solid oklch(0.22 0.01 240)", borderRadius: "8px", color: "oklch(0.97 0.005 240)" }}
                      formatter={(v: number) => [formatCurrency(v)]}
                    />
                    <Bar dataKey="total" fill="oklch(0.65 0.2 155 / 0.5)" radius={[4, 4, 0, 0]} name="Total" />
                    <Bar dataKey="distribuido" fill="oklch(0.65 0.2 155)" radius={[4, 4, 0, 0]} name="Distribuído" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Earnings list */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-semibold font-display mb-4">Lançamentos Recentes</h3>
              {!dailyEarnings || dailyEarnings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum lançamento ainda</p>
              ) : (
                <div className="space-y-2">
                  {dailyEarnings.slice(0, 10).map((e) => (
                    <div key={e.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(e.date).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {e.activeShareholdersAtTime} acionistas · {e.totalSharesAtTime.toLocaleString("pt-BR")} cotas
                          {e.notes && ` · ${e.notes}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">{formatCurrency(Number(e.distributedAmount))}</p>
                        <p className="text-xs text-muted-foreground">distribuído</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-4 mt-6">
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-semibold font-display mb-4">Saques Pendentes</h3>
              {!pendingWithdrawals || pendingWithdrawals.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  Nenhum saque pendente
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingWithdrawals.map((w) => (
                    <div key={w.id} className="rounded-lg border border-border/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Saque #{w.id}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Usuário ID: {w.userId} · {w.pixKeyType?.toUpperCase()}: {w.pixKey}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Solicitado: {new Date(w.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold font-display text-primary">
                            {formatCurrency(Number(w.amount))}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => processWithdrawal.mutate({ withdrawalId: w.id, action: "approve" })}
                              disabled={processWithdrawal.isPending}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() => processWithdrawal.mutate({ withdrawalId: w.id, action: "reject", reason: "Rejeitado pelo admin" })}
                              disabled={processWithdrawal.isPending}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 mt-6">
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-display">Acionistas</h3>
                <span className="text-sm text-muted-foreground">
                  {allUsers?.total ?? 0} usuários
                </span>
              </div>
              <div className="space-y-2">
                {allUsers?.users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {(u.name || u.fullName || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.fullName || u.name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{u.totalShares.toLocaleString("pt-BR")} cotas</p>
                      <p className="text-xs text-muted-foreground">
                        Saldo: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(u.availableBalance / 100)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-4 mt-6">
            {/* Create link form */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Novo Link de Afiliado
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Plataforma</Label>
                  <Select value={newLinkPlatform} onValueChange={(v) => setNewLinkPlatform(v as typeof newLinkPlatform)}>
                    <SelectTrigger className="bg-secondary border-border mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="shopee">Shopee</SelectItem>
                      <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título (opcional)</Label>
                  <Input
                    placeholder="Ex: Link Shopee - Semana 12"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="bg-secondary border-border mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>URL do Link de Afiliado *</Label>
                  <Input
                    placeholder="https://s.shopee.com.br/..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="bg-secondary border-border mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    placeholder="Descrição do link"
                    value={newLinkDesc}
                    onChange={(e) => setNewLinkDesc(e.target.value)}
                    className="bg-secondary border-border mt-1"
                  />
                </div>
              </div>
              <Button
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => createLink.mutate({
                  platform: newLinkPlatform,
                  url: newLinkUrl,
                  title: newLinkTitle || undefined,
                  description: newLinkDesc || undefined,
                })}
                disabled={!newLinkUrl || createLink.isPending}
              >
                {createLink.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Criar Link
              </Button>
            </div>

            {/* Links list */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-semibold font-display mb-4">Links Ativos</h3>
              {!affiliateLinks || affiliateLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum link criado ainda</p>
              ) : (
                <div className="space-y-3">
                  {affiliateLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          link.platform === "shopee" ? "bg-orange-500/10" : "bg-yellow-500/10"
                        }`}>
                          {link.platform === "shopee" ? (
                            <ShoppingBag className="w-4 h-4 text-orange-400" />
                          ) : (
                            <Store className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{link.title || link.platform}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{link.url}</p>
                          <p className="text-xs text-muted-foreground">{link.clickCount} cliques</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-border text-xs ${link.isActive ? "text-red-400 hover:bg-red-500/10" : "text-green-400 hover:bg-green-500/10"}`}
                        onClick={() => toggleLink.mutate({ id: link.id, isActive: !link.isActive })}
                      >
                        {link.isActive ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
