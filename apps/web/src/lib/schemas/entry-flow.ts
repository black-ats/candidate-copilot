import { z } from 'zod'

// Step 1: Contexto Profissional
export const step1Schema = z.object({
  cargo: z.string().min(2, 'Informe seu cargo atual ou último'),
  senioridade: z.enum(['junior', 'pleno', 'senior', 'lead', 'exec'], {
    required_error: 'Selecione sua senioridade',
  }),
  area: z.enum(['tech', 'produto', 'design', 'negocios', 'outro'], {
    required_error: 'Selecione sua área de atuação',
  }),
})

// Step 2: Situacao Atual
export const step2Schema = z.object({
  status: z.enum(['empregado', 'desempregado', 'transicao'], {
    required_error: 'Selecione seu status atual',
  }),
  tempoSituacao: z.enum(['menos_3_meses', '3_6_meses', '6_12_meses', 'mais_1_ano'], {
    required_error: 'Informe há quanto tempo está nessa situação',
  }),
  urgencia: z.number().min(1).max(5),
})

// Step 3: Objetivo (only)
export const step3Schema = z.object({
  objetivo: z.enum([
    'avaliar_proposta',
    'mais_entrevistas',
    'avancar_processos',
    'negociar_salario',
    'mudar_area',
    'outro'
  ], {
    required_error: 'Selecione seu objetivo principal',
  }),
})

// Step 4: Contextual follow-up (based on objetivo)
export const step4Schema = z.object({
  objetivo: z.enum([
    'avaliar_proposta',
    'mais_entrevistas',
    'avancar_processos',
    'negociar_salario',
    'mudar_area',
    'outro'
  ]),
  
  // Contextual follow-ups (validated conditionally)
  bloqueioDecisao: z.enum([
    'salario',
    'crescimento',
    'estabilidade',
    'comparacao'
  ]).optional(),
  
  gargaloEntrevistas: z.enum([
    'sem_respostas',
    'rejeicoes_rapidas',
    'poucas_respostas',
    'nao_sei'
  ]).optional(),
  
  faseMaxima: z.enum([
    'triagem',
    'tecnica',
    'final',
    'oferta'
  ]).optional(),
  
  sinaisAlavanca: z.enum([
    'performance',
    'escopo',
    'proposta_externa',
    'mercado',
    'nenhum'
  ]).optional(),
  
  tipoPivot: z.enum([
    'mesmo_dominio',
    'mudanca_total'
  ]).optional(),
  
  forcasTransferiveis: z.string().max(200).optional(),
  
  decisaoEvitando: z.string().max(300).optional(),
}).refine((data) => {
  // Conditional validation based on objetivo
  if (data.objetivo === 'avaliar_proposta' && !data.bloqueioDecisao) return false
  if (data.objetivo === 'mais_entrevistas' && !data.gargaloEntrevistas) return false
  if (data.objetivo === 'avancar_processos' && !data.faseMaxima) return false
  if (data.objetivo === 'negociar_salario' && !data.sinaisAlavanca) return false
  if (data.objetivo === 'mudar_area' && !data.tipoPivot) return false
  // 'outro' requires decisaoEvitando
  if (data.objetivo === 'outro' && !data.decisaoEvitando) return false
  return true
}, { message: 'Responda a pergunta adicional' })

// Combined schema for full form data
export const entryFlowSchema = step1Schema.merge(step2Schema).merge(z.object({
  objetivo: z.enum([
    'avaliar_proposta',
    'mais_entrevistas',
    'avancar_processos',
    'negociar_salario',
    'mudar_area',
    'outro'
  ]),
  bloqueioDecisao: z.enum(['salario', 'crescimento', 'estabilidade', 'comparacao']).optional(),
  gargaloEntrevistas: z.enum(['sem_respostas', 'rejeicoes_rapidas', 'poucas_respostas', 'nao_sei']).optional(),
  faseMaxima: z.enum(['triagem', 'tecnica', 'final', 'oferta']).optional(),
  sinaisAlavanca: z.enum(['performance', 'escopo', 'proposta_externa', 'mercado', 'nenhum']).optional(),
  tipoPivot: z.enum(['mesmo_dominio', 'mudanca_total']).optional(),
  forcasTransferiveis: z.string().max(200).optional(),
  decisaoEvitando: z.string().max(300).optional(),
}))

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type EntryFlowData = z.infer<typeof entryFlowSchema>

