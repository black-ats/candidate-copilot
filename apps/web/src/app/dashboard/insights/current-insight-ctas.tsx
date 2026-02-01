'use client'

import Link from 'next/link'
import { Button } from '@ui/components'
import { Mic, Plus, Sparkles } from 'lucide-react'
import { useCopilotDrawer, type HeroContext } from '@/hooks/use-copilot-drawer'

interface CurrentInsightCTAsProps {
  objetivo?: string
}

const copilotMessages: Record<string, { label: string; message: string }> = {
  avaliar_proposta: {
    label: 'Analisar proposta',
    message: 'Vamos analisar a proposta juntos? Me conta: qual empresa, cargo e qual o valor oferecido?',
  },
  negociar_salario: {
    label: 'Preparar argumentos',
    message: 'Vamos preparar sua negociação. Quais são os pontos que você quer levantar?',
  },
  mudar_area: {
    label: 'Planejar a mudança',
    message: 'Vamos explorar sua transição de carreira. O que te atrai na nova área?',
  },
}

function CopilotCTAButton({ objetivo }: { objetivo: string }) {
  const { openWithHeroContext } = useCopilotDrawer()
  const config = copilotMessages[objetivo]
  
  if (!config) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const heroContext: HeroContext = {
      type: 'hero',
      context: `objetivo_${objetivo}`,
      message: config.message,
    }
    openWithHeroContext(heroContext)
  }

  return (
    <button 
      onClick={handleClick} 
      className="
        w-full sm:w-auto inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-lg font-medium text-white
        bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500
        hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400
        transition-all duration-200
      "
    >
      <Sparkles className="w-4 h-4" />
      {config.label}
    </button>
  )
}

export function CurrentInsightCTAs({ objetivo }: CurrentInsightCTAsProps) {
  if (!objetivo) return null

  // mais_entrevistas: treinar entrevistas
  if (objetivo === 'mais_entrevistas') {
    return (
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Link href="/dashboard/interview-pro" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            <Mic className="w-4 h-4 mr-2" />
            Treinar para entrevistas
          </Button>
        </Link>
      </div>
    )
  }

  // avancar_processos: adicionar vaga + treinar entrevistas
  if (objetivo === 'avancar_processos') {
    return (
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Link href="/dashboard/aplicacoes/nova" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar vaga
          </Button>
        </Link>
        <Link href="/dashboard/interview-pro" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            <Mic className="w-4 h-4 mr-2" />
            Treinar entrevistas
          </Button>
        </Link>
      </div>
    )
  }

  // avaliar_proposta: adicionar proposta + Copilot
  if (objetivo === 'avaliar_proposta') {
    return (
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Link href="/dashboard/aplicacoes/nova" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar a proposta
          </Button>
        </Link>
        <CopilotCTAButton objetivo={objetivo} />
      </div>
    )
  }

  // negociar_salario ou mudar_area: Copilot
  if (objetivo === 'negociar_salario' || objetivo === 'mudar_area') {
    return (
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <CopilotCTAButton objetivo={objetivo} />
      </div>
    )
  }

  return null
}
