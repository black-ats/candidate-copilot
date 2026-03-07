'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { canUseResumeMatch } from '@/lib/subscription/check-access'
import { incrementMatchUsage } from '@/lib/subscription/actions'
import { analyzeResumeMatch } from '@/lib/match'
import { extractTextFromUpload } from '@/lib/match/extract-text'
import { trackAIUsage } from '@/lib/ai/usage-tracker'
import { logger } from '@/lib/logger'
import type { MatchResult } from '@/lib/match'

const matchInputSchema = z.object({
  resumeText: z.string().min(50, 'Currículo muito curto. Cole o texto completo do seu currículo.').max(15000),
  jobDescription: z.string().min(50, 'Descrição da vaga muito curta. Cole a descrição completa.').max(8000),
})

export type MatchAnalysisResponse = {
  success: true
  result: MatchResult
} | {
  success: false
  error: string
  limitReached?: boolean
}

export async function analyzeMatchAction(formData: {
  resumeText: string
  jobDescription: string
}): Promise<MatchAnalysisResponse> {
  const validated = matchInputSchema.safeParse(formData)
  if (!validated.success) {
    const firstError = validated.error.errors[0]?.message || 'Dados inválidos'
    return { success: false, error: firstError }
  }

  try {
    const result = await analyzeResumeMatch({
      resumeText: validated.data.resumeText,
      jobDescription: validated.data.jobDescription,
    })

    return { success: true, result }
  } catch (err) {
    logger.error('Resume match analysis failed', {
      error: err instanceof Error ? err.message : 'Unknown error',
      feature: 'resume_match',
    })
    return { success: false, error: 'Erro ao analisar. Tente novamente em alguns segundos.' }
  }
}

export async function extractResumeTextAction(formData: FormData): Promise<{
  success: boolean
  text?: string
  error?: string
}> {
  const file = formData.get('file') as File | null
  if (!file) {
    return { success: false, error: 'Nenhum arquivo enviado.' }
  }

  const result = await extractTextFromUpload(file)

  if (result.error) {
    return { success: false, error: result.error }
  }

  return { success: true, text: result.text }
}

export async function checkMatchAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { allowed: true, remaining: null, limit: null, plan: null }
  }

  const access = await canUseResumeMatch(user.id)
  return access
}

export async function saveMatchResult(result: MatchResult & { resumeText: string; jobDescription: string }) {
  const { supabase, user, error } = await getAuthenticatedUser()
  if (error || !user) {
    return { error: 'Não autenticado' }
  }

  const access = await canUseResumeMatch(user.id)
  if (!access.allowed) {
    return { error: 'Limite de análises atingido', limitReached: true }
  }

  const { data: match, error: insertError } = await supabase
    .from('resume_matches')
    .insert({
      user_id: user.id,
      resume_text: result.resumeText,
      job_description: result.jobDescription,
      job_title: result.jobTitle,
      company_name: result.companyName,
      match_score: result.matchScore,
      ats_risk: result.atsRisk,
      missing_signals: result.missingSignals,
      resume_weaknesses: result.resumeWeaknesses,
      improvements: result.improvements,
      diagnosis: result.diagnosis,
    })
    .select('id')
    .single()

  if (insertError) {
    logger.error('Failed to save match result', {
      error: insertError.message,
      userId: user.id,
      feature: 'resume_match',
    })
    return { error: 'Erro ao salvar análise' }
  }

  await incrementMatchUsage()

  await trackAIUsage(user.id, 'insight', 'gpt-4o-mini', {
    prompt_tokens: 0,
    completion_tokens: 0,
  })

  revalidatePath('/dashboard')

  return { success: true, matchId: match?.id }
}
