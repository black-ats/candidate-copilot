'use client'

import { Button, type ButtonProps } from '@ui/components'
import { Sparkles } from 'lucide-react'

interface CopilotButtonProps extends Omit<ButtonProps, 'variant'> {
  children: React.ReactNode
  showIcon?: boolean
  variant?: 'solid' | 'text'
}

const variantStyles = {
  solid: `
    bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500
    hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400
    text-white border-none
  `,
  text: `
    bg-transparent text-purple-600 hover:text-purple-700 hover:bg-purple-50
    border-none shadow-none
  `,
}

export function CopilotButton({ 
  children, 
  showIcon = true,
  variant = 'solid',
  className,
  ...props 
}: CopilotButtonProps) {
  return (
    <Button
      className={`${variantStyles[variant]} ${className || ''}`}
      {...props}
    >
      {showIcon && <Sparkles className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  )
}
