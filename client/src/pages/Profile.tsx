import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  User,
  CheckCircle,
  AlertCircle,
  Wallet,
  ArrowUpRight,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { useState } from "react";

const profileSchema = z.object({
  fullName: z.string().min(3, "Nome completo obrigatório"),
  cpf: z.string().min(11, "CPF inválido").max(14),
  phone: z.string().min(10, "Telefone inválido"),
  pixKey: z.string().min(1, "Chave PIX obrigatória"),
  pixKeyType: z.enum(["cpf", "email", "phone", "random"]),
});

const withdrawSchema = z.object({
  amount: z.number().min(10, "Valor mínimo de R$ 10,00"),
  pixKey: z.string().min(1, "Chave PIX obrigatória"),
  pixKeyType: z.enum(["cpf", "email", "phone", "random"]),
});

type ProfileForm = z.infer<typeof profileSchema>;
type WithdrawForm = z.infer<typeof withdrawSchema>;

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .slice(0, 14);
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

export default function Profile() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: stats, isLoading } = trpc.user.stats.useQuery();
  const { data: withdrawals } = trpc.withdrawals.myWithdrawals.useQuery();

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      utils.user.stats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const requestWithdrawal = trpc.withdrawals.request.useMutation({
    onSuccess: () => {
      toast.success("Solicitação de saque enviada! Processaremos em breve.");
      setWithdrawOpen(false);
      utils.user.stats.invalidate();
      utils.withdrawals.myWithdrawals.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: stats?.fullName || "",
      cpf: stats?.cpf || "",
      phone: stats?.phone || "",
      pixKey: stats?.pixKey || "",
      pixKeyType: (stats?.pixKeyType as ProfileForm["pixKeyType"]) || "cpf",
    },
  });

  const withdrawForm = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      pixKey: stats?.pixKey || "",
      pixKeyType: (stats?.pixKeyType as WithdrawForm["pixKeyType"]) || "cpf",
    },
  });

  const onSubmitProfile = (data: ProfileForm) => {
    updateProfile.mutate(data);
  };

  const onSubmitWithdraw = (data: WithdrawForm) => {
    requestWithdrawal.mutate(data);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
      processing: { label: "Processando", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      completed: { label: "Concluído", className: "bg-green-500/10 text-green-400 border-green-500/20" },
      failed: { label: "Falhou", className: "bg-red-500/10 text-red-400 border-red-500/20" },
      cancelled: { label: "Cancelado", className: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    };
    const s = map[status] || map.pending;
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  if (isLoading) {
    return (
      <AppLayout title="Meu Perfil">
        <div className="container py-8 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Meu Perfil">
      <div className="container py-8 space-y-6 max-w-4xl">
        {/* Balance Card */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Saldo Disponível</span>
            </div>
            <div className="text-3xl font-bold font-display text-primary">
              {formatCurrency(stats?.availableBalance ?? 0)}
            </div>
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                  disabled={(stats?.availableBalance ?? 0) < 1000}
                >
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  Solicitar Saque
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-display">Solicitar Saque via PIX</DialogTitle>
                </DialogHeader>
                <form onSubmit={withdrawForm.handleSubmit(onSubmitWithdraw)} className="space-y-4">
                  <div className="rounded-lg bg-secondary/50 p-3 text-sm text-muted-foreground">
                    Saldo disponível: <span className="text-primary font-semibold">{formatCurrency(stats?.availableBalance ?? 0)}</span>
                  </div>
                  <div>
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="10"
                      placeholder="10.00"
                      className="bg-secondary border-border mt-1"
                      {...withdrawForm.register("amount", { valueAsNumber: true })}
                    />
                    {withdrawForm.formState.errors.amount && (
                      <p className="text-xs text-destructive mt-1">{withdrawForm.formState.errors.amount.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Tipo de Chave PIX</Label>
                    <Select
                      defaultValue={stats?.pixKeyType || "cpf"}
                      onValueChange={(v) => withdrawForm.setValue("pixKeyType", v as WithdrawForm["pixKeyType"])}
                    >
                      <SelectTrigger className="bg-secondary border-border mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                        <SelectItem value="random">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Chave PIX</Label>
                    <Input
                      placeholder="Sua chave PIX"
                      defaultValue={stats?.pixKey || ""}
                      className="bg-secondary border-border mt-1"
                      {...withdrawForm.register("pixKey")}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={requestWithdrawal.isPending}
                  >
                    {requestWithdrawal.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Confirmar Saque
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="text-xs text-muted-foreground mb-1">Total Ganho</div>
            <div className="text-2xl font-bold font-display">{formatCurrency(stats?.totalEarned ?? 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">Acumulado total</div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="text-xs text-muted-foreground mb-1">Minhas Cotas</div>
            <div className="text-2xl font-bold font-display">{(stats?.totalShares ?? 0).toLocaleString("pt-BR")}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((stats?.totalShares ?? 0) / 1_000_000 * 100).toFixed(4)}% do total
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold font-display">Dados do Perfil</h2>
              <p className="text-xs text-muted-foreground">
                Necessários para subconta Woovi e saques PIX
              </p>
            </div>
            {stats?.profileComplete ? (
              <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completo
              </Badge>
            ) : (
              <Badge className="ml-auto bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <AlertCircle className="w-3 h-3 mr-1" />
                Incompleto
              </Badge>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  placeholder="João da Silva"
                  className="bg-secondary border-border mt-1"
                  defaultValue={stats?.fullName || ""}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  className="bg-secondary border-border mt-1"
                  defaultValue={stats?.cpf || ""}
                  {...register("cpf")}
                  onChange={(e) => {
                    e.target.value = formatCPF(e.target.value);
                    register("cpf").onChange(e);
                  }}
                />
                {errors.cpf && (
                  <p className="text-xs text-destructive mt-1">{errors.cpf.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  className="bg-secondary border-border mt-1"
                  defaultValue={stats?.phone || ""}
                  {...register("phone")}
                  onChange={(e) => {
                    e.target.value = formatPhone(e.target.value);
                    register("phone").onChange(e);
                  }}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label>Tipo de Chave PIX *</Label>
                <Select
                  defaultValue={stats?.pixKeyType || "cpf"}
                  onValueChange={(v) => setValue("pixKeyType", v as ProfileForm["pixKeyType"])}
                >
                  <SelectTrigger className="bg-secondary border-border mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="pixKey">Chave PIX *</Label>
                <Input
                  id="pixKey"
                  placeholder="Sua chave PIX para receber saques"
                  className="bg-secondary border-border mt-1"
                  defaultValue={stats?.pixKey || ""}
                  {...register("pixKey")}
                />
                {errors.pixKey && (
                  <p className="text-xs text-destructive mt-1">{errors.pixKey.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Esta chave será usada para processar seus saques via PIX
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">Por que precisamos desses dados?</strong>{" "}
              O CPF, telefone e chave PIX são necessários para criar sua subconta na Woovi
              (nosso processador de pagamentos) e para processar seus saques com segurança.
            </div>

            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Salvar Perfil
            </Button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="font-semibold font-display mb-4">Histórico de Saques</h2>
          {!withdrawals || withdrawals.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Nenhum saque solicitado ainda
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Saque via PIX</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(w.createdAt).toLocaleDateString("pt-BR")} · {w.pixKey}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-400">
                      -{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(w.amount))}
                    </p>
                    {statusBadge(w.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
