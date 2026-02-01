'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Badge } from '@ui/components'
import { Sparkles, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, User, MessageSquare, Clock } from 'lucide-react'
import {
  senioridadeLabels,
  areaLabels,
  statusLabels,
  objetivoLabels,
  type DiagnosticInsight,
} from '@/lib/insight-engine-v2'
import { track } from '@/lib/analytics/track'
import type { EntryFlowData } from '@/lib/schemas/entry-flow'
import { useUser } from '@/hooks/use-user'
import { saveInsight, checkInsightAccess, generateInsightAction } from './actions'
import { UpgradePrompt } from '@/components/upgrade-prompt'

type AccessCheck = {
  allowed: boolean
  remaining: number | null
  limit: number | null
  plan: 'free' | 'pro' | null
}

export default function InsightPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useUser()
  const [data, setData] = useState<EntryFlowData | null>(null)
  const [insight, setInsight] = useState<DiagnosticInsight | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [accessCheck, setAccessCheck] = useState<AccessCheck | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const isGeneratingRef = useRef(false) // Guard against double execution in Strict Mode

  // Check access when auth state changes
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      checkInsightAccess().then((access) => {
        setAccessCheck(access)
        if (!access.allowed) {
          setLimitReached(true)
          setIsLoading(false)
        }
      })
    }
  }, [authLoading, isLoggedIn])

  useEffect(() => {
    // Guard against double execution in React Strict Mode
    if (isGeneratingRef.current) return
    
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem('entryFlowData')

    if (!storedData) {
      // Redirect to start if no data
      router.push('/comecar')
      return
    }

    async function generateInsight(parsedData: EntryFlowData) {
      // Set guard immediately
      isGeneratingRef.current = true
      
      try {
        // Generate insight via server action (A/B test happens server-side)
        const result = await generateInsightAction(parsedData)
        
        if (result.success && result.insight) {
          setInsight(result.insight)
          setIsLoading(false)

          // Track insight generation with source for A/B analysis
          track('insight_generated', {
            cargo: parsedData.cargo,
            area: parsedData.area,
            senioridade: parsedData.senioridade,
            insightType: result.insight.type,
            source: result.source, // 'template' or 'llm'
          })
        } else {
          console.error('[InsightPage] Failed to generate insight:', result.error)
          isGeneratingRef.current = false // Reset on error
          router.push('/comecar')
        }
      } catch (error) {
        console.error('[InsightPage] Error generating insight:', error)
        isGeneratingRef.current = false // Reset on error
        router.push('/comecar')
      }
    }

    try {
      const parsedData = JSON.parse(storedData) as EntryFlowData
      setData(parsedData)
      generateInsight(parsedData)
    } catch {
      router.push('/comecar')
    }
  }, [router])

  // Salvar no localStorage para caso de signup posterior (localStorage persiste entre tabs)
  useEffect(() => {
    if (data && insight) {
      localStorage.setItem('pendingInsight', JSON.stringify({
        cargo: data.cargo,
        senioridade: data.senioridade,
        area: data.area,
        status: data.status,
        tempoSituacao: data.tempoSituacao,
        urgencia: data.urgencia,
        objetivo: data.objetivo,
        // V1.1 contextual fields (English names for DB)
        decisionBlocker: data.bloqueioDecisao,
        interviewBottleneck: data.gargaloEntrevistas,
        maxStage: data.faseMaxima,
        leverageSignals: data.sinaisAlavanca,
        pivotType: data.tipoPivot,
        transferableStrengths: data.forcasTransferiveis,
        avoidedDecision: data.decisaoEvitando,
        // V1.1 diagnostic insight fields
        type: insight.type,
        typeLabel: insight.typeLabel,
        diagnosis: insight.diagnosis,
        pattern: insight.pattern,
        risk: insight.risk,
        nextStep: insight.nextStep,
        inputHash: insight.inputHash,
        confidence: insight.confidence,
      }))
    }
  }, [data, insight])

  // Se ja logado, salvar no DB imediatamente
  useEffect(() => {
    if (isLoggedIn && data && insight && !saved && !authLoading && !limitReached) {
      // Check if localStorage still has the pending insight
      // If not, another tab (PendingInsightSaver) already saved it
      const pendingInsight = localStorage.getItem('pendingInsight')
      if (!pendingInsight) {
        console.log('[InsightPage] pendingInsight already removed, skipping save (likely saved by another tab)')
        setSaved(true)
        return
      }

      saveInsight({
        cargo: data.cargo,
        senioridade: data.senioridade,
        area: data.area,
        status: data.status,
        tempoSituacao: data.tempoSituacao,
        urgencia: data.urgencia,
        objetivo: data.objetivo,
        // V1.1 contextual fields (English names for DB)
        decisionBlocker: data.bloqueioDecisao,
        interviewBottleneck: data.gargaloEntrevistas,
        maxStage: data.faseMaxima,
        leverageSignals: data.sinaisAlavanca,
        pivotType: data.tipoPivot,
        transferableStrengths: data.forcasTransferiveis,
        avoidedDecision: data.decisaoEvitando,
        // V1.1 diagnostic insight fields
        type: insight.type,
        typeLabel: insight.typeLabel,
        diagnosis: insight.diagnosis,
        pattern: insight.pattern,
        risk: insight.risk,
        nextStep: insight.nextStep,
        inputHash: insight.inputHash,
        confidence: insight.confidence,
      }).then((result) => {
        if (result.success) {
          setSaved(true)
          // Limpar localStorage/sessionStorage ja que salvou no DB
          localStorage.removeItem('pendingInsight')
          sessionStorage.removeItem('entryFlowData')
          // Update remaining count after save
          if (accessCheck && accessCheck.remaining !== null) {
            setAccessCheck({
              ...accessCheck,
              remaining: Math.max(0, accessCheck.remaining - 1)
            })
          }
        } else if ('limitReached' in result && result.limitReached) {
          setLimitReached(true)
        }
      })
    }
  }, [isLoggedIn, data, insight, saved, authLoading, limitReached, accessCheck])

  const handleStartOver = () => {
    sessionStorage.removeItem('entryFlowData')
    router.push('/comecar')
  }

  if (isLoading && !limitReached) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-navy" />
          </div>
          <h2 className="text-xl font-semibold text-navy mb-2">Analisando seu contexto...</h2>
          <p className="text-navy/70">Preparando sua análise personalizada</p>
        </div>
      </div>
    )
  }

  // Show upgrade prompt if limit reached
  if (limitReached && accessCheck) {
    return (
      <div className="min-h-screen bg-sand">
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
          <UpgradePrompt
            remaining={accessCheck.remaining || 0}
            limit={accessCheck.limit || 3}
          />
        </main>
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
        {/* Remaining insights counter for Free users */}
        {isLoggedIn && accessCheck && accessCheck.plan === 'free' && accessCheck.remaining !== null && (
          <div className="mb-6 p-3 bg-amber/10 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:justify-between">
            <p className="text-sm text-navy/70">
              <span className="font-medium text-navy">{accessCheck.remaining}</span> de {accessCheck.limit} análises restantes este mês
            </p>
            <Link href="/dashboard/plano" className="text-sm font-medium text-amber hover:text-amber/80">
              Upgrade →
            </Link>
          </div>
        )}

        {/* Context Summary */}
        <div className="mb-6">
          <p className="text-sm text-navy/60 mb-2">Baseado no que você informou:</p>
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

        {/* Decision Card - V1.1 Diagnostic Structure */}
        <Card variant="elevated" className="mb-6 overflow-hidden">
          {/* Header with type badge */}
          <div className="bg-navy text-sand p-4 sm:p-6">
            <Badge variant="warning" className="mb-3">
              {insight.typeLabel}
            </Badge>
            <h1 className="text-xl sm:text-2xl font-semibold">
              Sua análise de carreira
            </h1>
          </div>

          {/* Diagnosis - Current situation */}
          <div className="p-4 sm:p-6 border-b border-stone/30">
            <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-2">
              Situação atual
            </h2>
            <p className="text-navy">{insight.diagnosis}</p>
          </div>

          {/* Pattern observed */}
          <div className="p-4 sm:p-6 border-b border-stone/30">
            <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-2">
              Padrão observado
            </h2>
            <p className="text-navy">{insight.pattern}</p>
          </div>

          {/* Risk - highlighted */}
          <div className="p-4 sm:p-6 border-b border-stone/30 bg-amber/5">
            <h2 className="text-sm font-semibold text-amber uppercase tracking-wide mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risco aberto
            </h2>
            <p className="text-navy">{insight.risk}</p>
          </div>

          {/* Next step - actionable */}
          <div className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-teal uppercase tracking-wide mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Próximo passo recomendado
            </h2>
            <p className="text-navy font-medium">{insight.nextStep}</p>
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="p-4 sm:p-6 md:p-8 text-center">
          {isLoggedIn ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-teal" />
                <h2 className="text-xl font-semibold text-navy">
                  Análise salva!
                </h2>
              </div>
              <p className="text-navy/70 mb-6 max-w-md mx-auto">
                Você pode acessar esta e outras análises no seu dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/dashboard">
                  <Button size="lg">
                    <ArrowRight className="mr-2 w-5 h-5" />
                    Revisar no Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleStartOver}>
                  <RefreshCw className="mr-2 w-5 h-5" />
                  Nova análise
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-navy mb-2">
                Quer aprofundar essa análise?
              </h2>
              <p className="text-navy/70 mb-6 max-w-md mx-auto">
                Veja o que o Copilot pode te ajudar a responder:
              </p>

              {/* Chat Preview */}
              <div className="bg-sand rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
                {/* User message */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-navy" />
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                    <p className="text-navy text-sm">
                      {data.objetivo === 'avaliar_proposta' && 'Qual salário devo pedir na negociação?'}
                      {data.objetivo === 'mais_entrevistas' && 'Como posso melhorar meu currículo para essa vaga?'}
                      {data.objetivo === 'avancar_processos' && 'Como me preparar para a próxima etapa?'}
                      {data.objetivo === 'mudar_area' && 'Quais skills preciso desenvolver primeiro?'}
                      {data.objetivo === 'negociar_salario' && 'Como devo abordar a conversa de aumento?'}
                      {!['avaliar_proposta', 'mais_entrevistas', 'avancar_processos', 'mudar_area', 'negociar_salario'].includes(data.objetivo) && 'O que você recomenda como próximo passo?'}
                    </p>
                  </div>
                </div>

                {/* Copilot response */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-teal" />
                  </div>
                  <div className="bg-teal/10 rounded-lg rounded-tl-none p-3 flex-1">
                    <p className="text-navy text-sm">
                      Baseado no seu perfil de <span className="font-medium">{data.cargo}</span> com experiência em <span className="font-medium">{areaLabels[data.area]}</span>, posso te ajudar a...
                    </p>
                    <p className="text-teal text-xs mt-2 font-medium">
                      Crie uma conta grátis para continuar →
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 w-full px-4 sm:px-0">
                <Link href="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    <MessageSquare className="mr-2 w-5 h-5 flex-shrink-0" />
                    Criar conta grátis
                  </Button>
                </Link>

                <p className="text-sm text-navy/50 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Leva menos de 1 minuto
                </p>

                <Button variant="ghost" size="sm" onClick={handleStartOver} className="w-full sm:w-auto">
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Nova análise
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-sm text-navy/50">
          Esta análise foi gerada com base nas informações que você forneceu e serve como um ponto de partida para reflexão. Decisões de carreira são pessoais e devem considerar seu contexto completo.
        </p>
      </main>
    </div>
  )
}
