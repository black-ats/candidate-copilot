'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Input } from '@ui/components'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { createInterviewSession, getLastInsightData, checkInterviewAccess } from '../actions'
import { track } from '@/lib/analytics/track'
import { UpgradePrompt } from '@/components/upgrade-prompt'

const senioridadeOptions = [
  { value: 'estagio', label: 'Estagio' },
  { value: 'junior', label: 'Junior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Senior' },
  { value: 'lideranca', label: 'Lideranca' },
]

const areaOptions = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'financas', label: 'Financas' },
  { value: 'rh', label: 'RH' },
  { value: 'operacoes', label: 'Operacoes' },
  { value: 'produto', label: 'Produto' },
  { value: 'design', label: 'Design' },
  { value: 'outro', label: 'Outro' },
]

export default function IniciarPage() {
  const router = useRouter()
  const [cargo, setCargo] = useState('')
  const [area, setArea] = useState('')
  const [senioridade, setSenioridade] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    async function loadData() {
      // Check access
      const access = await checkInterviewAccess()
      setHasAccess(access.allowed)
      
      if (!access.allowed) {
        setIsLoadingData(false)
        return
      }

      // Load last insight data
      const lastData = await getLastInsightData()
      if (lastData) {
        setCargo(lastData.cargo || '')
        setArea(lastData.area || '')
        setSenioridade(lastData.senioridade || '')
      }
      setIsLoadingData(false)
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cargo.trim()) {
      setError('Informe o cargo')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await createInterviewSession({
        cargo: cargo.trim(),
        area: area || undefined,
        senioridade: senioridade || undefined,
      })

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result.session) {
        track('interview_started', {
          cargo,
          area,
          senioridade,
        })
        router.push(`/dashboard/interview-pro/sessao/${result.session.id}`)
      }
    } catch (err) {
      setError('Erro ao iniciar entrevista. Tente novamente.')
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="container-narrow py-8 sm:py-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber animate-spin mx-auto mb-4" />
          <p className="text-navy/70">Carregando...</p>
        </div>
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="container-narrow py-8 sm:py-12">
        <Link href="/dashboard/interview-pro" className="inline-flex items-center text-navy/70 hover:text-navy mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
        <UpgradePrompt remaining={0} limit={0} feature="interview_pro" />
      </div>
    )
  }

  return (
    <div className="container-narrow py-8 sm:py-12">
      <Link href="/dashboard/interview-pro" className="inline-flex items-center text-navy/70 hover:text-navy mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Link>

      <Card variant="elevated" className="max-w-lg mx-auto">
        <div className="p-6 border-b border-stone/30">
          <h1 className="text-2xl font-semibold text-navy mb-2">
            Configurar entrevista
          </h1>
          <p className="text-navy/70">
            Informe a vaga para perguntas personalizadas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Cargo / Vaga *
            </label>
            <Input
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Desenvolvedor Frontend"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Area
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-stone/40 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            >
              <option value="">Selecione...</option>
              {areaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Senioridade
            </label>
            <select
              value={senioridade}
              onChange={(e) => setSenioridade(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-stone/40 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            >
              <option value="">Selecione...</option>
              {senioridadeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Preparando entrevista...
              </>
            ) : (
              <>
                Comecar entrevista
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-navy/60">
            Sao 3 perguntas, dura cerca de 5 minutos.
          </p>
        </form>
      </Card>
    </div>
  )
}
