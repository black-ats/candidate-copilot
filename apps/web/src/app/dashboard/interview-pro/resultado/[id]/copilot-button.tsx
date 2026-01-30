'use client'

import { CopilotButton } from '@/components/copilot-button'
import { useCopilotDrawer, type InterviewContext } from '@/hooks/use-copilot-drawer'

interface InterviewCopilotButtonProps {
  session: {
    id: string
    cargo: string
    area: string | null
    overall_score: number | null
    feedback: {
      summary?: string
      per_question?: Array<{
        strengths: string[]
        improvements: string[]
      }>
      general_tips?: string[]
    } | null
  }
}

export function InterviewCopilotButton({ session }: InterviewCopilotButtonProps) {
  const { openWithInterviewContext } = useCopilotDrawer()

  const handleClick = () => {
    // Build interview context from session data
    const strengths: string[] = []
    const improvements: string[] = []
    
    if (session.feedback?.per_question) {
      session.feedback.per_question.forEach(pq => {
        if (pq.strengths) strengths.push(...pq.strengths)
        if (pq.improvements) improvements.push(...pq.improvements)
      })
    }

    const context: InterviewContext = {
      sessionId: session.id,
      cargo: session.cargo,
      area: session.area || undefined,
      score: session.overall_score || 0,
      summary: session.feedback?.summary || '',
      strengths: strengths.slice(0, 5), // Limit to top 5
      improvements: improvements.slice(0, 5), // Limit to top 5
      tips: session.feedback?.general_tips || [],
    }

    openWithInterviewContext(context)
  }

  return (
    <CopilotButton onClick={handleClick}>
      Explorar com Copilot
    </CopilotButton>
  )
}
