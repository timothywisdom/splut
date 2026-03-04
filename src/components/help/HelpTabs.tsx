// ============================================================================
// SPLUT! Help Tabs
// Tab bar with keyboard navigation (Arrow keys, Home, End).
// ============================================================================

'use client'

import { useRef, useCallback, KeyboardEvent } from 'react'

export type HelpSection = 'overview' | 'board' | 'pieces' | 'splut' | 'winning' | 'quick-ref'

export const SECTIONS: { id: HelpSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'board', label: 'Board' },
  { id: 'pieces', label: 'Pieces' },
  { id: 'splut', label: 'SPLUT!' },
  { id: 'winning', label: 'Winning' },
  { id: 'quick-ref', label: 'Quick Ref' },
]

interface HelpTabsProps {
  activeSection: HelpSection
  onChangeSection: (section: HelpSection) => void
}

export default function HelpTabs({ activeSection, onChangeSection }: HelpTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const setTabRef = useCallback((el: HTMLButtonElement | null, index: number) => {
    tabRefs.current[index] = el
  }, [])

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection)
      let newIndex: number | null = null

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          newIndex = (currentIndex + 1) % SECTIONS.length
          break
        case 'ArrowLeft':
          e.preventDefault()
          newIndex = (currentIndex - 1 + SECTIONS.length) % SECTIONS.length
          break
        case 'Home':
          e.preventDefault()
          newIndex = 0
          break
        case 'End':
          e.preventDefault()
          newIndex = SECTIONS.length - 1
          break
        default:
          return
      }

      if (newIndex !== null) {
        onChangeSection(SECTIONS[newIndex].id)
        focusTab(newIndex)
      }
    },
    [activeSection, onChangeSection, focusTab]
  )

  return (
    <div
      role="tablist"
      aria-label="Rules sections"
      className="help-tab-bar flex overflow-x-auto px-6"
      style={{
        background: 'var(--slate-stone)',
        borderBottom: '1px solid rgba(212, 168, 83, 0.15)',
      }}
      onKeyDown={handleKeyDown}
    >
      {SECTIONS.map((section, index) => {
        const isActive = section.id === activeSection
        return (
          <button
            key={section.id}
            ref={(el) => setTabRef(el, index)}
            role="tab"
            id={`help-tab-${section.id}`}
            aria-selected={isActive}
            aria-controls={`help-panel-${section.id}`}
            tabIndex={isActive ? 0 : -1}
            className="relative cursor-pointer whitespace-nowrap transition-colors duration-150 focus-ring"
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: isActive ? 'var(--rune-gold-bright)' : 'var(--ash)',
              background: 'transparent',
              border: 'none',
            }}
            onClick={() => onChangeSection(section.id)}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--bone)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--ash)'
              }
            }}
          >
            {section.label}
            {/* Active indicator */}
            <span
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: '2px',
                background: 'var(--rune-gold)',
                transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 200ms ease-out',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
