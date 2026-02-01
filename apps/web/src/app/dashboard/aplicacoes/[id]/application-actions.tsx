'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { DeleteConfirmModal } from '../_components/delete-confirm-modal'
import type { Application } from '@/lib/types/application'

interface ApplicationActionsProps {
  application: Application
}

export function ApplicationActions({ application }: ApplicationActionsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Link 
          href={`/dashboard/aplicacoes/${application.id}/editar`}
          className="flex items-center gap-1.5 text-sm text-navy/60 hover:text-navy transition-colors"
        >
          <Edit className="w-4 h-4" />
          Editar
        </Link>
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-1.5 text-sm text-red-500/70 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      </div>

      <DeleteConfirmModal
        applicationId={application.id}
        companyName={application.company}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  )
}
