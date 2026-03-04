// ============================================================================
// SPLUT! Turn Banner
// Displays current player's turn info and move pips.
// ============================================================================

'use client'

import { useGameStore } from '@/store/gameStore'
import {
  useCurrentPlayer,
  useCurrentSeat,
  useIsAITurn,
  useMovesInfo,
  useGamePhase,
  usePendingThrow,
  getTeamCSSColor,
} from '@/store/selectors'
import { SEAT_COLOR } from '@/engine/setup'
import { GamePhase } from '@/engine/types'
import MoveCounter from './MoveCounter'

export default function TurnBanner() {
  const currentPlayer = useCurrentPlayer()
  const currentSeat = useCurrentSeat()
  const isAITurn = useIsAITurn()
  const { used, allowed } = useMovesInfo()
  const pendingThrow = usePendingThrow()
  const phase = useGamePhase()

  if (!currentPlayer || !currentSeat || phase !== GamePhase.Playing) return null

  const colorName = SEAT_COLOR[currentSeat]
  const teamColor = getTeamCSSColor(currentSeat)

  return (
    <div
      data-testid="turn-banner"
      role="status"
      aria-live="polite"
      className="w-full h-14 flex items-center justify-between px-6 bg-slate-stone transition-all duration-350"
      style={{ borderBottom: `2px solid ${teamColor}` }}
    >
      {/* Left: team dot + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: teamColor }}
        />
        <span
          className="font-display text-2xl font-semibold tracking-[0.02em] leading-[1.3]"
          style={{ color: teamColor }}
        >
          {colorName}&apos;s Turn
        </span>
        {isAITurn && (
          <span className="flex items-center gap-1.5 ml-1">
            <span className="flex gap-1.5">
              <span className="w-1 h-1 rounded-full animate-ai-thinking" style={{ backgroundColor: teamColor, animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full animate-ai-thinking" style={{ backgroundColor: teamColor, animationDelay: '500ms' }} />
              <span className="w-1 h-1 rounded-full animate-ai-thinking" style={{ backgroundColor: teamColor, animationDelay: '1000ms' }} />
            </span>
            <span className="text-sm text-magic-purple">thinking</span>
          </span>
        )}
      </div>

      {/* Right: move pips */}
      <div className="flex items-center gap-3">
        <MoveCounter used={used} allowed={allowed} teamColor={teamColor} />
        <span className="text-xs text-ash tracking-[0.04em] font-semibold">
          {pendingThrow ? 'Throw!' : `Move ${Math.min(used + 1, allowed)} of ${allowed}`}
        </span>
      </div>
    </div>
  )
}
