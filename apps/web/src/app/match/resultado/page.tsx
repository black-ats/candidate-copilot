'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Badge } from '@ui/components'
import {
  Sparkles,
  Target,
  Shield,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Briefcase,
  MessageSquare,
  Clock,
  User,
} from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { saveMatchResult, checkMatchAccess } from '../actions'
import { track } from '@/lib/analytics/track'
import { UpgradePrompt } from '@/components/upgrade-prompt'
import type { MatchResult } from '@/lib/match'

type StoredResult = MatchResult & {
  resumeText: string
  jobDescription: string
}

type AccessCheck = {
  allowed: boolean
  remaining: number | null
  limit: number | null
  plan: 'free' | 'pro' | null
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? 'text-teal' : score >= 45 ? 'text-amber' : 'text-red'
  const strokeColor = score >= 70 ? 'stroke-teal' : score >= 45 ? 'stroke-amber' : 'stroke-red'

  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-stone/20"
        />
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl sm:text-5xl font-bold ${color}`}>{score}</span>
        <span className="text-xs text-navy/50 uppercase tracking-wide">de 100</span>
      </div>
    </div>
  )
}

function ATSBadge({ risk }: { risk: string }) {
  const config = {
    low: { label: 'Baixo', variant: 'success' as const, icon: CheckCircle },
    medium: { label: 'Médio', variant: 'warning' as const, icon: AlertTriangle },
    high: { label: 'Alto', variant: 'warning' as const, icon: XCircle },
  }
  const { label, variant, icon: Icon } = config[risk as keyof typeof config] || config.medium

  return (
    <Badge variant={variant} className="text-sm px-3 py-1">
      <Icon className="w-3.5 h-3.5 mr-1" />
      Risco ATS: {label}
    </Badge>
  )
}

function ImportanceBadge({ importance }: { importance: string }) {
  const config = {
    critical: { label: 'Crítico', className: 'bg-red/10 text-red' },
    important: { label: 'Importante', className: 'bg-amber/10 text-amber' },
    nice_to_have: { label: 'Desejável', className: 'bg-stone/20 text-navy/60' },
  }
  const { label, className } = config[importance as keyof typeof config] || config.important

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  )
}

function ImpactBadge({ impact }: { impact: string }) {
  const config = {
    high: { label: 'Alto impacto', className: 'bg-teal/10 text-teal' },
    medium: { label: 'Médio impacto', className: 'bg-amber/10 text-amber' },
    low: { label: 'Baixo impacto', className: 'bg-stone/20 text-navy/60' },
  }
  const { label, className } = config[impact as keyof typeof config] || config.medium

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  )
}

export default function MatchResultPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useUser()
  const [result, setResult] = useState<StoredResult | null>(null)
  const [saved, setSaved] = useState(false)
  const [accessCheck, setAccessCheck] = useState<AccessCheck | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('matchResult')
    if (!stored) {
      router.push('/match')
      return
    }
    try {
      setResult(JSON.parse(stored) as StoredResult)
    } catch {
      router.push('/match')
    }
  }, [router])

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      checkMatchAccess().then((access) => {
        setAccessCheck(access)
      })
    }
  }, [authLoading, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn && result && !saved && !authLoading && !limitReached) {
      saveMatchResult(result).then((res) => {
        if ('success' in res && res.success) {
          setSaved(true)
          if (accessCheck && accessCheck.remaining !== null) {
            setAccessCheck({
              ...accessCheck,
              remaining: Math.max(0, accessCheck.remaining - 1),
            })
          }
        } else if ('limitReached' in res && res.limitReached) {
          setLimitReached(true)
        }
      })
    }
  }, [isLoggedIn, result, saved, authLoading, limitReached, accessCheck])

  useEffect(() => {
    if (result) {
      localStorage.setItem('pendingMatch', JSON.stringify(result))
    }
  }, [result])

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('matchResult')
    router.push('/match')
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Target className="w-8 h-8 text-navy" />
          </div>
          <h2 className="text-xl font-semibold text-navy mb-2">Carregando resultado...</h2>
        </div>
      </div>
    )
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
          <Button variant="ghost" size="sm" onClick={handleNewAnalysis}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Nova análise
          </Button>
        </div>
      </header>

      <main className="container-narrow py-8 sm:py-12">
        {/* Remaining counter for Free users */}
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

        {/* Score Hero */}
        <Card variant="elevated" className="mb-6 overflow-hidden">
          <div className="bg-navy text-sand p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing score={result.matchScore} />
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold mb-2">
                  {result.jobTitle
                    ? `Match: ${result.jobTitle}`
                    : 'Resultado da análise'}
                  {result.companyName && (
                    <span className="text-sand/60 font-normal"> — {result.companyName}</span>
                  )}
                </h1>
                <div className="mb-3">
                  <ATSBadge risk={result.atsRisk} />
                </div>
                <p className="text-sand/80 text-sm sm:text-base">{result.diagnosis}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Missing Signals */}
        {result.missingSignals.length > 0 && (
          <Card className="mb-6 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-stone/30">
              <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-red" />
                Sinais ausentes ({result.missingSignals.length})
              </h2>
              <p className="text-sm text-navy/60 mt-1">
                Termos e competências que a vaga pede e não estão claros no seu currículo
              </p>
            </div>
            <div className="divide-y divide-stone/20">
              {result.missingSignals.map((signal, i) => (
                <div key={i} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <XCircle className="w-4 h-4 text-red/60" />
                    <span className="font-medium text-navy">{signal.skill}</span>
                    <ImportanceBadge importance={signal.importance} />
                  </div>
                  <p className="text-sm text-navy/60 sm:ml-auto sm:text-right sm:max-w-[60%]">
                    {signal.context}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Resume Weaknesses */}
        {result.resumeWeaknesses.length > 0 && (
          <Card className="mb-6 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-stone/30">
              <h2 className="text-sm font-semibold text-navy/70 uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber" />
                Pontos fracos do currículo
              </h2>
            </div>
            <div className="divide-y divide-stone/20">
              {result.resumeWeaknesses.map((weakness, i) => (
                <div key={i} className="p-4 sm:px-6">
                  <h3 className="font-medium text-navy mb-1">{weakness.area}</h3>
                  <p className="text-sm text-navy/70">{weakness.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Improvements */}
        {result.improvements.length > 0 && (
          <Card className="mb-6 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-stone/30">
              <h2 className="text-sm font-semibold text-teal/80 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal" />
                O que fazer agora
              </h2>
              <p className="text-sm text-navy/60 mt-1">
                Ações concretas priorizadas por impacto
              </p>
            </div>
            <div className="divide-y divide-stone/20">
              {result.improvements.map((improvement, i) => (
                <div key={i} className="p-4 sm:px-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 bg-teal/10 rounded-full flex items-center justify-center text-xs font-bold text-teal flex-shrink-0">
                      {i + 1}
                    </span>
                    <h3 className="font-medium text-navy">{improvement.action}</h3>
                    <ImpactBadge impact={improvement.impact} />
                  </div>
                  <p className="text-sm text-navy/70 pl-8">{improvement.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

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
                Continue no Copilot para otimizar seu currículo, acompanhar a vaga ou preparar para uma entrevista.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/dashboard">
                  <Button size="lg">
                    <ArrowRight className="mr-2 w-5 h-5" />
                    Ir para o Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/aplicacoes/nova">
                  <Button variant="secondary">
                    <Briefcase className="mr-2 w-5 h-5" />
                    Adicionar esta vaga
                  </Button>
                </Link>
              </div>
              <div className="mt-3">
                <Button variant="ghost" size="sm" onClick={handleNewAnalysis}>
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Nova análise
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-navy mb-2">
                Quer melhorar esse score?
              </h2>
              <p className="text-navy/70 mb-6 max-w-md mx-auto">
                Com o GoHire Copilot você pode otimizar o currículo, acompanhar suas vagas e treinar para entrevistas com IA.
              </p>

              {/* Copilot Preview */}
              <div className="bg-sand rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-navy" />
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                    <p className="text-navy text-sm">
                      Como reescrever meu currículo para melhorar o match nessa vaga?
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-teal" />
                  </div>
                  <div className="bg-teal/10 rounded-lg rounded-tl-none p-3 flex-1">
                    <p className="text-navy text-sm">
                      Com base na sua análise (score {result.matchScore}/100), vou te ajudar a ajustar
                      {result.missingSignals.length > 0
                        ? ` os pontos de "${result.missingSignals[0].skill}" e mais...`
                        : ' os pontos identificados...'}
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
                <Button variant="ghost" size="sm" onClick={handleNewAnalysis} className="w-full sm:w-auto">
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Nova análise
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-sm text-navy/50">
          Esta análise foi gerada por IA com base nos textos fornecidos. Resultados reais de ATS podem variar conforme o sistema utilizado pelo recrutador.
        </p>
      </main>
    </div>
  )
}
