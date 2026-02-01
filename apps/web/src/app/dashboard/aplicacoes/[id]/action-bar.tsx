'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Check, ChevronDown } from 'lucide-react'
import { Badge, Textarea, Button } from '@ui/components'
import { BottomSheet } from '@/components/bottom-sheet'
import { DeleteConfirmModal } from '../_components/delete-confirm-modal'
import { changeStatus } from '../actions'
import { statusConfig, type Application, type ApplicationStatus } from '@/lib/types/application'

interface ActionBarProps {
  application: Application
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

export function ActionBar({ application }: ActionBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | null>(null)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentStatus = application.status
  const nextStatuses = statusFlow[currentStatus]
  const currentConfig = statusConfig[currentStatus]
  const canChangeStatus = nextStatuses.length > 0

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSelectedStatus(null)
        setNotes('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStatusConfirm = () => {
    if (!selectedStatus) return

    startTransition(async () => {
      const result = await changeStatus({
        id: application.id,
        status: selectedStatus,
        notes: notes || undefined,
      })

      if (!result.error) {
        setSelectedStatus(null)
        setNotes('')
        setIsDropdownOpen(false)
        setIsMobileSheetOpen(false)
      }
    })
  }

  const handleMobileClose = () => {
    setIsMobileSheetOpen(false)
    setSelectedStatus(null)
    setNotes('')
  }

  return (
    <>
      {/* Desktop: toolbar horizontal */}
      <div className="hidden md:flex items-center gap-2 py-3 px-4 bg-white rounded-xl border border-stone/20 shadow-sm mb-6">
        {/* Status dropdown (esquerda) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => canChangeStatus && setIsDropdownOpen(!isDropdownOpen)}
            disabled={!canChangeStatus}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${currentConfig.variant === 'success' ? 'bg-teal/10 text-teal hover:bg-teal/20' : ''}
              ${currentConfig.variant === 'error' ? 'bg-red-50 text-red-600 hover:bg-red-100' : ''}
              ${currentConfig.variant === 'warning' ? 'bg-amber/10 text-amber-700 hover:bg-amber/20' : ''}
              ${currentConfig.variant === 'info' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
              ${currentConfig.variant === 'default' ? 'bg-stone/10 text-navy/70 hover:bg-stone/20' : ''}
              ${!canChangeStatus ? 'cursor-default' : ''}
            `}
          >
            {currentConfig.label}
            {canChangeStatus && (
              <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-stone/20 shadow-lg z-50 overflow-hidden">
              <div className="p-2">
                {nextStatuses.map((status) => {
                  const config = statusConfig[status]
                  const isSelected = selectedStatus === status
                  
                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      disabled={isPending}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg
                        transition-colors duration-150 text-left
                        ${isSelected ? 'bg-navy/5' : 'hover:bg-stone/10'}
                        disabled:opacity-50
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`
                          w-4 h-4 rounded-full border-2 flex items-center justify-center
                          ${isSelected ? 'border-navy bg-navy' : 'border-stone/40'}
                        `}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-navy font-medium' : 'text-navy/80'}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className={`
                        w-2.5 h-2.5 rounded-full
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

              {selectedStatus && (
                <div className="px-3 pb-3 border-t border-stone/10 pt-3">
                  <Textarea
                    placeholder="Nota opcional..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[60px] text-sm mb-2"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedStatus(null)
                        setNotes('')
                      }}
                      disabled={isPending}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1"
                      onClick={handleStatusConfirm}
                      isLoading={isPending}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Confirmar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Ações secundárias (direita) */}
        <Link 
          href={`/dashboard/aplicacoes/${application.id}/editar`}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-navy/70 hover:text-navy hover:bg-stone/10 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          Editar
        </Link>
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500/80 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      </div>

      {/* Mobile: barra fixa no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-stone/20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 py-3 gap-2">
          {/* Editar */}
          <Link 
            href={`/dashboard/aplicacoes/${application.id}/editar`}
            className="flex flex-col items-center gap-1 px-3 py-1 text-navy/70"
          >
            <Edit className="w-5 h-5" />
            <span className="text-xs">Editar</span>
          </Link>

          {/* Status */}
          <button
            onClick={() => canChangeStatus && setIsMobileSheetOpen(true)}
            disabled={!canChangeStatus}
            className="flex flex-col items-center gap-1 px-3 py-1"
          >
            <Badge variant={currentConfig.variant} className="text-xs px-2 py-0.5">
              {currentConfig.label}
            </Badge>
            {canChangeStatus && (
              <span className="text-xs text-navy/60">Mudar</span>
            )}
          </button>

          {/* Excluir */}
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1 text-red-500/80"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-xs">Excluir</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet para mudança de status (mobile only) */}
      <BottomSheet
        isOpen={isMobileSheetOpen}
        onClose={handleMobileClose}
        title="Atualizar status"
      >
        <div className="space-y-1 mb-4">
          {nextStatuses.map((status) => {
            const config = statusConfig[status]
            const isSelected = selectedStatus === status
            
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
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

        <div className="flex gap-3 pt-2">
          <Button 
            variant="ghost" 
            className="flex-1"
            onClick={handleMobileClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1"
            onClick={handleStatusConfirm}
            disabled={!selectedStatus}
            isLoading={isPending}
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmar
          </Button>
        </div>
      </BottomSheet>

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmModal
        applicationId={application.id}
        companyName={application.company}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  )
}
