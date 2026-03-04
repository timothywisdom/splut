// ============================================================================
// SPLUT! Board Diagram
// Styled visual board diagram for the Help modal Board tab.
// Uses engine data to ensure accuracy.
// ============================================================================

'use client'

import { ALL_VALID_SQUARES, isValidSquare } from '@/engine/board'
import { PlayerSeat } from '@/engine/types'
import { SorcererIcon, TrollIcon, DwarfIcon, RockIcon } from '@/components/game/PieceIcons'

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const
// Rows displayed top to bottom: 9 at top, 1 at bottom
const DISPLAY_ROWS = [9, 8, 7, 6, 5, 4, 3, 2, 1] as const

interface StartingPosition {
  square: string
  seat: PlayerSeat
  piece: 'sorcerer' | 'dwarf' | 'troll'
}

const STARTING_POSITIONS: StartingPosition[] = [
  { square: 'D8', seat: PlayerSeat.Top, piece: 'sorcerer' },
  { square: 'E8', seat: PlayerSeat.Top, piece: 'dwarf' },
  { square: 'F8', seat: PlayerSeat.Top, piece: 'troll' },
  { square: 'F2', seat: PlayerSeat.Bottom, piece: 'sorcerer' },
  { square: 'E2', seat: PlayerSeat.Bottom, piece: 'dwarf' },
  { square: 'D2', seat: PlayerSeat.Bottom, piece: 'troll' },
  { square: 'B6', seat: PlayerSeat.Left, piece: 'sorcerer' },
  { square: 'B5', seat: PlayerSeat.Left, piece: 'dwarf' },
  { square: 'B4', seat: PlayerSeat.Left, piece: 'troll' },
  { square: 'H6', seat: PlayerSeat.Right, piece: 'sorcerer' },
  { square: 'H5', seat: PlayerSeat.Right, piece: 'dwarf' },
  { square: 'H4', seat: PlayerSeat.Right, piece: 'troll' },
]

const ROCK_POSITIONS = ['E9', 'E1', 'A5', 'I5']

const TEAM_COLORS: Record<PlayerSeat, string> = {
  [PlayerSeat.Top]: 'var(--team-green)',
  [PlayerSeat.Bottom]: 'var(--team-red)',
  [PlayerSeat.Left]: 'var(--team-yellow)',
  [PlayerSeat.Right]: 'var(--team-blue)',
}

const TEAM_HEX: Record<PlayerSeat, string> = {
  [PlayerSeat.Top]: '#22C55E',
  [PlayerSeat.Bottom]: '#EF4444',
  [PlayerSeat.Left]: '#EAB308',
  [PlayerSeat.Right]: '#3B82F6',
}

function getStartingPos(key: string): StartingPosition | undefined {
  return STARTING_POSITIONS.find((p) => p.square === key)
}

function isRockPos(key: string): boolean {
  return ROCK_POSITIONS.includes(key)
}

function PieceIcon({
  piece,
  color,
  size,
}: {
  piece: 'sorcerer' | 'dwarf' | 'troll' | 'rock'
  color: string
  size: number
}) {
  switch (piece) {
    case 'sorcerer':
      return <SorcererIcon color={color} size={size} />
    case 'troll':
      return <TrollIcon color={color} size={size} />
    case 'dwarf':
      return <DwarfIcon color={color} size={size} />
    case 'rock':
      return <RockIcon size={size} />
  }
}

export default function BoardDiagram() {
  return (
    <div
      className="flex flex-col items-center rounded-lg p-4"
      style={{
        background: 'rgba(13, 13, 18, 0.5)',
        border: '1px solid var(--carved-stone)',
      }}
    >
      {/* Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(9, 28px)',
          gridTemplateRows: 'repeat(9, 28px)',
          gap: '2px',
        }}
      >
        {DISPLAY_ROWS.map((row) =>
          COLS.map((col) => {
            const colIdx = COLS.indexOf(col)
            const rowIdx = row - 1
            const key = `${col}${row}`
            const valid = isValidSquare(colIdx, rowIdx)

            if (!valid) {
              return <div key={key} />
            }

            const startPos = getStartingPos(key)
            const rock = isRockPos(key)

            let bgColor = 'var(--carved-stone)'
            if (startPos) {
              bgColor = `color-mix(in srgb, ${TEAM_COLORS[startPos.seat]} 20%, var(--carved-stone))`
            } else if (rock) {
              bgColor = `color-mix(in srgb, var(--rock-granite) 20%, var(--carved-stone))`
            }

            return (
              <div
                key={key}
                className="relative flex items-center justify-center rounded-[4px]"
                style={{
                  background: bgColor,
                  border: '1px solid rgba(58, 58, 82, 0.5)',
                  width: '28px',
                  height: '28px',
                }}
              >
                {/* Piece icon on desktop, hidden on mobile via parent media query */}
                {startPos && (
                  <div className="absolute inset-0 flex items-center justify-center board-diagram-icon">
                    <PieceIcon
                      piece={startPos.piece}
                      color={TEAM_HEX[startPos.seat]}
                      size={12}
                    />
                  </div>
                )}
                {rock && !startPos && (
                  <div className="absolute inset-0 flex items-center justify-center board-diagram-icon">
                    <RockIcon size={12} />
                  </div>
                )}
                {/* Coordinate label */}
                <span
                  className="relative z-[1] font-mono text-ash select-none"
                  style={{
                    fontSize: '9px',
                    lineHeight: 1,
                  }}
                >
                  {key}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap justify-center mt-3"
        style={{ gap: '12px' }}
      >
        {[
          { label: 'Green (Top)', color: 'var(--team-green)' },
          { label: 'Red (Bottom)', color: 'var(--team-red)' },
          { label: 'Yellow (Left)', color: 'var(--team-yellow)' },
          { label: 'Blue (Right)', color: 'var(--team-blue)' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="rounded-full"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: color,
              }}
            />
            <span className="text-ash" style={{ fontSize: '11px' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
