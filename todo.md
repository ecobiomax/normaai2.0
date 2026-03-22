# Gluuu - TODO

## Status: MVP Completo ✅

## Fase 2: Schema e Estrutura Base
- [x] Schema do banco de dados (users, cotas, transações, ganhos diários, saques, links afiliados, notificações)
- [x] Helpers de banco de dados (db.ts)
- [x] Routers tRPC base
- [x] Identidade visual (cores, fontes, CSS global)

## Fase 3: Landing Page
- [x] Landing page institucional com hero section
- [x] Seção explicando o modelo de negócio
- [x] Seção de como funciona (passo a passo)
- [x] Seção de benefícios
- [x] CTA para login/cadastro
- [x] Footer com links

## Fase 4: Autenticação e Perfil
- [x] Página de perfil do usuário
- [x] Formulário de dados Woovi (nome, CPF, telefone, chave PIX)
- [x] Validação de dados obrigatórios
- [x] Atualização de perfil

## Fase 5: Sistema de Cotas
- [x] Página de compra de cotas
- [x] Integração Woovi para gerar cobrança PIX
- [x] Webhook para confirmar pagamento e creditar cotas
- [x] Controle de 1.000.000 cotas totais
- [x] Histórico de compras de cotas
- [x] Regra de lock 12 meses

## Fase 6: Sistema Bancário Interno
- [x] Lançamento diário de ganhos pelo admin
- [x] Distribuição automática de 95% proporcional às cotas
- [x] Atualização de saldo disponível por acionista
- [x] Histórico de distribuições

## Fase 7: Dashboard do Acionista
- [x] Gráfico de ganhos diários
- [x] Gráfico de ganhos semanais/mensais/anuais
- [x] Filtros de período
- [x] Extrato detalhado (ganhos + saques)
- [x] Barra de progresso de cotas (% do total)
- [x] Saldo disponível para saque
- [x] Solicitação de saque PIX
- [x] Aviso de comunidade WhatsApp (persistente)

## Fase 8: Painel Administrativo
- [x] Dashboard admin com métricas gerais
- [x] Lançamento diário de ganhos totais
- [x] Lista de acionistas e suas cotas
- [x] Controle de cotas disponíveis
- [x] Gerenciamento de links de afiliados
- [x] Aprovação/gestão de saques
- [x] Notificações para admin

## Fase 9: Webhooks e Links de Afiliados
- [x] Webhook Woovi para pagamentos de cotas
- [x] Webhook Woovi para confirmação de saques
- [x] Seção de links de afiliados (Shopee + Mercado Livre)
- [x] Botão de copiar link
- [x] Instruções de uso
- [x] Link para comunidade WhatsApp

## Fase 10: Testes e Entrega
- [x] Testes Vitest (19/19 passando)
- [x] Push para GitHub
- [x] Checkpoint final

## Próximas Melhorias (Pós-MVP)
- [ ] Configurar chave API Woovi real (WOOVI_API_KEY)
- [ ] Implementar saques automáticos via Woovi API
- [ ] Dashboard com gráficos acumulados anuais
- [ ] Sistema de recompra de cotas (após 12 meses)
- [ ] Notificações push via WhatsApp Business API
- [ ] Relatórios exportáveis (PDF/Excel)
