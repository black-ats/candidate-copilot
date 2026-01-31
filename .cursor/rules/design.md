# Design System Rules - GoHire Copilot

## Direcao de Marca
- Sensacao: **confianca, calma, clareza, premium**
- Nao pode: neon/cyberpunk/gamer/corporativo frio

## Paleta "Warm Intelligence"

```css
/* Cores principais */
--navy: #0F1F2E;      /* Estrutura, texto */
--sand: #F5F3EE;      /* Background */
--stone: #C8C1B8;     /* Borders, secundario */
--amber: #F4B860;     /* CTA primario, "decisao" */
--teal: #4FA3A5;      /* Links, estados ativos */
```

### Uso das Cores

| Cor | Uso |
|-----|-----|
| Navy | Texto principal, headers, estrutura |
| Sand | Background de paginas |
| Stone | Borders, textos secundarios, dividers |
| Amber | CTA primario, badges importantes, highlights |
| Teal | Links, botoes secundarios, estados ativos |

## Componentes

### Botoes
```tsx
<Button>Primario (amber)</Button>
<Button variant="secondary">Secundario (outline)</Button>
<Button variant="ghost">Ghost (texto)</Button>
```

**Regra**: Apenas 1 CTA primario (amber) por secao.

### Cards
- Fundo claro (`bg-white` ou `bg-sand`)
- Sombra suave (`shadow-sm` ou `shadow-md`)
- Bordas discretas (`border border-stone/30`)
- Variant `elevated` para destaque

### Badges
```tsx
<Badge>Default</Badge>
<Badge className="bg-teal/20 text-teal">Ativo</Badge>
<Badge className="bg-amber/20 text-amber">Destaque</Badge>
```

### Botao do Copilot

**IMPORTANTE**: Todo botao que abre o Copilot DEVE usar o componente `CopilotButton`:

```tsx
import { CopilotButton } from '@/components/copilot-button'

// Padrao - usar size="sm" para manter compacto
<CopilotButton size="sm" onClick={handleClick}>
  Dicas no Copilot
</CopilotButton>

// Variante text - apenas texto
<CopilotButton size="sm" variant="text" onClick={handleClick}>
  Perguntar ao Copilot
</CopilotButton>
```

**Identidade visual**:
- Icone: `Sparkles` (lucide-react) - automatico via `showIcon={true}`
- Gradiente: `from-violet-500 via-purple-500 to-fuchsia-500`
- Hover: `from-violet-400 via-purple-400 to-fuchsia-400`
- Texto branco, fonte medium

**Regras**:
- NUNCA criar botao do Copilot com estilo customizado
- SEMPRE usar `CopilotButton` para consistencia
- SEMPRE usar `size="sm"` para manter o botao compacto
- Para contextos especificos, criar wrapper (ex: `BenchmarkCopilotButton`)

**Exemplo de wrapper para contexto especifico**:
```tsx
// apps/web/src/app/dashboard/aplicacoes/_components/benchmark-copilot-button.tsx
import { CopilotButton } from '@/components/copilot-button'
import { useCopilotDrawer, type BenchmarkContext } from '@/hooks/use-copilot-drawer'

export function BenchmarkCopilotButton({ context }: { context: BenchmarkContext }) {
  const { openWithBenchmarkContext } = useCopilotDrawer()
  return (
    <CopilotButton size="sm" onClick={() => openWithBenchmarkContext(context)}>
      Dicas no Copilot
    </CopilotButton>
  )
}
```

## Spacing

Use espacamento consistente:
- `gap-2` (8px) - entre elementos inline
- `gap-4` (16px) - entre elementos relacionados
- `gap-6` (24px) - entre secoes
- `gap-8` (32px) - entre blocos

## Typography

- Titulos: `font-semibold` ou `font-bold`
- Corpo: `font-normal`
- Secundario: `text-navy/70` ou `text-navy/60`
- Pequeno: `text-sm` ou `text-xs`

## Responsividade

Breakpoints Tailwind:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+

Padrao mobile-first:
```tsx
<div className="flex flex-col sm:flex-row">
```

---

## Mobile Patterns (OBRIGATORIO)

### 1. Tap Targets - Minimo 44x44px

Todo elemento clicavel DEVE ter no minimo 44x44px para acessibilidade touch.

```tsx
// ERRADO - tap target muito pequeno
<button className="p-2.5">
  <X className="w-5 h-5" />
</button>

// CERTO - tap target adequado
<button className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
  <X className="w-5 h-5" />
</button>

// Para botoes com texto curto
<button className="px-4 py-3.5 min-h-[44px]">
  Ação
</button>
```

### 2. Padding Responsivo

Cards e secoes DEVEM ter padding menor no mobile.

```tsx
// ERRADO - padding fixo
<Card className="p-8">

// CERTO - padding responsivo
<Card className="p-4 sm:p-6 md:p-8">

// Para secoes internas
<div className="p-4 sm:p-6">
```

### 3. Tipografia Responsiva

Headings DEVEM escalar de forma suave.

```tsx
// ERRADO - pulo muito grande
<h1 className="text-4xl sm:text-6xl">

// CERTO - escala gradual
<h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">

// Para textos secundarios
<p className="text-base sm:text-lg">
```

### 4. Layout Flex Responsivo

Layouts que empilham no mobile DEVEM usar flex-col com breakpoint.

```tsx
// ERRADO - pode quebrar no mobile
<div className="flex items-center justify-between">

// CERTO - empilha no mobile
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:justify-between">
```

### 5. Min-Height Responsivo

Containers com altura minima DEVEM ser menores no mobile.

```tsx
// ERRADO - altura fixa
<div className="min-h-[280px]">

// CERTO - altura responsiva
<div className="min-h-[220px] sm:min-h-[280px]">
```

### 6. Texto Longo em Botoes

Botoes com texto longo DEVEM ter versao curta no mobile.

```tsx
// ERRADO - texto muito longo pode quebrar
<Button>
  Comecar minha entrevista gratis
  <ArrowRight className="ml-2 w-5 h-5" />
</Button>

// CERTO - texto responsivo
<Button>
  <span className="sm:hidden">Comecar gratis</span>
  <span className="hidden sm:inline">Comecar minha entrevista gratis</span>
  <ArrowRight className="ml-2 w-5 h-5" />
</Button>
```

### 7. List Padding

Listas com marcadores DEVEM ter padding menor no mobile.

```tsx
// ERRADO - pode causar overflow
<ul className="list-disc pl-6">

// CERTO - padding responsivo
<ul className="list-disc pl-4 sm:pl-6">
```

### 8. Gaps Responsivos

Gaps entre elementos DEVEM diminuir no mobile.

```tsx
// ERRADO - gap fixo grande
<div className="flex gap-6">

// CERTO - gap responsivo
<div className="flex gap-4 sm:gap-6">
```

### Checklist Mobile (antes de finalizar)

- [ ] Tap targets >= 44px (botoes, links, icones clicaveis)
- [ ] Padding responsivo em cards/secoes
- [ ] Tipografia com escala gradual
- [ ] Layouts flex-col no mobile
- [ ] Min-heights responsivos
- [ ] Textos longos em botoes com versao curta
- [ ] Testar em 375px (iPhone SE) e 390px (iPhone 14)
