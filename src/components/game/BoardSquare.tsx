// ============================================================================
// SPLUT! Board Square
// Individual cell on the game board with highlight states.
// ============================================================================

'use client'

import { SquareKey } from '@/engine/types'
import { HighlightType } from '@/store/gameStore'

interface BoardSquareProps {
  square: SquareKey
  gridCol: number
  gridRow: number
  highlight: HighlightType | null
  isHovered: boolean
  hasOwnPiece: boolean
  teamColor: string | null
  occupantLabel: string
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  tabIndex: number
  children: React.ReactNode
}

export default function BoardSquare({
  square,
  gridCol,
  gridRow,
  highlight,
  isHovered,
  hasOwnPiece,
  teamColor,
  occupantLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
  tabIndex,
  children,
}: BoardSquareProps) {
  const highlightStyles = getHighlightStyles(highlight, teamColor)
  const hoverStyles = isHovered && !highlight
    ? hasOwnPiece && teamColor
      ? { borderColor: `${teamColor}66` } // 40% opacity
      : { borderColor: 'rgba(212, 168, 83, 0.2)' }
    : {}

  const ariaLabel = occupantLabel
    ? `Square ${square}, contains ${occupantLabel}`
    : `Square ${square}, empty`

  return (
    <div
      data-square={square}
      data-testid={`square-${square}`}
      role="gridcell"
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      className={`
        relative flex items-center justify-center
        transition-all duration-150 focus-ring-inset
        ${isHovered && !highlight ? 'bg-worn-stone cursor-pointer' : 'bg-carved-stone'}
        ${highlight === 'selected' ? 'z-10' : ''}
        ${highlight === 'splut' ? 'animate-splut-flash' : ''}
      `}
      style={{
        gridColumn: gridCol,
        gridRow: gridRow,
        boxShadow: highlightStyles.boxShadow || 'inset 0 1px 2px rgba(0,0,0,0.3)',
        border: highlightStyles.border || (isHovered ? `1px solid` : '1px solid transparent'),
        borderRadius: '2px',
        ...hoverStyles,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
    >
      {/* Valid move target dot */}
      {highlight === 'valid-move' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-valid-move opacity-70 animate-pulse-glow" />
        </div>
      )}

      {/* Counter-rotate content so pieces appear upright */}
      <div className="board-diamond-counter flex items-center justify-center w-full h-full">
        {children}
      </div>
    </div>
  )
}

function getHighlightStyles(
  highlight: HighlightType | null,
  teamColor: string | null
): { border?: string; boxShadow?: string } {
  if (!highlight) return {}

  switch (highlight) {
    case 'selected':
      return {
        border: `2px solid ${teamColor || 'var(--rune-gold)'}cc`,
        boxShadow: `0 0 12px ${teamColor || 'var(--rune-gold)'}80, 0 0 24px ${teamColor || 'var(--rune-gold)'}33`,
      }
    case 'valid-move':
      return {
        border: '2px solid rgba(34, 211, 238, 0.6)',
      }
    case 'throw-path':
      return {
        border: '1px solid var(--throw-orange)',
        boxShadow: '0 0 8px rgba(249, 115, 22, 0.3)',
      }
    case 'splut':
      return {
        border: '2px solid var(--splut-red)',
        boxShadow: '0 0 16px rgba(255, 45, 85, 0.5)',
      }
    case 'levitate-eligible':
      return {
        border: '2px solid rgba(168, 85, 247, 0.6)',
        boxShadow: '0 0 12px rgba(168, 85, 247, 0.3)',
      }
    default:
      return {}
  }
}
