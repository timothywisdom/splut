// ============================================================================
// SPLUT! Callout Box
// Reusable callout for important notes, warnings, and highlighted information.
// ============================================================================

'use client'

import { ReactNode } from 'react'

type CalloutType = 'info' | 'magic' | 'warning' | 'danger'

interface CalloutBoxProps {
  type?: CalloutType
  children: ReactNode
}

const BORDER_COLORS: Record<CalloutType, string> = {
  info: 'var(--rune-gold)',
  magic: 'var(--magic-purple)',
  warning: 'var(--throw-orange)',
  danger: 'var(--splut-red)',
}

export default function CalloutBox({ type = 'info', children }: CalloutBoxProps) {
  return (
    <div
      className="rounded-r-[6px] my-4"
      style={{
        background: 'rgba(42, 42, 62, 0.6)',
        borderLeft: `3px solid ${BORDER_COLORS[type]}`,
        padding: '12px 16px',
      }}
    >
      <div
        className="text-bone leading-relaxed"
        style={{ fontSize: '13px', lineHeight: '1.6' }}
      >
        {children}
      </div>
    </div>
  )
}
