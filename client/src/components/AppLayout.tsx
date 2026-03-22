import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  LayoutDashboard,
  User,
  ShoppingCart,
  Link,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  Shield,
} from "lucide-react";
import { Link as WouterLink, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notifications } = trpc.notifications.list.useQuery();
  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => trpc.useUtils().notifications.list.invalidate(),
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      window.location.href = "/";
    },
  });

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/links-afiliados", label: "Links Afiliados", icon: Link },
    { href: "/comprar-cotas", label: "Comprar Cotas", icon: ShoppingCart },
    { href: "/perfil", label: "Meu Perfil", icon: User },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <WouterLink href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight">Gluuu</span>
          </WouterLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <WouterLink key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 text-sm ${
                    location === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </WouterLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-border">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="font-semibold text-sm">Notificações</span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 text-primary"
                      onClick={() => markAllRead.mutate()}
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications?.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications?.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`px-3 py-3 border-b border-border/30 last:border-0 ${
                          !n.isRead ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          )}
                          <div className={!n.isRead ? "" : "ml-4"}>
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {(user?.name || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm max-w-24 truncate">
                    {user?.name?.split(" ")[0] || "Usuário"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <div className="px-3 py-2 border-b border-border">
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  {user?.role === "admin" && (
                    <Badge className="mt-1 bg-primary/20 text-primary border-primary/30 text-xs">Admin</Badge>
                  )}
                </div>
                <WouterLink href="/perfil">
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                </WouterLink>
                <WouterLink href="/dashboard">
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </DropdownMenuItem>
                </WouterLink>
                {user?.role === "admin" && (
                  <WouterLink href="/admin">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Shield className="w-4 h-4" />
                      Painel Admin
                    </DropdownMenuItem>
                  </WouterLink>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="container py-4 space-y-1">
              {navItems.map((item) => (
                <WouterLink key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 ${
                      location === item.href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </WouterLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* WhatsApp Community Banner (persistent) */}
      <div className="fixed bottom-4 right-4 z-40">
        <a
          href="https://chat.whatsapp.com/gluuu"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 glow-green-sm"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:block">Comunidade WhatsApp</span>
        </a>
      </div>

      {/* Page Content */}
      <main className="pt-16 min-h-screen">
        {title && (
          <div className="border-b border-border/30 bg-card/20">
            <div className="container py-6">
              <h1 className="text-2xl font-bold font-display">{title}</h1>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
