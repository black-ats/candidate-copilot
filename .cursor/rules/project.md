# GoHire Copilot - Project Rules

## Idioma
- Responder em Português (pt-BR)
- Código e comentários em Português
- UI text em Português
- **SEMPRE usar acentos, cedilhas e diacríticos corretos** (não escrever "nao", "codigo", "decisao" etc.)

## Antes de Codar

1. Ler `AGENTS.md` para arquitetura
2. Verificar `.cursor/plans/` para planos existentes
3. Verificar rules relacionadas ao tópico

## Rules Disponíveis

| Arquivo | Conteúdo |
|---------|----------|
| `product.md` | North Star, Product Truths, Planos |
| `ux.md` | UX Skills, Copy, Tom, Estados |
| `design.md` | Paleta, Componentes, Spacing |
| `ai.md` | Postura Copilot, Guardrails, Formatos |
| `engineering.md` | Stack, Arquitetura, Padrões |
| `patterns.md` | Code snippets reutilizáveis |
| `workflow.md` | DoD, PRs, Commits |

## Não Fazer

- Criar API routes sem necessidade (usar Server Actions)
- Adicionar dependências sem verificar se existe similar
- Usar `any` type
- Commitar `.env`
- Responder em inglês (a menos que pedido)
- Criar features que não conectam com o Copilot
- Ignorar mobile
- Escrever português sem acentos/diacríticos (ex.: "nao" em vez de "não")

## Sempre Fazer

- Usar `@ui/components` para primitivos
- Verificar limites de subscription antes de features Pro
- Testar no mobile
- Incluir estados (loading, empty, error)
- Manter copy em pt-BR com acentuação correta
