# Roadmap — GoHire Copilot

> **Fonte unica de verdade** para discussoes de produto, backlog e futuro.
> Atualizado: Jan/2026

---

## Principios

- **Clareza para decisoes de carreira** (nao "um tracker de vagas")
- **Low friction**: menor atrito possivel para valor
- **Progressive disclosure**: revelar complexidade gradualmente
- **Copilot-centric**: features alimentam o Copilot com contexto

---

## Now (Em Execucao / Curto Prazo)

| Item | Descricao | Status | Plano/Link |
|------|-----------|--------|------------|
| **Contextualizacao de Entrevista** | Selecionar contexto (vaga cadastrada, ultimo insight, manual) antes de iniciar sessao | Pendente | `contextualizacao_entrevista_*.plan.md` (a criar) |
| **Copilot Showcase na LP** | Secao com exemplos visuais/animados do Copilot na landing page | Pendente | `lp_copilot_showcase_*.plan.md` (a criar) |
| **Auth Email OTP (default)** | Email OTP como padrao, Magic Link como secundario (reduz friccao) | Pendente | `email_otp_authentication_*.plan.md` (a criar) |

---

## Next (1-2 Sprints)

| Item | Descricao | Status | Plano/Link |
|------|-----------|--------|------------|
| **Indices de DB** | Adicionar indices para queries frequentes | Pendente | `.cursor/plans/refactory_infraestrutura_otimização_95e0dc24.plan.md` |
| **RPC Increment Atomico** | Usar RPC para incrementos atomicos (evitar race conditions) | Pendente | `.cursor/plans/refactory_infraestrutura_otimização_95e0dc24.plan.md` |
| **Fix/Limit Benchmark** | Corrigir e limitar funcao de benchmark | Pendente | `.cursor/plans/refactory_infraestrutura_otimização_95e0dc24.plan.md` |
| **Bundle Analyzer + Lazy Load** | Otimizar bundle e lazy load de componentes pesados | Pendente | `.cursor/plans/refactory_infraestrutura_otimização_95e0dc24.plan.md` |

---

## Later (Medio Prazo)

| Item | Descricao | Status | Plano/Link |
|------|-----------|--------|------------|
| **Componentizacao/Design System** | Tokens, Modal, EmptyState, Skeleton, refactors de cores | Pendente | `.cursor/plans/refactory_componentização_design_system_0e0bf98b.plan.md` |
| **Media/Baixa Prioridade Refactors** | Memoizacao, logger, a11y/seo, otimizacoes de IA | Pendente | `.cursor/plans/refactory_média_baixa_prioridade_66c4af49.plan.md` |

---

## Parking Lot (Ideias Discutidas, Sem Compromisso)

### Alta Prioridade (valor de produto)

| Ideia | Por Que Importa | Dependencias | Notas |
|-------|-----------------|--------------|-------|
| **Match Score CV ↔ Vaga** | Usuario entende gap entre CV e vaga; "why you didnt get called" | Upload CV (PDF) + fallback manual; LinkedIn publico (fragil) | Outputs: score, top 5 motivos, sugestoes (CV, projetos, cursos) |
| **Integracao ATS** | Sync automatico de status de vagas | Provedores externos, permissoes | Complexo; depende de discovery de provedores |
| **Career Coach IA** | Evolucao do Copilot para conselheiro estrategico | Historico de apps + entrevistas + CV | Feature grande; depende de Match Score |

### Media Prioridade

| Ideia | Por Que Importa | Dependencias | Notas |
|-------|-----------------|--------------|-------|
| **Notificacoes/Alertas** | Follow-up, entrevista, prazo | - | Push ou email |
| **Metas/Gamificacao** | Engajamento (streaks, badges) | - | Validar se faz sentido pro produto |
| **Helper/Onboarding** | Tour guiado para novos usuarios | - | - |

### Baixa Prioridade / V1+

| Ideia | Por Que Importa | Dependencias | Notas |
|-------|-----------------|--------------|-------|
| **Analytics Avancado** | Metricas mais detalhadas | - | - |
| **Auto-Apply** | Aplicar automaticamente em vagas | Integracao ATS | Complexo |
| **CV Builder Completo** | Criar CV dentro do produto | - | Scope grande |

---

## Dependencias / Sequencia Sugerida

```
1. Conversao/Ativacao: OTP + Showcase + Contextualizacao de Entrevista
   ↓
2. Estabilidade: Indices DB + RPC Increment (escala + race conditions)
   ↓
3. Manutencao: Componentizacao (reduz custo de novas features)
   ↓
4. Features Grandes: Match Score → ATS → Career Coach
```

---

## Estado Atual (Ja Entregue)

### Produto (MVP)
- Landing + Entry flow (insight sem cadastro)
- Tracking de aplicacoes (CRUD + timeline)
- Copilot contextual (insight/hero/interview)
- Interview Pro funcional + trial (1 free)
- Assinatura Free/Pro (Stripe)
- Analytics basico (PostHog + GA4)

### Estabilidade (Refactors Completos)
- Correcoes criticas: LGPD/Seguranca/SEO/A11y — `.cursor/plans/refactory_correções_críticas_0efeb8d2.plan.md` ✅
- Alta prioridade: performance/estado/observabilidade — `.cursor/plans/refactory_alta_prioridade_82b3adfb.plan.md` ✅

---

## Links para Planos

| Plano | Status |
|-------|--------|
| `refactory_correções_críticas_0efeb8d2.plan.md` | ✅ Completo |
| `refactory_alta_prioridade_82b3adfb.plan.md` | ✅ Completo |
| `refactory_infraestrutura_otimização_95e0dc24.plan.md` | ⏳ Pendente |
| `refactory_componentização_design_system_0e0bf98b.plan.md` | ⏳ Pendente |
| `refactory_média_baixa_prioridade_66c4af49.plan.md` | ⏳ Pendente |

---

## Como Atualizar Este Documento

Ao discutir ideias de produto:
1. Registrar a ideia na secao apropriada (Now/Next/Later/Parking Lot)
2. Documentar: **por que importa** + **dependencias** + **notas**
3. Se criar plano de execucao, adicionar link na coluna "Plano/Link"
4. Ao completar item, mover para "Estado Atual" com ✅
