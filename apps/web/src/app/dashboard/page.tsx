import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, Card, Badge } from '@ui/components'
import { Sparkles, ArrowRight, Mic, Briefcase, TrendingUp, Trophy, BarChart3 } from 'lucide-react'
import { getApplicationStats } from './aplicacoes/actions'
import { getDashboardMetrics, getHeroData } from './actions'
import { PendingInsightSaver } from './_components/pending-insight-saver'
import { MetricsCards } from './_components/metrics-cards'
import { HeroCard } from './_components/hero-card'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const stats = await getApplicationStats()
  const metrics = await getDashboardMetrics()
  const heroData = await getHeroData()

  // Buscar insights do usuario
  const { data: insights } = await supabase
    .from('insights')
    .select('id, recommendation, objetivo, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Salva insight pendente automaticamente apos signup */}
      <PendingInsightSaver />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-navy mb-2">
          Bem-vindo ao seu Copilot
        </h1>
        <p className="text-navy/70">
          {user?.email}
        </p>
      </div>

      <div className="grid gap-6">
        {/* 1. Hero Card - Acao mais importante do momento */}
        {heroData && <HeroCard data={heroData} />}

        {/* 2. Aplicacoes - Core do produto */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-teal" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-navy">
                  Suas Aplicacoes
                </h2>
                <p className="text-sm text-navy/60">
                  Acompanhe suas candidaturas
                </p>
              </div>
            </div>
            <Link href="/dashboard/aplicacoes">
              <Button size="sm">
                Ver todas
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-stone/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-navy mb-1">{stats.total}</div>
              <div className="text-xs text-navy/60">Total</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-700 mb-1">
                <TrendingUp className="w-5 h-5" />
                {stats.em_andamento}
              </div>
              <div className="text-xs text-blue-600">Em andamento</div>
            </div>
            <div className="bg-teal/10 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-teal mb-1">
                <Trophy className="w-5 h-5" />
                {stats.propostas}
              </div>
              <div className="text-xs text-teal">Propostas</div>
            </div>
          </div>

          {stats.total === 0 && (
            <div className="mt-4 pt-4 border-t border-stone/20">
              <p className="text-sm text-navy/60 mb-3">
                Comece a rastrear suas candidaturas para ter uma visao clara do seu progresso.
              </p>
              <Link href="/dashboard/aplicacoes/nova">
                <Button variant="secondary" size="sm">
                  Adicionar primeira aplicacao
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* 3. Insights - Combinado com CTA de novo insight */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-navy">
                  Seus Insights
                </h2>
                <p className="text-sm text-navy/60">
                  Recomendacoes personalizadas
                </p>
              </div>
            </div>
            <Link href="/comecar">
              <Button size="sm">
                Novo insight
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {insights && insights.length > 0 ? (
            <>
              <ul className="space-y-2">
                {insights.slice(0, 3).map((insight) => (
                  <li key={insight.id}>
                    <Link 
                      href={`/dashboard/insights/${insight.id}`}
                      className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-stone/5 transition-colors"
                    >
                      <Sparkles className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-navy font-medium line-clamp-1">{insight.recommendation}</p>
                        <p className="text-sm text-navy/60">
                          {formatDate(insight.created_at)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-navy/30 flex-shrink-0 mt-1" />
                    </Link>
                  </li>
                ))}
              </ul>
              {insights.length > 3 && (
                <div className="mt-3 pt-3 border-t border-stone/20 text-center">
                  <Link href="/dashboard/insights">
                    <Button variant="ghost" size="sm">
                      Ver todos os {insights.length} insights
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-navy/60 text-sm mb-3">
                Responda algumas perguntas e receba recomendacoes personalizadas para sua carreira.
              </p>
              <Link href="/comecar">
                <Button variant="secondary" size="sm">
                  Gerar primeiro insight
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* 4. Metricas - Contexto sobre a busca */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy">Sua busca</h2>
            <Link href="/dashboard/metricas">
              <Button variant="ghost" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver mais
              </Button>
            </Link>
          </div>
          <MetricsCards metrics={metrics} />
          {metrics.total === 0 && (
            <p className="text-sm text-navy/60 mt-4 text-center">
              Adicione suas primeiras aplicacoes para ver metricas
            </p>
          )}
        </Card>

        {/* 5. Interview Pro - Upsell */}
        <Card className="p-6 border-teal/30 bg-teal/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-teal" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-teal/20 text-teal">Pro</Badge>
              <h3 className="text-lg font-semibold text-navy mb-1">
                Interview Pro
              </h3>
              <p className="text-navy/70 text-sm mb-3">
                Mock interviews com IA. Pratique e receba feedback instantaneo.
              </p>
              <Link href="/dashboard/interview-pro" className="text-sm font-medium text-teal hover:text-teal/80 transition-colors">
                Treinar entrevistas →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
