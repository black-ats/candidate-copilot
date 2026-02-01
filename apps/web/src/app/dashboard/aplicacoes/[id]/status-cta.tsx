'use client'

import Link from 'next/link'
import { Card, Button } from '@ui/components'
import { Mic, Sparkles, MessageSquare } from 'lucide-react'
import { useCopilotDrawer, type ApplicationContext } from '@/hooks/use-copilot-drawer'
import type { ApplicationStatus, StatusHistory } from '@/lib/types/application'

interface StatusCTAProps {
  status: ApplicationStatus
  applicationId: string
  company: string
  title: string
  salaryRange?: string | null
  notes?: string | null
  jobDescription?: string | null
  location?: string | null
  url?: string | null
  statusHistory?: StatusHistory[]
}

// Extrai notas relevantes do histórico de status
function getStatusHistoryNotes(history: StatusHistory[] | undefined, currentStatus: string): string | undefined {
  if (!history || history.length === 0) return undefined
  
  // Buscar a nota da mudança para o status atual (ex: quando mudou para "proposta")
  const statusChangeNote = history.find(h => h.to_status === currentStatus && h.notes)
  
  if (statusChangeNote?.notes) {
    return statusChangeNote.notes
  }
  
  return undefined
}

const ctaConfig: Record<string, {
  title: string
  description: string
  type: 'copilot' | 'interview'
  buttonText: string
}> = {
  entrevista: {
    title: 'Preparar para a entrevista?',
    description: 'Treine com nossa IA para se sair melhor na entrevista.',
    type: 'interview',
    buttonText: 'Treinar entrevista',
  },
  proposta: {
    title: 'Analisar a proposta?',
    description: 'Converse com o Copilot para avaliar os prós e contras.',
    type: 'copilot',
    buttonText: 'Analisar proposta',
  },
}

function PropostaCopilotButton({ 
  applicationId,
  company, 
  title,
  status,
  salaryRange,
  notes,
  statusHistoryNotes,
  jobDescription,
  location,
  url,
  buttonText,
}: { 
  applicationId: string
  company: string
  title: string
  status: string
  salaryRange?: string | null
  notes?: string | null
  statusHistoryNotes?: string
  jobDescription?: string | null
  location?: string | null
  url?: string | null
  buttonText: string
}) {
  const { openWithApplicationContext } = useCopilotDrawer()

  // Combinar notas: notas gerais + notas do histórico de status
  const combinedNotes = [notes, statusHistoryNotes].filter(Boolean).join('\n\n---\n\n')

  const handleClick = () => {
    const context: ApplicationContext = {
      type: 'application',
      id: applicationId,
      company,
      title,
      status,
      salaryRange: salaryRange || undefined,
      notes: combinedNotes || undefined,
      jobDescription: jobDescription || undefined,
      location: location || undefined,
      url: url || undefined,
    }
    openWithApplicationContext(context)
  }

  return (
    <button 
      onClick={handleClick}
      className="
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-lg font-medium text-white
        bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500
        hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400
        transition-all duration-200
      "
    >
      <Sparkles className="w-4 h-4" />
      {buttonText}
    </button>
  )
}

export function StatusCTA({ 
  status, 
  applicationId,
  company, 
  title,
  salaryRange,
  notes,
  jobDescription,
  location,
  url,
  statusHistory,
}: StatusCTAProps) {
  const config = ctaConfig[status]
  
  if (!config) return null

  // Extrair notas do histórico de status (ex: "5 mil + benefícios" quando mudou para proposta)
  const statusHistoryNotes = getStatusHistoryNotes(statusHistory, status)

  return (
    <Card className="p-4 sm:p-5 bg-gradient-to-br from-teal/5 to-amber/5 border-teal/20 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
          {config.type === 'interview' ? (
            <Mic className="w-5 h-5 text-teal" />
          ) : (
            <MessageSquare className="w-5 h-5 text-teal" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-navy mb-1">{config.title}</h3>
          <p className="text-sm text-navy/70 mb-3">{config.description}</p>
          
          {config.type === 'interview' ? (
            <Link href="/dashboard/interview-pro">
              <Button variant="secondary" size="sm">
                <Mic className="w-4 h-4 mr-2" />
                {config.buttonText}
              </Button>
            </Link>
          ) : (
            <PropostaCopilotButton 
              applicationId={applicationId}
              company={company}
              title={title}
              status={status}
              salaryRange={salaryRange}
              notes={notes}
              statusHistoryNotes={statusHistoryNotes}
              jobDescription={jobDescription}
              location={location}
              url={url}
              buttonText={config.buttonText}
            />
          )}
        </div>
      </div>
    </Card>
  )
}
