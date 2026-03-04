// ============================================================================
// SPLUT! Help - Pieces Section
// All four piece type descriptions with abilities.
// ============================================================================

'use client'

import { SorcererIcon, TrollIcon, DwarfIcon, RockIcon } from '@/components/game/PieceIcons'
import InlinePiece from '../InlinePiece'
import CalloutBox from '../CalloutBox'
import RulesTable from '../RulesTable'

function SectionDivider() {
  return (
    <div
      className="my-6"
      style={{ height: '1px', background: 'rgba(212, 168, 83, 0.15)' }}
    />
  )
}

function PieceHeading({
  icon,
  name,
  subtitle,
}: {
  icon: React.ReactNode
  name: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3" style={{ marginTop: '24px' }}>
      {icon}
      <div>
        <h3
          className="font-display font-semibold text-parchment"
          style={{ fontSize: '16px', letterSpacing: '0.01em' }}
        >
          {name}
        </h3>
        <span className="text-ash italic" style={{ fontSize: '12px' }}>
          {subtitle}
        </span>
      </div>
    </div>
  )
}

function SorcererSection() {
  return (
    <div>
      <PieceHeading
        icon={<SorcererIcon color="#A855F7" size={28} />}
        name="Sorcerer"
        subtitle="The Leader"
      />
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        The Sorcerer is the most important piece.{' '}
        <strong className="text-parchment font-semibold">
          If your Sorcerer dies, your entire team is eliminated.
        </strong>
      </p>
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        <strong className="text-parchment font-semibold">Movement:</strong> 1 square orthogonally.
        Cannot move into any occupied square.
      </p>
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        <strong className="text-parchment font-semibold">Levitation:</strong> When moving the
        Sorcerer, you may simultaneously levitate one <InlinePiece piece="Rock" /> anywhere on the
        board. The Rock moves 1 square in the <strong className="text-parchment">same direction</strong>{' '}
        as the Sorcerer.
      </p>

      <CalloutBox type="magic">
        <strong className="text-parchment">Levitation rules:</strong>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>The Rock&apos;s destination must be <strong className="text-parchment">empty</strong> (any piece blocks it)</li>
          <li>Once you start levitating a specific Rock, you must keep using that same Rock for the rest of the turn</li>
          <li>If you stop levitating (move another piece, or move the Sorcerer without levitating), you <strong className="text-parchment">cannot resume</strong> levitation that turn</li>
        </ol>
      </CalloutBox>

      <CalloutBox type="warning">
        <strong style={{ color: 'var(--throw-orange)' }}>Cooldown:</strong>{' '}
        You cannot levitate a Rock that was moved by the previous player (thrown, levitated, pushed, or pulled).
      </CalloutBox>
    </div>
  )
}

function TrollSection() {
  return (
    <div>
      <PieceHeading
        icon={<TrollIcon color="#D4A853" size={28} />}
        name="Troll"
        subtitle="The Heavy Hitter"
      />
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        The Troll is your offensive weapon. It throws <InlinePiece piece="Rock" />s to eliminate
        enemy <InlinePiece piece="Sorcerer" />s.
      </p>
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        <strong className="text-parchment font-semibold">Movement:</strong> 1 square orthogonally.
        Cannot move onto a square occupied by another piece (Sorcerer, Dwarf, or Troll) &mdash;{' '}
        <strong className="text-parchment">except</strong> Rocks.
      </p>
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        <strong className="text-parchment font-semibold">Throwing Rocks:</strong> When the Troll
        moves onto a Rock&apos;s square, it <strong className="text-parchment">must</strong> throw the
        Rock. Pick a direction (N/S/E/W) and the Rock flies in a straight line:
      </p>

      <RulesTable
        headers={['What the Rock hits', 'Result']}
        rows={[
          ['Empty square', 'Flies over, keeps going'],
          ['Board edge', 'Stops on last valid square'],
          ['Troll or Rock', 'Stops on square before the obstacle'],
          [
            <span key="sorc" style={{ color: 'var(--splut-red)', fontWeight: 600 }}>
              Sorcerer
            </span>,
            <span key="sorc-r">
              Lands on Sorcerer&apos;s square &mdash;{' '}
              <strong style={{ color: 'var(--splut-red)' }}>KILLS the Sorcerer!</strong>
            </span>,
          ],
          ['Dwarf', 'Flies over (Dwarves are small!)'],
        ]}
      />

      <CalloutBox type="warning">
        <strong className="text-parchment">Throwing immediately ends your turn</strong>, no matter
        how many moves you had left.
      </CalloutBox>

      <CalloutBox type="info">
        <strong className="text-parchment">Pull-back:</strong> After the Troll makes a normal move
        (not onto a Rock), if there is a Rock directly behind where the Troll came from, you may
        optionally drag it into the Troll&apos;s vacated square. This lets you reposition Rocks without
        throwing them.
      </CalloutBox>
    </div>
  )
}

function DwarfSection() {
  return (
    <div>
      <PieceHeading
        icon={<DwarfIcon color="#C8C8D4" size={28} />}
        name="Dwarf"
        subtitle="The Pusher"
      />
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        The Dwarf is small but mighty. Thrown Rocks fly right over it &mdash; but it can shove anything.
      </p>
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        <strong className="text-parchment font-semibold">Movement:</strong> 1 square orthogonally.
        Can move into occupied squares.
      </p>
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        <strong className="text-parchment font-semibold">Push chains:</strong> When the Dwarf moves
        into an occupied square, it <strong className="text-parchment">pushes</strong> all
        consecutive pieces in that direction. Every piece in the chain shifts 1 square forward. The
        push fails entirely if the last piece would be pushed off the board.
      </p>
      <p className="text-ash italic" style={{ fontSize: '13px', lineHeight: '1.6' }}>
        Dwarves are immune to thrown Rocks... mostly. See the SPLUT! section for the exception.
      </p>
    </div>
  )
}

function RockSection() {
  return (
    <div>
      <PieceHeading
        icon={<RockIcon size={28} />}
        name="Rock"
        subtitle="The Weapon"
      />
      <p className="text-bone" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
        Rocks are neutral &mdash; no player owns them. They can only be moved by:
      </p>
      <ul className="space-y-2 mb-4">
        {[
          { piece: 'Troll' as const, method: 'Throw (Troll lands on it)' },
          { piece: 'Sorcerer' as const, method: 'Levitation (Sorcerer lifts it)' },
          { piece: 'Dwarf' as const, method: 'Push (Dwarf shoves it)' },
          { piece: 'Troll' as const, method: 'Pull-back (Troll drags it)' },
        ].map(({ piece, method }) => (
          <li key={method} className="flex items-center gap-2">
            <InlinePiece piece={piece} iconOnly />
            <span className="text-bone" style={{ fontSize: '14px' }}>
              {method}
            </span>
          </li>
        ))}
      </ul>

      <CalloutBox type="info">
        There are always <strong className="text-parchment">4 Rocks</strong> on the board. Rocks
        are never removed from play.
      </CalloutBox>
    </div>
  )
}

export default function PiecesSection() {
  return (
    <div>
      <h2
        className="font-display font-semibold text-rune-gold"
        style={{ fontSize: '20px', letterSpacing: '0.02em', marginBottom: '16px' }}
      >
        The Pieces
      </h2>

      <SorcererSection />
      <SectionDivider />
      <TrollSection />
      <SectionDivider />
      <DwarfSection />
      <SectionDivider />
      <RockSection />
    </div>
  )
}
