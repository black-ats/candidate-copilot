'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Small delay to trigger CSS animation
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
      // Lock body scroll
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before hiding
      const timeout = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      document.body.style.overflow = ''
      return () => clearTimeout(timeout)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Touch handlers for drag-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current
    
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`
    }
  }

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current
    
    if (sheetRef.current) {
      sheetRef.current.style.transform = ''
    }
    
    // Close if dragged more than 100px down
    if (diff > 100) {
      onClose()
    }
    
    startY.current = 0
    currentY.current = 0
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className={`
          absolute inset-0 bg-black/40 transition-opacity duration-300
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`
          absolute bottom-0 left-0 right-0
          bg-white rounded-t-2xl shadow-xl
          max-h-[85vh] overflow-hidden
          transition-all duration-300 ease-out
          sm:bottom-auto sm:top-1/2 sm:left-1/2 
          sm:-translate-x-1/2 sm:max-w-md sm:rounded-2xl
          ${isAnimating 
            ? 'translate-y-0 sm:-translate-y-1/2 opacity-100' 
            : 'translate-y-full sm:translate-y-[-40%] sm:opacity-0'
          }
        `}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-stone/30 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone/20">
            <h2 id="bottom-sheet-title" className="text-lg font-semibold text-navy">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-navy/50 hover:text-navy transition-colors rounded-lg hover:bg-stone/10"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-4rem)] p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
