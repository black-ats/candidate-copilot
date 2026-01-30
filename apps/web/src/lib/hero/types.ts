import type { Application } from '@/lib/types/application'

export type HeroContext = 
  | 'pending_insight'
  | 'proposal_received'
  | 'interview_soon'
  | 'needs_followup'
  | 'stale_apps'
  | 'low_activity'
  | 'new_user'
  | 'active_summary'

export type HeroData = {
  context: HeroContext
  title: string
  message: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  metadata?: Record<string, unknown>
}

export type UserDataForHero = {
  applications: Application[]
  insights: Array<{ id: string; created_at: string }>
  hasPendingInsight: boolean
}

export type ContextDetectionResult = {
  context: HeroContext
  relevantApp?: Application
  metadata?: Record<string, unknown>
}
