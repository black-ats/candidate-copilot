'use client'

import { CopilotButton } from '@/components/copilot-button'
import { useCopilotDrawer, type InsightContext } from '@/hooks/use-copilot-drawer'
import { mapObjetivoToTipo } from '../../_components/copilot-chat/insight-messages'

type InsightData = {
  id: string
  cargo: string
  area?: string | null
  objetivo?: string | null
  recommendation: string
  next_steps: string[]
}

export function ContinueConversationButton({ insight }: { insight: InsightData }) {
  const { openWithContext } = useCopilotDrawer()

  const handleClick = () => {
    const context: InsightContext = {
      id: insight.id,
      tipo: mapObjetivoToTipo(insight.objetivo || 'outro'),
      cargo: insight.cargo,
      area: insight.area || undefined,
      recommendation: insight.recommendation,
      next_steps: insight.next_steps || [],
    }
    openWithContext(context)
  }

  return (
    <CopilotButton onClick={handleClick}>
      Continuar conversa
    </CopilotButton>
  )
}
