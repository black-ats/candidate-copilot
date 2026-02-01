import { getOpenAIClient } from '@/lib/ai/openai/client'
import { trackAIUsage } from '@/lib/ai/usage-tracker'
import type { HeroContext, HeroData, ContextDetectionResult } from './types'

// Cache em memoria para mensagens AI (evita chamadas repetidas)
const messageCache = new Map<string, { data: HeroData; timestamp: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

function getCacheKey(context: HeroContext, metadata?: Record<string, unknown>): string {
  // Para contextos com app específico, usa o app id
  if (metadata?.company) {
    return `${context}_${metadata.company}`
  }
  return context
}

function getCachedMessage(key: string): HeroData | null {
  const cached = messageCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }
  // Limpa cache expirado
  if (cached) {
    messageCache.delete(key)
  }
  return null
}

function setCachedMessage(key: string, data: HeroData): void {
  messageCache.set(key, { data, timestamp: Date.now() })
}

// Dicas rotativas para active_summary (evita chamadas AI desnecessárias)
// Troca a cada 6 horas para manter o conteúdo fresco
const tips = [
  // Candidatura
  'Personalize cada candidatura. Recrutadores valorizam quem demonstra interesse genuíno pela vaga e empresa.',
  'Adapte seu currículo para cada vaga, destacando experiências relevantes para a posição.',
  'Inclua números e resultados no currículo. "Aumentei vendas em 30%" é mais impactante que "responsável por vendas".',
  'Envie sua candidatura no início da semana. Estudos mostram que vagas recebem mais atenção segunda e terça.',
  
  // LinkedIn e Networking
  'Mantenha seu LinkedIn atualizado. 87% dos recrutadores usam a plataforma para encontrar candidatos.',
  'Aproveite cada oportunidade de networking, mesmo que pareça pequena. Cada conexão pode abrir portas.',
  'Conecte-se com recrutadores das empresas que te interessam. Uma mensagem personalizada pode abrir portas.',
  'Participe de grupos do LinkedIn da sua área. É uma ótima forma de ficar por dentro das tendências.',
  'Peça recomendações no LinkedIn para colegas e gestores. Elas aumentam a credibilidade do seu perfil.',
  
  // Entrevistas
  'Prepare-se para entrevistas pesquisando a cultura da empresa. Isso demonstra comprometimento.',
  'Pratique suas respostas para perguntas comportamentais usando o método STAR (Situação, Tarefa, Ação, Resultado).',
  'Prepare perguntas para fazer ao entrevistador. Demonstra interesse e te ajuda a avaliar a empresa.',
  'Vista-se um nível acima do dress code da empresa. Melhor pecar pelo excesso de formalidade.',
  'Chegue 10-15 minutos antes da entrevista. Pontualidade é básico, mas faz diferença.',
  
  // Follow-up
  'Faça follow-up educado após entrevistas. Um email de agradecimento pode fazer a diferença.',
  'Se não tiver retorno em 1-2 semanas, envie um follow-up cordial. Demonstra interesse sem ser insistente.',
  'Após uma rejeição, peça feedback. Nem todos respondem, mas quando respondem, é ouro.',
  
  // Mindset e estratégia
  'Trate sua busca de emprego como um projeto. Defina metas semanais de aplicações e follow-ups.',
  'Não coloque todos os ovos na mesma cesta. Continue aplicando mesmo quando uma vaga parece promissora.',
  'Rejeições fazem parte do processo. Cada "não" te aproxima do "sim" certo.',
  'Cuide da sua saúde mental durante a busca. Pausas e autocuidado não são luxo, são necessidade.',
  'Celebre pequenas vitórias: uma entrevista agendada, um feedback positivo, uma nova conexão.',
  
  // Salário e negociação
  'Pesquise a faixa salarial do mercado antes de entrevistas. Sites como Glassdoor podem ajudar.',
  'Quando perguntarem sua pretensão salarial, dê uma faixa ao invés de um número fixo.',
  'Considere o pacote total: salário, benefícios, flexibilidade, crescimento. Nem tudo é sobre dinheiro.',
  
  // Desenvolvimento
  'Aprenda uma skill nova enquanto busca emprego. Mostra proatividade e mantém você atualizado.',
  'Contribua em projetos open source ou crie um portfólio. Evidências práticas valem mais que palavras.',
  'Mantenha-se ativo na sua área: leia artigos, participe de eventos, faça cursos.',
]

function getRotatingTip(): string {
  // Troca a cada 6 horas (4 periodos por dia)
  const sixHoursMs = 6 * 60 * 60 * 1000
  const periodsSinceEpoch = Math.floor(Date.now() / sixHoursMs)
  return tips[periodsSinceEpoch % tips.length]
}

