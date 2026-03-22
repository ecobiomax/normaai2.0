import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link,
  Copy,
  CheckCircle,
  ShoppingBag,
  Store,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AffiliateLinks() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: links, isLoading, refetch } = trpc.affiliateLinks.list.useQuery();
  const trackClick = trpc.affiliateLinks.trackClick.useMutation();

  const shopeeLinks = links?.filter(l => l.platform === "shopee") ?? [];
  const mlLinks = links?.filter(l => l.platform === "mercadolivre") ?? [];

  const handleCopy = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copiado!");
    trackClick.mutate({ id });
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleOpen = (id: number, url: string) => {
    trackClick.mutate({ id });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout title="Links de Afiliados">
      <div className="container py-8 space-y-6 max-w-4xl">
        {/* Important notice */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Compromisso do Acionista Gluuu
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Sempre que for comprar no Shopee ou Mercado Livre,
                use os links abaixo.</strong> Apenas compras feitas via estes links geram comissão para a Gluuu.
                Sem comissão → sem distribuição → ninguém ganha. É um ciclo fechado que depende de todos nós.
              </p>
              <a
                href="https://chat.whatsapp.com/gluuu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Entrar na Comunidade WhatsApp para receber links diários
              </a>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : links?.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <Link className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold font-display mb-2">Nenhum link disponível</h3>
            <p className="text-sm text-muted-foreground">
              Os links de afiliados serão publicados em breve pelo administrador.
              Fique atento à comunidade WhatsApp!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Shopee Links */}
            {shopeeLinks.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold font-display">Shopee</h2>
                    <p className="text-xs text-muted-foreground">{shopeeLinks.length} link{shopeeLinks.length > 1 ? "s" : ""} disponível{shopeeLinks.length > 1 ? "is" : ""}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {shopeeLinks.map((link) => (
                    <div
                      key={link.id}
                      className="rounded-xl border border-border/50 bg-card p-4 hover:border-orange-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {link.title && (
                            <h4 className="font-medium text-foreground mb-1">{link.title}</h4>
                          )}
                          {link.description && (
                            <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {link.url}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {link.clickCount} clique{link.clickCount !== 1 ? "s" : ""}
                            </span>
                            {link.validUntil && (
                              <span className="text-xs text-muted-foreground">
                                Válido até {new Date(link.validUntil).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border"
                            onClick={() => handleCopy(link.id, link.url)}
                          >
                            {copiedId === link.id ? (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => handleOpen(link.id, link.url)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1.5" />
                            Abrir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mercado Livre Links */}
            {mlLinks.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold font-display">Mercado Livre</h2>
                    <p className="text-xs text-muted-foreground">{mlLinks.length} link{mlLinks.length > 1 ? "s" : ""} disponível{mlLinks.length > 1 ? "is" : ""}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {mlLinks.map((link) => (
                    <div
                      key={link.id}
                      className="rounded-xl border border-border/50 bg-card p-4 hover:border-yellow-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {link.title && (
                            <h4 className="font-medium text-foreground mb-1">{link.title}</h4>
                          )}
                          {link.description && (
                            <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {link.url}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {link.clickCount} clique{link.clickCount !== 1 ? "s" : ""}
                            </span>
                            {link.validUntil && (
                              <span className="text-xs text-muted-foreground">
                                Válido até {new Date(link.validUntil).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border"
                            onClick={() => handleCopy(link.id, link.url)}
                          >
                            {copiedId === link.id ? (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                            onClick={() => handleOpen(link.id, link.url)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1.5" />
                            Abrir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* How to use */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h3 className="font-semibold font-display mb-4">Como usar os links?</h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "Antes de comprar qualquer coisa no Shopee ou Mercado Livre, acesse esta página." },
              { step: "2", text: "Copie o link da plataforma desejada ou clique em 'Abrir'." },
              { step: "3", text: "Navegue normalmente pelo site e faça sua compra." },
              { step: "4", text: "A comissão é gerada automaticamente e distribuída para todos os acionistas." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {item.step}
                </div>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
