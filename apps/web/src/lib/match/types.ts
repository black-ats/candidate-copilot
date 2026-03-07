export type ATSRisk = 'low' | 'medium' | 'high'

export interface MissingSignal {
  skill: string
  importance: 'critical' | 'important' | 'nice_to_have'
  context: string
}

export interface ResumeWeakness {
  area: string
  description: string
}

export interface Improvement {
  action: string
  impact: 'high' | 'medium' | 'low'
  detail: string
}

export interface MatchResult {
  matchScore: number
  atsRisk: ATSRisk
  diagnosis: string
  missingSignals: MissingSignal[]
  resumeWeaknesses: ResumeWeakness[]
  improvements: Improvement[]
  jobTitle?: string
  companyName?: string
}

export interface MatchInput {
  resumeText: string
  jobDescription: string
}
