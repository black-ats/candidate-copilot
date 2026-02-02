import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, Badge, Button } from '@ui/components'
import { ArrowLeft, CheckCircle, AlertTriangle, MessageSquare, ArrowRight } from 'lucide-react'
import { objetivoLabels } from '@/lib/insight-engine'
import { CopilotCTACard } from './continue-button'
import { ContextualCTAs } from './contextual-ctas'
import { validateUUID } from '@/lib/schemas/uuid'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function getInsight(id: string) {
  // Validar UUID antes da query
  const uuidValidation = validateUUID(id)
  if (!uuidValidation.success) {
    return null
  }

  const supabase = await createClient()
  
  const { data: insight, error } = await supabase
    .from('insights')
    .select('*')
    .eq('id', uuidValidation.data)
    .single()
  
  if (error || !insight) {
    return null
  }
  
  return insight
}

// Check if this is a V1.1 insight (has diagnostic fields)
function isV2Insight(insight: { diagnosis?: string; type?: string }): boolean {
  return Boolean(insight.diagnosis && insight.type)
}

export default async function InsightDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const insight = await getInsight(id)

  if (!insight) {
    notFound()
  }

  const isV2 = isV2Insight(insight)

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/insights">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Voltar
          </Button>
        </Link>
        <span className="text-sm text-navy/60">
          {formatDate(insight.created_at)}
        </span>
      </div>

      {/* Context Summary */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge>{insight.cargo}</Badge>
        {insight.area && <Badge variant="info">{insight.area}</Badge>}
        {insight.objetivo && <Badge variant="info">{objetivoLabels[insight.objetivo] || insight.objetivo}</Badge>}
      </div>

      {/* Insight Content */}
      <Card variant="elevated" className="mb-6 overflow-hidden">
        {isV2 ? (
          <>
            {/* V1.1 Diagnostic Structure */}
            <div className="bg-navy text-sand p-4 sm:p-6">
              {insight.type_label && (
                <Badge variant="warning" className="mb-3">
                  {insight.type_label}
                </Badge>
              )}
              <h1 className="text-xl font-semibold">
                Sua análise de carreira
              </h1>
            </div>

            {/* Diagnosis - Current situation */}
            <div className="p-4 sm:p-6 border-b border-stone/30">
              <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-2">
                Situação atual
              </h3>
              <p className="text-navy">{insight.diagnosis}</p>
            </div>

            {/* Pattern observed */}
            {insight.pattern && (
              <div className="p-4 sm:p-6 border-b border-stone/30">
                <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-2">
                  Padrão observado
                </h3>
                <p className="text-navy">{insight.pattern}</p>
              </div>
            )}

            {/* Risk - highlighted */}
            {insight.risk && (
              <div className="p-4 sm:p-6 border-b border-stone/30 bg-amber/5">
                <h3 className="text-sm font-semibold text-amber uppercase tracking-wide mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risco aberto
                </h3>
                <p className="text-navy">{insight.risk}</p>
              </div>
            )}

            {/* Next step - actionable + Contextual CTA */}
            {insight.next_step && (
              <div className="p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-teal uppercase tracking-wide mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Próximo passo recomendado
                </h3>
                <p className="text-navy font-medium mb-4">{insight.next_step}</p>
                <ContextualCTAs objetivo={insight.objetivo} variant="inline" />
              </div>
            )}
          </>
        ) : (
          <>
            {/* V1 Legacy Structure */}
            <div className="bg-navy text-sand p-4 sm:p-6">
              <h1 className="text-xl font-semibold">
                {insight.recommendation}
              </h1>
            </div>

            {/* Why section */}
            {insight.why && insight.why.length > 0 && (
              <div className="p-4 sm:p-6 border-b border-stone/30">
                <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
                  Por que?
                </h3>
                <ul className="space-y-2">
                  {insight.why.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                      <span className="text-navy">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {insight.risks && insight.risks.length > 0 && (
              <div className="p-4 sm:p-6 border-b border-stone/30 bg-amber/5">
                <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
                  Riscos a considerar
                </h3>
                <ul className="space-y-2">
                  {insight.risks.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                      <span className="text-navy">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps + Contextual CTA */}
            {insight.next_steps && insight.next_steps.length > 0 && (
              <div className="p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
                  Próximos passos
                </h3>
                <ol className="space-y-3 mb-4">
                  {insight.next_steps.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {i + 1}
                      </span>
                      <span className="text-navy">{item}</span>
                    </li>
                  ))}
                </ol>
                <ContextualCTAs objetivo={insight.objetivo} variant="inline" />
              </div>
            )}
          </>
        )}
      </Card>

      {/* CTA: Continuar conversa - texto contextualizado por objetivo */}
      <CopilotCTACard 
        objetivo={insight.objetivo}
        insight={{
          id: insight.id,
          cargo: insight.cargo,
          area: insight.area,
          senioridade: insight.senioridade,
          status: insight.status,
          objetivo: insight.objetivo,
          recommendation: insight.recommendation,
          next_steps: insight.next_steps,
          diagnosis: insight.diagnosis,
          pattern: insight.pattern,
          risk: insight.risk,
          next_step: insight.next_step,
          type_label: insight.type_label,
          urgencia: insight.urgencia,
          tempo_situacao: insight.tempo_situacao,
          decision_blocker: insight.decision_blocker,
          interview_bottleneck: insight.interview_bottleneck,
          max_stage: insight.max_stage,
          leverage_signals: insight.leverage_signals,
          pivot_type: insight.pivot_type,
          transferable_strengths: insight.transferable_strengths,
          avoided_decision: insight.avoided_decision,
        }} 
      />
    </div>
  )
}
