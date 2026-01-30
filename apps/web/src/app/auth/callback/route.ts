import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const user = data.user
      // Check if user is new by comparing created_at (within last 30 seconds)
      const createdAt = new Date(user.created_at).getTime()
      const now = Date.now()
      const isNewUser = (now - createdAt) < 30000 // 30 seconds
      
      // Determine auth provider
      const provider = user.app_metadata.provider || 'email'
      
      // Pass tracking info via query params for client-side tracking
      const redirectUrl = new URL(redirect, origin)
      redirectUrl.searchParams.set('auth_event', isNewUser ? 'signup' : 'login')
      redirectUrl.searchParams.set('auth_method', provider)
      redirectUrl.searchParams.set('auth_user_id', user.id)
      
      return NextResponse.redirect(redirectUrl.toString())
    }
  }

  // Return to auth page if there's an error
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