// Templates estáticos para contextos simples
const templates: Record<string, (metadata?: Record<string, unknown>) => HeroData> = {
  pending_insight: () => ({
    context: 'pending_insight',
    title: '💡 Insight pronto para você',
    message: 'Você tem um insight de carreira pendente. Acesse para ver suas recomendações personalizadas.',
    primaryCta: { label: 'Ver insight', href: '/dashboard/insights' },
    secondaryCta: { label: 'Tirar dúvidas', href: '/dashboard?chat=open' },
  }),

  stale_apps: (metadata) => ({
    context: 'stale_apps',
    title: '⏰ Suas aplicações precisam de atenção',
    message: `Você tem ${metadata?.count || 'várias'} aplicações sem atualização há mais de 2 semanas. Que tal revisar o status delas?`,
    primaryCta: { label: 'Ver aplicações', href: '/dashboard/aplicacoes' },
    secondaryCta: { label: 'Dicas de follow-up', href: '/dashboard?chat=open&prompt=dicas-followup' },
  }),

  low_activity: (metadata) => ({
    context: 'low_activity',
    title: '🎯 Hora de continuar sua busca',
    message: `Já faz ${metadata?.daysSinceLastApp || 'alguns'} dias desde sua última aplicação. Manter o ritmo é importante!`,
    primaryCta: { label: 'Adicionar vaga', href: '/dashboard/aplicacoes/nova' },
    secondaryCta: { label: 'Ver vagas salvas', href: '/dashboard/aplicacoes' },
  }),

  new_user: () => ({
    context: 'new_user',
    title: '👋 Bem-vindo ao seu Copilot de carreira',
    message: 'Comece adicionando suas aplicações ou gere um insight personalizado sobre sua carreira.',
    primaryCta: { label: 'Gerar insight', href: '/comecar' },
    secondaryCta: { label: 'Adicionar vaga', href: '/dashboard/aplicacoes/nova' },
  }),
}

// Contextos que usam AI para personalizar mensagem
const aiContexts: HeroContext[] = ['proposal_received', 'interview_soon', 'interview_feedback', 'needs_followup', 'active_summary']

async function generateAIMessage(result: ContextDetectionResult, userId?: string): Promise<HeroData | null> {
  const openai = getOpenAIClient()
  
  const prompts: Record<string, string> = {
    proposal_received: `O usuário recebeu uma proposta de emprego da empresa "${result.metadata?.company}" para a vaga de "${result.metadata?.title}". 
Gere uma mensagem curta (máximo 2 frases) e encorajadora, sugerindo que ele avalie a proposta com calma. Seja conciso e direto.`,
    
    interview_soon: `O usuário tem uma entrevista agendada na empresa "${result.metadata?.company}" para a vaga de "${result.metadata?.title}". 
Gere uma mensagem curta (máximo 2 frases) motivacional, sugerindo que ele pratique para a entrevista. Seja conciso e direto.`,
    
    interview_feedback: `O usuário completou uma entrevista simulada (mock interview) para a vaga de "${result.metadata?.cargo}" e tirou ${result.metadata?.score}/100.
${result.metadata?.mainTip ? `Uma dica importante foi: "${result.metadata.mainTip}".` : ''}
Gere uma mensagem curta (máximo 2 frases) comentando o resultado e incentivando-o a explorar o feedback no Copilot para melhorar. Seja encorajador mas direto.`,
    
    needs_followup: `O usuário aplicou para "${result.metadata?.title}" na "${result.metadata?.company}" há ${result.metadata?.daysSinceUpdate} dias e ainda não teve retorno.
Gere uma mensagem curta (máximo 2 frases) sugerindo que ele faça um follow-up. Seja conciso e direto.`,
    
    active_summary: `O usuário tem ${result.metadata?.totalApps} aplicações, sendo ${result.metadata?.activeApps} ativas.
Gere uma dica do dia curta (máximo 2 frases) para quem está em busca de emprego. Seja motivacional mas prático.`,
  }

  const prompt = prompts[result.context]
  if (!prompt) return null

  const MODEL = 'gpt-4o-mini' as const

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Você é um coach de carreira brasileiro amigável. Responda apenas com a mensagem solicitada, sem introduções. Use português brasileiro informal mas profissional.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const message = response.choices[0]?.message?.content?.trim()
    if (!message) return null

    // Track AI usage
    if (userId && response.usage) {
      await trackAIUsage(userId, 'hero_card', MODEL, {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
      })
    }

    return buildHeroDataFromAI(result, message)
  } catch (error) {
    console.error('[Hero] AI message generation failed:', error)
    return null
  }
}

