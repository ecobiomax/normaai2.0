import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Video,
  Mic,
  CreditCard,
  HelpCircle,
  Heart,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/novo-video", label: "Novo Vídeo", icon: PlusCircle },
  { href: "/meus-videos", label: "Meus Vídeos", icon: Video },
  { href: "/perfis-de-voz", label: "Perfis de Voz", icon: Mic },
  { href: "/assinatura", label: "Assinatura", icon: CreditCard },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: subscription } = trpc.subscription.current.useQuery();

  const handleLogout = async () => {
    await logout();
    toast.success("Você saiu com sucesso");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground",
        mobile ? "w-full" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-sidebar-primary fill-sidebar-primary/20" />
            <span className="font-semibold text-sidebar-foreground text-base tracking-tight">
              Memórias <span className="text-sidebar-primary">VIVA</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Credits badge */}
      {subscription && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-sidebar-foreground/70">Créditos restantes</span>
            <Sparkles className="w-3.5 h-3.5 text-sidebar-primary" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-sidebar-foreground">
              {subscription.creditsRemaining}
            </span>
            <span className="text-xs text-sidebar-foreground/50">
              / {(subscription as any).plan?.videosPerMonth ?? "—"}
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-sidebar-border rounded-full overflow-hidden">
            <div
              className="h-full bg-sidebar-primary rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  ((subscription.creditsRemaining /
                    ((subscription as any).plan?.videosPerMonth ?? 1)) *
                    100)
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-sidebar-foreground/50 mt-1.5">
            {(subscription as any).plan?.name}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 mt-2">
        {NAV_ITEMS.map((item) => {
          const active = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <a
          href="mailto:suporte@memoriasviva.com.br"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          Suporte
        </a>
        <div className="px-3 py-2.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-semibold text-sidebar-primary">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user?.name ?? "Usuário"}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleLogout}
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 shrink-0 border-r border-border">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 shadow-2xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-primary fill-primary/20" />
            <span className="font-semibold text-sm">
              Memórias <span className="text-primary">VIVA</span>
            </span>
          </div>
          {subscription && (
            <Badge variant="secondary" className="text-xs">
              {subscription.creditsRemaining} créditos
            </Badge>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-5xl mx-auto py-6 px-4">
            {title && (
              <h1 className="text-2xl font-serif font-semibold text-foreground mb-6">
                {title}
              </h1>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
