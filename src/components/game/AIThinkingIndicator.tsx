// ============================================================================
// SPLUT! AI Thinking Indicator
// Pulsing indicator shown during AI turns.
// ============================================================================

'use client'

import { useIsAITurn, useCurrentSeat, getTeamCSSColor } from '@/store/selectors'
import { SEAT_COLOR } from '@/engine/setup'

export default function AIThinkingIndicator() {
  const isAITurn = useIsAITurn()
  const currentSeat = useCurrentSeat()

  if (!isAITurn || !currentSeat) return null

  const colorName = SEAT_COLOR[currentSeat]
  const teamColor = getTeamCSSColor(currentSeat)

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-stone/80 border border-magic-purple/30">
      {/* Pulsing dots */}
      <div className="flex gap-1">
        <div
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ backgroundColor: teamColor, animationDelay: '0ms', animationDuration: '1s' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ backgroundColor: teamColor, animationDelay: '200ms', animationDuration: '1s' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ backgroundColor: teamColor, animationDelay: '400ms', animationDuration: '1s' }}
        />
      </div>
      <span className="text-xs text-magic-purple font-semibold tracking-wide">
        {colorName} AI
      </span>
    </div>
  )
}
