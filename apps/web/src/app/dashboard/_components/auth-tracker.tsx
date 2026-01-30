'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { track, identify } from '@/lib/analytics/track'

export function AuthTracker() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const authEvent = searchParams.get('auth_event')
    const authMethod = searchParams.get('auth_method')
    const authUserId = searchParams.get('auth_user_id')

    if (authEvent && authUserId) {
      // Identify user in analytics
      identify(authUserId)

      // Track signup or login event
      if (authEvent === 'signup') {
        track('signup_completed', { method: authMethod || 'unknown' })
      } else if (authEvent === 'login') {
        track('login_completed', { method: authMethod || 'unknown' })
      }

      // Clean up URL by removing auth params
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('auth_event')
      newParams.delete('auth_method')
      newParams.delete('auth_user_id')
      
      const newUrl = newParams.toString() 
        ? `${pathname}?${newParams.toString()}`
        : pathname
      
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router, pathname])

  return null
}
