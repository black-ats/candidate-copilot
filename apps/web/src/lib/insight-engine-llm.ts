import { getAIProvider } from '@/lib/ai'
import type { EntryFlowData } from './schemas/entry-flow'
import type { InsightType, DiagnosticInsight } from './insight-engine-v2'
import { insightTypeLabels, objetivoLabels } from './insight-engine-v2'

// Labels for context building
const senioridadeLabels: Record<string, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  lead: 'Lead/Tech Lead',
  exec: 'Executivo/Diretor',
}

const areaLabels: Record<string, string> = {
  tech: 'Tecnologia/Engenharia',
  produto: 'Produto',
  design: 'Design/UX',
  negocios: 'Negócios/Vendas',
  outro: 'Outro',
}

const statusLabels: Record<string, string> = {
  empregado: 'Empregado',
  desempregado: 'Desempregado',
  transicao: 'Em transição',
}

const tempoLabels: Record<string, string> = {
  menos_3_meses: 'menos de 3 meses',
  '3_6_meses': '3 a 6 meses',
  '6_12_meses': '6 a 12 meses',
  mais_1_ano: 'mais de 1 ano',
}

const bloqueioDecisaoLabels: Record<string, string> = {
  salario: 'salário/pacote',
  crescimento: 'escopo e crescimento',
  estabilidade: 'estabilidade vs risco',
  comparacao: 'comparação com o atual',
}

const gargaloLabels: Record<string, string> = {
  sem_respostas: 'não recebe respostas',
  rejeicoes_rapidas: 'rejeições rápidas',
  poucas_respostas: 'poucas oportunidades',
  nao_sei: 'não sabe onde trava',
}

const faseMaximaLabels: Record<string, string> = {
  triagem: 'triagem inicial',
  tecnica: 'fase técnica',
  final: 'fase final',
  oferta: 'oferta/negociação',
}

const sinaisAlavancaLabels: Record<string, string> = {
  performance: 'performance comprovada',
  escopo: 'aumento de escopo',
  proposta_externa: 'proposta externa',
  mercado: 'defasagem de mercado',
  nenhum: 'nenhum sinal claro',
}

const tipoPivotLabels: Record<string, string> = {
  mesmo_dominio: 'mesmo domínio (ex: Tech para Produto)',
  mudanca_total: 'mudança total de área',
}

// Insight type descriptions for the LLM (patterns to investigate, not conclusions)
const insightTypeDescriptions: Record<InsightType, string> = {
  movimento_vs_progresso: 'Padrão a investigar: possível desconexão entre o tempo/esforço investido e os resultados obtidos. Analise os dados para entender se há sinais de estagnação apesar de atividade.',
  gargalo_errado: 'Padrão a investigar: o problema que o usuário acredita ter pode não ser o real gargalo. Use os dados informados para identificar onde está a real dificuldade.',
  desalinhamento_nivel: 'Padrão a investigar: possível incompatibilidade entre o nível das vagas buscadas e a experiência atual. Analise senioridade e fase onde trava para entender.',
  estagnacao_invisivel: 'Padrão a investigar: situação de conforto que pode estar impedindo crescimento. Analise tempo na situação, urgência e objetivo para entender o cenário.',
  esforco_mal_alocado: 'Padrão a investigar: energia sendo direcionada para uma mudança que pode precisar de mais planejamento. Considere urgência e tipo de transição desejada.',
}

/**
 * Build context string from user data
 */
function buildUserContext(data: EntryFlowData): string {
  const parts: string[] = []
  
  parts.push(`Cargo: ${data.cargo}`)
  parts.push(`Senioridade: ${senioridadeLabels[data.senioridade] || data.senioridade}`)
  parts.push(`Área: ${areaLabels[data.area] || data.area}`)
  parts.push(`Status: ${statusLabels[data.status] || data.status}`)
  
  if (data.tempoSituacao) {
    parts.push(`Tempo nessa situação: ${tempoLabels[data.tempoSituacao] || data.tempoSituacao}`)
  }
  
  if (data.urgencia) {
    parts.push(`Urgência para resolver: ${data.urgencia}/5`)
  }
  
  parts.push(`Objetivo principal: ${objetivoLabels[data.objetivo] || data.objetivo}`)
  
  // Contextual follow-ups
  if (data.bloqueioDecisao) {
    parts.push(`O que trava a decisão: ${bloqueioDecisaoLabels[data.bloqueioDecisao] || data.bloqueioDecisao}`)
  }
  if (data.gargaloEntrevistas) {
    parts.push(`Onde trava nas entrevistas: ${gargaloLabels[data.gargaloEntrevistas] || data.gargaloEntrevistas}`)
  }
  if (data.faseMaxima) {
    parts.push(`Fase máxima que costuma chegar: ${faseMaximaLabels[data.faseMaxima] || data.faseMaxima}`)
  }
  if (data.sinaisAlavanca) {
    parts.push(`Sinal de alavanca: ${sinaisAlavancaLabels[data.sinaisAlavanca] || data.sinaisAlavanca}`)
  }
  if (data.tipoPivot) {
    parts.push(`Tipo de mudança desejada: ${tipoPivotLabels[data.tipoPivot] || data.tipoPivot}`)
  }
  if (data.forcasTransferiveis) {
    parts.push(`Forças transferíveis: ${data.forcasTransferiveis}`)
  }
  if (data.decisaoEvitando) {
    parts.push(`Decisão que está evitando: ${data.decisaoEvitando}`)
  }
  
  return parts.join('\n')
}

