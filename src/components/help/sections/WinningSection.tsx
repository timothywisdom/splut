// ============================================================================
// SPLUT! Help - Winning Section
// Elimination and victory conditions.
// ============================================================================

'use client'

import CalloutBox from '../CalloutBox'
import InlinePiece from '../InlinePiece'

export default function WinningSection() {
  return (
    <div>
      <h2
        className="font-display font-semibold text-rune-gold"
        style={{ fontSize: '20px', letterSpacing: '0.02em', marginBottom: '16px' }}
      >
        Winning
      </h2>

      <p
        className="text-bone"
        style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}
      >
        When a <InlinePiece piece="Sorcerer" /> is killed by a thrown{' '}
        <InlinePiece piece="Rock" />, that{' '}
        <strong className="text-parchment font-semibold">
          entire team is eliminated
        </strong>{' '}
        &mdash; all their pieces are removed from the board.
      </p>

      {/* Highlighted victory condition */}
      <div className="my-5">
        {/* Ornament above */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px w-12" style={{ background: 'rgba(212, 168, 83, 0.4)' }} />
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{ background: 'rgba(212, 168, 83, 0.4)' }}
          />
          <div className="h-px w-12" style={{ background: 'rgba(212, 168, 83, 0.4)' }} />
        </div>

        <p
          className="text-center font-display font-semibold"
          style={{
            fontSize: '16px',
            color: 'var(--rune-gold-bright)',
          }}
        >
          The last player with a surviving Sorcerer wins!
        </p>

        {/* Ornament below */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-px w-12" style={{ background: 'rgba(212, 168, 83, 0.4)' }} />
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{ background: 'rgba(212, 168, 83, 0.4)' }}
          />
          <div className="h-px w-12" style={{ background: 'rgba(212, 168, 83, 0.4)' }} />
        </div>
      </div>

      <CalloutBox type="warning">
        <strong style={{ color: 'var(--throw-orange)' }}>Warning:</strong> Watch out for friendly
        fire &mdash; you can accidentally kill your own Sorcerer with a poorly aimed throw.
      </CalloutBox>
    </div>
  )
}
