'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Email invalido'),
  source: z.string().optional(),
})

export async function joinWaitlist(formData: FormData) {
  const email = formData.get('email')
  const source = formData.get('source') || 'direct'

  const validated = schema.safeParse({ email, source })
  if (!validated.success) {
    return { error: 'Email invalido' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('waitlist')
    .insert({
      email: validated.data.email,
      feature: 'interview-pro',
      source: validated.data.source,
    })

  if (error?.code === '23505') {
    return { error: 'Este email ja esta na lista!' }
  }
  if (error) {
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  return { success: true }
}
