import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { STRIPE_CONFIG } from '@/lib/stripe/config'

// Check if email is in the Pro whitelist
function isWhitelisted(email: string | undefined): boolean {
  if (!email) return false
  const whitelist = process.env.PRO_WHITELIST || ''
  if (!whitelist) return false
  
  const emails = whitelist.split(',').map(e => e.trim().toLowerCase())
  return emails.includes(email.toLowerCase())
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    // Check if user is whitelisted for free Pro access
    if (isWhitelisted(user.email)) {
      // Upgrade directly without payment
      await supabase
        .from('user_profiles')
        .update({
          plan: 'pro',
          subscription_status: 'active',
          upgrade_source: 'whitelist',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      // Return success URL directly
      return NextResponse.json({ 
        url: `${STRIPE_CONFIG.appUrl}/dashboard/plano?success=true`,
        whitelisted: true 
      })
    }

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.proPriceId,
          quantity: 1,
        },
      ],
      success_url: `${STRIPE_CONFIG.appUrl}/dashboard/plano?success=true`,
      cancel_url: `${STRIPE_CONFIG.appUrl}/dashboard/plano?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessao de checkout' },
      { status: 500 }
    )
  }
}
