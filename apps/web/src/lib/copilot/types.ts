export interface UserContext {
  // Resumo do usuario
  profile: {
    totalApplications: number
    activeSince: string
    lastActivity: string
  }
  
  // Metricas
  metrics: {
    taxaConversao: number
    processosAtivos: number
    aguardandoResposta: number
    ofertas: number
    rejeicoes: number
  }
  
  // Aplicacoes recentes (ultimas 10)
  recentApplications: {
    company: string
    title: string
    status: string
    appliedAt: string
    daysSinceApplied: number
  }[]
  
  // Aplicacoes aguardando resposta
  pendingApplications: {
    company: string
    title: string
    daysSinceApplied: number
  }[]
  
  // Historico de insights (todos os insights gerados)
  insights: {
    id: string
    recommendation: string
    why: string[]
    risks: string[]
    nextSteps: string[]
    objetivo: string
    createdAt: string
  }[]
  
  // Resumo do contexto de carreira (do ultimo insight)
  careerContext: {
    cargo: string
    senioridade: string
    area: string
    status: string
    objetivo: string
  } | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface SuggestedQuestion {
  id: string
  label: string
  category: 'metricas' | 'proximos_passos' | 'insights' | 'analise'
}
