import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PluuuLayout } from "@/components/PluuuLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { User, Phone, Building2, Award, Save, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: profile, isLoading } = trpc.profile.get.useQuery();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"corretor" | "imobiliaria">("corretor");
  const [creci, setCreci] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize form when profile loads - use useEffect to avoid render-phase state updates
  useEffect(() => {
    if (profile && !initialized) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setUserType((profile.userType as any) || "corretor");
      setCreci(profile.creci || "");
      setCompanyName(profile.companyName || "");
      setInitialized(true);
    }
  }, [profile, initialized]);

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      utils.profile.get.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erro ao atualizar perfil"),
  });

  const handleSave = () => {
    updateMutation.mutate({
      name: name.trim(),
      phone: phone.trim() || undefined,
      userType,
      creci: creci.trim() || undefined,
      companyName: companyName.trim() || undefined,
    });
  };

  const initials = (profile?.name || authUser?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PluuuLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie suas informações pessoais e profissionais
          </p>
        </div>

        {/* Avatar section */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.image || ""} />
              <AvatarFallback className="bg-primary text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground text-lg">
                {profile?.name || authUser?.name || "Usuário"}
              </h2>
              <p className="text-sm text-muted-foreground">{profile?.email || authUser?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {profile?.role === "admin" && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    Admin
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {profile?.userType === "imobiliaria" ? "Imobiliária" : "Corretor"}
                </Badge>
                {profile?.creci && (
                  <Badge variant="outline" className="text-xs">
                    CRECI {profile.creci}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : (
          <motion.div
            className="bg-card rounded-2xl border border-border p-6 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold text-foreground">Informações pessoais</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-11"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de perfil</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "corretor", label: "Corretor autônomo" },
                  { id: "imobiliaria", label: "Imobiliária" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setUserType(type.id as any)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                      userType === type.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:border-primary/30"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creci">CRECI</Label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="creci"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  className="pl-10 h-11"
                  placeholder="Ex: 12345-F"
                />
              </div>
            </div>

            {userType === "imobiliaria" && (
              <div className="space-y-2">
                <Label htmlFor="company">Nome da imobiliária</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-10 h-11"
                    placeholder="Nome da sua imobiliária"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-primary text-white hover:bg-primary/90 h-11"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar alterações
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Account info */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Informações da conta</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground font-medium">{profile?.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membro desde</span>
              <span className="text-foreground font-medium">
                {profile?.createdAt
                  ? format(new Date(profile.createdAt), "MMMM 'de' yyyy", { locale: ptBR })
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Último acesso</span>
              <span className="text-foreground font-medium">
                {profile?.lastSignedIn
                  ? format(new Date(profile.lastSignedIn), "dd/MM/yyyy 'às' HH:mm")
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={logout}
            className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>
    </PluuuLayout>
  );
}
