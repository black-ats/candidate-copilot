'use client'

import Link from 'next/link'
import { Button } from '@ui/components'
import { Mic, Plus } from 'lucide-react'

interface ContextualCTAsProps {
  objetivo?: string
  variant?: 'default' | 'inside-card' | 'inline'
}

// CTAs não-Copilot: ações concretas como adicionar vaga, treinar entrevistas
// CTAs de Copilot são tratados no card "Quer aprofundar?" para evitar duplicação
export function ContextualCTAs({ objetivo, variant = 'default' }: ContextualCTAsProps) {
  if (!objetivo) return null

  const wrapperClass = variant === 'inside-card' 
    ? 'flex flex-col sm:flex-row gap-2 p-4 sm:p-6' 
    : variant === 'inline'
    ? 'flex flex-col sm:flex-row gap-2'
    : 'flex flex-col sm:flex-row gap-2 mt-4'

  // mais_entrevistas: treinar entrevistas
  if (objetivo === 'mais_entrevistas') {
    return (
      <div className={wrapperClass}>
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
      <div className={wrapperClass}>
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

  // avaliar_proposta: apenas adicionar proposta (Copilot fica no card abaixo)
  if (objetivo === 'avaliar_proposta') {
    return (
      <div className={wrapperClass}>
        <Link href="/dashboard/aplicacoes/nova" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar a proposta
          </Button>
        </Link>
      </div>
    )
  }

  // negociar_salario e mudar_area: apenas Copilot, tratado no card abaixo
  return null
}
