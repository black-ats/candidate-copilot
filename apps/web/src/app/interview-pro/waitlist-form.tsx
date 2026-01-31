'use client'

import { useState, useTransition } from 'react'
import { Button, Input } from '@ui/components'
import { CheckCircle, Loader2, Mail } from 'lucide-react'
import { joinWaitlist } from './actions'
import { track } from '@/lib/analytics/track'

interface WaitlistFormProps {
  source?: string
}

export function WaitlistForm({ source = 'direct' }: WaitlistFormProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (formData: FormData) => {
    setStatus('idle')
    setErrorMessage('')

    startTransition(async () => {
      const result = await joinWaitlist(formData)

      if (result.success) {
        setStatus('success')
        // Track waitlist join
        track('interview_waitlist_joined', {
          source: source,
        })
      } else {
        setStatus('error')
        setErrorMessage(result.error || 'Erro ao salvar. Tente novamente.')
      }
    })
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-teal" />
        </div>
        <p className="text-lg font-medium text-navy">Pronto! Você está na lista.</p>
        <p className="text-sm text-navy/60">Avisaremos quando estiver pronto.</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="w-full max-w-md mx-auto">
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="email"
            name="email"
            placeholder="seu@email.com"
            required
            disabled={isPending}
            error={status === 'error' ? errorMessage : undefined}
            aria-label="Email"
          />
        </div>
        <Button type="submit" disabled={isPending} className="whitespace-nowrap">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Entrar na lista
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
