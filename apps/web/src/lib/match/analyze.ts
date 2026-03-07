import { getAIProvider } from '@/lib/ai'
import { logger } from '@/lib/logger'
import type { MatchInput, MatchResult } from './types'

const SYSTEM_PROMPT = `Você é um especialista em recrutamento e ATS (Applicant Tracking Systems) com profunda experiência em análise de currículos.

Seu trabalho é comparar um currículo com uma descrição de vaga e produzir uma análise detalhada e acionável.

REGRAS:
- Fale diretamente com o usuário usando "você"
- Seja específico — cite termos exatos da vaga que faltam no currículo
- Não invente informações que não existem no currículo ou na vaga
- Seja honesto sobre fraquezas sem ser destrutivo
- Foque em ações concretas que o usuário pode tomar
- Português brasileiro, sem emojis

FORMATO DE RESPOSTA (JSON estrito):
{
  "matchScore": <número de 0 a 100>,
  "atsRisk": "<low | medium | high>",
  "diagnosis": "<2-3 frases resumindo a compatibilidade geral>",
  "jobTitle": "<cargo extraído da vaga, se identificável>",
  "companyName": "<empresa extraída da vaga, se identificável>",
  "missingSignals": [
    {
      "skill": "<competência/keyword ausente>",
      "importance": "<critical | important | nice_to_have>",
      "context": "<por que isso importa para esta vaga>"
    }
  ],
  "resumeWeaknesses": [
    {
      "area": "<área do problema>",
      "description": "<descrição específica do problema>"
    }
  ],
  "improvements": [
    {
      "action": "<ação concreta>",
      "impact": "<high | medium | low>",
      "detail": "<como executar essa ação>"
    }
  ]
}

CRITÉRIOS DE PONTUAÇÃO:
- 80-100: Forte match — currículo alinhado com os requisitos principais
- 60-79: Match parcial — há lacunas relevantes mas a base existe
- 40-59: Match fraco — lacunas significativas em requisitos-chave
- 0-39: Match muito fraco — currículo desalinhado com a vaga

CRITÉRIOS DE RISCO ATS:
- low: keywords principais presentes, formatação adequada
- medium: algumas keywords ausentes, possível filtro por ATS
- high: keywords críticas ausentes, alta chance de rejeição por ATS

REGRAS PARA missingSignals:
- Máximo 7 itens
- Ordenar por importância (critical primeiro)
- Somente incluir termos que realmente aparecem na vaga e estão ausentes no currículo

REGRAS PARA resumeWeaknesses:
- Máximo 4 itens
- Focar em problemas estruturais (impacto não claro, senioridade mal sinalizada, etc.)

REGRAS PARA improvements:
- Máximo 5 itens
- Ordenar por impacto (high primeiro)
- Cada ação deve ser executável em minutos a horas, não semanas`

export async function analyzeResumeMatch(input: MatchInput): Promise<MatchResult> {
  const provider = getAIProvider()

  const userMessage = `CURRÍCULO:
---
${input.resumeText.slice(0, 8000)}
---

DESCRIÇÃO DA VAGA:
---
${input.jobDescription.slice(0, 4000)}
---

Analise a compatibilidade entre o currículo e a vaga. Retorne APENAS o JSON.`

  const response = await provider.complete([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ], {
    model: 'gpt-4o-mini',
    temperature: 0.4,
    max_tokens: 2000,
  })

  let parsed: MatchResult

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response')
    }
    parsed = JSON.parse(jsonMatch[0])
  } catch (parseError) {
    logger.error('Failed to parse match analysis response', {
      error: parseError instanceof Error ? parseError.message : 'Unknown error',
      feature: 'resume_match',
    })
    throw new Error('Falha ao processar análise. Tente novamente.')
  }

  // Validate and clamp score
  parsed.matchScore = Math.max(0, Math.min(100, Math.round(parsed.matchScore)))

  if (!['low', 'medium', 'high'].includes(parsed.atsRisk)) {
    parsed.atsRisk = parsed.matchScore >= 70 ? 'low' : parsed.matchScore >= 45 ? 'medium' : 'high'
  }

  return {
    matchScore: parsed.matchScore,
    atsRisk: parsed.atsRisk,
    diagnosis: parsed.diagnosis || 'Análise não disponível.',
    missingSignals: (parsed.missingSignals || []).slice(0, 7),
    resumeWeaknesses: (parsed.resumeWeaknesses || []).slice(0, 4),
    improvements: (parsed.improvements || []).slice(0, 5),
    jobTitle: parsed.jobTitle,
    companyName: parsed.companyName,
  }
}
