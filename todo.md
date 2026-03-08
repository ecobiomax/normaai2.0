# VibeDia - Portal de Frases e Horóscopo

## Banco de Dados
- [x] Tabela categories (id, name, slug, description, icon)
- [x] Tabela messages (id, category_id, text, image_url, slug, created_at)
- [x] Tabela horoscopes (id, sign, date, text, image_url, slug, created_at)
- [x] Tabela generationLogs para rastrear gerações de conteúdo
- [x] Migração do banco de dados

## Backend (tRPC Routers)
- [x] Router de mensagens: listagem por categoria, busca por slug, geração via IA
- [x] Router de horóscopo: listagem por signo/data, geração via IA
- [x] Router de categorias: listagem de categorias
- [x] Router de admin: painel de controle, geração manual
- [x] Endpoint sitemap.xml dinâmico (sitemap index + sub-sitemaps)
- [x] Endpoint RSS feed (/feed.xml)
- [x] Endpoint robots.txt
- [x] Cron job: geração automática de mensagens a cada 2 horas
- [x] Cron job: geração automática de horóscopo diário às 06:00 BRT
- [x] generateAllMessages: gera mensagens para todas as categorias de uma vez

## Frontend - Layout e Navegação
- [x] Design system: cores creme/dourado/azul marinho, geometria sagrada
- [x] Header com navegação principal e logo VibeDia
- [x] Footer com links e informações do portal
- [x] Layout responsivo mobile-first
- [x] Espaços para banners de monetização (topo, meio, rodapé)
- [x] Fontes Google: Playfair Display + Cormorant Garamond + Inter

## Frontend - Páginas Principais
- [x] Home page com destaques do dia (horóscopo + mensagens)
- [x] Página de categoria dinâmica (todas as 8 categorias)
- [x] Página individual de mensagem com slug dinâmico
- [x] Página de horóscopo geral: /horoscopo-de-hoje
- [x] Páginas de signo: /horoscopo/[signo]
- [x] Páginas de signo por data: /horoscopo/[signo]/[data]

## Frontend - Funcionalidades
- [x] Botões de compartilhamento: WhatsApp, Facebook, Instagram, X/Twitter, Copiar link
- [x] SEO dinâmico: title, meta description, Open Graph, Twitter Card, canonical
- [x] Schema.org markup: Article, BlogPosting, WebPage, Breadcrumb
- [x] Breadcrumb navigation
- [x] Links internos automáticos (mensagens relacionadas, outros signos)
- [x] Paginação de conteúdo nas páginas de categoria

## Páginas Institucionais
- [x] Página Sobre (/sobre)
- [x] Página Política de Privacidade (/politica-de-privacidade) com e-mail jrmemachado@gmail.com

## Painel Admin
- [x] Dashboard com estatísticas (total mensagens, horóscopo, categorias)
- [x] Geração manual de conteúdo via IA por categoria
- [x] Geração manual de horóscopo para todos os 12 signos
- [x] Geração em lote para todas as categorias
- [x] Logs de geração de conteúdo

## SEO e Performance
- [x] Sitemap index (/sitemap.xml)
- [x] Sub-sitemaps: mensagens, horóscopo, categorias, recentes
- [x] RSS feed (/feed.xml)
- [x] robots.txt
- [x] Fontes otimizadas via Google Fonts
- [x] favicon.svg com logo VibeDia
- [x] Schema.org WebSite no HTML base
- [x] Open Graph e Twitter Card tags

## Testes
- [x] Testes vitest: 13 testes passando (auth, content, admin protection)

## Geração com OpenAI (nova fase)
- [x] Configurar OPENAI_API_KEY como secret
- [x] Adaptar geração de texto para usar OpenAI GPT-4o-mini diretamente
- [x] Implementar geração de imagens com DALL-E 3 para mensagens
- [x] Implementar geração de imagens com DALL-E 3 para horóscopo (arte por signo)
- [x] Salvar imagens geradas no S3 e armazenar URL no banco
- [x] Exibir imagens nas páginas de mensagem e horóscopo
- [x] Atualizar cron jobs para usar OpenAI GPT-4o-mini
- [x] Adicionar toggle "Gerar com Imagem (DALL-E 3)" no painel admin
- [x] 15 testes vitest passando (incluindo validação da chave OpenAI)

## Fase 3 - Completar automação e segurança admin
- [x] Ativar geração de imagens nos cron jobs automáticos (horóscopo + mensagens)
- [x] Verificar e completar geração de imagem em todas as páginas do site
- [x] Autenticação exclusiva no admin: apenas jrmemachado/davilorena (login por usuário+senha próprio, sem OAuth)
- [x] Bloquear qualquer outro acesso ao painel admin
- [x] Testes de segurança do admin (5 testes: rejeita credenciais erradas, aceita corretas, bloqueia sem sessão)

## Fase 4 - Melhorias UX e Admin Banner

- [x] Schema: tabela banners (id, imageUrl, fileKey, affiliateLink, position, active, createdAt)
- [x] Backend: procedure uploadBanner (upload S3 + salvar no banco)
- [x] Backend: procedure getBanners e updateBanner
- [x] Admin: seção de upload de banner com preview, link de afiliado e toggle ativo/inativo
- [x] BannerAd.tsx: buscar banner ativo do banco via tRPC e exibir com link de afiliado
- [x] Fonte Inter: otimizada para mobile (clamp, line-height 1.75, letter-spacing)
- [x] Scroll ao topo: ScrollToTop component no App.tsx para toda navegação

## Fase 5 - Banners, Mobile Fix e Analytics
- [ ] BannerAd: padronizar 320×100 em todos os lugares, puxar do banco (posição "mid" como padrão)
- [ ] Header: corrigir overflow mobile (largura responsiva, sem scroll horizontal)
- [ ] Google Analytics: injetar código G-YKZF5094C7 no index.html
