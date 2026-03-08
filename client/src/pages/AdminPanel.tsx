import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Loader2, RefreshCw, Star, MessageCircle, BarChart3,
  Clock, CheckCircle, XCircle, Home, LogIn, LogOut, Image,
} from "lucide-react";

const CATEGORIES = [
  "mensagem-de-bom-dia", "mensagem-de-boa-tarde", "mensagem-de-boa-noite",
  "mensagem-motivacional", "mensagem-de-amor", "frases-de-reflexao",
  "frases-curtas", "frases-para-whatsapp",
];

// ─── Login Form ───────────────────────────────────────────────────────────────

function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      onSuccess();
    },
    onError: (e) => {
      toast.error(e.message || "Usuário ou senha incorretos.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Preencha usuário e senha.");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1A2744 0%, #243358 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "#F8F4ED",
        borderRadius: "16px",
        padding: "2.5rem",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        border: "1px solid rgba(201,168,76,0.3)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "60px", height: "60px",
            background: "linear-gradient(135deg, #C9A84C, #A07830)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
            fontSize: "1.75rem",
          }}>
            ✨
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#1A2744",
            marginBottom: "0.25rem",
          }}>
            VibeDia Admin
          </h1>
          <p style={{ color: "#7A8AAA", fontSize: "0.875rem" }}>
            Acesso exclusivo para administradores
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#1A2744",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              autoComplete="username"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1.5px solid rgba(201,168,76,0.4)",
                borderRadius: "8px",
                fontSize: "0.9375rem",
                color: "#1A2744",
                background: "#FFFDF7",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#C9A84C"}
              onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.4)"}
            />
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#1A2744",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1.5px solid rgba(201,168,76,0.4)",
                borderRadius: "8px",
                fontSize: "0.9375rem",
                color: "#1A2744",
                background: "#FFFDF7",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#C9A84C"}
              onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.4)"}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              width: "100%",
              padding: "0.875rem",
              background: "linear-gradient(135deg, #C9A84C, #A07830)",
              color: "#1A2744",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9375rem",
              fontWeight: 700,
              cursor: loginMutation.isPending ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              opacity: loginMutation.isPending ? 0.7 : 1,
            }}
          >
            {loginMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {loginMutation.isPending ? "Autenticando..." : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link href="/" style={{ color: "#A07830", fontSize: "0.875rem", textDecoration: "none" }}>
            ← Voltar ao portal
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [msgCount, setMsgCount] = useState(3);
  const [horoDate, setHoroDate] = useState(new Date().toISOString().split("T")[0]);
  const [withImage, setWithImage] = useState(false);

  const { data: stats, refetch: refetchStats } = trpc.content.getStats.useQuery();
  const { data: logs, refetch: refetchLogs } = trpc.content.getGenerationLogs.useQuery();

  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: () => {
      toast.success("Sessão encerrada.");
      onLogout();
    },
  });

  const seedMutation = trpc.content.seedCategories.useMutation({
    onSuccess: () => { toast.success("Categorias criadas!"); refetchStats(); },
    onError: (e) => toast.error(e.message),
  });

  const genMsgMutation = trpc.content.generateMessage.useMutation({
    onSuccess: (d) => { toast.success(`${d.generated.length} mensagens geradas!`); refetchStats(); refetchLogs(); },
    onError: (e) => toast.error(e.message),
  });

  const genAllMsgMutation = trpc.content.generateAllMessages.useMutation({
    onSuccess: (d) => { toast.success(`${d.total} mensagens geradas!`); refetchStats(); refetchLogs(); },
    onError: (e) => toast.error(e.message),
  });

  const genHoroMutation = trpc.content.generateHoroscopes.useMutation({
    onSuccess: (d) => { toast.success(`Horóscopos gerados para ${d.date}!`); refetchStats(); refetchLogs(); },
    onError: (e) => toast.error(e.message),
  });

  const isGenerating = genMsgMutation.isPending || genAllMsgMutation.isPending || genHoroMutation.isPending;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #1A2744 0%, #243358 100%)",
        padding: "1rem 0",
        borderBottom: "2px solid rgba(201,168,76,0.3)",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/" style={{ color: "#9AAAC0", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.875rem" }}>
              <Home size={14} /> Portal
            </Link>
            <span style={{ color: "#4A5F8A" }}>/</span>
            <span style={{ color: "#C9A84C", fontWeight: 600 }}>Admin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "#9AAAC0", fontSize: "0.875rem" }}>jrmemachado</span>
            <button
              onClick={() => logoutMutation.mutate()}
              style={{
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#C9A84C",
                padding: "0.4rem 0.875rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8125rem",
                display: "flex", alignItems: "center", gap: "0.35rem",
              }}
            >
              <LogOut size={13} /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: "2rem 1rem" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.75rem",
          color: "#1A2744",
          marginBottom: "0.5rem",
        }}>
          Painel de Administração
        </h1>
        <p style={{ color: "#7A8AAA", marginBottom: "2rem", fontSize: "0.9375rem" }}>
          Gerencie o conteúdo do portal VibeDia
        </p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Mensagens", value: stats?.messages ?? "—", icon: "💬" },
            { label: "Horóscopos", value: stats?.horoscopes ?? "—", icon: "⭐" },
            { label: "Categorias", value: stats?.categories ?? "—", icon: "📂" },
          ].map((s) => (
            <div key={s.label} className="vibe-card" style={{ padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, color: "#1A2744" }}>{s.value}</div>
              <div style={{ fontSize: "0.8125rem", color: "#7A8AAA", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toggle imagem global */}
        <div className="vibe-card" style={{ padding: "1.25rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Image size={20} style={{ color: "#C9A84C" }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: "#1A2744", marginBottom: "0.2rem" }}>Gerar imagens com DALL-E 3</p>
            <p style={{ fontSize: "0.8125rem", color: "#7A8AAA" }}>
              Ativa a geração de imagens para todos os botões abaixo. Cada imagem custa ~$0,04 na OpenAI.
            </p>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={withImage}
              onChange={(e) => setWithImage(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#C9A84C" }}
            />
            <span style={{ fontWeight: 600, color: withImage ? "#A07830" : "#7A8AAA", fontSize: "0.9375rem" }}>
              {withImage ? "Ativado" : "Desativado"}
            </span>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* Seed Categories */}
          <div className="vibe-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
              📂 Criar Categorias
            </h3>
            <p style={{ color: "#7A8AAA", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Cria as 8 categorias padrão no banco de dados. Execute apenas uma vez.
            </p>
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="btn-navy"
              style={{ width: "100%" }}
            >
              {seedMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
              Criar Categorias
            </button>
          </div>

          {/* Generate Messages */}
          <div className="vibe-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
              💬 Gerar Mensagens
            </h3>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ fontSize: "0.8125rem", color: "#4A5F8A", display: "block", marginBottom: "0.35rem" }}>Categoria:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: "100%", padding: "0.5rem", border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: "6px", fontSize: "0.875rem", color: "#1A2744",
                  background: "#FFFDF7", marginBottom: "0.5rem",
                }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label style={{ fontSize: "0.8125rem", color: "#4A5F8A", display: "block", marginBottom: "0.35rem" }}>Quantidade:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={msgCount}
                onChange={(e) => setMsgCount(Number(e.target.value))}
                style={{
                  width: "100%", padding: "0.5rem", border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: "6px", fontSize: "0.875rem", color: "#1A2744", background: "#FFFDF7",
                }}
              />
            </div>
            <button
              onClick={() => genMsgMutation.mutate({ categorySlug: selectedCategory, count: msgCount, withImage })}
              disabled={isGenerating}
              className="btn-gold"
              style={{ width: "100%" }}
            >
              {genMsgMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
              Gerar {msgCount} Mensagens{withImage ? " + Imagens" : ""}
            </button>
          </div>

          {/* Generate All Messages */}
          <div className="vibe-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
              🔄 Gerar Todas as Categorias
            </h3>
            <p style={{ color: "#7A8AAA", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Gera 3 mensagens para cada uma das 8 categorias (24 mensagens no total).
            </p>
            <button
              onClick={() => genAllMsgMutation.mutate({ countPerCategory: 3, withImage })}
              disabled={isGenerating}
              className="btn-navy"
              style={{ width: "100%" }}
            >
              {genAllMsgMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Gerar Todas{withImage ? " + Imagens" : ""}
            </button>
          </div>

          {/* Generate Horoscopes */}
          <div className="vibe-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
              ⭐ Gerar Horóscopo
            </h3>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ fontSize: "0.8125rem", color: "#4A5F8A", display: "block", marginBottom: "0.35rem" }}>Data:</label>
              <input
                type="date"
                value={horoDate}
                onChange={(e) => setHoroDate(e.target.value)}
                style={{
                  width: "100%", padding: "0.5rem", border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: "6px", fontSize: "0.875rem", color: "#1A2744", background: "#FFFDF7",
                }}
              />
            </div>
            <button
              onClick={() => genHoroMutation.mutate({ date: horoDate, withImage })}
              disabled={isGenerating}
              className="btn-gold"
              style={{ width: "100%" }}
            >
              {genHoroMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
              Gerar 12 Signos{withImage ? " + Imagens" : ""}
            </button>
          </div>
        </div>

        {/* Generation Logs */}
        <div className="vibe-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Clock size={18} style={{ color: "#C9A84C" }} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744", fontSize: "1.1rem" }}>
              Logs de Geração
            </h3>
          </div>
          {logs && logs.length > 0 ? (
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {logs.map((log: any) => (
                <div key={log.id} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  padding: "0.625rem 0",
                  borderBottom: "1px solid rgba(201,168,76,0.1)",
                  fontSize: "0.8125rem",
                }}>
                  {log.status === "success"
                    ? <CheckCircle size={14} style={{ color: "#22C55E", flexShrink: 0, marginTop: "1px" }} />
                    : <XCircle size={14} style={{ color: "#EF4444", flexShrink: 0, marginTop: "1px" }} />
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ color: "#4A5F8A", fontWeight: 600 }}>{log.type}</span>
                    {" — "}
                    <span style={{ color: "#7A8AAA" }}>{log.details}</span>
                  </div>
                  <span style={{ color: "#9AAAC0", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                    {new Date(log.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#9AAAC0", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>
              Nenhum log ainda. Gere conteúdo para ver os registros aqui.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { data: adminSession, isLoading, refetch } = trpc.adminAuth.me.useQuery();
  const [, forceUpdate] = useState(0);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1A2744" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#C9A84C" }} />
      </div>
    );
  }

  if (!adminSession) {
    return (
      <AdminLoginForm onSuccess={() => {
        refetch();
        forceUpdate(n => n + 1);
      }} />
    );
  }

  return (
    <AdminDashboard onLogout={() => {
      refetch();
      forceUpdate(n => n + 1);
    }} />
  );
}
