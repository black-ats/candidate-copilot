'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { canGenerateInsight } from '@/lib/subscription/check-access'
import { incrementInsightUsage } from '@/lib/subscription/actions'

const insightSchema = z.object({
  // Entry flow data (camelCase from frontend)
  cargo: z.string(),
  senioridade: z.string(),
  area: z.string(),
  status: z.string(),
  tempoSituacao: z.string().optional(),
  urgencia: z.number().optional(),
  objetivo: z.string(),
  objetivoOutro: z.string().optional(),
  // Generated insight
  recommendation: z.string(),
  why: z.array(z.string()),
  risks: z.array(z.string()),
  nextSteps: z.array(z.string()),
})

export type InsightData = z.infer<typeof insightSchema>

// Check if user can generate insight (for logged in users)
export async function checkInsightAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Not logged in - allow generation but don't track
    return { allowed: true, remaining: null, limit: null, plan: null }
  }
  
  const access = await canGenerateInsight(user.id)
  return access
}

export async function saveInsight(data: InsightData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Check if user has access before saving
  const access = await canGenerateInsight(user.id)
  if (!access.allowed) {
    return { error: 'Limite de insights atingido', limitReached: true }
  }
  
  const validated = insightSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Dados invalidos' }
  }
  
  const { data: insertedInsight, error } = await supabase
    .from('insights')
    .insert({
      user_id: user.id,
      cargo: validated.data.cargo,
      senioridade: validated.data.senioridade,
      area: validated.data.area,
      status: validated.data.status,
      tempo_situacao: validated.data.tempoSituacao,
      urgencia: validated.data.urgencia,
      objetivo: validated.data.objetivo,
      objetivo_outro: validated.data.objetivoOutro,
      recommendation: validated.data.recommendation,
      why: validated.data.why,
      risks: validated.data.risks,
      next_steps: validated.data.nextSteps,
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Error saving insight:', error)
    return { error: 'Erro ao salvar insight' }
  }
  
  // Increment usage counter after successful save
  await incrementInsightUsage()
  
  // Revalidate dashboard pages to show new insight
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/insights')
  
  return { success: true, insightId: insertedInsight?.id }
}
