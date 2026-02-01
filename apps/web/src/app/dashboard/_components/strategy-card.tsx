import Link from 'next/link'
import { Card, Badge, Button } from '@ui/components'
import { Sparkles, ArrowRight, Target, RefreshCw } from 'lucide-react'
import { objetivoLabels } from '@/lib/insight-engine'
import { ContextualCTAButton } from './contextual-cta-button'

interface InsightData {
  id: string
  // V1 fields
  recommendation?: string
  next_steps?: string[]
  // V1.1 fields
  diagnosis?: string
  next_step?: string
  type_label?: string
  // Common fields
  objetivo?: string
  cargo?: string
  created_at: string
}

interface StrategyCardProps {
  insight: InsightData | null
}

function getInsightAge(createdAt: string): { days: number; label: string; isStale: boolean } {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
  const isStale = days > 14
  
  let label: string
  if (days === 0) {
    label = 'Hoje'
  } else if (days === 1) {
    label = 'Ontem'
  } else if (days < 7) {
    label = `${days} dias atrás`
  } else if (days < 14) {
    label = '1 semana atrás'
  } else if (days < 30) {
    label = `${Math.floor(days / 7)} semanas atrás`
  } else {
    label = `${Math.floor(days / 30)} mês${Math.floor(days / 30) > 1 ? 'es' : ''} atrás`
  }
  
  return { days, label, isStale }
}

type ContextualCTA = {
  type: 'interview' | 'add_application' | 'copilot'
  label: string
  copilotMessage?: string
}

function getContextualCTAs(objetivo: string | undefined): ContextualCTA[] {
  if (!objetivo) return []
  
  const ctasByObjetivo: Record<string, ContextualCTA[]> = {
    mais_entrevistas: [
      { type: 'interview', label: 'Treinar para entrevistas' },
    ],
    avancar_processos: [
      { type: 'add_application', label: 'Adicionar vaga' },
      { type: 'interview', label: 'Treinar entrevistas' },
    ],
    avaliar_proposta: [
      { type: 'copilot', label: 'Analisar proposta', copilotMessage: 'Vamos analisar a proposta juntos? Me conta: qual empresa, cargo e qual o valor oferecido?' },
    ],
    negociar_salario: [
      { type: 'copilot', label: 'Preparar argumentos', copilotMessage: 'Vamos preparar sua negociação. Quais são os pontos que você quer levantar?' },
    ],
    mudar_area: [
      { type: 'copilot', label: 'Planejar a mudança', copilotMessage: 'Vamos explorar sua transição de carreira. O que te atrai na nova área?' },
    ],
  }
  
  return ctasByObjetivo[objetivo] || []
}

export function StrategyCard({ insight }: StrategyCardProps) {
  // Empty state
  if (!insight) {
    return (
      <Card className="p-4 sm:p-6 border-amber/30 bg-amber/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
          <div className="w-12 h-12 bg-amber/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-amber" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-navy">
              Defina sua estratégia de carreira
            </h2>
            <p className="text-sm sm:text-base text-navy/60">
              Receba um direcionamento personalizado para sua situação
            </p>
          </div>
        </div>
        
        <div className="bg-white/60 rounded-lg p-4 mb-4">
          <p className="text-sm text-navy/70">
            Responda 4 perguntas rápidas sobre seu momento profissional e receba:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-navy/70">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              Análise do seu contexto atual
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              Recomendação principal
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              Próximos passos claros
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <Link href="/comecar" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Sparkles className="w-4 h-4 mr-2" />
              Criar minha estratégia
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  const age = getInsightAge(insight.created_at)
  // Support both V1 (next_steps array) and V1.1 (next_step string) formats
  const nextSteps = insight.next_steps?.slice(0, 4) || (insight.next_step ? [insight.next_step] : [])
  // Use V1.1 diagnosis if available, otherwise use V1 recommendation
  const mainContent = insight.diagnosis || insight.recommendation || ''

  return (
    <Card variant="elevated" className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-amber" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-navy">
              Sua Estratégia
            </h2>
            <p className="text-sm text-navy/60">
              {/* V1.1: Show type label, V1: Show objetivo or cargo */}
              {insight.type_label || (insight.objetivo && objetivoLabels[insight.objetivo]) || insight.cargo || 'Análise personalizada'}
            </p>
          </div>
        </div>
        <Badge variant={age.isStale ? 'warning' : 'info'} className="self-start">
          {age.label}
        </Badge>
      </div>

      {/* Main content: V1.1 diagnostico or V1 recommendation */}
      <div className="bg-navy/5 rounded-lg p-4 mb-4">
        <p className="text-navy font-medium">
          {mainContent}
        </p>
      </div>

      {/* Next steps - timeline */}
      {nextSteps.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-navy/70 mb-3">
            {insight.next_step ? 'Próximo passo' : 'Próximos passos'}
          </h3>
          <div className="border-l-2 border-teal/30 pl-4 space-y-3">
            {nextSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-teal/60" />
                <p className="text-sm text-navy/80">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contextual CTAs based on objetivo */}
      {!age.isStale && getContextualCTAs(insight.objetivo).length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          {getContextualCTAs(insight.objetivo).map((cta, index) => (
            <ContextualCTAButton
              key={index}
              type={cta.type}
              label={cta.label}
              objetivo={insight.objetivo}
              copilotMessage={cta.copilotMessage}
            />
          ))}
        </div>
      )}

      {/* Main CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-2 border-t border-stone/20">
        {age.isStale ? (
          <>
            <Link href="/comecar" className="flex-1">
              <Button className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar estrategia
              </Button>
            </Link>
            <Link href={`/dashboard/insights/${insight.id}`} className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto h-11 sm:h-auto">
                Ver atual
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href={`/dashboard/insights/${insight.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Ver detalhes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/comecar" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refazer
              </Button>
            </Link>
          </>
        )}
      </div>
    </Card>
  )
}
