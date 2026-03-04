// ============================================================================
// SPLUT! Player Count Selector
// Three stone-style buttons for selecting 2, 3, or 4 players.
// ============================================================================

'use client'

interface PlayerCountSelectorProps {
  value: 2 | 3 | 4 | null
  onChange: (count: 2 | 3 | 4) => void
}

export default function PlayerCountSelector({ value, onChange }: PlayerCountSelectorProps) {
  const counts: (2 | 3 | 4)[] = [2, 3, 4]

  return (
    <div>
      <label className="block text-sm font-semibold text-bone tracking-wide mb-3">
        How many players?
      </label>
      <div className="flex gap-3">
        {counts.map((count) => {
          const isSelected = value === count
          return (
            <button
              key={count}
              data-testid={`player-count-${count}`}
              onClick={() => onChange(count)}
              className={`
                w-20 h-12 rounded-lg text-lg font-semibold transition-all duration-150 cursor-pointer
                ${
                  isSelected
                    ? 'bg-rune-gold/20 border-2 border-rune-gold-bright text-parchment shadow-[0_0_12px_rgba(212,168,83,0.2)]'
                    : 'bg-carved-stone border border-ash/30 text-bone hover:bg-worn-stone hover:border-rune-gold/50'
                }
              `}
            >
              {count}
            </button>
          )
        })}
      </div>
    </div>
  )
}