// Options for select/radio fields
export const senioridadeOptions = [
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'lead', label: 'Lead / Tech Lead' },
  { value: 'exec', label: 'Executivo / Diretor' },
]

export const areaOptions = [
  { value: 'tech', label: 'Tecnologia / Engenharia' },
  { value: 'produto', label: 'Produto' },
  { value: 'design', label: 'Design / UX' },
  { value: 'negocios', label: 'Negócios / Vendas' },
  { value: 'outro', label: 'Outro' },
]

export const statusOptions = [
  { value: 'empregado', label: 'Empregado', description: 'Trabalhando atualmente' },
  { value: 'desempregado', label: 'Desempregado', description: 'Buscando oportunidades' },
  { value: 'transicao', label: 'Em transição', description: 'Saindo ou com proposta em mão' },
]

export const tempoSituacaoOptions = [
  { value: 'menos_3_meses', label: 'Menos de 3 meses' },
  { value: '3_6_meses', label: '3 a 6 meses' },
  { value: '6_12_meses', label: '6 a 12 meses' },
  { value: 'mais_1_ano', label: 'Mais de 1 ano' },
]

export const objetivoOptions = [
  { value: 'avaliar_proposta', label: 'Avaliar uma proposta', description: 'Tenho uma oferta e preciso decidir' },
  { value: 'mais_entrevistas', label: 'Conseguir mais entrevistas', description: 'Quero aumentar minhas chances' },
  { value: 'avancar_processos', label: 'Avançar em processos', description: 'Estou travando nas etapas' },
  { value: 'negociar_salario', label: 'Negociar salário', description: 'Quero ganhar mais onde estou' },
  { value: 'mudar_area', label: 'Mudar de área', description: 'Quero transição de carreira' },
  { value: 'outro', label: 'Outro', description: 'Tenho uma questão diferente' },
]

// Contextual follow-up options
export const bloqueioDecisaoOptions = [
  { value: 'salario', label: 'Salário ou pacote', description: 'Não sei se vale financeiramente' },
  { value: 'crescimento', label: 'Escopo e crescimento', description: 'Não sei se vou evoluir lá' },
  { value: 'estabilidade', label: 'Estabilidade vs risco', description: 'Tenho medo de arriscar' },
  { value: 'comparacao', label: 'Comparação com o atual', description: 'Não sei se é melhor que hoje' },
]

export const gargaloEntrevistasOptions = [
  { value: 'sem_respostas', label: 'Não recebo respostas', description: 'Aplico e fica no silêncio' },
  { value: 'rejeicoes_rapidas', label: 'Rejeições rápidas', description: 'Rejeitam em dias' },
  { value: 'poucas_respostas', label: 'Poucas oportunidades', description: 'Não acho vagas relevantes' },
  { value: 'nao_sei', label: 'Não sei onde trava', description: 'Estou perdido' },
]

export const faseMaximaOptions = [
  { value: 'triagem', label: 'Triagem inicial', description: 'CV/formulário' },
  { value: 'tecnica', label: 'Fase técnica', description: 'Entrevista ou teste' },
  { value: 'final', label: 'Fase final', description: 'Conversas com gestores' },
  { value: 'oferta', label: 'Oferta/negociação', description: 'Recebo, mas não fecho' },
]

export const sinaisAlavancaOptions = [
  { value: 'performance', label: 'Performance comprovada', description: 'Entregas acima da média' },
  { value: 'escopo', label: 'Aumento de escopo', description: 'Responsabilidades maiores' },
  { value: 'proposta_externa', label: 'Proposta externa', description: 'Tenho oferta de fora' },
  { value: 'mercado', label: 'Defasagem de mercado', description: 'Sei que ganho abaixo' },
  { value: 'nenhum', label: 'Nenhum claro', description: 'Quero, mas não tenho argumento' },
]

export const tipoPivotOptions = [
  { value: 'mesmo_dominio', label: 'Mesmo domínio', description: 'Tech para Produto, Design para UX, etc.' },
  { value: 'mudanca_total', label: 'Mudança total', description: 'Área completamente diferente' },
]

// Follow-up labels for each objetivo
export const followUpLabels: Record<string, string> = {
  avaliar_proposta: 'O que mais te trava nessa decisão?',
  mais_entrevistas: 'Onde você sente que trava?',
  avancar_processos: 'Até qual fase você costuma chegar?',
  negociar_salario: 'Qual sinal de alavanca você tem hoje?',
  mudar_area: 'Que tipo de mudança você quer fazer?',
  outro: 'Qual decisão você sente que está evitando?',
}
