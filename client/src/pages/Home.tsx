import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import {
  TrendingUp,
  Users,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  DollarSign,
  BarChart3,
  Link,
  Smartphone,
  Star,
  ChevronRight,
  ShoppingBag,
  Store,
  Percent,
  Clock,
  Wallet,
  MessageCircle,
} from "lucide-react";
import { Link as WouterLink } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const handleCTA = () => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight">Gluuu</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#beneficios" className="hover:text-foreground transition-colors">Benefícios</a>
            <a href="#cotas" className="hover:text-foreground transition-colors">Cotas</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <WouterLink href="/dashboard">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Meu Dashboard
                </Button>
              </WouterLink>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Entrar
                  </Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm">
                    Começar Agora
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 right-10 w-[300px] h-[300px] rounded-full bg-primary/8 blur-2xl" />
          <div className="absolute bottom-0 left-10 w-[200px] h-[200px] rounded-full bg-primary/5 blur-2xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(oklch(0.65 0.2 155) 1px, transparent 1px), linear-gradient(90deg, oklch(0.65 0.2 155) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              95% dos lucros distribuídos aos acionistas
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display leading-tight mb-6">
              Ganhe dinheiro com{" "}
              <span className="gradient-brand-text">cada compra</span>{" "}
              no Shopee e Mercado Livre
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              A Gluuu distribui <strong className="text-foreground">95% das comissões</strong> de afiliados
              diariamente para seus acionistas. Compre cotas, use nossos links e veja seu dinheiro crescer
              todo dia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green text-base px-8 h-14"
                onClick={handleCTA}
              >
                Tornar-se Acionista
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <a href="#como-funciona">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary text-base px-8 h-14 w-full sm:w-auto"
                >
                  Como Funciona
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { value: "95%", label: "Lucros distribuídos", icon: Percent },
                { value: "1M", label: "Cotas disponíveis", icon: BarChart3 },
                { value: "R$ 9,90", label: "Por cota", icon: DollarSign },
                { value: "Diário", label: "Distribuição", icon: Clock },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/50 bg-card/50 p-4 text-center backdrop-blur-sm"
                >
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold font-display text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-12 border-y border-border/30 bg-card/20">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Geramos comissões através dos maiores marketplaces do Brasil
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-card border border-border/50">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Shopee</div>
                <div className="text-xs text-muted-foreground">Links de afiliados</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-card border border-border/50">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Store className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Mercado Livre</div>
                <div className="text-xs text-muted-foreground">Links de afiliados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Modelo de Negócio
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Como a Gluuu funciona?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Um ciclo fechado e sustentável onde todos ganham juntos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                step: "01",
                icon: DollarSign,
                title: "Compre Cotas",
                desc: "Adquira cotas da Gluuu por R$ 9,90 cada via PIX. Cada cota representa sua participação nos lucros.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                step: "02",
                icon: Link,
                title: "Use os Links",
                desc: "Sempre que for comprar no Shopee ou Mercado Livre, use os links da Gluuu disponíveis no painel.",
                color: "text-blue-400",
                bg: "bg-blue-400/10",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Gluuu Gera Comissão",
                desc: "Cada compra feita via link da Gluuu gera comissão de afiliado para a empresa.",
                color: "text-purple-400",
                bg: "bg-purple-400/10",
              },
              {
                step: "04",
                icon: Wallet,
                title: "Receba Diariamente",
                desc: "95% das comissões são distribuídas todo dia proporcionalmente às suas cotas. Saque via PIX quando quiser.",
                color: "text-yellow-400",
                bg: "bg-yellow-400/10",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="absolute top-4 right-4 text-4xl font-bold font-display text-border/30 group-hover:text-primary/20 transition-colors">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2 font-display">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Cycle explanation */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2 font-display">
                  O Compromisso do Acionista
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Para que o ciclo funcione, <strong className="text-foreground">todo acionista deve usar exclusivamente os links da Gluuu</strong>{" "}
                  ao comprar no Shopee e Mercado Livre. Sem isso, não há comissão, não há distribuição,
                  e ninguém ganha. É um ciclo fechado: quanto mais compramos usando os links da Gluuu,
                  mais todos ganham. Por isso, participe da nossa{" "}
                  <strong className="text-primary">Comunidade WhatsApp</strong>{" "}
                  onde os links são atualizados diariamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20 px-4 bg-card/20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Por que a Gluuu?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Benefícios de ser acionista
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Renda Passiva Diária",
                desc: "Receba sua parte dos lucros todos os dias, automaticamente, sem precisar fazer nada além de usar os links.",
              },
              {
                icon: Shield,
                title: "Investimento Acessível",
                desc: "Comece com apenas R$ 9,90. Compre quantas cotas quiser e aumente sua participação nos lucros.",
              },
              {
                icon: BarChart3,
                title: "Dashboard Completo",
                desc: "Acompanhe seus ganhos em tempo real com gráficos detalhados, extrato e histórico completo.",
              },
              {
                icon: Wallet,
                title: "Saque via PIX",
                desc: "Solicite saques do seu saldo disponível a qualquer momento diretamente para sua chave PIX.",
              },
              {
                icon: Users,
                title: "Comunidade Ativa",
                desc: "Faça parte da comunidade WhatsApp onde os links diários são compartilhados e o grupo cresce junto.",
              },
              {
                icon: Zap,
                title: "Transparência Total",
                desc: "Veja exatamente quanto foi gerado, quanto foi distribuído e sua participação percentual no total.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cotas Section */}
      <section id="cotas" className="py-20 px-4">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Sistema de Cotas
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-6">
                Sua participação nos lucros da Gluuu
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                A Gluuu possui <strong className="text-foreground">1.000.000 de cotas</strong> disponíveis
                para seus acionistas. Cada cota custa <strong className="text-primary">R$ 9,90</strong> e
                representa sua participação proporcional nos lucros diários.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Compre via PIX de forma instantânea",
                  "Cotas bloqueadas por 12 meses (proteção do projeto)",
                  "Após 12 meses, pode revender para a Gluuu",
                  "Quanto mais cotas, maior sua fatia dos lucros",
                  "Acompanhe sua % do total no dashboard",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm"
                size="lg"
                onClick={handleCTA}
              >
                Comprar Cotas Agora
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Price card */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 glow-green">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Preço por cota</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30">Disponível</Badge>
                </div>
                <div className="text-4xl font-bold font-display text-primary mb-1">R$ 9,90</div>
                <div className="text-sm text-muted-foreground">por cota / pagamento via PIX</div>
              </div>

              {/* Example calculation */}
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <h4 className="font-semibold text-foreground mb-4 font-display">Exemplo de Ganhos</h4>
                <div className="space-y-3">
                  {[
                    { cotas: 10, investimento: "R$ 99,00", participacao: "0,001%", ganho: "R$ 0,95/dia*" },
                    { cotas: 100, investimento: "R$ 990,00", participacao: "0,01%", ganho: "R$ 9,50/dia*" },
                    { cotas: 1000, investimento: "R$ 9.900,00", participacao: "0,1%", ganho: "R$ 95,00/dia*" },
                  ].map((ex) => (
                    <div key={ex.cotas} className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0">
                      <div>
                        <span className="text-foreground font-medium">{ex.cotas} cotas</span>
                        <span className="text-muted-foreground ml-2">({ex.investimento})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-medium">{ex.ganho}</div>
                        <div className="text-muted-foreground text-xs">{ex.participacao} do total</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * Exemplo baseado em R$ 1.000/dia de comissão total distribuída. Valores reais variam conforme as comissões geradas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-card/20">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Dúvidas Frequentes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Como a Gluuu gera dinheiro?",
                a: "A Gluuu gera comissões de afiliados quando alguém compra no Shopee ou Mercado Livre usando nossos links. Esses links são exclusivos da Gluuu e rastreiam as vendas para gerar comissão.",
              },
              {
                q: "Por que devo usar os links da Gluuu?",
                a: "Porque apenas as compras feitas via links da Gluuu geram comissão para a empresa. Sem comissão, não há distribuição de lucros. É um ciclo fechado: use os links → Gluuu ganha comissão → você recebe sua parte.",
              },
              {
                q: "Quando recebo meus ganhos?",
                a: "Os ganhos são distribuídos diariamente. O admin lança o total de comissões do dia e o sistema distribui automaticamente 95% proporcional às suas cotas. O saldo fica disponível para saque imediatamente.",
              },
              {
                q: "Posso vender minhas cotas?",
                a: "Sim, mas apenas após 12 meses da compra. Esse período de lock existe para garantir a sustentabilidade do projeto. Após o prazo, você pode oferecer suas cotas de volta para a Gluuu recomprar.",
              },
              {
                q: "Como funciona o saque?",
                a: "Você solicita o saque do seu saldo disponível informando sua chave PIX. O pagamento é processado via Woovi e cai na sua conta em minutos.",
              },
              {
                q: "Quantas cotas posso comprar?",
                a: "Não há limite por acionista. A Gluuu tem 1.000.000 de cotas no total. Quanto mais cotas você tiver, maior será sua participação percentual nos lucros diários.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card p-6">
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{item.q}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="relative rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/10 blur-3xl rounded-full" />
            </div>
            <div className="relative">
              <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
                <Star className="w-3.5 h-3.5 mr-1.5" />
                Comece hoje mesmo
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-6">
                Pronto para ganhar com{" "}
                <span className="gradient-brand-text">cada compra</span>?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                Junte-se à comunidade Gluuu, compre suas primeiras cotas e comece a receber
                sua parte dos lucros ainda hoje.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green text-base px-10 h-14"
                  onClick={handleCTA}
                >
                  Tornar-se Acionista
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <a
                  href="https://chat.whatsapp.com/gluuu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary text-base px-10 h-14 w-full sm:w-auto"
                  >
                    <MessageCircle className="mr-2 w-5 h-5 text-green-400" />
                    Comunidade WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 px-4">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold font-display">Gluuu</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plataforma de distribuição de lucros de afiliados para acionistas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a></li>
                <li><a href="#cotas" className="hover:text-foreground transition-colors">Sistema de Cotas</a></li>
                <li><a href="#beneficios" className="hover:text-foreground transition-colors">Benefícios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Conta</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href={getLoginUrl()} className="hover:text-foreground transition-colors">
                    Entrar
                  </a>
                </li>
                <li>
                  <a href={getLoginUrl()} className="hover:text-foreground transition-colors">
                    Cadastrar
                  </a>
                </li>
                <li>
                  <WouterLink href="/dashboard" className="hover:text-foreground transition-colors">
                    Dashboard
                  </WouterLink>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Comunidade</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://chat.whatsapp.com/gluuu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="https://www.gluuu.com.br" className="hover:text-foreground transition-colors">
                    www.gluuu.com.br
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Gluuu. Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Investimentos em cotas envolvem riscos. Resultados passados não garantem resultados futuros.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
