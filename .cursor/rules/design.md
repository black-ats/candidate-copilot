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
