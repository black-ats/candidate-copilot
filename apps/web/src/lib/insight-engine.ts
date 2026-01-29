import type { EntryFlowData } from './schemas/entry-flow'

export interface Insight {
  recommendation: string
  why: string[]
  risks: string[]
  nextSteps: string[]
}

// Rule-based insight generation engine
export function generateInsight(data: EntryFlowData): Insight {
  const { cargo, senioridade, area, status, tempoSituacao, urgencia, objetivo } = data

  // Base insights by objective
  const objectiveInsights: Record<string, Insight> = {
    avaliar_proposta: {
      recommendation: 'Avalie a proposta com calma antes de decidir',
      why: [
        'Decisoes apressadas em transicao de carreira costumam gerar arrependimento',
        'O mercado atual exige analise cuidadosa de beneficios alem do salario',
        'Sua senioridade permite negociar melhores condicoes',
      ],
      risks: [
        'Aceitar sem negociar pode deixar dinheiro na mesa',
        'Focar so no salario pode esconder problemas de cultura',
      ],
      nextSteps: [
        'Liste seus 3 criterios mais importantes (alem de salario)',
        'Pesquise o Glassdoor e LinkedIn da empresa',
        'Prepare 3 perguntas sobre cultura e expectativas',
      ],
    },
    mais_entrevistas: {
      recommendation: 'Ajuste sua estrategia de posicionamento',
      why: [
        'Candidatos que se posicionam claramente tem 3x mais retorno',
        'Seu perfil tem potencial mas precisa de diferenciacao',
        'O mercado valoriza especialistas com clareza de proposta',
      ],
      risks: [
        'Aplicar para tudo dilui sua marca pessoal',
        'Curriculo generico compete com milhares de outros',
      ],
      nextSteps: [
        'Defina 3 empresas-alvo e personalize abordagem',
        'Atualize seu LinkedIn com palavras-chave da area',
        'Pratique seu pitch de 30 segundos',
      ],
    },
    mudar_area: {
      recommendation: 'Planeje sua transicao em fases',
      why: [
        'Transicoes bem-sucedidas sao graduais, nao radicais',
        'Suas habilidades atuais sao transferiveis com o posicionamento certo',
        'O mercado aceita transicoes quando bem justificadas',
      ],
      risks: [
        'Mudar sem preparacao pode significar recomecar do zero',
        'Ansiedade pode levar a decisoes precipitadas',
      ],
      nextSteps: [
        'Mapeie 5 habilidades que se transferem para a nova area',
        'Conecte com 3 pessoas que fizeram transicao similar',
        'Comece um projeto paralelo na nova area',
      ],
    },
    negociar_salario: {
      recommendation: 'Prepare sua negociacao com dados',
      why: [
        'Negociacoes baseadas em dados tem 40% mais sucesso',
        'Sua experiencia justifica uma revisao salarial',
        'Momento de mercado favorece profissionais posicionados',
      ],
      risks: [
        'Negociar sem preparacao pode enfraquecer sua posicao',
        'Focar so em salario ignora outros beneficios valiosos',
      ],
      nextSteps: [
        'Pesquise faixas salariais no Glassdoor e Levels.fyi',
        'Liste suas entregas dos ultimos 6 meses',
        'Agende conversa com seu gestor com antecedencia',
      ],
    },
    outro: {
      recommendation: 'Defina seu proximo passo com clareza',
      why: [
        'Clareza de objetivo acelera qualquer processo de carreira',
        'Seu contexto atual permite explorar opcoes',
        'Decisoes conscientes geram melhores resultados',
      ],
      risks: [
        'Paralisia por analise pode atrasar seu progresso',
        'Falta de foco dispersa energia e oportunidades',
      ],
      nextSteps: [
        'Escreva em uma frase o que voce quer em 6 meses',
        'Identifique 1 acao que voce pode fazer essa semana',
        'Converse com alguem que ja chegou onde voce quer',
      ],
    },
  }

  // Get base insight
  const baseInsight = objectiveInsights[objetivo] || objectiveInsights.outro

  // Customize based on context
  const customizedInsight = { ...baseInsight }

  // Adjust for status
  if (status === 'desempregado') {
    customizedInsight.why = [
      ...customizedInsight.why.slice(0, 2),
      'Em periodo de transicao, foco e estrategia sao ainda mais importantes',
    ]
  }

  // Adjust for urgency
  if (urgencia >= 4) {
    customizedInsight.nextSteps = [
      `URGENTE: ${customizedInsight.nextSteps[0]}`,
      ...customizedInsight.nextSteps.slice(1),
    ]
    customizedInsight.risks = [
      'Pressao por urgencia pode levar a decisoes subotimas',
      ...customizedInsight.risks,
    ]
  }

  // Adjust for seniority
  if (senioridade === 'junior' || senioridade === 'pleno') {
    customizedInsight.nextSteps.push('Busque mentoria de alguem mais senior na area')
  } else if (senioridade === 'lead' || senioridade === 'exec') {
    customizedInsight.why = [
      'Sua posicao de lideranca traz oportunidades unicas',
      ...customizedInsight.why.slice(0, 2),
    ]
  }

  // Adjust for time in situation
  if (tempoSituacao === 'mais_1_ano' && status === 'empregado') {
    customizedInsight.why.push('Mais de 1 ano na mesma situacao indica momento de reflexao')
  }

  return customizedInsight
}

// Helper to get display labels
export const senioridadeLabels: Record<string, string> = {
  junior: 'Junior',
  pleno: 'Pleno',
  senior: 'Senior',
  lead: 'Lead',
  exec: 'Executivo',
}

export const areaLabels: Record<string, string> = {
  tech: 'Tecnologia',
  produto: 'Produto',
  design: 'Design',
  negocios: 'Negocios',
  outro: 'Outro',
}

export const statusLabels: Record<string, string> = {
  empregado: 'Empregado',
  desempregado: 'Desempregado',
  transicao: 'Em transicao',
}

export const objetivoLabels: Record<string, string> = {
  avaliar_proposta: 'Avaliar proposta',
  mais_entrevistas: 'Conseguir mais entrevistas',
  mudar_area: 'Mudar de area',
  negociar_salario: 'Negociar salario',
  outro: 'Outro objetivo',
}
