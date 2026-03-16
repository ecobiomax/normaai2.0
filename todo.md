# Memórias VIVA — TODO

## Fase 2: Schema do banco de dados e design system
- [x] Schema do banco de dados (plans, subscriptions, voice_profiles, video_jobs, terms_log, billing_records, audit_logs)
- [x] Design system: paleta de cores suaves (azul-ardósia + lavanda + dourado âmbar), tipografia, CSS global
- [x] Estrutura de rotas no App.tsx (landing, dashboard, planos, checkout, novo-video, meus-videos, perfis-de-voz, assinatura, legais)

## Fase 3: Landing Page
- [x] Hero section com headline emocional
- [x] Seção "Como funciona" (3 passos)
- [x] Tabela de planos com preços
- [x] FAQ sobre privacidade e uso ético
- [x] Footer com links legais
- [x] Navbar responsiva

## Fase 4: Autenticação e Termos
- [x] Autenticação via Manus OAuth
- [x] Pop-up de termos obrigatório (4 checkboxes, bloqueante)
- [x] Renovação de termos a cada 90 dias
- [x] Registro de aceite com IP e user-agent
- [x] Redirecionamento para planos pós-login

## Fase 5: Dashboard e Assinatura
- [x] AppLayout com sidebar escura (desktop) + header mobile
- [x] Header com créditos restantes e plano atual
- [x] Card de boas-vindas com progresso
- [x] Integração Woovi (Pix recorrente) — checkout com QR Code
- [x] Polling de confirmação de pagamento
- [x] Gestão de assinatura (upgrade, cancelamento, histórico)

## Fase 6: Fluxo de Criação de Vídeo
- [x] Passo 1: Selecionar/criar perfil de voz
- [x] Upload de áudio com preview
- [x] Integração ElevenLabs (clonagem de voz) — modo demo + real
- [x] Passo 2: Upload de foto com preview
- [x] Passo 3: Escrever mensagem com contador de caracteres
- [x] Passo 4: Resumo e geração de vídeo
- [x] Tela de loading com etapas visuais animadas
- [x] Pipeline assíncrono: ElevenLabs TTS → D-ID → marca d'água → S3

## Fase 7: Galeria e Perfis de Voz
- [x] Galeria de vídeos com grid responsivo
- [x] Player de vídeo inline
- [x] Ações: baixar, compartilhar, excluir
- [x] Filtros por status (todos, concluídos, processando, erro)
- [x] Expiração de vídeos baseada no plano
- [x] Gestão de perfis de voz com limite por plano
- [x] Rate limiting: máx 2 jobs simultâneos

## Fase 8: Páginas Legais e Admin
- [x] Página /termos (Termos de Uso completos)
- [x] Página /privacidade (Política de Privacidade LGPD)
- [x] Página /conduta (Política de Uso Aceitável)
- [x] Rota /admin/setup com checklist de integrações
- [x] 12 testes unitários Vitest passando
- [ ] Onboarding guiado (tour interativo) — pendente

## Pendente (aguardando chaves de API)
- [ ] Integrar ELEVENLABS_API_KEY para clonagem de voz real
- [ ] Integrar DID_API_KEY para lipsync real
- [ ] Integrar WOOVI_API_KEY para Pix recorrente real
- [ ] Aplicar marca d'água nos vídeos (aguardando marcadagua.webp)
- [ ] Webhook Woovi para confirmação automática de pagamento
- [ ] Configurar domínio personalizado (memoriasviva.com.br)
