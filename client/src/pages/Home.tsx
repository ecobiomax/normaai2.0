import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Heart,
  Mic,
  Image,
  MessageSquare,
  Video,
  Check,
  ChevronRight,
  Star,
  Shield,
  Lock,
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const PLANS = [
  {
    slug: "semente",
    name: "Semente",
    price: "R$ 24,90",
    period: "/mês",
    videos: 3,
    duration: "30 segundos",
    voices: 1,
    quality: "HD 720p",
    storage: "30 dias",
    highlight: false,
    description: "Para começar a preservar memórias",
  },
  {
    slug: "memoria",
    name: "Memória",
    price: "R$ 59,90",
    period: "/mês",
    videos: 10,
    duration: "45 segundos",
    voices: 2,
    quality: "Full HD 1080p",
    storage: "90 dias",
    highlight: true,
    description: "O mais escolhido pelas famílias",
  },
  {
    slug: "presenca",
    name: "Presença",
    price: "R$ 157,00",
    period: "/mês",
    videos: 30,
    duration: "60 segundos",
    voices: 5,
    quality: "Full HD 1080p",
    storage: "Permanente",
    highlight: false,
    description: "Para guardar para sempre",
  },
];

const FAQ_ITEMS = [
  {
    question: "Como funciona a clonagem de voz?",
    answer:
      "Você envia um áudio de pelo menos 30 segundos com a voz da pessoa. Nossa tecnologia analisa as características únicas da voz e cria um clone digital fiel. A partir daí, qualquer texto que você digitar será falado com a voz clonada.",
  },
  {
    question: "Meus dados e arquivos estão seguros?",
    answer:
      "Sim. Todos os arquivos são criptografados em trânsito e em repouso. Utilizamos AWS S3 com políticas de acesso restrito. Apenas você tem acesso aos seus vídeos. Cumprimos integralmente a LGPD.",
  },
  {
    question: "Posso usar a voz e imagem de qualquer pessoa?",
    answer:
      "Não. Você deve ter autorização legal para usar a voz e imagem da pessoa. Isso inclui ser familiar direto de pessoa falecida, ter autorização expressa da pessoa viva, ou ser a própria pessoa. O uso indevido é crime e a plataforma coopera com autoridades.",
  },
  {
    question: "Os vídeos têm marca d'água?",
    answer:
      "Sim, todos os vídeos gerados possuem a marca d'água discreta do Memórias VIVA, garantindo a rastreabilidade e autenticidade do conteúdo.",
  },
  {
    question: "O que acontece se eu cancelar minha assinatura?",
    answer:
      "Você mantém acesso à plataforma até o fim do período pago. Não há reembolso proporcional. Seus vídeos ficam disponíveis conforme o prazo do plano contratado.",
  },
  {
    question: "Os créditos não usados acumulam para o mês seguinte?",
    answer:
      "Não. Os créditos mensais não acumulam. Eles são renovados a cada ciclo de cobrança. Recomendamos usar todos os créditos antes da data de renovação.",
  },
  {
    question: "Qual a qualidade dos vídeos gerados?",
    answer:
      "Os vídeos são gerados com sincronização labial realista usando tecnologia de ponta. O Plano Semente gera em HD 720p, enquanto os planos Memória e Presença geram em Full HD 1080p.",
  },
  {
    question: "Como é feito o pagamento?",
    answer:
      "Todos os pagamentos são feitos via Pix recorrente (assinatura mensal) através da plataforma Woovi. Você receberá um QR Code Pix a cada renovação mensal.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const ctaHref = isAuthenticated ? "/dashboard" : getLoginUrl();

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary/20" />
            <span className="font-semibold text-foreground text-lg tracking-tight">
              Memórias <span className="text-primary">VIVA</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">
              Como funciona
            </a>
            <a href="#planos" className="hover:text-foreground transition-colors">
              Planos
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">Meu painel</Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button size="sm">Começar agora</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section className="hero-gradient pt-16 pb-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5 text-xs font-medium tracking-wide"
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            Tecnologia de IA com propósito emocional
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold leading-tight text-foreground mb-6">
            Ouça novamente{" "}
            <span className="text-gradient italic">a voz de quem</span>
            <br />
            você ama
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Envie uma foto e um áudio de alguém especial. Escreva uma mensagem.
            Receba um vídeo realista com sincronização labial — como se aquela
            pessoa estivesse falando com você hoje.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href={ctaHref}>
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 py-6">
                Criar minha primeira memória
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 text-base px-8 py-6"
              onClick={() => setVideoPlaying(true)}
            >
              <Play className="w-4 h-4" />
              Ver demonstração
            </Button>
          </div>

          {/* Video demo placeholder */}
          <div className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-muted aspect-video">
            {videoPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/5">
                <p className="text-muted-foreground text-sm">Vídeo demo em breve</p>
              </div>
            ) : (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                onClick={() => setVideoPlaying(true)}
              >
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-1" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Assista como funciona
                </p>
                {/* Animated waveform decoration */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1 opacity-30">
                  {[3, 5, 8, 6, 10, 7, 4, 9, 5, 7, 3, 6, 8, 5, 4].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{
                        height: `${h * 3}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social proof */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary" />
              <span>LGPD compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary" />
              <span>Dados criptografados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-accent-foreground fill-accent-foreground" />
              <span>Tecnologia de ponta</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Como funciona ───────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-24 px-4 bg-background">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-xs tracking-wide">
              Simples e intuitivo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-4">
              Em 4 passos, uma memória viva
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Sem conhecimento técnico necessário. Qualquer pessoa consegue criar
              em poucos minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: Mic,
                title: "Envie o áudio",
                desc: "Faça upload de um áudio com a voz da pessoa. Quanto mais longo, mais fiel o clone.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                step: "02",
                icon: Image,
                title: "Envie a foto",
                desc: "Uma foto nítida do rosto, de frente, com boa iluminação. JPG, PNG ou WEBP.",
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                step: "03",
                icon: MessageSquare,
                title: "Escreva a mensagem",
                desc: "Digite o que você gostaria de ouvir. Pode ser uma declaração, um conselho, um abraço em palavras.",
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                step: "04",
                icon: Video,
                title: "Receba o vídeo",
                desc: "Em minutos, seu vídeo com sincronização labial realista estará pronto para assistir e guardar.",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-card rounded-2xl p-6 border border-border card-hover"
              >
                <div className="text-xs font-mono text-muted-foreground/50 mb-4 font-medium">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
                {i < 3 && (
                  <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Planos ──────────────────────────────────────────────────────────── */}
      <section id="planos" className="py-24 px-4 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-xs tracking-wide">
              Pix recorrente — sem cartão de crédito
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-4">
              Escolha seu plano
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Sem período de teste gratuito. Acesso completo imediatamente após o
              pagamento confirmado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.slug}
                className={`relative bg-card rounded-2xl border-2 p-6 flex flex-col card-hover ${
                  plan.highlight
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-medium shadow-sm">
                      Mais popular
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-1">
                    Plano {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    `${plan.videos} vídeos por mês`,
                    `Duração máx. ${plan.duration}`,
                    `${plan.voices} clone${plan.voices > 1 ? "s" : ""} de voz`,
                    plan.quality,
                    `Armazenamento: ${plan.storage}`,
                    "Pix recorrente",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{feat}</span>
                    </li>
                  ))}
                </ul>

                <a href={getLoginUrl()}>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    size="lg"
                  >
                    Assinar com Pix
                  </Button>
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Pagamento via Pix recorrente. Cancele quando quiser. Acesso mantido até o fim do período pago.
          </p>
        </div>
      </section>

      {/* ─── Depoimentos placeholder ─────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-background">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold text-foreground mb-4">
              Histórias que tocam o coração
            </h2>
            <p className="text-muted-foreground">
              Pessoas que usaram o Memórias VIVA para reviver momentos preciosos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Ana Paula S.",
                text: "Perdi meu pai há dois anos. Com o Memórias VIVA, ouvi ele me dizer que estava orgulhoso de mim. Chorei de gratidão.",
                stars: 5,
              },
              {
                name: "Carlos M.",
                text: "Minha avó faleceu sem poder se despedir dos netos. Criamos um vídeo dela desejando feliz aniversário para minha filha. Inesquecível.",
                stars: 5,
              },
              {
                name: "Fernanda L.",
                text: "A qualidade da sincronização labial é impressionante. Parece que minha mãe está realmente falando. Muito emocionante.",
                stars: 5,
              },
            ].map((t, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4 italic">
                  "{t.text}"
                </p>
                <p className="text-xs font-medium text-muted-foreground">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4 bg-muted/30">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-xs tracking-wide">
              Dúvidas frequentes
            </Badge>
            <h2 className="text-3xl font-serif font-semibold text-foreground mb-4">
              Perguntas e respostas
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-5 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── CTA Final ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-primary">
        <div className="container max-w-2xl mx-auto text-center">
          <Heart className="w-10 h-10 text-primary-foreground/60 mx-auto mb-6 fill-primary-foreground/20" />
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-primary-foreground mb-4">
            Preserve quem você ama
          </h2>
          <p className="text-primary-foreground/70 mb-8 text-lg leading-relaxed">
            Cada memória é única. Não deixe o tempo apagar a voz e o sorriso de
            quem faz parte da sua história.
          </p>
          <a href={ctaHref}>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base px-8 py-6"
            >
              Criar minha primeira memória
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-background border-t border-border py-12 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary/20" />
              <span className="font-semibold text-foreground">
                Memórias <span className="text-primary">VIVA</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/termos" className="hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link href="/privacidade" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link href="/conduta" className="hover:text-foreground transition-colors">
                Política de Conduta
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2025 Memórias VIVA. Todos os direitos reservados.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              Esta plataforma utiliza inteligência artificial para fins emocionais e memoriais.
              O uso indevido para criar deepfakes ou conteúdo fraudulento é crime previsto na
              legislação brasileira. Todos os acessos são registrados e cooperamos plenamente
              com autoridades competentes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
