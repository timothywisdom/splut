// ============================================================================
// SPLUT! Piece Component
// Renders any piece (Troll, Dwarf, Sorcerer, Rock) by type and team.
// ============================================================================

'use client'

import { PieceType, PlayerSeat, Piece as PieceData, PlayerPiece, RockPiece } from '@/engine/types'
import { TrollIcon, DwarfIcon, SorcererIcon, RockIcon } from './PieceIcons'
import { getTeamCSSColor } from '@/store/selectors'
import { SEAT_COLOR } from '@/engine/setup'

interface PieceProps {
  piece: PieceData
  square: string
  isSelected?: boolean
  isHovered?: boolean
  isLevitating?: boolean
  onClick?: () => void
}

export default function Piece({
  piece,
  square,
  isSelected = false,
  isHovered = false,
  isLevitating = false,
  onClick,
}: PieceProps) {
  if (piece.type === PieceType.Rock) {
    return (
      <div
        role="img"
        aria-label={`Rock on ${square}`}
        className={`
          flex items-center justify-center transition-transform duration-150 ease-out
          ${isLevitating ? '-translate-y-0.5' : ''}
        `}
        style={
          isLevitating
            ? { filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.3))' }
            : undefined
        }
      >
        <RockIcon size={24} />
      </div>
    )
  }

  const playerPiece = piece as PlayerPiece
  const teamColor = getTeamCSSColor(playerPiece.owner)
  const hexColor = getTeamHexColor(playerPiece.owner)
  const colorName = SEAT_COLOR[playerPiece.owner]

  return (
    <div
      role="button"
      aria-label={`${colorName} ${playerPiece.type} on ${square}. Click to select.`}
      data-testid={`piece-${piece.id}`}
      className="flex items-center justify-center transition-transform duration-150 ease-out cursor-pointer"
      style={{
        transform: isSelected ? 'scale(1.05)' : isHovered ? 'scale(1.08)' : 'scale(1)',
        filter: isSelected
          ? `drop-shadow(0 0 8px ${teamColor})`
          : isHovered
            ? `drop-shadow(0 0 6px ${teamColor})`
            : undefined,
      }}
      onClick={onClick}
    >
      {playerPiece.type === PieceType.Troll && (
        <TrollIcon color={hexColor} size={32} />
      )}
      {playerPiece.type === PieceType.Dwarf && (
        <DwarfIcon color={hexColor} size={28} />
      )}
      {playerPiece.type === PieceType.Sorcerer && (
        <SorcererIcon color={hexColor} size={32} />
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
