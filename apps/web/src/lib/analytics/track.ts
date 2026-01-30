import posthog from 'posthog-js'
import { trackGAEvent } from '@/components/providers/google-analytics'

type EventName =
  | 'signup_completed'
  | 'login_completed'
  | 'insight_generated'
  | 'application_created'
  | 'application_status_changed'
  | 'upgrade_initiated'
  | 'upgrade_completed'
  | 'interview_waitlist_joined'
  | 'interview_started'
  | 'interview_completed'
  | 'interview_abandoned'

type EventProperties = Record<string, string | number | boolean | undefined>

export function track(event: EventName, properties?: EventProperties) {
  // PostHog
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(event, properties)
  }

  // Google Analytics
  trackGAEvent(event, 'engagement', properties?.label as string)
}

// Identificar usuario (apos login)
export function identify(userId: string, traits?: Record<string, string>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, traits)
  }
}

// Reset ao logout
export function reset() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.reset()
  }
}
