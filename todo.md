# Pluuu - TODO

## Fase 1: Infraestrutura e Banco de Dados
- [ ] Instalar dependências (bullmq, ioredis, nodemailer, ffmpeg-static, fluent-ffmpeg, multer, crypto, node-cron, ws)
- [ ] Schema Drizzle: users, subscriptions, videos, payments, videoClips
- [ ] Executar migration SQL
- [ ] Helpers de banco (db.ts)

## Fase 2: Landing Page
- [ ] Identidade visual Pluuu (cores, tipografia, CSS variables)
- [ ] Hero section com tagline "Seus imóveis em movimento"
- [ ] Seção "Como funciona" (3 passos)
- [ ] Seção de planos (Básico, Profissional, Agência)
- [ ] Seção de depoimentos placeholder
- [ ] FAQ
- [ ] Footer com links legais
- [ ] Navbar com CTA

## Fase 3: Autenticação e Dashboard
- [ ] Página de login/cadastro (corretor / imobiliária)
- [ ] Perfil do usuário editável
- [ ] Dashboard principal com resumo de plano e créditos
- [ ] Sidebar desktop + bottom nav mobile
- [ ] Listagem de vídeos com status e countdown de expiração
- [ ] Página de assinatura com QR Code Pix

## Fase 4: Wizard de Criação de Vídeo
- [ ] Etapa 1: Upload de fotos (drag & drop, reordenar, preview)
- [ ] Etapa 2: Informações do imóvel + estilo (Moderno, Luxo, Aconchegante, Minimalista, Clássico)
- [ ] Etapa 3: Confirmação e verificação de créditos
- [ ] Tela de processamento com progresso em tempo real (WebSocket)

## Fase 5: Pipeline BullMQ
- [ ] Job analyze-photos (Claude API → prompts cinematográficos JSON)
- [ ] Job generate-clips (Runway Gen-4 Turbo API → clips MP4)
- [ ] Job compose-final-video (FFmpeg: crossfade, trilha sonora, fade in/out)
- [ ] Upload clips e vídeo final para S3
- [ ] Atualização de progresso no banco
- [ ] WebSocket para progresso em tempo real

## Fase 6: Woovi Pix
- [ ] Criar cobrança Woovi (assinatura recorrente)
- [ ] Exibir QR Code + copia-e-cola
- [ ] Webhook POST /api/webhooks/woovi (payment.confirmed, payment.failed, subscription.cancelled)
- [ ] Validação HMAC SHA256 do webhook
- [ ] Idempotência (ignorar webhooks duplicados)
- [ ] Middleware checkActiveSubscription
- [ ] Reset de créditos mensais (cron mensal)

## Fase 7: Emails e Cron Jobs
- [ ] Email: boas-vindas + verificação
- [ ] Email: confirmação de pagamento
- [ ] Email: vídeo pronto com link de download (expira 7 dias)
- [ ] Email: assinatura vencida
- [ ] Cron job diário 03:00 → limpeza de vídeos expirados (>7 dias)
- [ ] Cron job mensal → reset de créditos

## Fase 8: Segurança e PWA
- [ ] Rate limiting nas rotas de API
- [ ] Validação de tipo/tamanho de arquivo no upload
- [ ] Headers de segurança (CSP, HSTS)
- [ ] PWA manifest + service worker
- [ ] Testes Vitest

## Concluídos