/**
 * Build the system prompt for insight generation
 */
function buildSystemPrompt(insightType: InsightType): string {
  return `Você é um analista de carreira experiente. Você está dando feedback DIRETO para o usuário que preencheu o formulário — fale com ele em segunda pessoa ("você").

CATEGORIA DO INSIGHT: ${insightTypeLabels[insightType]}
DIREÇÃO DA ANÁLISE: ${insightTypeDescriptions[insightType]}

REGRAS FUNDAMENTAIS:
- Fale diretamente com o usuário usando "você" (não "o profissional", "o candidato", etc.)
- Use APENAS as informações que ele forneceu — não assuma comportamentos ou ações não mencionados
- Seja específico ao contexto dele (cargo, área, senioridade, situação)
- Evite frases genéricas de coaching ("você é capaz", "acredite em si")
- Se algo não foi informado, não invente — foque no que você sabe

TOM:
- Direto e respeitoso
- Honesto sobre riscos, sem ser alarmista
- Prático, não motivacional

FORMATO DE RESPOSTA (JSON):
{
  "diagnosis": "Descreva a situação atual em 2-3 frases, falando diretamente com o usuário (ex: 'Você está...')",
  "pattern": "Explique o padrão que você observa, conectando os pontos de forma lógica",
  "risk": "Aponte um risco real e específico, em 1-2 frases diretas",
  "nextStep": "Sugira 1-2 ações concretas para as próximas 1-2 semanas"
}

IMPORTANTE:
- Português brasileiro
- Sem emojis
- SEMPRE use "você", nunca terceira pessoa`
}

/**
 * Generate insight using LLM
 */
export async function generateLLMInsight(
  data: EntryFlowData,
  insightType: InsightType,
  confidence: 'high' | 'medium' | 'low'
): Promise<DiagnosticInsight> {
  const provider = getAIProvider()
  const userContext = buildUserContext(data)
  const systemPrompt = buildSystemPrompt(insightType)
  
  const response = await provider.complete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Analise este profissional e gere o insight:\n\n${userContext}` },
  ], {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 800,
  })
  
  // Parse JSON response
  let parsed: { diagnosis: string; pattern: string; risk: string; nextStep: string }
  
  try {
    // Try to extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    parsed = JSON.parse(jsonMatch[0])
  } catch (parseError) {
    console.error('[generateLLMInsight] Failed to parse LLM response:', parseError)
    throw new Error('Failed to parse LLM response')
  }
  
  // Build input hash (same as template version)
  const hashStr = JSON.stringify({
    cargo: data.cargo,
    senioridade: data.senioridade,
    area: data.area,
    status: data.status,
    tempoSituacao: data.tempoSituacao,
    urgencia: data.urgencia,
    objetivo: data.objetivo,
    bloqueioDecisao: data.bloqueioDecisao,
    gargaloEntrevistas: data.gargaloEntrevistas,
    faseMaxima: data.faseMaxima,
    sinaisAlavanca: data.sinaisAlavanca,
    tipoPivot: data.tipoPivot,
  })
  let hash = 0
  for (let i = 0; i < hashStr.length; i++) {
    const char = hashStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const inputHash = Math.abs(hash).toString(16)
  
  return {
    type: insightType,
    typeLabel: insightTypeLabels[insightType],
    diagnosis: parsed.diagnosis,
    pattern: parsed.pattern,
    risk: parsed.risk,
    nextStep: parsed.nextStep,
    inputHash,
    confidence,
  }
}
