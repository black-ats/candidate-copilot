'use client'

import { CopilotButton } from '@/components/copilot-button'
import { useCopilotDrawer, type InsightContext } from '@/hooks/use-copilot-drawer'
import { mapObjetivoToTipo } from '../_components/copilot-chat/insight-messages'

type InsightData = {
  id: string
  cargo?: string | null
  area?: string | null
  objetivo?: string | null
  // V1 fields
  recommendation?: string | null
  next_steps?: string[] | null
  // V1.1 diagnostic fields (from list query)
  diagnosis?: string | null
  type_label?: string | null
  next_step?: string | null
}

export function InsightChatButton({ insight }: { insight: InsightData }) {
  const { openWithContext } = useCopilotDrawer()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const context: InsightContext = {
      id: insight.id,
      tipo: mapObjetivoToTipo(insight.objetivo || 'outro'),
      cargo: insight.cargo || 'Cargo não especificado',
      area: insight.area || undefined,
      objetivo: insight.objetivo || undefined,
      // V1 fields
      recommendation: insight.recommendation || undefined,
      next_steps: insight.next_steps || undefined,
      // V1.1 diagnostic fields
      diagnosis: insight.diagnosis || undefined,
      typeLabel: insight.type_label || undefined,
      nextStep: insight.next_step || undefined,
    }
    openWithContext(context)
  }

  return (
    <CopilotButton variant="text" size="sm" onClick={handleClick}>
      Conversar
    </CopilotButton>
  )
}
