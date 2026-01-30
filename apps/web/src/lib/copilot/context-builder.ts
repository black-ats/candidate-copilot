import type { UserContext } from './types'
import type { Application } from '@/lib/types/application'

interface InsightFromDB {
  id: string
  recommendation: string
  why: string[] | unknown
  risks: string[] | unknown
  next_steps: string[] | unknown
  objetivo: string
  cargo: string
  senioridade: string
  area: string
  status: string
  created_at: string
}

function daysSince(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function ensureStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  return []
}

export function buildUserContext(
  applications: Application[] | null,
  insights: InsightFromDB[] | null
): UserContext {
  const apps = applications ?? []
  const insightsList = insights ?? []
  
  // Calcular metricas
  const total = apps.length
  const entrevistas = apps.filter(a => a.status === 'entrevista').length
  const propostas = apps.filter(a => a.status === 'proposta').length
  const rejeicoes = apps.filter(a => a.status === 'rejeitado').length
  const aplicados = apps.filter(a => a.status === 'aplicado').length
  const emAnalise = apps.filter(a => a.status === 'em_analise').length
  
  // Aplicacoes pendentes (aguardando resposta)
  const pendingStatuses = ['aplicado', 'em_analise']
  const pendingApps = apps
    .filter(a => pendingStatuses.includes(a.status))
    .map(a => ({
      company: a.company,
      title: a.title,
      daysSinceApplied: daysSince(a.created_at)
    }))
    .sort((a, b) => b.daysSinceApplied - a.daysSinceApplied)
  
  // Aplicacoes recentes
  const recentApps = apps
    .slice(0, 10)
    .map(a => ({
      company: a.company,
      title: a.title,
      status: a.status,
      appliedAt: formatDate(a.created_at),
      daysSinceApplied: daysSince(a.created_at)
    }))
  
  // Processar insights
  const processedInsights = insightsList.map(insight => ({
    id: insight.id,
    recommendation: insight.recommendation,
    why: ensureStringArray(insight.why),
    risks: ensureStringArray(insight.risks),
    nextSteps: ensureStringArray(insight.next_steps),
    objetivo: insight.objetivo,
    createdAt: formatDate(insight.created_at)
  }))
  
  // Contexto de carreira do ultimo insight
  const lastInsight = insightsList[0]
  const careerContext = lastInsight ? {
    cargo: lastInsight.cargo,
    senioridade: lastInsight.senioridade,
    area: lastInsight.area,
    status: lastInsight.status,
    objetivo: lastInsight.objetivo
  } : null
  
  // Encontrar primeira e ultima atividade
  const dates = apps.map(a => new Date(a.created_at).getTime())
  const activeSince = dates.length > 0 
    ? formatDate(new Date(Math.min(...dates)).toISOString())
    : ''
  const lastActivity = dates.length > 0
    ? formatDate(new Date(Math.max(...dates)).toISOString())
    : ''

  return {
    profile: {
      totalApplications: total,
      activeSince,
      lastActivity
    },
    metrics: {
      taxaConversao: total > 0 ? Math.round((entrevistas / total) * 100) : 0,
      processosAtivos: entrevistas + propostas,
      aguardandoResposta: aplicados + emAnalise,
      ofertas: propostas,
      rejeicoes
    },
    recentApplications: recentApps,
    pendingApplications: pendingApps,
    insights: processedInsights,
    careerContext
  }
}

export function buildSystemPrompt(context: UserContext): string {
  const contextStr = formatContextForPrompt(context)
  
  return `Voce e o GoHire Copilot, um assistente de carreira que ajuda 
usuarios a tomar decisoes sobre sua busca de emprego.

CONTEXTO DO USUARIO:
${contextStr}

DIRETRIZES:
1. Sempre baseie suas respostas nos dados reais do usuario
2. Seja direto e objetivo - evite respostas genericas
3. Quando apropriado, sugira acoes concretas
4. Use um tom amigavel mas profissional
5. Se nao tiver dados suficientes, diga isso claramente
6. Responda sempre em portugues brasileiro

FORMATO DE RESPOSTA:
- Use paragrafos curtos
- Destaque numeros e metricas importantes com **negrito**
- Inclua proximos passos quando relevante
- Evite listas muito longas`
}

function formatContextForPrompt(ctx: UserContext): string {
  let prompt = `- Total de aplicacoes: ${ctx.profile.totalApplications}
- Taxa de conversao: ${ctx.metrics.taxaConversao}% (entrevistas/total)
- Processos ativos: ${ctx.metrics.processosAtivos}
- Aguardando resposta: ${ctx.metrics.aguardandoResposta} aplicacoes
- Ofertas: ${ctx.metrics.ofertas}
- Rejeicoes: ${ctx.metrics.rejeicoes}`

  if (ctx.pendingApplications.length > 0) {
    const oldest = ctx.pendingApplications[0]
    prompt += `\n- Aplicacao mais antiga sem resposta: ${oldest.company} (${oldest.daysSinceApplied} dias)`
  }
  
  if (ctx.careerContext) {
    prompt += `

PERFIL DE CARREIRA:
- Cargo atual: ${ctx.careerContext.cargo}
- Senioridade: ${ctx.careerContext.senioridade}
- Area: ${ctx.careerContext.area}
- Objetivo: ${ctx.careerContext.objetivo}`
  }
  
  if (ctx.insights.length > 0) {
    prompt += `

HISTORICO DE INSIGHTS:`
    
    ctx.insights.slice(0, 3).forEach((insight, i) => {
      prompt += `

[Insight ${i + 1} - ${insight.createdAt}]
- Recomendacao: "${insight.recommendation}"
- Motivos: ${insight.why.join('; ')}
- Riscos: ${insight.risks.join('; ')}
- Proximos passos: ${insight.nextSteps.join('; ')}`
    })
  }
  
  if (ctx.recentApplications.length > 0) {
    prompt += `

APLICACOES RECENTES:`
    ctx.recentApplications.slice(0, 5).forEach(app => {
      prompt += `\n- ${app.company} (${app.title}) - ${app.status} - ${app.daysSinceApplied} dias`
    })
  }

  return prompt
}
