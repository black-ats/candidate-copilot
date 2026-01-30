'use client'

import { 
  TrendingUp, Clock, Target, Lightbulb, 
  Sparkles, HelpCircle, AlertTriangle, ListChecks 
} from 'lucide-react'
import type { SuggestedQuestion } from '@/lib/copilot/types'
import type { LucideIcon } from 'lucide-react'

interface ExtendedQuestion extends SuggestedQuestion {
  icon: LucideIcon
}

const defaultQuestions: ExtendedQuestion[] = [
  // Metricas
  {
    id: 'taxa-conversao',
    label: 'Qual minha taxa de conversao?',
    category: 'metricas',
    icon: TrendingUp,
  },
  {
    id: 'aguardando',
    label: 'Quantas aplicacoes aguardando resposta?',
    category: 'metricas',
    icon: Clock,
  },
  // Proximos passos
  {
    id: 'follow-up',
    label: 'Quais empresas devo fazer follow-up?',
    category: 'proximos_passos',
    icon: Target,
  },
  {
    id: 'melhorar',
    label: 'O que posso fazer para melhorar?',
    category: 'proximos_passos',
    icon: Lightbulb,
  },
  // Insights
  {
    id: 'ultimo-insight',
    label: 'Me lembre do meu ultimo insight',
    category: 'insights',
    icon: Sparkles,
  },
  {
    id: 'recomendacoes',
    label: 'Quais foram suas recomendacoes?',
    category: 'insights',
    icon: Lightbulb,
  },
  {
    id: 'riscos',
    label: 'Quais riscos voce identificou?',
    category: 'insights',
    icon: AlertTriangle,
  },
  {
    id: 'proximos-passos',
    label: 'Quais proximos passos sugeriu?',
    category: 'insights',
    icon: ListChecks,
  },
  // Analise
  {
    id: 'padroes',
    label: 'Quais padroes voce identifica?',
    category: 'analise',
    icon: HelpCircle,
  },
]

const categoryLabels: Record<string, string> = {
  metricas: 'Metricas',
  proximos_passos: 'Proximos Passos',
  insights: 'Seus Insights',
  analise: 'Analise',
}

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
  compact?: boolean
  categories?: string[]
}

export function SuggestedQuestions({ 
  onSelect, 
  compact = false,
  categories 
}: SuggestedQuestionsProps) {
  // Filtrar por categorias se especificado
  const questions = categories 
    ? defaultQuestions.filter(q => categories.includes(q.category))
    : defaultQuestions
  
  if (compact) {
    // Modo compacto: apenas 4 perguntas principais
    const compactQuestions = questions.slice(0, 4)
    
    return (
      <div className="flex flex-wrap gap-2">
        {compactQuestions.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelect(q.label)}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-stone/10 hover:bg-stone/20 transition-colors
              text-xs text-navy/80 hover:text-navy
            "
          >
            <q.icon className="w-3 h-3" />
            <span>{q.label}</span>
          </button>
        ))}
      </div>
    )
  }
  
  // Agrupar por categoria
  const grouped = questions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = []
    }
    acc[q.category].push(q)
    return acc
  }, {} as Record<string, ExtendedQuestion[]>)
  
  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryQuestions]) => (
        <div key={category}>
          <p className="text-xs text-navy/50 uppercase tracking-wide mb-2">
            {categoryLabels[category] || category}
          </p>
          <div className="space-y-1.5">
            {categoryQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => onSelect(q.label)}
                className="
                  w-full flex items-center gap-3 p-3 rounded-lg
                  bg-stone/5 hover:bg-stone/10 transition-colors text-left
                "
              >
                <q.icon className="w-4 h-4 text-teal flex-shrink-0" />
                <span className="text-sm text-navy">{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
