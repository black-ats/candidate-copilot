'use client'

import { LogOut } from 'lucide-react'

interface UserMenuProps {
  email?: string
}

export function UserMenu({ email }: UserMenuProps) {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="w-full flex items-center h-11 px-4 mx-2 rounded-lg
          text-navy/70 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut className="w-5 h-5 flex-shrink-0" />
        <span className="ml-3 text-sm font-medium">Sair</span>
      </button>
    </form>
  )
}
