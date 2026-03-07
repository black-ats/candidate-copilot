# UX Rules - GoHire Copilot

## Regras de UX (MVP)

### Princípios
- **Sem fricção**: valor antes de pedir cadastro
- **Sem "coach genérico"**: respostas sempre baseadas em contexto/dados
- **Sem "IA intrusiva"**: IA sugere, não sobrescreve
- **Progressive disclosure**: primeiro Copilot, depois tracking, depois entrevistas

### Fluxo de Valor
```
Insight gratuito → Conta opcional → Tracking → Entrevista IA
```

## Copy & Tone (pt-BR)

### Linguagem
- Direta, humana, sem startupês
- "Decisão" > "otimização"
- Evitar termos de RH corporativo
- **Sempre com acentuação correta** (não escrever "decisao", "nao", "voce")

### Exemplos

**Bom:**
- "Leva menos de 2 minutos"
- "Com base no seu contexto"
- "Clareza para sua decisão"
- "Vamos analisar juntos?"

**Ruim:**
- "Aumente sua empregabilidade com IA"
- "Otimize sua jornada profissional"
- "Revolucione sua carreira"
- "Pipeline de oportunidades"

## Estados Obrigatórios

Toda interface deve ter:
- Loading state (skeleton ou spinner)
- Empty state (mensagem + CTA)
- Error state (mensagem clara + retry)
- Success state (feedback visual)

## Mobile First

### Princípios
- Testar sempre no mobile primeiro
- Layouts devem empilhar verticalmente em telas pequenas
- Touch targets mínimo 44x44px
- Evitar hover-only interactions

### Viewports de Teste (obrigatório)
- **iPhone SE**: 375px (mínimo suportado)
- **iPhone 14**: 390px (referência principal)
- **Desktop**: 1280px+

### Checklist Pre-Deploy

**Tap Targets:**
- [ ] Botões de ação com `min-h-[44px]`
- [ ] Botões de fechar/ícone com `min-w-[44px] min-h-[44px]`
- [ ] Tabs/navegação com `py-3.5` ou similar

**Layout:**
- [ ] Layouts flex usam `flex-col sm:flex-row`
- [ ] Nenhum scroll horizontal no mobile
- [ ] Cards com padding `p-4 sm:p-6` ou `p-6 sm:p-8`

**Tipografia:**
- [ ] Headings com escala gradual (`text-3xl sm:text-4xl lg:text-5xl`)
- [ ] Texto legível sem zoom

**Botões:**
- [ ] Textos longos têm versão curta no mobile
- [ ] CTAs principais não quebram em múltiplas linhas

### Erros Comuns a Evitar

| Erro | Solução |
|------|---------|
| `p-8` fixo em cards | Usar `p-4 sm:p-6 md:p-8` |
| `text-4xl sm:text-6xl` (pulo grande) | Usar `text-3xl sm:text-4xl lg:text-5xl` |
| `flex justify-between` sem empilhar | Usar `flex flex-col sm:flex-row` |
| `min-h-[280px]` fixo | Usar `min-h-[220px] sm:min-h-[280px]` |
| Botão close com `p-2.5` | Usar `p-3 min-w-[44px] min-h-[44px]` |
| `pl-6` em listas | Usar `pl-4 sm:pl-6` |

## Acessibilidade Básica
- Labels em todos os inputs
- Focus visível
- Contraste adequado (WCAG AA)
- Textos alternativos em imagens
