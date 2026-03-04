// ============================================================================
// SPLUT! Help - Board Section
// Board diagram, team cards, player count variants.
// ============================================================================

'use client'

import { PlayerSeat } from '@/engine/types'
import { SorcererIcon, TrollIcon, DwarfIcon } from '@/components/game/PieceIcons'
import BoardDiagram from '../BoardDiagram'
import CalloutBox from '../CalloutBox'

interface TeamInfo {
  seat: PlayerSeat
  color: string
  colorName: string
  hexColor: string
  position: string
  sorcerer: string
  dwarf: string
  troll: string
}

const TEAMS: TeamInfo[] = [
  {
    seat: PlayerSeat.Top,
    color: 'var(--team-green)',
    colorName: 'Green',
    hexColor: '#22C55E',
    position: 'Top',
    sorcerer: 'D8',
    dwarf: 'E8',
    troll: 'F8',
  },
  {
    seat: PlayerSeat.Bottom,
    color: 'var(--team-red)',
    colorName: 'Red',
    hexColor: '#EF4444',
    position: 'Bottom',
    sorcerer: 'F2',
    dwarf: 'E2',
    troll: 'D2',
  },
  {
    seat: PlayerSeat.Left,
    color: 'var(--team-yellow)',
    colorName: 'Yellow',
    hexColor: '#EAB308',
    position: 'Left',
    sorcerer: 'B6',
    dwarf: 'B5',
    troll: 'B4',
  },
  {
    seat: PlayerSeat.Right,
    color: 'var(--team-blue)',
    colorName: 'Blue',
    hexColor: '#3B82F6',
    position: 'Right',
    sorcerer: 'H6',
    dwarf: 'H5',
    troll: 'H4',
  },
]

function TeamCard({ team }: { team: TeamInfo }) {
  const pieces = [
    { icon: <SorcererIcon color={team.hexColor} size={16} />, name: 'Sorcerer', coord: team.sorcerer },
    { icon: <DwarfIcon color={team.hexColor} size={16} />, name: 'Dwarf', coord: team.dwarf },
    { icon: <TrollIcon color={team.hexColor} size={16} />, name: 'Troll', coord: team.troll },
  ]

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: 'var(--carved-stone)',
        border: `1px solid color-mix(in srgb, ${team.color} 30%, transparent)`,
        borderLeft: `3px solid ${team.color}`,
        minWidth: '140px',
      }}
    >
      {/* Team name header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="rounded-full"
          style={{ width: '8px', height: '8px', backgroundColor: team.color }}
        />
        <span className="font-semibold" style={{ fontSize: '13px', color: team.color }}>
          {team.colorName} ({team.position})
        </span>
      </div>
      {/* Piece rows */}
      <div className="space-y-1">
        {pieces.map(({ icon, name, coord }) => (
          <div key={name} className="flex items-center gap-2">
            {icon}
            <span className="text-bone" style={{ fontSize: '13px' }}>
              {name}
            </span>
            <span className="text-ash font-mono ml-auto" style={{ fontSize: '13px' }}>
              {coord}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BoardSection() {
  return (
    <div>
      <h2
        className="font-display font-semibold text-rune-gold"
        style={{ fontSize: '20px', letterSpacing: '0.02em', marginBottom: '16px' }}
      >
        The Board
      </h2>

      <p
        className="text-bone mb-4"
        style={{ fontSize: '14px', lineHeight: '1.7' }}
      >
        The board is a <strong className="text-parchment font-semibold">diamond</strong> (rotated
        square) made of 41 squares on a 9x9 grid. Only squares within Manhattan distance 4 of the
        center (E5) are playable. All movement is{' '}
        <strong className="text-parchment font-semibold">orthogonal</strong> (North, South, East,
        West). No diagonal movement.
      </p>

      <BoardDiagram />

      {/* Divider */}
      <div
        className="my-6"
        style={{ height: '1px', background: 'rgba(212, 168, 83, 0.15)' }}
      />

      {/* Teams */}
      <h3
        className="font-display font-semibold text-parchment"
        style={{
          fontSize: '16px',
          letterSpacing: '0.01em',
          marginTop: '24px',
          marginBottom: '12px',
        }}
      >
        Teams &amp; Starting Positions
      </h3>

      <p
        className="text-bone mb-4"
        style={{ fontSize: '14px', lineHeight: '1.7' }}
      >
        Each team has a color and three pieces. Four neutral{' '}
        <strong className="text-parchment font-semibold">Rocks</strong> start at the diamond
        tips: E9, E1, A5, and I5.
      </p>

      {/* Team card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {TEAMS.map((team) => (
          <TeamCard key={team.seat} team={team} />
        ))}
      </div>

      {/* Divider */}
      <div
        className="my-6"
        style={{ height: '1px', background: 'rgba(212, 168, 83, 0.15)' }}
      />

      {/* Player Count Variants */}
      <h3
        className="font-display font-semibold text-parchment"
        style={{
          fontSize: '16px',
          letterSpacing: '0.01em',
          marginBottom: '12px',
        }}
      >
        Player Count Variants
      </h3>

      <CalloutBox type="info">
        <strong className="text-parchment">2 Players:</strong> Players must sit at{' '}
        <strong className="text-parchment">opposite</strong> seats (Top/Bottom or Left/Right).
      </CalloutBox>

      <CalloutBox type="info">
        <strong className="text-parchment">3 Players:</strong> Any three seats.
        The fourth seat&apos;s corner still has its Rock.
      </CalloutBox>

      <CalloutBox type="info">
        <strong className="text-parchment">4 Players:</strong> All four seats occupied.
      </CalloutBox>
    </div>
  )
}
