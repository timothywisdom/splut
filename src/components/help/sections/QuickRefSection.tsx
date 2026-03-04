// ============================================================================
// SPLUT! Help - Quick Reference Section
// Numbered summary of the 8 key rules.
// ============================================================================

'use client'

const RULES = [
  <>All moves are <strong className="text-parchment font-semibold">mandatory</strong> &mdash; use them all</>,
  <>Throwing a Rock <strong className="text-parchment font-semibold">ends your turn</strong> immediately</>,
  <>Kill a Sorcerer = <strong className="text-parchment font-semibold">eliminate the whole team</strong></>,
  <>Dwarves <strong className="text-parchment font-semibold">push chains</strong> of pieces</>,
  <>Sorcerers <strong className="text-parchment font-semibold">levitate</strong> one Rock at a time (same direction they move)</>,
  <>Trolls <strong className="text-parchment font-semibold">throw</strong> Rocks and can pull them back</>,
  <><strong className="text-parchment font-semibold">SPLUT!</strong> = thrown Rock + Dwarf + obstacle right behind = Dwarf crushed</>,
  <>Rocks never leave the board &mdash; <strong className="text-parchment font-semibold">always 4</strong> in play</>,
]

export default function QuickRefSection() {
  return (
    <div>
      <h2
        className="font-display font-semibold text-rune-gold"
        style={{ fontSize: '20px', letterSpacing: '0.02em', marginBottom: '16px' }}
      >
        Quick Reference
      </h2>

      <div className="space-y-3">
        {RULES.map((rule, i) => (
          <div key={i} className="flex items-start" style={{ gap: '12px' }}>
            {/* Number marker */}
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0 font-display font-semibold"
              style={{
                width: '24px',
                height: '24px',
                background: 'var(--carved-stone)',
                border: '1px solid rgba(212, 168, 83, 0.4)',
                fontSize: '13px',
                color: 'var(--rune-gold)',
              }}
            >
              {i + 1}
            </div>
            {/* Rule text */}
            <p
              className="text-bone"
              style={{ fontSize: '14px', lineHeight: '1.6' }}
            >
              {rule}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
