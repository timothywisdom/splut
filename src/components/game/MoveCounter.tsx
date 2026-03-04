// ============================================================================
// SPLUT! Move Counter
// Visual move pip indicators (filled for used, hollow for remaining).
// ============================================================================

'use client'

interface MoveCounterProps {
  used: number
  allowed: number
  teamColor: string
}

export default function MoveCounter({ used, allowed, teamColor }: MoveCounterProps) {
  const pips = []
  for (let i = 0; i < allowed; i++) {
    const isFilled = i < used
    pips.push(
      <div
        key={i}
        className="w-2 h-2 rounded-full transition-all duration-200"
        style={{
          backgroundColor: isFilled ? teamColor : 'transparent',
          border: `1.5px solid ${isFilled ? teamColor : `${teamColor}4D`}`,
        }}
      />
    )
  }

  return <div className="flex items-center gap-1.5" data-testid="move-counter">{pips}</div>
}
