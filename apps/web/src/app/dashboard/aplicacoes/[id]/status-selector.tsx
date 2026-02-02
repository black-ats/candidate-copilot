'use client'

import { useState, useTransition } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { Badge, Textarea, Button } from '@ui/components'
import { BottomSheet } from '@/components/bottom-sheet'
import { changeStatus } from '../actions'
import { statusConfig, type ApplicationStatus } from '@/lib/types/application'

interface StatusSelectorProps {
  applicationId: string
  currentStatus: ApplicationStatus
}

// Define status flow - which statuses can follow which
const statusFlow: Record<ApplicationStatus, ApplicationStatus[]> = {
  aplicado: ['em_analise', 'entrevista', 'rejeitado'],
  em_analise: ['entrevista', 'proposta', 'rejeitado'],
  entrevista: ['proposta', 'rejeitado'],
  proposta: ['aceito', 'rejeitado', 'desistencia'],
  aceito: ['desistencia'],
  rejeitado: [],
  desistencia: [],
}

export function StatusSelector({ applicationId, currentStatus }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | null>(null)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  const nextStatuses = statusFlow[currentStatus]
  const currentConfig = statusConfig[currentStatus]

  const handleStatusSelect = (status: ApplicationStatus) => {
    setSelectedStatus(status)
  }

  const handleConfirm = () => {
    if (!selectedStatus) return

    startTransition(async () => {
      const result = await changeStatus({
        id: applicationId,
        status: selectedStatus,
        notes: notes || undefined,
      })

      if (!result.error) {
        setSelectedStatus(null)
        setNotes('')
        setIsOpen(false)
      }
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedStatus(null)
    setNotes('')
  }

  // Se não há próximos status possíveis (ex: rejeitado, desistencia)
  if (nextStatuses.length === 0) {
    return (
      <div className="mb-6">
        <Badge variant={currentConfig.variant} className="text-sm px-3 py-1.5">
          {currentConfig.label}
        </Badge>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        {/* Badge clicável que abre o bottom sheet */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 group"
        >
          <Badge variant={currentConfig.variant} className="text-sm px-3 py-1.5">
            {currentConfig.label}
          </Badge>
          <span className="text-sm text-navy/60 group-hover:text-navy transition-colors flex items-center gap-0.5">
            Atualizar status
            <ChevronRight className="w-4 h-4" />
          </span>
        </button>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        title="Atualizar status"
      >
        {/* Lista de status */}
        <div className="space-y-1 mb-4">
          {nextStatuses.map((status) => {
            const config = statusConfig[status]
            const isSelected = selectedStatus === status
            
            return (
              <button
                key={status}
                onClick={() => handleStatusSelect(status)}
                disabled={isPending}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl
                  transition-colors duration-150
                  ${isSelected 
                    ? 'bg-navy/5 ring-1 ring-navy/20' 
                    : 'hover:bg-stone/10'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Radio indicator */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    transition-colors duration-150
                    ${isSelected 
                      ? 'border-navy bg-navy' 
                      : 'border-stone/40'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  
                  <span className={`font-medium ${isSelected ? 'text-navy' : 'text-navy/80'}`}>
                    {config.label}
                  </span>
                </div>
                
                {/* Status color indicator */}
                <div className={`
                  w-3 h-3 rounded-full
                  ${config.variant === 'success' ? 'bg-teal' : ''}
                  ${config.variant === 'error' ? 'bg-red-500' : ''}
                  ${config.variant === 'warning' ? 'bg-amber' : ''}
                  ${config.variant === 'info' ? 'bg-blue-500' : ''}
                  ${config.variant === 'default' ? 'bg-stone' : ''}
                `} />
              </button>
            )
          })}
        </div>

        {/* Campo de notas (aparece quando um status é selecionado) */}
        {selectedStatus && (
          <div className="mb-4">
            <Textarea
              label="Nota (opcional)"
              placeholder="Ex: Entrevista marcada para dia 15..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="ghost" 
            className="flex-1"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1"
            onClick={handleConfirm}
            disabled={!selectedStatus}
            isLoading={isPending}
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmar
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}
