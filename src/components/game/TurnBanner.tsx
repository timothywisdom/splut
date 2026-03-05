// ============================================================================
// SPLUT! Turn Banner
// Unified header: Lobby nav, turn info (team + move counter), Rules nav.
// ============================================================================

'use client'

import {
  useCurrentPlayer,
  useCurrentSeat,
  useIsAITurn,
  useMovesInfo,
  useGamePhase,
  usePendingThrow,
  useCanUndo,
  getTeamCSSColor,
} from '@/store/selectors'
import { SEAT_COLOR } from '@/engine/setup'
import { GamePhase } from '@/engine/types'
import MoveCounter from './MoveCounter'

interface TurnBannerProps {
  onLobby: () => void
  onUndo: () => void
  onShowHelp: () => void
}

export default function TurnBanner({ onLobby, onUndo, onShowHelp }: TurnBannerProps) {
  const currentPlayer = useCurrentPlayer()
  const currentSeat = useCurrentSeat()
  const isAITurn = useIsAITurn()
  const { used, allowed } = useMovesInfo()
  const pendingThrow = usePendingThrow()
  const phase = useGamePhase()
  const canUndo = useCanUndo()

  const isPlaying = phase === GamePhase.Playing
  const isGameOver = phase === GamePhase.Over

  if (!isPlaying && !isGameOver) return null

  const colorName = currentSeat ? SEAT_COLOR[currentSeat] : null
  const teamColor = currentSeat ? getTeamCSSColor(currentSeat) : null

  return (
    <header
      data-testid="turn-banner"
      role="banner"
      className="w-full h-14 flex items-center px-4 bg-slate-stone transition-all duration-350"
      style={{ borderBottom: `2px solid ${isGameOver || !teamColor ? 'rgba(42,42,62,0.3)' : teamColor}` }}
    >
      {/* LEFT ZONE: Lobby + Undo */}
      <div className="flex items-center gap-1.5 min-w-[120px] flex-shrink-0">
        <button
          onClick={onLobby}
          className="flex items-center gap-1 py-1.5 px-2 rounded-md text-[13px] text-ash hover:text-bone hover:bg-carved-stone/50 transition-colors duration-150 cursor-pointer focus-ring"
          aria-label="Return to lobby"
        >
          <span aria-hidden="true">&larr;</span>
          <span className="hidden sm:inline">Lobby</span>
        </button>
        {canUndo && (
          <>
            <div className="w-px h-5 bg-carved-stone/50" aria-hidden="true" />
            <button
              data-testid="undo-button"
              onClick={onUndo}
              className="flex items-center justify-center w-8 h-8 rounded-md text-ash hover:text-bone hover:bg-carved-stone/50 transition-colors duration-150 cursor-pointer focus-ring"
              aria-label="Undo last move (Ctrl+Z)"
              title="Undo (Ctrl+Z)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 8l3-3M4 8l3 3" />
                <path d="M4 8h8a4 4 0 1 1 0 8H9" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* CENTER ZONE: Turn Info */}
      {isPlaying && currentPlayer && teamColor && (
        <div
          className="flex-1 min-w-0 flex items-center justify-between px-4"
          role="status"
          aria-live="polite"
        >
          {/* Left cluster: team dot + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: teamColor }}
            />
            <span
              className="font-display text-lg sm:text-2xl font-semibold tracking-[0.02em] leading-[1.3] truncate"
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
                <span className="text-sm text-magic-purple hidden sm:inline">thinking</span>
              </span>
            )}
          </div>

          {/* Right cluster: move pips + counter */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <MoveCounter used={used} allowed={allowed} teamColor={teamColor} />
            <span className="text-xs text-ash tracking-[0.04em] font-semibold whitespace-nowrap">
              <span className="hidden sm:inline">
                {pendingThrow ? 'Throw!' : `Move ${Math.min(used + 1, allowed)} of ${allowed}`}
              </span>
              <span className="sm:hidden">
                {pendingThrow ? 'Throw!' : `M${Math.min(used + 1, allowed)}/${allowed}`}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* RIGHT ZONE: Rules */}
      <div className="flex items-center justify-end min-w-[80px] flex-shrink-0">
        {isPlaying && (
          <button
            onClick={onShowHelp}
            className="flex items-center gap-1.5 py-1.5 px-2 rounded-md text-[13px] text-ash hover:text-bone hover:bg-carved-stone/50 transition-colors duration-150 cursor-pointer focus-ring"
            aria-label="Open rules"
          >
            <span
              className="inline-flex items-center justify-center rounded-full"
              style={{
                width: '16px',
                height: '16px',
                border: '1.5px solid currentColor',
                fontSize: '10px',
                fontWeight: 600,
                lineHeight: 1,
              }}
              aria-hidden="true"
            >
              ?
            </span>
            <span className="hidden sm:inline">Rules</span>
          </button>
        )}
      </div>
    </header>
  )
}