function buildHeroDataFromAI(result: ContextDetectionResult, message: string): HeroData {
  const contextConfig: Record<string, { title: string; primaryCta: { label: string; href: string }; secondaryCta?: { label: string; href: string } }> = {
    proposal_received: {
      title: '🎉 Parabéns pela proposta!',
      primaryCta: { label: 'Avaliar proposta', href: `/dashboard/aplicacoes/${result.relevantApp?.id}` },
      // secondaryCta: { label: 'Analisar com Copilot', href: '/dashboard?chat=open' },
    },
    interview_soon: {
      title: '🎤 Entrevista a caminho',
      primaryCta: { label: 'Praticar entrevista', href: '/dashboard/interview-pro' },
      secondaryCta: { label: 'Dicas no Copilot', href: '/dashboard?chat=open' },
    },
    interview_feedback: {
      title: '🎯 Feedback da sua entrevista',
      primaryCta: { label: 'Explorar com Copilot', href: '/dashboard?chat=open&context=interview' },
      secondaryCta: { label: 'Ver resultado', href: `/dashboard/interview-pro/resultado/${result.metadata?.sessionId}` },
    },
    needs_followup: {
      title: '📬 Hora do follow-up',
      primaryCta: { label: 'Criar follow-up', href: '/dashboard?chat=open' },
      secondaryCta: { label: 'Ver aplicação', href: `/dashboard/aplicacoes/${result.relevantApp?.id}` },
    },
    active_summary: {
      title: '💡 Dica do Copilot',
      primaryCta: { label: 'Explorar no Copilot', href: '/dashboard?chat=open' },
      secondaryCta: { label: 'Ver aplicações', href: '/dashboard/aplicacoes' },
    },
  }

  const config = contextConfig[result.context] || contextConfig.active_summary

  return {
    context: result.context,
    title: config.title,
    message,
    primaryCta: config.primaryCta,
    secondaryCta: config.secondaryCta,
    metadata: result.metadata,
  }
}

// Fallback templates para quando AI falhar
function getFallbackTemplate(result: ContextDetectionResult): HeroData {
  const fallbacks: Record<string, HeroData> = {
    proposal_received: {
      context: 'proposal_received',
      title: '🎉 Parabéns pela proposta!',
      message: `Você recebeu uma proposta da ${result.metadata?.company}! Avalie com calma os benefícios e a cultura da empresa.`,
      primaryCta: { label: 'Avaliar proposta', href: `/dashboard/aplicacoes/${result.relevantApp?.id}` },
      // secondaryCta: { label: 'Analisar com Copilot', href: '/dashboard?chat=open' },
    },
    interview_soon: {
      context: 'interview_soon',
      title: '🎤 Entrevista a caminho',
      message: `Sua entrevista na ${result.metadata?.company} está chegando! Pratique suas respostas e pesquise sobre a empresa.`,
      primaryCta: { label: 'Praticar entrevista', href: '/dashboard/interview-pro' },
      secondaryCta: { label: 'Dicas no Copilot', href: '/dashboard?chat=open' },
    },
    interview_feedback: {
      context: 'interview_feedback',
      title: '🎯 Feedback da sua entrevista',
      message: `Você completou uma entrevista para ${result.metadata?.cargo} e tirou ${result.metadata?.score}/100. Explore o feedback com o Copilot para melhorar suas respostas!`,
      primaryCta: { label: 'Explorar com Copilot', href: '/dashboard?chat=open&context=interview' },
      secondaryCta: { label: 'Ver resultado', href: `/dashboard/interview-pro/resultado/${result.metadata?.sessionId}` },
    },
    needs_followup: {
      context: 'needs_followup',
      title: '📬 Hora do follow-up',
      message: `Sua aplicação para ${result.metadata?.title} na ${result.metadata?.company} está há ${result.metadata?.daysSinceUpdate} dias sem retorno. Um follow-up educado pode fazer a diferença!`,
      primaryCta: { label: 'Criar follow-up', href: '/dashboard?chat=open' },
      secondaryCta: { label: 'Ver aplicação', href: `/dashboard/aplicacoes/${result.relevantApp?.id}` },
    },
    active_summary: {
      context: 'active_summary',
      title: '💡 Dica do Copilot',
      message: getRotatingTip(),
      primaryCta: { label: 'Explorar no Copilot', href: '/dashboard?chat=open' },
      secondaryCta: { label: 'Ver aplicações', href: '/dashboard/aplicacoes' },
    },
  }

  return fallbacks[result.context] || fallbacks.active_summary
}

export async function buildMessage(result: ContextDetectionResult, userId?: string): Promise<HeroData> {
  // Usa template estático para contextos simples
  const templateFn = templates[result.context]
  if (templateFn) {
    return templateFn(result.metadata)
  }

  // Para active_summary, usa dica do dia (evita chamadas AI desnecessarias)
  if (result.context === 'active_summary') {
    return getFallbackTemplate(result)
  }

  // Usa AI para contextos que precisam personalização (com cache de 24h)
  if (aiContexts.includes(result.context)) {
    const cacheKey = getCacheKey(result.context, result.metadata)
    
    // Verifica cache primeiro
    const cached = getCachedMessage(cacheKey)
    if (cached) {
      return cached
    }

    // Gera mensagem com AI
    const aiMessage = await generateAIMessage(result, userId)
    if (aiMessage) {
      // Salva no cache
      setCachedMessage(cacheKey, aiMessage)
      return aiMessage
    }
    
    // Fallback se AI falhar
    return getFallbackTemplate(result)
  }

  // Default fallback
  return getFallbackTemplate(result)
}
