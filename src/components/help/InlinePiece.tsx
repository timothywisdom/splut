// ============================================================================
// SPLUT! Inline Piece Reference
// Renders a piece icon + name inline in body text.
// ============================================================================

'use client'

import { SorcererIcon, TrollIcon, DwarfIcon, RockIcon } from '@/components/game/PieceIcons'

type PieceName = 'Sorcerer' | 'Troll' | 'Dwarf' | 'Rock'

interface InlinePieceProps {
  piece: PieceName
  /** If true, just show the icon without the name */
  iconOnly?: boolean
}

export default function InlinePiece({ piece, iconOnly = false }: InlinePieceProps) {
  const iconProps = { size: 16, className: 'inline-block' }
  const runeGold = '#D4A853'

  let icon: React.ReactNode
  switch (piece) {
    case 'Sorcerer':
      icon = <SorcererIcon color={runeGold} {...iconProps} />
      break
    case 'Troll':
      icon = <TrollIcon color={runeGold} {...iconProps} />
      break
    case 'Dwarf':
      icon = <DwarfIcon color={runeGold} {...iconProps} />
      break
    case 'Rock':
      icon = <RockIcon {...iconProps} />
      break
  }

  return (
    <span className="inline-flex items-baseline" style={{ verticalAlign: 'baseline' }}>
      <span className="inline-block" style={{ verticalAlign: '-3px', margin: '0 3px' }}>
        {icon}
      </span>
      {!iconOnly && (
        <span className="text-parchment font-semibold" style={{ fontSize: '14px' }}>
          {piece}
        </span>
      )}
    </span>
  )
}
