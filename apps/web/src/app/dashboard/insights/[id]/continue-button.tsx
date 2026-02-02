'use client'

import { CopilotButton } from '@/components/copilot-button'
import { Card } from '@ui/components'
import { MessageSquare } from 'lucide-react'
import { useCopilotDrawer, type InsightContext } from '@/hooks/use-copilot-drawer'
import { mapObjetivoToTipo } from '../../_components/copilot-chat/insight-messages'

type InsightData = {
  id: string
  cargo: string
  area?: string | null
  senioridade?: string | null
  status?: string | null
  objetivo?: string | null
  // V1 fields
  recommendation?: string | null
  next_steps?: string[] | null
  // V1.1 diagnostic fields
  diagnosis?: string | null
  pattern?: string | null
  risk?: string | null
  next_step?: string | null
  type_label?: string | null
  // V1.1 contextual data
  urgencia?: number | null
  tempo_situacao?: string | null
  decision_blocker?: string | null
  interview_bottleneck?: string | null
  max_stage?: string | null
  leverage_signals?: string | null
  pivot_type?: string | null
  transferable_strengths?: string | null
  avoided_decision?: string | null
}

// Textos contextualizados por objetivo
const copilotCardContent: Record<string, { title: string; description: string; buttonText: string }> = {
  avaliar_proposta: {
    title: 'Vamos analisar a proposta?',
    description: 'Converse com o Copilot para avaliar os prós e contras e tomar uma decisão mais segura.',
    buttonText: 'Analisar proposta',
  },
  negociar_salario: {
    title: 'Preparar sua negociação?',
    description: 'O Copilot pode te ajudar a estruturar argumentos e simular cenários de negociação.',
    buttonText: 'Preparar argumentos',
  },
  mudar_area: {
    title: 'Planejar sua transição?',
    description: 'Converse com o Copilot sobre como aproveitar suas habilidades na nova área.',
    buttonText: 'Planejar a mudança',
  },
}

const defaultContent = {
  title: 'Quer aprofundar?',
  description: 'Converse com o Copilot sobre esta análise e tire suas dúvidas.',
  buttonText: 'Continuar conversa',
}

export function ContinueConversationButton({ insight, buttonText }: { insight: InsightData; buttonText?: string }) {
  const { openWithContext } = useCopilotDrawer()

  const handleClick = () => {
    const context: InsightContext = {
      id: insight.id,
      tipo: mapObjetivoToTipo(insight.objetivo || 'outro'),
      cargo: insight.cargo,
      area: insight.area || undefined,
      senioridade: insight.senioridade || undefined,
      status: insight.status || undefined,
      objetivo: insight.objetivo || undefined,
      recommendation: insight.recommendation || undefined,
      next_steps: insight.next_steps || undefined,
      diagnosis: insight.diagnosis || undefined,
      pattern: insight.pattern || undefined,
      risk: insight.risk || undefined,
      nextStep: insight.next_step || undefined,
      typeLabel: insight.type_label || undefined,
      urgencia: insight.urgencia || undefined,
      tempoSituacao: insight.tempo_situacao || undefined,
      decisionBlocker: insight.decision_blocker || undefined,
      interviewBottleneck: insight.interview_bottleneck || undefined,
      maxStage: insight.max_stage || undefined,
      leverageSignals: insight.leverage_signals || undefined,
      pivotType: insight.pivot_type || undefined,
      transferableStrengths: insight.transferable_strengths || undefined,
      avoidedDecision: insight.avoided_decision || undefined,
    }
    openWithContext(context)
  }

  return (
    <CopilotButton onClick={handleClick}>
      {buttonText || 'Continuar conversa'}
    </CopilotButton>
  )
}

export function CopilotCTACard({ objetivo, insight }: { objetivo?: string | null; insight: InsightData }) {
  const content = (objetivo && copilotCardContent[objetivo]) || defaultContent

  return (
    <Card className="p-4 sm:p-6 text-center bg-teal/5 border-teal/20 mt-6">
      <MessageSquare className="w-8 h-8 text-teal mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-navy mb-2">
        {content.title}
      </h2>
      <p className="text-navy/70 mb-4">
        {content.description}
      </p>
      <ContinueConversationButton insight={insight} buttonText={content.buttonText} />
    </Card>
  )
}
