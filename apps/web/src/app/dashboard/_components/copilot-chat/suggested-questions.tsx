'use client'

import { 
  TrendingUp, Clock, Target, Lightbulb, 
  Sparkles, HelpCircle, AlertTriangle, ListChecks,
  Mic, Users
} from 'lucide-react'
import type { SuggestedQuestion } from '@/lib/copilot/types'
import type { LucideIcon } from 'lucide-react'
import type { InsightContext, HeroContext, InterviewContext, BenchmarkContext } from '@/hooks/use-copilot-drawer'
import { insightSuggestedQuestions, heroSuggestedQuestions, interviewSuggestedQuestions, benchmarkSuggestedQuestions } from './insight-messages'

interface ExtendedQuestion extends SuggestedQuestion {
  icon: LucideIcon
}

const defaultQuestions: ExtendedQuestion[] = [
  // Foco no objetivo
  {
    id: 'caminho-certo',
    label: 'Estou no caminho certo pro meu objetivo?',
    category: 'objetivo',
    icon: Target,
  },
  {
    id: 'prioridade',
    label: 'O que deveria ser minha prioridade agora?',
    category: 'decisao',
    icon: ListChecks,
  },
  {
    id: 'onde-travando',
    label: 'Onde você acha que estou travando?',
    category: 'decisao',
    icon: HelpCircle,
  },
  // Análise da situação
  {
    id: 'como-estou',
    label: 'Como está minha situação hoje?',
    category: 'situacao',
    icon: TrendingUp,
  },
  {
    id: 'riscos',
    label: 'Quais riscos você identificou pra mim?',
    category: 'situacao',
    icon: AlertTriangle,
  },
  // Ações e próximos passos
  {
    id: 'proximo-passo',
    label: 'Qual meu próximo passo?',
    category: 'decisao',
    icon: Sparkles,
  },
  {
    id: 'melhorar-conversao',
    label: 'Como consigo mais entrevistas?',
    category: 'objetivo',
    icon: Lightbulb,
  },
  {
    id: 'preparar-entrevista',
    label: 'Me ajuda a preparar para entrevistas',
    category: 'interview',
    icon: Mic,
  },
]

// Perguntas de Entrevista IA (aparecem para todos usuários com histórico de entrevista)
const interviewQuestions: ExtendedQuestion[] = [
  {
    id: 'ultima-entrevista',
    label: 'Como foi minha última entrevista simulada?',
    category: 'interview',
    icon: Mic,
  },
  {
    id: 'evolucao-treinos',
    label: 'Qual minha evolução nos treinos?',
    category: 'interview',
    icon: TrendingUp,
  },
  {
    id: 'perguntas-praticar',
    label: 'Que perguntas devo praticar mais?',
    category: 'interview',
    icon: Target,
  },
  {
    id: 'melhorar-entrevista',
    label: 'Me ajuda a melhorar meus pontos fracos',
    category: 'interview',
    icon: Lightbulb,
  },
]

// Perguntas de Benchmark
const benchmarkQuestions: ExtendedQuestion[] = [
  {
    id: 'minha-comparacao',
    label: 'Como me comparo com outros candidatos?',
    category: 'benchmark',
    icon: Users,
  },
  {
    id: 'melhorar-taxa',
    label: 'Como melhorar minha taxa de conversão?',
    category: 'benchmark',
    icon: TrendingUp,
  },
]

const categoryLabels: Record<string, string> = {
  objetivo: 'Seu Objetivo',
  decisao: 'Decisões',
  situacao: 'Sua Situação',
  interview: 'Mock Interview',
  benchmark: 'Comparação',
}

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
  compact?: boolean
  categories?: string[]
  insightContext?: InsightContext | null
  heroContext?: HeroContext | null
  interviewContext?: InterviewContext | null
  benchmarkContext?: BenchmarkContext | null
  hasInterviewHistory?: boolean
}

export function SuggestedQuestions({ 
  onSelect, 
  compact = false,
  categories,
  insightContext,
  heroContext,
  interviewContext,
  benchmarkContext,
  hasInterviewHistory = false
}: SuggestedQuestionsProps) {
  // If there's benchmark, interview, insight, or hero context, show context-specific questions
  const contextQuestions = benchmarkContext
    ? benchmarkSuggestedQuestions
    : interviewContext
    ? interviewSuggestedQuestions
    : insightContext 
    ? insightSuggestedQuestions[insightContext.tipo] || insightSuggestedQuestions.default
    : heroContext
    ? heroSuggestedQuestions[heroContext.context] || heroSuggestedQuestions.active_summary
    : null
    
  if (contextQuestions) {
    if (compact) {
      const compactQuestions = contextQuestions.slice(0, 4)
      
      return (
        <div className="flex flex-wrap gap-2">
          {compactQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => onSelect(q)}
              className="
                flex items-center gap-2 px-3 py-1.5 rounded-full
                bg-stone/10 hover:bg-stone/20 transition-colors
                text-xs text-navy/80 hover:text-navy
              "
            >
              <HelpCircle className="w-3 h-3" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      )
    }
    
    return (
      <div className="space-y-1.5">
        {contextQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="
              w-full flex items-center gap-3 p-3 rounded-lg
              bg-stone/5 hover:bg-stone/10 transition-colors text-left
            "
          >
            <HelpCircle className="w-4 h-4 text-teal flex-shrink-0" />
            <span className="text-sm text-navy">{q}</span>
          </button>
        ))}
      </div>
    )
  }
  
  // Incluir perguntas de interview e benchmark para todos usuarios
  const allQuestions = hasInterviewHistory
    ? [...defaultQuestions, ...interviewQuestions, ...benchmarkQuestions]
    : [...defaultQuestions, ...benchmarkQuestions]
  
  // Filtrar por categorias se especificado
  const questions = categories 
    ? allQuestions.filter(q => categories.includes(q.category))
    : allQuestions
  
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
