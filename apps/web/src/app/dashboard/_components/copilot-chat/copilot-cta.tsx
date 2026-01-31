'use client'

import Link from 'next/link'
import { Video, Sparkles, Plus } from 'lucide-react'
import { useCopilotDrawer } from '@/hooks/use-copilot-drawer'
import type { CopilotCTA as CopilotCTAType } from '@/lib/copilot/types'

interface CopilotCTAProps {
  cta: CopilotCTAType
}

const iconMap = {
  video: Video,
  sparkles: Sparkles,
  plus: Plus,
}

export function CopilotCTA({ cta }: CopilotCTAProps) {
  const Icon = cta.icon ? iconMap[cta.icon] : null
  const { close } = useCopilotDrawer()
  
  return (
    <div className="mt-3">
      <Link
        href={cta.href}
        onClick={close}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-lg
          bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10
          border border-violet-500/20
          hover:from-violet-500/20 hover:to-fuchsia-500/20
          hover:border-violet-500/30
          transition-all duration-200
          text-sm font-medium text-navy
        "
      >
        {Icon && <Icon className="w-4 h-4 text-violet-600" />}
        <span>{cta.label}</span>
      </Link>
    </div>
  )
}
