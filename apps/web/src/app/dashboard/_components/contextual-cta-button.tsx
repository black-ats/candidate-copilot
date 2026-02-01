'use client'

import Link from 'next/link'
import { Button } from '@ui/components'
import { Mic, Plus, Sparkles } from 'lucide-react'
import { useCopilotDrawer, type HeroContext } from '@/hooks/use-copilot-drawer'

type CTAType = 'interview' | 'add_application' | 'copilot'

interface ContextualCTAButtonProps {
  type: CTAType
  label: string
  objetivo?: string
  copilotMessage?: string
}

export function ContextualCTAButton({ type, label, objetivo, copilotMessage }: ContextualCTAButtonProps) {
  const { openWithHeroContext } = useCopilotDrawer()

  if (type === 'interview') {
    return (
      <Link href="/dashboard/interview-pro" className="w-full sm:w-auto">
        <Button variant="secondary" className="w-full sm:w-auto">
          <Mic className="w-4 h-4 mr-2" />
          {label}
        </Button>
      </Link>
    )
  }

  if (type === 'add_application') {
    return (
      <Link href="/dashboard/aplicacoes/nova" className="w-full sm:w-auto">
        <Button variant="secondary" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          {label}
        </Button>
      </Link>
    )
  }

  // type === 'copilot'
  const handleCopilotClick = () => {
    const heroContext: HeroContext = {
      type: 'hero',
      context: `objetivo_${objetivo || 'geral'}`,
      message: copilotMessage || 'Vamos conversar sobre sua estratégia de carreira.',
    }
    openWithHeroContext(heroContext)
  }

  return (
    <button 
      onClick={handleCopilotClick} 
      className="
        w-full sm:w-auto inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-lg font-medium text-white
        bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500
        hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400
        transition-all duration-200
      "
    >
      <Sparkles className="w-4 h-4" />
      {label}
    </button>
  )
}
