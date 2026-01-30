'use client'

import { Button } from '@ui/components'
import { MessageCircle } from 'lucide-react'
import { useCopilotDrawer, type InsightContext } from '@/hooks/use-copilot-drawer'
import { mapObjetivoToTipo } from '../_components/copilot-chat/insight-messages'

type InsightData = {
  id: string
  cargo?: string | null
  area?: string | null
  objetivo?: string | null
  recommendation: string
  next_steps?: string[] | null
}

export function InsightChatButton({ insight }: { insight: InsightData }) {
  const { openWithContext } = useCopilotDrawer()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const context: InsightContext = {
      id: insight.id,
      tipo: mapObjetivoToTipo(insight.objetivo || 'outro'),
      cargo: insight.cargo || 'Cargo nao especificado',
      area: insight.area || undefined,
      recommendation: insight.recommendation,
      next_steps: insight.next_steps || [],
    }
    openWithContext(context)
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleClick}
      className="text-teal hover:text-teal/80"
    >
      <MessageCircle className="w-4 h-4 mr-1" />
      Conversar
    </Button>
  )
}
