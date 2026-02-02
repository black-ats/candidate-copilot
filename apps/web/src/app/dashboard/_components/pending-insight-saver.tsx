'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveInsight, type InsightData } from '@/app/insight/actions'
import { Button, Card } from '@ui/components'
import { CheckCircle, Sparkles, MessageSquare } from 'lucide-react'

type SavedInsight = {
  id: string
  summary: string // Can be diagnosis (V1.1) or recommendation (V1)
  typeLabel?: string // V1.1 diagnostic type label
}

export function PendingInsightSaver() {
  const router = useRouter()
  const [savedInsight, setSavedInsight] = useState<SavedInsight | null>(null)
  const [saving, setSaving] = useState(false)
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    // Only attempt once per mount
    if (attempted) return
    
    const pendingInsight = localStorage.getItem('pendingInsight')
    
    if (pendingInsight && !saving) {
      setAttempted(true)
      
      try {
        const data = JSON.parse(pendingInsight) as InsightData & { recommendation?: string; diagnosis?: string; typeLabel?: string }
        console.log('[PendingInsightSaver] Found pending insight, attempting to save...')
        
        // Remove localStorage BEFORE saving to prevent race condition with insight page
        localStorage.removeItem('pendingInsight')
        sessionStorage.removeItem('entryFlowData')
        
        setSaving(true)
        
        saveInsight(data).then((result) => {
          console.log('[PendingInsightSaver] Save result:', result)
          
          if (result.success && 'insightId' in result && result.insightId) {
            setSavedInsight({
              id: result.insightId,
              // Use V1.1 diagnosis if available, otherwise fall back to V1 recommendation
              summary: data.diagnosis || data.recommendation || 'Análise salva',
              typeLabel: data.typeLabel
            })
            console.log('[PendingInsightSaver] Insight saved successfully!')
            // Force refresh to update Server Components (insight list)
            router.refresh()
          } else if (result.error) {
            console.error('[PendingInsightSaver] Error saving insight:', result.error)
          }
          setSaving(false)
        }).catch((err) => {
          console.error('[PendingInsightSaver] Exception saving insight:', err)
          setSaving(false)
        })
      } catch (err) {
        console.error('[PendingInsightSaver] Error parsing pending insight:', err)
        localStorage.removeItem('pendingInsight')
        setSaving(false)
      }
    }
  }, [saving, attempted, router])

  if (savedInsight) {
    return (
      <Card className="p-4 sm:p-6 bg-teal/10 border-teal/30 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-teal" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-navy mb-1">
              Sua análise foi salva!
            </h3>
            {savedInsight.typeLabel && (
              <p className="text-xs text-teal font-medium mb-1">{savedInsight.typeLabel}</p>
            )}
            <p className="text-navy/70 text-sm mb-3 line-clamp-2">
              {savedInsight.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/dashboard/insights/${savedInsight.id}`}>
                <Button size="sm">
                  <Sparkles className="mr-2 w-4 h-4" />
                  Ver análise
                </Button>
              </Link>
              <Link href={`/dashboard/insights/${savedInsight.id}?chat=true`}>
                <Button variant="secondary" size="sm">
                  <MessageSquare className="mr-2 w-4 h-4" />
                  Aprofundar com Copilot
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
