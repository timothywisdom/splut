// ============================================================================
// SPLUT! Player Type Toggle
// Toggle between Human and AI for a player seat.
// ============================================================================

'use client'

import { PlayerType } from '@/engine/types'

interface PlayerTypeToggleProps {
  value: PlayerType
  onChange: (type: PlayerType) => void
  disabled?: boolean
  seat?: string
}

export default function PlayerTypeToggle({
  value,
  onChange,
  disabled = false,
  seat,
}: PlayerTypeToggleProps) {
  const isAI = value === PlayerType.AI

  return (
    <button
      data-testid={seat ? `player-type-${seat}` : 'player-type-toggle'}
      onClick={() => onChange(isAI ? PlayerType.Human : PlayerType.AI)}
      disabled={disabled}
      className={`
        relative w-[88px] h-8 rounded-full transition-all duration-200 cursor-pointer focus-ring
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${isAI ? 'bg-magic-purple/30 border border-magic-purple/50' : 'bg-carved-stone border border-ash/30'}
      `}
      aria-label={`Switch to ${isAI ? 'Human' : 'AI'}`}
    >
      {/* Slider thumb */}
      <div
        className={`
          absolute top-1 w-6 h-6 rounded-full transition-all duration-200
          ${isAI ? 'left-[58px] bg-magic-purple' : 'left-1 bg-bone'}
        `}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      />
      {/* Labels */}
      <span
        className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-wider transition-opacity duration-200 ${isAI ? 'opacity-100 text-magic-purple' : 'opacity-40 text-ash'}`}
      >
        AI
      </span>
      <span
        className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-wider transition-opacity duration-200 ${!isAI ? 'opacity-100 text-parchment' : 'opacity-40 text-ash'}`}
      >
        Human
      </span>
    </button>
  )
}
