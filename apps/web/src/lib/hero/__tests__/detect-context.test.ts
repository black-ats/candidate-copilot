import { detectContext } from '../detect-context'
import type { UserDataForHero } from '../types'
import type { Application } from '@/lib/types/application'

// Helper to create mock application
const createApp = (overrides: Partial<Application> = {}): Application => ({
  id: 'test-id',
  user_id: 'user-1',
  company: 'Test Company',
  title: 'Software Engineer',
  status: 'aplicado',
  notes: null,
  job_description: null,
  url: null,
  salary_range: null,
  location: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Helper to create date X days ago
const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

describe('detectContext', () => {
  it('returns pending_insight when hasPendingInsight is true', () => {
    const userData: UserDataForHero = {
      applications: [],
      insights: [],
      hasPendingInsight: true,
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('pending_insight')
  })

  it('returns proposal_received when app has proposta status', () => {
    const userData: UserDataForHero = {
      applications: [createApp({ status: 'proposta', company: 'Google' })],
      insights: [],
      hasPendingInsight: false,
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('proposal_received')
    expect(result.metadata?.company).toBe('Google')
  })

  it('returns interview_soon when app has entrevista status', () => {
    const userData: UserDataForHero = {
      applications: [createApp({ status: 'entrevista', company: 'Meta' })],
      insights: [],
      hasPendingInsight: false,
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('interview_soon')
    expect(result.metadata?.company).toBe('Meta')
  })

  it('returns needs_followup when app is 7+ days old without update', () => {
    const userData: UserDataForHero = {
      applications: [
        createApp({ 
          status: 'aplicado', 
          company: 'Nubank',
          updated_at: daysAgo(8) 
        })
      ],
      insights: [],
      hasPendingInsight: false,
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('needs_followup')
    expect(result.metadata?.company).toBe('Nubank')
    expect(result.metadata?.daysSinceUpdate).toBeGreaterThanOrEqual(8)
  })

  it('returns stale_apps when 3+ apps are 14+ days stale', () => {
    const userData: UserDataForHero = {
      applications: [
        createApp({ status: 'aplicado', updated_at: daysAgo(15) }),
        createApp({ status: 'em_analise', updated_at: daysAgo(16) }),
        createApp({ status: 'aplicado', updated_at: daysAgo(20) }),
      ],
      insights: [],
      hasPendingInsight: false,
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('stale_apps')
    expect(result.metadata?.count).toBe(3)
  })

  it('returns low_activity when no app added in 7+ days', () => {
    const userData: UserDataForHero = {
      applications: [
        createApp({ 
          status: 'entrevista', // Active but old
          created_at: daysAgo(10),
          updated_at: new Date().toISOString(), // Recently updated
        })
      ],
      insights: [{ id: '1', created_at: new Date().toISOString() }],
      hasPendingInsight: false,
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('low_activity')
  })

  it('returns new_user when no apps and no insights', () => {
    const userData: UserDataForHero = {
      applications: [],
      insights: [],
      hasPendingInsight: false,
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('new_user')
  })

  it('returns active_summary as default', () => {
    const userData: UserDataForHero = {
      applications: [
        createApp({ 
          status: 'aplicado',
          created_at: daysAgo(2),
          updated_at: daysAgo(2),
        }),
      ],
      insights: [{ id: '1', created_at: new Date().toISOString() }],
      hasPendingInsight: false,
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('active_summary')
    expect(result.metadata?.totalApps).toBe(1)
  })

  it('respects priority order - pending_insight > proposal_received', () => {
    const userData: UserDataForHero = {
      applications: [createApp({ status: 'proposta' })],
      insights: [],
      hasPendingInsight: true, // Should win
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('pending_insight')
  })

  it('respects priority order - proposal_received > interview_soon', () => {
    const userData: UserDataForHero = {
      applications: [
        createApp({ status: 'proposta' }),
        createApp({ status: 'entrevista' }),
      ],
      insights: [],
      hasPendingInsight: false,
    }
    
    const result = detectContext(userData)
    expect(result.context).toBe('proposal_received')
  })
})
