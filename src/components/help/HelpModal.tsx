// ============================================================================
// SPLUT! Help Modal
// Full-screen modal overlay with tabbed rules content.
// Focus trap, Escape to close, backdrop click to close.
// ============================================================================

'use client'

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react'
import HelpTabs, { HelpSection } from './HelpTabs'
import HelpContent from './HelpContent'

interface HelpModalProps {
  open: boolean
  onClose: () => void
  initialSection?: HelpSection
}

export default function HelpModal({
  open,
  onClose,
  initialSection = 'overview',
}: HelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>(initialSection)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Reset to overview every time modal opens
  useEffect(() => {
    if (open) {
      setActiveSection('overview')
      // Store the element that had focus before opening
      previousFocusRef.current = document.activeElement as HTMLElement | null
    }
  }, [open])

  // Focus the close button when the modal opens
  useEffect(() => {
    if (open) {
      // Slight delay to ensure the DOM is rendered
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Return focus when closing
  useEffect(() => {
    if (!open && previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  // Escape key handler
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab') return

      const modal = modalRef.current
      if (!modal) return

      const focusableEls = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const focusable = Array.from(focusableEls).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      )

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    []
  )

  // Backdrop click handler
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking directly on the backdrop, not the modal content
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  if (!open) return null

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(13, 13, 18, 0.88)',
          backdropFilter: 'blur(4px)',
          animation: 'help-backdrop-in 300ms ease-out both',
        }}
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div
        className="relative z-[51] flex flex-col"
        style={{
          maxWidth: '720px',
          width: 'calc(100vw - 32px)',
          maxHeight: 'min(85vh, 800px)',
          background: 'var(--slate-stone)',
          border: '1px solid rgba(212, 168, 83, 0.3)',
          borderRadius: '16px',
          boxShadow:
            '0 8px 24px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          animation: 'help-modal-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0" style={{ padding: '24px 24px 0 24px' }}>
          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close rules"
            className="absolute cursor-pointer focus-ring"
            style={{
              top: '16px',
              right: '16px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              padding: '6px',
              zIndex: 1,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="var(--ash)"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-[stroke] duration-150"
              />
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="var(--ash)"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-[stroke] duration-150"
              />
            </svg>
          </button>

          {/* Top ornament */}
          <div className="flex items-center justify-center gap-2 mb-4 help-header-ornament">
            <div className="h-px w-12" style={{ background: 'rgba(212, 168, 83, 0.4)' }} />
            <div
              className="w-2 h-2 rotate-45"
              style={{ background: 'rgba(212, 168, 83, 0.4)' }}
            />
            <div className="h-px w-12" style={{ background: 'rgba(212, 168, 83, 0.4)' }} />
          </div>

          {/* Title */}
          <h1
            id="help-modal-title"
            className="font-display font-bold text-center"
            style={{
              fontSize: '24px',
              letterSpacing: '0.04em',
              color: 'var(--rune-gold-bright)',
              textShadow: '0 0 20px rgba(212, 168, 83, 0.3)',
            }}
          >
            RULES OF SPLUT!
          </h1>

          {/* Subtitle */}
          <p
            className="text-center text-bone italic mt-1 help-header-subtitle"
            style={{ fontSize: '13px' }}
          >
            A Game of Trolls, Dwarves &amp; Sorcerers
          </p>

          {/* Divider */}
          <div
            className="mt-4"
            style={{ height: '1px', background: 'rgba(212, 168, 83, 0.2)' }}
          />
        </div>

        {/* Tab Bar (sticky) */}
        <div className="flex-shrink-0">
          <HelpTabs
            activeSection={activeSection}
            onChangeSection={setActiveSection}
          />
        </div>

        {/* Scrollable content */}
        <HelpContent activeSection={activeSection} />
      </div>

    </div>
  )
}
