// ============================================================================
// SPLUT! Throw Direction Picker
// Overlay with 4 directional arrows for choosing throw direction.
// Positioned relative to the Troll's square on the board.
// Board is displayed without rotation:
//   N = screen up, S = screen down, E = screen right, W = screen left
// ============================================================================

'use client'

import { useMemo } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Direction, SquareKey } from '@/engine/types'
import { stepInDirection } from '@/engine/board'

interface ThrowDirectionPickerProps {
  pieceSquare: SquareKey
  gridCol: number
  gridRow: number
  totalCols: number
  totalRows: number
}

// Direction positions relative to center (standard compass layout)
const DIRECTION_LAYOUT: Record<Direction, { label: string; offset: { x: number; y: number } }> = {
  N: { label: 'N', offset: { x: 0, y: -60 } },     // top
  E: { label: 'E', offset: { x: 60, y: 0 } },      // right
  S: { label: 'S', offset: { x: 0, y: 60 } },      // bottom
  W: { label: 'W', offset: { x: -60, y: 0 } },     // left
}

const DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W']

export default function ThrowDirectionPicker({
  pieceSquare,
  gridCol,
  gridRow,
  totalCols,
  totalRows,
}: ThrowDirectionPickerProps) {
  const chooseThrowDirection = useGameStore((s) => s.chooseThrowDirection)
  const game = useGameStore((s) => s.game)

  // Determine which directions are blocked (immediate obstacle)
  const blockedDirs = useMemo(() => {
    if (!game) return new Set<Direction>()
    const blocked = new Set<Direction>()
    for (const dir of DIRECTIONS) {
      const next = stepInDirection(pieceSquare, dir)
      if (!next) {
        blocked.add(dir) // Off the board
      }
    }
    return blocked
  }, [game, pieceSquare])

  // Compute the center position of the Troll's square within the board grid
  // Each cell is roughly 1/totalCols of the board width
  const centerXPercent = ((gridCol - 0.5) / totalCols) * 100
  const centerYPercent = ((gridRow - 0.5) / totalRows) * 100

  return (
    <div className="absolute inset-0 z-20" role="group" aria-label="Choose throw direction">
      {/* Dark backdrop over the board */}
      <div className="absolute inset-0 bg-obsidian/60 rounded-lg" />

      {/* Direction buttons centered on the Troll's square position */}
      <div
        className="absolute"
        style={{
          left: `${centerXPercent}%`,
          top: `${centerYPercent}%`,
        }}
      >
        {DIRECTIONS.map((dir, index) => {
          const layout = DIRECTION_LAYOUT[dir]
          const isBlocked = blockedDirs.has(dir)
          return (
            <button
              key={dir}
              data-testid={`throw-${dir}`}
              onClick={() => !isBlocked && chooseThrowDirection(dir)}
              disabled={isBlocked}
              className={`
                absolute w-12 h-12 rounded-full font-bold text-sm
                flex items-center justify-center
                transition-all duration-150 focus-ring
                ${isBlocked
                  ? 'bg-carved-stone text-ash/30 cursor-not-allowed'
                  : 'bg-throw-orange text-obsidian cursor-pointer hover:scale-110 hover:shadow-[0_0_16px_rgba(249,115,22,0.5)] active:scale-95 shadow-[0_2px_8px_rgba(249,115,22,0.3)]'
                }
              `}
              style={{
                left: `${layout.offset.x - 24}px`,
                top: `${layout.offset.y - 24}px`,
                animationDelay: `${index * 50}ms`,
              }}
              aria-label={`Throw ${dir}${isBlocked ? ' (blocked)' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!isBlocked) chooseThrowDirection(dir)
                }
              }}
            >
              {layout.label}
            </button>
          )
        })}

        {/* Center label */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-throw-orange font-semibold tracking-wide pointer-events-none whitespace-nowrap">
          THROW
        </div>
      </div>
    </div>
  )
}
