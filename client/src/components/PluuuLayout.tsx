import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Film,
  LayoutDashboard,
  Video,
  Plus,
  CreditCard,
  User,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/dashboard/videos", icon: Video, label: "Meus Vídeos" },
  { href: "/dashboard/criar", icon: Plus, label: "Criar Vídeo" },
  { href: "/dashboard/assinatura", icon: CreditCard, label: "Assinatura" },
  { href: "/dashboard/perfil", icon: User, label: "Perfil" },
];

export function PluuuLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center animate-pulse">
            <Film className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl(location);
    }
  }, [loading, isAuthenticated, location]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center animate-pulse">
            <Film className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── Sidebar (desktop) ─────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">Pluuu</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer",
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                  {item.href === "/dashboard/criar" && (
                    <span className="ml-auto text-xs bg-primary text-white rounded-full px-2 py-0.5">
                      Novo
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.image || ""} />
                  <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/50 truncate">
                    {user?.email || ""}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-sidebar-foreground/40 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/perfil">
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/assinatura">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Assinatura
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ─── Main content ──────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Top bar (mobile) */}
        <header className="md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Film className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Pluuu</span>
          </Link>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* ─── Bottom nav (mobile) ───────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map((item) => {
            const active = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.href === "/dashboard/criar" ? (
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <>
                      <item.icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
          <Link href="/dashboard/perfil">
            <div className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
              location === "/dashboard/perfil" ? "text-primary" : "text-muted-foreground"
            )}>
              <Avatar className="w-6 h-6">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback className="bg-primary text-white text-[10px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-medium">Perfil</span>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
