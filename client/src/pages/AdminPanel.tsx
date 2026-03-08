import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { toast } from "sonner";
import { Loader2, RefreshCw, Star, MessageCircle, BarChart3, Clock, CheckCircle, XCircle, Home } from "lucide-react";

const CATEGORIES = [
  "mensagem-de-bom-dia", "mensagem-de-boa-tarde", "mensagem-de-boa-noite",
  "mensagem-motivacional", "mensagem-de-amor", "frases-de-reflexao",
  "frases-curtas", "frases-para-whatsapp",
];

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [msgCount, setMsgCount] = useState(3);
  const [horoDate, setHoroDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: stats, refetch: refetchStats } = trpc.content.getStats.useQuery();
  const { data: logs, refetch: refetchLogs } = trpc.content.getGenerationLogs.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
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
    onSuccess: (d) => { toast.success(`${d.total} mensagens geradas para todas as categorias!`); refetchStats(); refetchLogs(); },
    onError: (e) => toast.error(e.message),
  });

  const genHoroMutation = trpc.content.generateHoroscopes.useMutation({
    onSuccess: (d) => { toast.success(`Horóscopos gerados para ${d.date}!`); refetchStats(); refetchLogs(); },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1A2744", marginBottom: "0.75rem" }}>
            Acesso Restrito
          </h2>
          <p style={{ color: "#7A8AAA" }}>Esta área é exclusiva para administradores.</p>
          <Link href="/" style={{ color: "#A07830", textDecoration: "none", marginTop: "1rem", display: "inline-block" }}>
            ← Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main>
      <section style={{
        background: "linear-gradient(135deg, #1A2744 0%, #243358 100%)",
        padding: "2rem 0",
      }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.75rem",
                color: "#F8F4ED",
                marginBottom: "0.25rem",
              }}>
                Painel Admin
              </h1>
              <p style={{ color: "#9AAAC0", fontSize: "0.875rem" }}>VibeDia — Gerenciamento de Conteúdo</p>
            </div>
            <Link href="/" style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              color: "#C9A84C", textDecoration: "none", fontSize: "0.875rem",
            }}>
              <Home size={14} /> Ver site
            </Link>
          </div>
        </div>
      </section>

      <div className="gold-divider-thick" />

      <div className="container" style={{ padding: "2rem 1rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Mensagens", value: stats?.messages ?? "—", icon: <MessageCircle size={20} />, color: "#C9A84C" },
            { label: "Horóscopos", value: stats?.horoscopes ?? "—", icon: <Star size={20} />, color: "#6366F1" },
            { label: "Categorias", value: stats?.categories ?? "—", icon: <BarChart3 size={20} />, color: "#10B981" },
          ].map((stat) => (
            <div key={stat.label} className="vibe-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div style={{
                  width: "36px", height: "36px",
                  background: `${stat.color}18`,
                  border: `1px solid ${stat.color}30`,
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#7A8AAA", fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#1A2744" }}>
                {typeof stat.value === "number" ? stat.value.toLocaleString("pt-BR") : stat.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* Seed Categories */}
          <div className="vibe-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.125rem", color: "#1A2744", marginBottom: "1rem" }}>
              Inicializar Categorias
            </h3>
            <p style={{ color: "#7A8AAA", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Cria as 8 categorias padrão no banco de dados.
            </p>
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="btn-navy"
              style={{ width: "100%" }}
            >
              {seedMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Criar Categorias
            </button>
          </div>

          {/* Generate Messages */}
          <div className="vibe-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.125rem", color: "#1A2744", marginBottom: "1rem" }}>
              Gerar Mensagens por Categoria
            </h3>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ fontSize: "0.8125rem", color: "#4A5F8A", fontWeight: 500, display: "block", marginBottom: "0.375rem" }}>
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: "100%", padding: "0.5rem 0.75rem",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: "0.5rem",
                  background: "#F8F4ED",
                  color: "#1A2744",
                  fontSize: "0.875rem",
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace(/-/g, " ")}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8125rem", color: "#4A5F8A", fontWeight: 500, display: "block", marginBottom: "0.375rem" }}>
                Quantidade: {msgCount}
              </label>
              <input
                type="range" min={1} max={10} value={msgCount}
                onChange={(e) => setMsgCount(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
            <button
              onClick={() => genMsgMutation.mutate({ categorySlug: selectedCategory, count: msgCount })}
              disabled={genMsgMutation.isPending}
              className="btn-gold"
              style={{ width: "100%" }}
            >
              {genMsgMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
              Gerar {msgCount} Mensagens
            </button>
          </div>

          {/* Generate All Messages */}
          <div className="vibe-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.125rem", color: "#1A2744", marginBottom: "1rem" }}>
              Gerar para Todas as Categorias
            </h3>
            <p style={{ color: "#7A8AAA", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Gera 3 mensagens para cada uma das 8 categorias (24 mensagens no total).
            </p>
            <button
              onClick={() => genAllMsgMutation.mutate({ countPerCategory: 3 })}
              disabled={genAllMsgMutation.isPending}
              className="btn-navy"
              style={{ width: "100%" }}
            >
              {genAllMsgMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Gerar Todas
            </button>
          </div>

          {/* Generate Horoscopes */}
          <div className="vibe-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.125rem", color: "#1A2744", marginBottom: "1rem" }}>
              Gerar Horóscopo
            </h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8125rem", color: "#4A5F8A", fontWeight: 500, display: "block", marginBottom: "0.375rem" }}>
                Data
              </label>
              <input
                type="date"
                value={horoDate}
                onChange={(e) => setHoroDate(e.target.value)}
                style={{
                  width: "100%", padding: "0.5rem 0.75rem",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: "0.5rem",
                  background: "#F8F4ED",
                  color: "#1A2744",
                  fontSize: "0.875rem",
                }}
              />
            </div>
            <button
              onClick={() => genHoroMutation.mutate({ date: horoDate })}
              disabled={genHoroMutation.isPending}
              className="btn-gold"
              style={{ width: "100%" }}
            >
              {genHoroMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
              Gerar 12 Signos
            </button>
          </div>
        </div>

        {/* Generation Logs */}
        {logs && logs.length > 0 && (
          <div className="vibe-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <Clock size={18} style={{ color: "#C9A84C" }} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.125rem", color: "#1A2744" }}>
                Logs de Geração
              </h3>
            </div>
            <div style={{ display: "grid", gap: "0.5rem", maxHeight: "400px", overflowY: "auto" }}>
              {logs.map((log) => (
                <div key={log.id} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.625rem 0.875rem",
                  background: log.status === "success" ? "#F0FDF4" : "#FEF2F2",
                  border: `1px solid ${log.status === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: "0.5rem",
                  fontSize: "0.8125rem",
                }}>
                  {log.status === "success"
                    ? <CheckCircle size={14} style={{ color: "#10B981", flexShrink: 0 }} />
                    : <XCircle size={14} style={{ color: "#EF4444", flexShrink: 0 }} />
                  }
                  <span style={{ color: "#4A5F8A", flex: 1 }}>{log.details}</span>
                  <span style={{ color: "#9AAAC0", whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
