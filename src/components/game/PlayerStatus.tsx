// ============================================================================
// SPLUT! Player Status Panel
// Player cards showing team info, alive pieces, and AI badge.
// Supports both vertical (desktop left panel) and horizontal (mobile strip) layout.
// ============================================================================

'use client'

import { useGameStore } from '@/store/gameStore'
import { usePlayers, useCurrentSeat, getTeamCSSColor } from '@/store/selectors'
import { SEAT_COLOR } from '@/engine/setup'
import { PlayerType, PlayerSeat, PieceType, PlayerPiece } from '@/engine/types'
import { TrollIcon, DwarfIcon, SorcererIcon } from './PieceIcons'

interface PlayerStatusPanelProps {
  layout?: 'vertical' | 'horizontal'
}

export default function PlayerStatusPanel({ layout = 'vertical' }: PlayerStatusPanelProps) {
  const players = usePlayers()
  const currentSeat = useCurrentSeat()

  if (players.length === 0) return null

  const isHorizontal = layout === 'horizontal'

  return (
    <div className={isHorizontal ? 'flex gap-2 min-w-max' : 'flex flex-col gap-2 w-60'}>
      {players.map((player) => (
        <PlayerStatusCard
          key={player.seat}
          seat={player.seat}
          playerType={player.playerType}
          isEliminated={player.isEliminated}
          isCurrentTurn={player.seat === currentSeat}
          compact={isHorizontal}
        />
      ))}
    </div>
  )
}

interface PlayerStatusCardProps {
  seat: PlayerSeat
  playerType: PlayerType
  isEliminated: boolean
  isCurrentTurn: boolean
  compact?: boolean
}

function PlayerStatusCard({
  seat,
  playerType,
  isEliminated,
  isCurrentTurn,
  compact = false,
}: PlayerStatusCardProps) {
  const colorName = SEAT_COLOR[seat]
  const teamColor = getTeamCSSColor(seat)
  const hexColor = getTeamHexColor(seat)
  const game = useGameStore((s) => s.game)

  // Get alive piece types for this team
  const alivePieces: PieceType[] = []
  const deadPieces: PieceType[] = []
  if (game) {
    for (const [, piece] of game.pieces) {
      if (piece.type === PieceType.Rock) continue
      const pp = piece as PlayerPiece
      if (pp.owner === seat) {
        if (pp.alive) alivePieces.push(pp.type)
        else deadPieces.push(pp.type)
      }
    }
  }

  return (
    <div
      data-testid={`player-status-${seat}`}
      className={`
        relative flex items-center rounded-lg bg-slate-stone overflow-hidden
        transition-all duration-200
        ${compact ? 'h-12 min-w-[140px]' : 'h-14'}
        ${isEliminated ? 'opacity-35' : ''}
        ${isCurrentTurn && !isEliminated ? 'border border-opacity-50' : 'border border-carved-stone'}
      `}
      style={
        isCurrentTurn && !isEliminated
          ? { borderColor: `${teamColor}80` }
          : undefined
      }
    >
      {/* Left color bar with shimmer for active turn */}
      <div
        className={`w-1 h-full flex-shrink-0 ${isCurrentTurn && !isEliminated ? 'animate-shimmer' : ''}`}
        style={{
          backgroundColor: isEliminated ? 'var(--ash)' : teamColor,
          ...(isCurrentTurn && !isEliminated
            ? {
                backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
                backgroundSize: '200% 100%',
              }
            : {}),
        }}
      />

      {/* Content */}
      <div className="flex items-center justify-between flex-1 px-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-display font-semibold tracking-wide"
              style={{ color: isEliminated ? 'var(--ash)' : teamColor }}
            >
              {colorName}
            </span>
            {playerType === PlayerType.AI && !isEliminated && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider bg-magic-purple/30 text-pure-light rounded">
                AI
              </span>
            )}
          </div>
          {isEliminated && (
            <span className="text-[10px] text-ash tracking-wide">(eliminated)</span>
          )}
        </div>

        {/* Piece mini-icons */}
        <div className="flex items-center gap-1">
          {[PieceType.Sorcerer, PieceType.Troll, PieceType.Dwarf].map((type) => {
            const alive = alivePieces.includes(type)
            const dead = deadPieces.includes(type)
            if (!alive && !dead) return null
            return (
              <div
                key={type}
                className={dead ? 'opacity-25 relative' : ''}
              >
                {type === PieceType.Troll && <TrollIcon color={hexColor} size={16} />}
                {type === PieceType.Dwarf && <DwarfIcon color={hexColor} size={16} />}
                {type === PieceType.Sorcerer && <SorcererIcon color={hexColor} size={16} />}
                {dead && <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-ash/50" /></div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Elimination strike-through */}
      {isEliminated && (
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full h-px bg-ash/50" />
        </div>
      )}
    </div>
  )
}

function getTeamHexColor(seat: PlayerSeat): string {
  switch (seat) {
    case PlayerSeat.Top: return '#22C55E'
    case PlayerSeat.Bottom: return '#EF4444'
    case PlayerSeat.Left: return '#EAB308'
    case PlayerSeat.Right: return '#3B82F6'
  }
}
