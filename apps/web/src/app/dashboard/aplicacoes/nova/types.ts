import { ApplicationStatus } from '@/lib/types/application'

export type ApplicationDraft = {
  company: string
  title: string
  status: ApplicationStatus
  url?: string
  notes?: string
  salary_range?: string
  location?: string
  job_description?: string
}

export type ChatStep = 'company' | 'title' | 'status' | 'url' | 'complete'
