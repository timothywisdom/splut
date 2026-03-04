// ============================================================================
// SPLUT! Pull-Back Confirmation Prompt
// Shown when a Troll moves and there's an eligible rock to pull.
// ============================================================================

'use client'

import { useGameStore, PendingPullBack } from '@/store/gameStore'

export default function PullBackPrompt() {
  const pendingPullBack = useGameStore((s) => s.pendingPullBack)
  const confirmPullBack = useGameStore((s) => s.confirmPullBack)

  if (!pendingPullBack) return null

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center" role="dialog" aria-label="Pull back rock?">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-obsidian/60 rounded-lg" />

      {/* Prompt card */}
      <div className="relative bg-slate-stone border border-rune-gold/40 rounded-lg p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-w-xs text-center">
        <p className="font-display text-sm text-parchment mb-1">Pull Rock?</p>
        <p className="text-xs text-bone mb-4">
          Rock on <span className="font-mono text-rune-gold">{pendingPullBack.rockSquare}</span> can
          be pulled to <span className="font-mono text-rune-gold">{pendingPullBack.targetSquare}</span>
          {' '}(your Troll&apos;s vacated square).
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => confirmPullBack(true)}
            className="px-4 py-2 rounded bg-throw-orange text-obsidian font-semibold text-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform focus-ring"
            autoFocus
          >
            Pull Rock
          </button>
          <button
            onClick={() => confirmPullBack(false)}
            className="px-4 py-2 rounded bg-carved-stone text-bone text-sm cursor-pointer hover:bg-worn-stone transition-colors focus-ring"
          >
            Move Only
          </button>
        </div>
      </div>
    </div>
  )
}
