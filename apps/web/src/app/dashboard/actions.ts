'use server'

import { createClient } from '@/lib/supabase/server'
import { detectContext, buildMessage, type HeroData, type UserDataForHero } from '@/lib/hero'
import type { Application } from '@/lib/types/application'

export interface DashboardMetrics {
  total: number
  porStatus: Record<string, number>
  taxaConversao: number
  processosAtivos: number
  aguardandoResposta: number
  ofertas: number
}

export interface BenchmarkMetrics {
  taxaConversaoMedia: number
  processosAtivosMedia: number
  totalUsuariosAtivos: number
  percentilUsuario: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      total: 0,
      porStatus: {},
      taxaConversao: 0,
      processosAtivos: 0,
      aguardandoResposta: 0,
      ofertas: 0,
    }
  }
  
  const { data: applications } = await supabase
    .from('applications')
    .select('status')
    .eq('user_id', user.id)

  if (!applications || applications.length === 0) {
    return {
      total: 0,
      porStatus: {},
      taxaConversao: 0,
      processosAtivos: 0,
      aguardandoResposta: 0,
      ofertas: 0,
    }
  }
  
  // Contar por status
  const porStatus: Record<string, number> = {}
  applications.forEach(app => {
    porStatus[app.status] = (porStatus[app.status] || 0) + 1
  })
  
  const total = applications.length
  const entrevistas = porStatus['entrevista'] || 0
  const propostas = porStatus['proposta'] || 0
  const aceito = porStatus['aceito'] || 0
  const aplicados = porStatus['aplicado'] || 0
  const emAnalise = porStatus['em_analise'] || 0
  const conversoes = entrevistas + propostas + aceito
  const taxaConversao = total > 0 ? Math.round((conversoes / total) * 100) : 0

  return {
    total,
    porStatus,
    taxaConversao,
    processosAtivos: entrevistas + propostas,
    aguardandoResposta: aplicados + emAnalise,
    ofertas: propostas,
  }
}

export async function getBenchmarkMetrics(
  userMetrics: DashboardMetrics
): Promise<BenchmarkMetrics | null> {
  const supabase = await createClient()
  
  // Usar função do banco que bypassa RLS (SECURITY DEFINER)
  const { data: benchmarkData, error } = await supabase
    .rpc('get_benchmark_stats')
  
  if (error || !benchmarkData) {
    // Função retorna null se não atingir requisitos mínimos
    return null
  }
  
  // Calcular percentil do usuário
  const { data: percentil } = await supabase
    .rpc('get_user_percentile', { user_taxa: userMetrics.taxaConversao })
  
  return {
    taxaConversaoMedia: benchmarkData.taxa_conversao_media || 0,
    processosAtivosMedia: 0, // Simplificado por agora
    totalUsuariosAtivos: benchmarkData.users_with_3plus || 0,
    percentilUsuario: percentil || 0,
  }
}

export async function getHeroData(hasPendingInsight: boolean = false): Promise<HeroData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Paralelizar as 3 queries independentes para reduzir latência
  const [
    { data: applications },
    { data: insights },
    { data: recentInterview },
  ] = await Promise.all([
    // Buscar aplicacoes do usuario
    supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    // Buscar insights do usuario
    supabase
      .from('insights')
      .select('id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    // Buscar entrevista simulada recente (Pro users)
    supabase
      .from('interview_sessions')
      .select('id, cargo, area, overall_score, feedback, completed_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const userData: UserDataForHero = {
    applications: (applications || []) as Application[],
    insights: insights || [],
    hasPendingInsight,
    recentInterviewSession: recentInterview || null,
  }

  // Detectar contexto e construir mensagem
  const contextResult = detectContext(userData)
  const heroData = await buildMessage(contextResult, user.id)

  return heroData
}
