// ============================================================================
// SPLUT! Help - Overview Section
// Game introduction + Turn Structure with visual pips.
// ============================================================================

'use client'

import InlinePiece from '../InlinePiece'
import CalloutBox from '../CalloutBox'

function MovePips({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex items-center" style={{ gap: '6px' }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: '8px',
            height: '8px',
            background: i < filled ? 'var(--rune-gold)' : 'var(--carved-stone)',
            border: i < filled ? 'none' : '1px solid var(--worn-stone)',
          }}
        />
      ))}
    </div>
  )
}

export default function OverviewSection() {
  return (
    <div>
      {/* Section Heading */}
      <h2
        className="font-display font-semibold text-rune-gold"
        style={{ fontSize: '20px', letterSpacing: '0.02em', marginBottom: '16px' }}
      >
        Overview
      </h2>

      {/* Introduction paragraph */}
      <p
        className="text-bone"
        style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}
      >
        SPLUT! is a strategic board game for 2-4 players. Each player commands a team of three
        pieces &mdash; a <InlinePiece piece="Sorcerer" />, a <InlinePiece piece="Troll" />,
        and a <InlinePiece piece="Dwarf" /> &mdash; on a diamond-shaped board scattered
        with <InlinePiece piece="Rock" />s. Eliminate rival Sorcerers by hurling Rocks at them.
        The last Sorcerer standing wins.
      </p>

      {/* Divider */}
      <div
        className="my-6"
        style={{ height: '1px', background: 'rgba(212, 168, 83, 0.15)' }}
      />

      {/* Turn Structure */}
      <h3
        className="font-display font-semibold text-parchment"
        style={{
          fontSize: '16px',
          letterSpacing: '0.01em',
          marginBottom: '12px',
        }}
      >
        Turn Structure
      </h3>

      <p
        className="text-bone mb-4"
        style={{ fontSize: '14px', lineHeight: '1.7' }}
      >
        Players take turns clockwise. Each turn, you get a number of moves:
      </p>

      {/* Turn structure table with pips */}
      <div
        className="w-full rounded-lg overflow-hidden mb-4"
        style={{ border: '1px solid var(--carved-stone)' }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: 'var(--carved-stone)' }}>
              <th
                className="text-left text-parchment"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '10px 16px',
                }}
              >
                Turn
              </th>
              <th
                className="text-left text-parchment"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '10px 16px',
                }}
              >
                Moves Available
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: '1st turn', filled: 1 },
              { label: '2nd turn', filled: 2 },
              { label: '3rd onward', filled: 3 },
            ].map(({ label, filled }, i) => (
              <tr
                key={label}
                style={{
                  background: i % 2 === 0 ? 'var(--slate-stone)' : 'rgba(42, 42, 62, 0.3)',
                  borderTop: i > 0 ? '1px solid rgba(42, 42, 62, 0.4)' : undefined,
                  height: '40px',
                }}
              >
                <td className="text-bone" style={{ fontSize: '13px', padding: '10px 16px' }}>
                  {label}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div className="flex items-center gap-3">
                    <MovePips filled={filled} total={3} />
                    <span className="text-ash" style={{ fontSize: '13px' }}>
                      {filled} {filled === 1 ? 'move' : 'moves'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CalloutBox type="info">
        <strong className="text-parchment">All moves are mandatory</strong> &mdash; you cannot
        pass or skip. Distribute your moves freely among your three pieces in any order.
      </CalloutBox>
    </div>
  )
}
