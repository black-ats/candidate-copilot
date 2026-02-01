'use client'

import { CopilotButton } from '@/components/copilot-button'
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

export function ContinueConversationButton({ insight }: { insight: InsightData }) {
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
      // V1 fields
      recommendation: insight.recommendation || undefined,
      next_steps: insight.next_steps || undefined,
      // V1.1 diagnostic fields
      diagnosis: insight.diagnosis || undefined,
      pattern: insight.pattern || undefined,
      risk: insight.risk || undefined,
      nextStep: insight.next_step || undefined,
      typeLabel: insight.type_label || undefined,
      // V1.1 contextual data
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
      Continuar conversa
    </CopilotButton>
  )
}
