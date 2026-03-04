// ============================================================================
// SPLUT! Modal Component
// Overlay modal with Dark Fantasy Arcana theme.
// ============================================================================

'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  className?: string
}

export default function Modal({ open, onClose, children, className = '' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current && onClose) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-obsidian/85 animate-in fade-in duration-400" />

      {/* Content */}
      <div
        className={`relative z-10 bg-slate-stone border border-rune-gold/30 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)] ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
