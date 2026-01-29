'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Badge } from '@ui/components'
import { Sparkles, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, User } from 'lucide-react'
import {
  generateInsight,
  senioridadeLabels,
  areaLabels,
  statusLabels,
  objetivoLabels,
  type Insight,
} from '@/lib/insight-engine'
import type { EntryFlowData } from '@/lib/schemas/entry-flow'

export default function InsightPage() {
  const router = useRouter()
  const [data, setData] = useState<EntryFlowData | null>(null)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem('entryFlowData')
    
    if (!storedData) {
      // Redirect to start if no data
      router.push('/comecar')
      return
    }

    try {
      const parsedData = JSON.parse(storedData) as EntryFlowData
      setData(parsedData)
      
      // Simulate processing time for better UX
      setTimeout(() => {
        const generatedInsight = generateInsight(parsedData)
        setInsight(generatedInsight)
        setIsLoading(false)
      }, 1500)
    } catch {
      router.push('/comecar')
    }
  }, [router])

  const handleStartOver = () => {
    sessionStorage.removeItem('entryFlowData')
    router.push('/comecar')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-navy" />
          </div>
          <h2 className="text-xl font-semibold text-navy mb-2">Analisando seu contexto...</h2>
          <p className="text-navy/70">Preparando seu insight personalizado</p>
        </div>
      </div>
    )
  }

  if (!data || !insight) {
    return null
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
          </Link>
        </div>
      </header>

      <main className="container-narrow py-8 sm:py-12">
        {/* Context Summary */}
        <div className="mb-6">
          <p className="text-sm text-navy/60 mb-2">Baseado no que voce informou:</p>
          <div className="flex flex-wrap gap-2">
            <Badge>{data.cargo}</Badge>
            <Badge variant="info">{senioridadeLabels[data.senioridade]}</Badge>
            <Badge variant="info">{areaLabels[data.area]}</Badge>
            <Badge variant={data.status === 'empregado' ? 'success' : 'warning'}>
              {statusLabels[data.status]}
            </Badge>
            <Badge>{objetivoLabels[data.objetivo]}</Badge>
          </div>
        </div>

        {/* Decision Card */}
        <Card variant="elevated" className="mb-6 overflow-hidden">
          {/* Recommendation Header */}
          <div className="bg-navy text-sand p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-navy" />
              </div>
              <div>
                <p className="text-sm text-sand/70 mb-1">Recomendacao</p>
                <h1 className="text-xl sm:text-2xl font-semibold">
                  {insight.recommendation}
                </h1>
              </div>
            </div>
          </div>

          {/* Why Section */}
          <div className="p-6 border-b border-stone/30">
            <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
              Por que?
            </h2>
            <ul className="space-y-2">
              {insight.why.map((reason, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <span className="text-navy">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks Section */}
          <div className="p-6 border-b border-stone/30 bg-amber/5">
            <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
              Riscos a considerar
            </h2>
            <ul className="space-y-2">
              {insight.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                  <span className="text-navy">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps Section */}
          <div className="p-6">
            <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
              Proximos passos
            </h2>
            <ol className="space-y-3">
              {insight.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-navy">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="p-6 sm:p-8 text-center">
          <h2 className="text-xl font-semibold text-navy mb-2">
            Quer acompanhar seu progresso?
          </h2>
          <p className="text-navy/70 mb-6 max-w-md mx-auto">
            Crie uma conta gratuita para salvar seus insights, acompanhar suas metas e receber direcionamentos personalizados.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth">
              <Button size="lg">
                <User className="mr-2 w-5 h-5" />
                Criar conta gratuita
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleStartOver}>
              <RefreshCw className="mr-2 w-5 h-5" />
              Comecar de novo
            </Button>
          </div>
        </Card>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-sm text-navy/50">
          Este insight foi gerado com base nas informacoes que voce forneceu e serve como um ponto de partida para reflexao. Decisoes de carreira sao pessoais e devem considerar seu contexto completo.
        </p>
      </main>
    </div>
  )
}
