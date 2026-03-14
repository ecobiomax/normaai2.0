import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Camera,
  Zap,
  Download,
  Play,
  Check,
  Star,
  ChevronRight,
  Film,
  Music,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { PLANS } from "../../../shared/plans";
import { getLoginUrl } from "@/const";

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Film className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Pluuu</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
          <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href={getLoginUrl("/dashboard")}>
            <Button variant="ghost" size="sm">Entrar</Button>
          </a>
          <a href={getLoginUrl("/dashboard")}>
            <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
              Começar grátis
            </Button>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-4">
          <a href="#como-funciona" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Como funciona</a>
          <a href="#planos" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Planos</a>
          <a href="#faq" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>FAQ</a>
          <a href={getLoginUrl("/dashboard")}>
            <Button className="w-full bg-primary text-white">Começar agora</Button>
          </a>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.45_0.22_265)] via-[oklch(0.35_0.25_280)] to-[oklch(0.20_0.15_290)]" />
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />
      {/* Floating orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.60_0.20_280)]/20 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-[oklch(0.72_0.18_200)]/15 blur-3xl" />

      <div className="container relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by Runway Gen-4 + Claude AI
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Seus imóveis{" "}
            <span className="text-[oklch(0.85_0.15_75)]">em movimento</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transforme fotos de imóveis em vídeos cinematográficos profissionais com
            movimentos de câmera dinâmicos, trilha sonora e efeitos de IA — em minutos.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a href={getLoginUrl("/dashboard")}>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 h-12 text-base shadow-xl"
              >
                Criar meu primeiro vídeo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
            <a href="#como-funciona">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent h-12 text-base"
              >
                <Play className="w-4 h-4 mr-2" />
                Ver como funciona
              </Button>
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["#7C3AED", "#4F46E5", "#0EA5E9"].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white/20" style={{ background: c }} />
                ))}
              </div>
              <span>+500 corretores ativos</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[oklch(0.85_0.15_75)] text-[oklch(0.85_0.15_75)]" />
              ))}
              <span className="ml-1">4.9/5 avaliação</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1">
              <Film className="w-4 h-4" />
              <span>+12.000 vídeos gerados</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 40C480 0 240 80 0 40L0 80Z" fill="oklch(0.99 0.002 265)" />
        </svg>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      step: "01",
      title: "Envie as fotos",
      description: "Faça upload de até 10 fotos do imóvel. Arraste para reordenar a sequência do vídeo.",
      color: "text-[oklch(0.45_0.22_265)]",
      bg: "bg-[oklch(0.45_0.22_265)]/10",
    },
    {
      icon: Sparkles,
      step: "02",
      title: "IA gera os prompts",
      description: "Claude analisa cada foto e cria prompts cinematográficos otimizados para movimentos de câmera únicos.",
      color: "text-[oklch(0.60_0.20_280)]",
      bg: "bg-[oklch(0.60_0.20_280)]/10",
    },
    {
      icon: Film,
      step: "03",
      title: "Runway cria os clips",
      description: "Runway Gen-4 Turbo gera clips de 5s para cada foto com pan, tilt, zoom e dolly cinematográficos.",
      color: "text-[oklch(0.55_0.22_200)]",
      bg: "bg-[oklch(0.55_0.22_200)]/10",
    },
    {
      icon: Music,
      step: "04",
      title: "FFmpeg compõe o vídeo",
      description: "Clips são concatenados com crossfade, trilha sonora ambiente e fade in/out. Vídeo final em 1080p.",
      color: "text-[oklch(0.65_0.18_320)]",
      bg: "bg-[oklch(0.65_0.18_320)]/10",
    },
    {
      icon: Download,
      step: "05",
      title: "Baixe e compartilhe",
      description: "Receba o link por email. Baixe o MP4 em HD e compartilhe nas redes sociais ou envie para clientes.",
      color: "text-[oklch(0.55_0.18_75)]",
      bg: "bg-[oklch(0.55_0.18_75)]/10",
    },
  ];

  return (
    <section id="como-funciona" className="py-24 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Como funciona</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            De fotos a vídeo em{" "}
            <span className="text-primary">5 passos simples</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Nossa pipeline de IA automatiza todo o processo de produção cinematográfica.
            Você só precisa enviar as fotos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border z-0 -translate-x-1/2" />
              )}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow relative z-10">
                <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mb-4`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-2">{step.step}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Video Styles ─────────────────────────────────────────────────────────────
function VideoStyles() {
  const styles = [
    { name: "Moderno", emoji: "⚡", desc: "Dinâmico e contemporâneo", color: "from-violet-500 to-purple-600" },
    { name: "Luxo", emoji: "✨", desc: "Elegante e sofisticado", color: "from-amber-400 to-yellow-500" },
    { name: "Aconchegante", emoji: "🏡", desc: "Quente e familiar", color: "from-orange-400 to-red-400" },
    { name: "Minimalista", emoji: "◻", desc: "Limpo e arquitetônico", color: "from-slate-400 to-gray-500" },
    { name: "Clássico", emoji: "🎬", desc: "Atemporal e profissional", color: "from-blue-500 to-indigo-600" },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Estilos cinematográficos</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            5 estilos para cada tipo de imóvel
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Cada estilo define a atmosfera, os movimentos de câmera e a trilha sonora do seu vídeo.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {styles.map((s, i) => (
            <motion.div
              key={i}
              className="group cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className={`bg-gradient-to-br ${s.color} rounded-2xl p-6 text-white text-center shadow-lg`}>
                <div className="text-3xl mb-3">{s.emoji}</div>
                <div className="font-semibold text-sm">{s.name}</div>
                <div className="text-xs text-white/70 mt-1">{s.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const planList = Object.values(PLANS);

  return (
    <section id="planos" className="py-24 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Planos e preços</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Assinatura mensal via Pix recorrente. Cancele quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planList.map((plan, i) => (
            <motion.div
              key={plan.id}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                "highlighted" in plan && plan.highlighted
                  ? "border-primary shadow-xl shadow-primary/10 bg-primary text-white scale-105"
                  : "border-border bg-card"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {"highlighted" in plan && plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[oklch(0.85_0.15_75)] text-[oklch(0.20_0.05_75)] border-0 shadow-md">
                    ⭐ Mais popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${"highlighted" in plan && plan.highlighted ? "text-white" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${"highlighted" in plan && plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm ${"highlighted" in plan && plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>R$</span>
                  <span className={`text-4xl font-bold ${"highlighted" in plan && plan.highlighted ? "text-white" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${"highlighted" in plan && plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>/mês</span>
                </div>
                <p className={`text-sm mt-1 font-medium ${"highlighted" in plan && plan.highlighted ? "text-white/80" : "text-primary"}`}>
                  {plan.videosPerMonth} vídeos por mês
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${"highlighted" in plan && plan.highlighted ? "text-white" : "text-primary"}`} />
                    <span className={"highlighted" in plan && plan.highlighted ? "text-white/85" : "text-foreground"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <a href={getLoginUrl("/dashboard/assinatura")}>
                <Button
                  className={`w-full h-11 font-semibold ${"highlighted" in plan && plan.highlighted
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  Assinar {plan.name}
                </Button>
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Pagamento via Pix recorrente • Cancele quando quiser • Sem fidelidade
        </p>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    { icon: Zap, title: "Geração em minutos", desc: "Pipeline automatizada com BullMQ. Seus vídeos ficam prontos enquanto você atende outros clientes." },
    { icon: Shield, title: "Pagamento seguro", desc: "Pix recorrente via Woovi. Confirmação automática via webhook. Dados protegidos com HMAC SHA256." },
    { icon: Clock, title: "Vídeos por 7 dias", desc: "Cada vídeo fica disponível por 7 dias. Você recebe um email de aviso antes de expirar." },
    { icon: TrendingUp, title: "Mais vendas", desc: "Vídeos aumentam em até 403% o engajamento em anúncios imobiliários. Destaque-se da concorrência." },
    { icon: Film, title: "1080p HD", desc: "Output em MP4 H.264, 1920x1080, 30fps. Qualidade profissional para todas as plataformas." },
    { icon: Music, title: "Trilha sonora", desc: "5 trilhas royalty-free incluídas, escolhidas automaticamente conforme o estilo do vídeo." },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Recursos</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para se destacar
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      name: "Marcos Oliveira",
      role: "Corretor Autônomo • SP",
      text: "Antes eu gastava R$ 800 por vídeo com produtora. Com o Pluuu faço 5 vídeos por mês por R$ 97. A qualidade é impressionante.",
      avatar: "MO",
      stars: 5,
    },
    {
      name: "Ana Paula Costa",
      role: "Diretora Comercial • Imobiliária Viver",
      text: "Nossa equipe de 8 corretores usa o Pluuu. Os vídeos aumentaram o engajamento nos anúncios em mais de 300%. Vale cada centavo.",
      avatar: "AC",
      stars: 5,
    },
    {
      name: "Ricardo Mendes",
      role: "Corretor • CRECI 45.231",
      text: "Simples de usar, vídeo fica pronto rápido e o resultado parece produção profissional. Meus clientes ficam impressionados.",
      avatar: "RM",
      stars: 5,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Depoimentos</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Corretores que já transformaram seus anúncios
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.stars)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const faqs = [
    {
      q: "Quanto tempo leva para gerar um vídeo?",
      a: "O processo completo leva entre 10 e 20 minutos, dependendo da quantidade de fotos. Você recebe um email quando o vídeo estiver pronto.",
    },
    {
      q: "Quantas fotos posso enviar por vídeo?",
      a: "Todos os planos suportam até 10 fotos por vídeo. Recomendamos entre 5 e 8 fotos para o melhor resultado cinematográfico.",
    },
    {
      q: "Por quanto tempo o vídeo fica disponível?",
      a: "Os vídeos ficam disponíveis por 7 dias após a geração. Você recebe um email de aviso 2 dias antes de expirar. Após isso, pode criar um novo vídeo.",
    },
    {
      q: "Como funciona o pagamento via Pix?",
      a: "Utilizamos Pix recorrente via Woovi. Você paga mensalmente via QR Code. O acesso é liberado automaticamente após a confirmação do pagamento.",
    },
    {
      q: "Posso cancelar a assinatura a qualquer momento?",
      a: "Sim! Você pode cancelar quando quiser direto no painel de assinatura. Não há fidelidade ou multa por cancelamento.",
    },
    {
      q: "O vídeo pode ser usado em portais imobiliários?",
      a: "Sim! O vídeo é gerado em MP4 H.264 1080p, compatível com todos os portais imobiliários, redes sociais e WhatsApp.",
    },
    {
      q: "O que acontece se eu atingir o limite de vídeos do mês?",
      a: "Você pode fazer upgrade de plano ou adquirir vídeos avulsos por R$ 14,90 cada. O limite reseta todo mês na data de renovação da assinatura.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas frequentes
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section className="py-24 bg-gradient-to-br from-[oklch(0.45_0.22_265)] to-[oklch(0.35_0.25_280)]">
      <div className="container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar seus anúncios?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-10 text-lg">
            Junte-se a mais de 500 corretores que já usam o Pluuu para criar
            vídeos profissionais em minutos.
          </p>
          <a href={getLoginUrl("/dashboard")}>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-10 h-12 text-base shadow-xl"
            >
              Criar meu primeiro vídeo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
          <p className="text-white/50 text-sm mt-4">
            Sem cartão de crédito • Pix recorrente • Cancele quando quiser
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[oklch(0.10_0.03_265)] text-white/60 py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Pluuu</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Seus imóveis em movimento. Plataforma de geração de vídeos imobiliários
              profissionais com Inteligência Artificial.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="/lgpd" className="hover:text-white transition-colors">LGPD</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 Pluuu. Todos os direitos reservados.</p>
          <p>www.pluuu.com.br</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <VideoStyles />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  );
}
