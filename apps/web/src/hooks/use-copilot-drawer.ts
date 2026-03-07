'use client'

import { create } from 'zustand'

export type InsightContext = {
  id: string
  tipo: string
  cargo: string
  area?: string
  senioridade?: string
  status?: string
  objetivo?: string
  // V1 fields
  recommendation?: string
  next_steps?: string[]
  // V1.1 diagnostic fields
  diagnosis?: string
  pattern?: string
  risk?: string
  nextStep?: string
  typeLabel?: string
  // V1.1 contextual data
  urgencia?: number
  tempoSituacao?: string
  decisionBlocker?: string
  interviewBottleneck?: string
  maxStage?: string
  leverageSignals?: string
  pivotType?: string
  transferableStrengths?: string
  avoidedDecision?: string
}

export type HeroContext = {
  type: 'hero'
  context: string // pending_insight, proposal_received, etc.
  message: string
  company?: string
  title?: string
}

export type InterviewContext = {
  sessionId: string
  cargo: string
  area?: string
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  tips: string[]
}

export type BenchmarkContext = {
  userTaxa: number
  mediaTaxa: number
  percentil: number
  totalUsuarios: number
  diff: number
  isAbove: boolean
}

export type MatchContext = {
  type: 'match'
  matchScore: number
  atsRisk: string
  diagnosis: string
  missingSignals: string[]
  improvements: string[]
  jobTitle?: string
  companyName?: string
}

export type ApplicationContext = {
  type: 'application'
  id: string
  company: string
  title: string
  status: string
  salaryRange?: string
  notes?: string
  jobDescription?: string
  location?: string
  url?: string
}

type CopilotDrawerStore = {
  isOpen: boolean
  insightContext: InsightContext | null
  heroContext: HeroContext | null
  interviewContext: InterviewContext | null
  benchmarkContext: BenchmarkContext | null
  applicationContext: ApplicationContext | null
  matchContext: MatchContext | null
  pendingQuestion: string | null
  open: () => void
  close: () => void
  openWithContext: (context: InsightContext) => void
  openWithHeroContext: (context: HeroContext) => void
  openWithInterviewContext: (context: InterviewContext) => void
  openWithBenchmarkContext: (context: BenchmarkContext) => void
  openWithApplicationContext: (context: ApplicationContext) => void
  openWithMatchContext: (context: MatchContext) => void
  openWithPendingQuestion: (question: string, heroContext?: HeroContext) => void
  clearPendingQuestion: () => void
  clearContext: () => void
}

const nullContexts = {
  insightContext: null,
  heroContext: null,
  interviewContext: null,
  benchmarkContext: null,
  applicationContext: null,
  matchContext: null,
  pendingQuestion: null,
}

export const useCopilotDrawer = create<CopilotDrawerStore>((set) => ({
  isOpen: false,
  ...nullContexts,
  open: () => set({ isOpen: true, ...nullContexts }),
  close: () => set({ isOpen: false, ...nullContexts }),
  openWithContext: (context) => set({ isOpen: true, ...nullContexts, insightContext: context }),
  openWithHeroContext: (context) => set({ isOpen: true, ...nullContexts, heroContext: context }),
  openWithInterviewContext: (context) => set({ isOpen: true, ...nullContexts, interviewContext: context }),
  openWithBenchmarkContext: (context) => set({ isOpen: true, ...nullContexts, benchmarkContext: context }),
  openWithApplicationContext: (context) => set({ isOpen: true, ...nullContexts, applicationContext: context }),
  openWithMatchContext: (context) => set({ isOpen: true, ...nullContexts, matchContext: context }),
  openWithPendingQuestion: (question, heroCtx) => set({
    isOpen: true,
    ...nullContexts,
    pendingQuestion: question.trim() || null,
    heroContext: heroCtx || null,
  }),
  clearPendingQuestion: () => set({ pendingQuestion: null }),
  clearContext: () => set(nullContexts),
}))
