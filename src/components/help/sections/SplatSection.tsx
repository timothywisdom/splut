// ============================================================================
// SPLUT! Help - SPLUT! Section
// The signature mechanic explanation with dramatic visual treatment.
// ============================================================================

'use client'

import SplatDiagram from '../SplatDiagram'

export default function SplatSection() {
  return (
    <div>
      {/* Dramatic title */}
      <h2
        className="font-display font-bold text-center"
        style={{
          fontSize: '28px',
          letterSpacing: '0.06em',
          color: 'var(--splut-red)',
          textShadow: '0 0 16px rgba(255, 45, 85, 0.5), 0 0 32px rgba(255, 45, 85, 0.2)',
          marginBottom: '16px',
        }}
      >
        SPLUT!
      </h2>

      <p
        className="text-bone"
        style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}
      >
        The signature move! When a thrown Rock flies over a Dwarf and the{' '}
        <strong className="text-parchment font-semibold">very next square</strong> is blocked
        (board edge, Troll, or Rock), the Rock{' '}
        <strong className="text-parchment font-semibold">
          lands on the Dwarf and crushes it
        </strong>
        .
      </p>

      <p
        className="text-bone"
        style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}
      >
        SPLUT! only kills the Dwarf &mdash; it does{' '}
        <strong className="text-parchment font-semibold">not</strong> eliminate the team (the
        Sorcerer survives).
      </p>

      {/* Diagram */}
      <SplatDiagram />

      {/* Divider */}
      <div
        className="my-6"
        style={{ height: '1px', background: 'rgba(212, 168, 83, 0.15)' }}
      />

      {/* Does NOT trigger */}
      <h3
        className="font-display font-semibold text-parchment"
        style={{
          fontSize: '16px',
          letterSpacing: '0.01em',
          marginBottom: '12px',
        }}
      >
        What does NOT trigger SPLUT!
      </h3>

      <ul className="space-y-3">
        {[
          'Empty square after the Dwarf \u2014 the Rock keeps flying',
          'A Sorcerer after the Dwarf \u2014 the Rock flies over the Dwarf and kills the Sorcerer instead',
        ].map((text, i) => (
          <li key={i} className="flex items-start gap-2">
            {/* Red X icon */}
            <svg
              width={12}
              height={12}
              viewBox="0 0 12 12"
              className="flex-shrink-0 mt-1"
            >
              <line
                x1="2"
                y1="2"
                x2="10"
                y2="10"
                stroke="var(--splut-red)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="10"
                y1="2"
                x2="2"
                y2="10"
                stroke="var(--splut-red)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-ash" style={{ fontSize: '14px', lineHeight: '1.6' }}>
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
