import { createClient } from '@/lib/supabase/server'
import { Card } from '@ui/components'
import { Lightbulb, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { InsightChatButton } from './chat-button'
import { objetivoLabels } from '@/lib/insight-engine'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function InsightsPage() {
  const supabase = await createClient()
  
  const { data: insights } = await supabase
    .from('insights')
    .select('id, recommendation, objetivo, cargo, area, next_steps, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber" />
          </div>
          <h1 className="text-2xl font-semibold text-navy">
            Seus Insights
          </h1>
        </div>
        <p className="text-navy/70">
          Todos os insights salvos da sua jornada de carreira.
        </p>
      </div>

      {insights && insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight) => (
            <Link key={insight.id} href={`/dashboard/insights/${insight.id}`}>
              <Card className="p-6 hover:bg-stone/5 transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-5 h-5 text-amber flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-medium mb-2">
                      {insight.recommendation}
                    </p>
                    {insight.objetivo && (
                      <p className="text-sm text-navy/60 mb-2">
                        Objetivo: {objetivoLabels[insight.objetivo] || insight.objetivo}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-navy/40">
                        {formatDate(insight.created_at)}
                      </p>
                      <InsightChatButton insight={insight} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 bg-stone/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-navy/40" />
          </div>
          <h2 className="text-lg font-medium text-navy mb-2">
            Nenhum insight salvo ainda
          </h2>
          <p className="text-navy/60 mb-4 max-w-md mx-auto">
            Comece respondendo algumas perguntas para receber insights personalizados sobre sua carreira.
          </p>
          <Link 
            href="/comecar"
            className="inline-flex items-center justify-center px-4 py-2 bg-amber text-navy font-medium rounded-lg hover:bg-amber/90 transition-colors"
          >
            Gerar primeiro insight
          </Link>
        </Card>
      )}
    </div>
  )
}
