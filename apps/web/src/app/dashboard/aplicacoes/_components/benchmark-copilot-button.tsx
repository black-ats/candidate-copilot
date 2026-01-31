'use client'

import { CopilotButton } from '@/components/copilot-button'
import { useCopilotDrawer, type BenchmarkContext } from '@/hooks/use-copilot-drawer'

interface BenchmarkCopilotButtonProps {
  context: BenchmarkContext
  label?: string
  className?: string
}

/**
 * Botão do Copilot para contexto de Benchmark
 * Usa o CopilotButton padrão com identidade visual do Copilot (gradiente roxo + Sparkles)
 */
export function BenchmarkCopilotButton({ 
  context, 
  label = 'Entender melhor',
  className 
}: BenchmarkCopilotButtonProps) {
  const { openWithBenchmarkContext } = useCopilotDrawer()
  
  return (
    <CopilotButton 
      size="sm"
      onClick={() => openWithBenchmarkContext(context)}
      className={className}
    >
      {label}
    </CopilotButton>
  )
}
