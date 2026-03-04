// ============================================================================
// SPLUT! Action Log
// Scrolling log of game moves in the right panel.
// ============================================================================

'use client'

import { useRef, useEffect } from 'react'
import { useGameStore, UILogEntry } from '@/store/gameStore'

export default function ActionLog() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const entries = useGameStore((s) => s.actionLog)

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  return (
    <div
      className="flex flex-col h-full w-70"
      data-testid="action-log"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="font-display text-lg font-semibold tracking-wide text-rune-gold">
          Battle Log
        </h3>
        <div className="mt-1.5 h-px bg-rune-gold/20" />
      </div>

      {/* Scrollable log with fade gradient and custom scrollbar */}
      <div className="relative flex-1 min-h-0">
        {/* Top fade gradient */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-stone to-transparent pointer-events-none z-10" />

        <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-2 space-y-0.5 action-log-scroll">
          {entries.length === 0 && (
            <p className="text-xs text-ash italic">Game events will appear here...</p>
          )}
          {entries.map((entry, index) => (
            <LogEntryRow key={entry.id} entry={entry} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LogEntryRow({ entry, index }: { entry: UILogEntry; index: number }) {
  const isSplut = entry.kind === 'splut'
  const isEliminate = entry.kind === 'eliminate'
  const isWin = entry.kind === 'win'
  const isThrow = entry.kind === 'throw'

  return (
    <div
      className={`flex items-baseline gap-2 py-1 animate-slide-in-right ${index % 2 === 0 ? '' : 'bg-carved-stone/30 -mx-2 px-2 rounded'}`}
    >
      <span className="font-mono text-ash flex-shrink-0" style={{ fontSize: '13px' }}>
        {entry.timestamp}
      </span>

      {isSplut ? (
        <span className="font-display font-bold text-splut-red tracking-wide">
          SPLUT!
        </span>
      ) : isEliminate ? (
        <span className="text-xs font-semibold" style={{ color: entry.teamColor }}>
          {entry.description}
        </span>
      ) : isWin ? (
        <span className="font-display font-bold text-rune-gold-bright tracking-wide text-xs">
          {entry.description}
        </span>
      ) : (
        <>
          <span className="text-xs font-semibold" style={{ color: entry.teamColor }}>
            {entry.colorName}
          </span>
          <span className="text-xs text-bone">{entry.pieceType}</span>
          <span className="font-mono text-xs text-bone">
            {isThrow ? entry.description : entry.description}
          </span>
        </>
      )}
    </div>
  )
}
