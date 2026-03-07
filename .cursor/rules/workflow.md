# Workflow Rules - GoHire Copilot

## Definition of Done (DoD)

Uma feature só está pronta quando:
- [ ] Entrega valor claro ao usuário (não só UI)
- [ ] Sem travar fluxo por IA (fallbacks)
- [ ] Tem estados: loading, empty, error, success
- [ ] Acessível (labels, focus, contraste)
- [ ] Mobile ok
- [ ] Copy final pt-BR com acentuação correta

## Checklist Pre-Commit

- [ ] `npm run lint` passa
- [ ] Testado no mobile
- [ ] Copy revisada (pt-BR com acentos/diacríticos corretos)
- [ ] Sem regressão no "wow moment"
- [ ] Types corretos (sem `any`)

## Padrões de PR

### Tamanho
- PR pequeno e revisável
- Uma feature/fix por PR

### Descrição
```markdown
## O que muda
[Descrição curta]

## Screenshot/Video
[Anexar visual]

## Checklist
- [ ] Testado mobile
- [ ] Copy pt-BR
- [ ] Sem regressões
```

## Decisions Log

Toda decisão importante vira doc em `/docs/decisions/`:
- Formato: `YYYY-MM-DD-descricao.md`
- Conteúdo: Contexto, Opções, Decisão, Consequências

Exemplos:
- `2026-01-29-auth-supabase.md`
- `2026-01-30-interview-trial.md`

## Plans

Planos de features em `.cursor/plans/`:
- Criados pelo agente via `CreatePlan`
- Atualizados conforme execução
- Marcados como completed quando finalizados

## Branches

- `main` - produção
- `feat/xxx` - features
- `fix/xxx` - bug fixes
- `chore/xxx` - manutenção

## Commits

Formato: `tipo: descrição curta`

Tipos:
- `feat:` nova feature
- `fix:` bug fix
- `refactor:` refatoração
- `style:` estilo (CSS, formatação)
- `docs:` documentação
- `chore:` manutenção
