'use client'

import { create } from 'zustand'

export type InsightContext = {
  id: string
  tipo: string
  cargo: string
  area?: string
  recommendation: string
  next_steps: string[]
}

export type HeroContext = {
  type: 'hero'
  context: string // pending_insight, proposal_received, etc.
  message: string
  company?: string
  title?: string
}

type CopilotDrawerStore = {
  isOpen: boolean
  insightContext: InsightContext | null
  heroContext: HeroContext | null
  open: () => void
  close: () => void
  openWithContext: (context: InsightContext) => void
  openWithHeroContext: (context: HeroContext) => void
  clearContext: () => void
}

export const useCopilotDrawer = create<CopilotDrawerStore>((set) => ({
  isOpen: false,
  insightContext: null,
  heroContext: null,
  open: () => set({ isOpen: true, insightContext: null, heroContext: null }),
  close: () => set({ isOpen: false, insightContext: null, heroContext: null }),
  openWithContext: (context) => set({ isOpen: true, insightContext: context, heroContext: null }),
  openWithHeroContext: (context) => set({ isOpen: true, heroContext: context, insightContext: null }),
  clearContext: () => set({ insightContext: null, heroContext: null }),
}))
