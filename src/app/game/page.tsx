// ============================================================================
// SPLUT! Game Page
// Main gameplay screen with board, status panels, and action log.
// ============================================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import GameBoard from '@/components/game/GameBoard'
import TurnBanner from '@/components/game/TurnBanner'
import PlayerStatusPanel from '@/components/game/PlayerStatus'
import ActionLog from '@/components/game/ActionLog'
import GameOverOverlay from '@/components/game/GameOverOverlay'
import { useGameStore } from '@/store/gameStore'
import HelpModal from '@/components/help/HelpModal'
import { GamePhase } from '@/engine/types'

export default function GamePage() {
  const game = useGameStore((s) => s.game)
  const resetGame = useGameStore((s) => s.resetGame)
  const undoLastMove = useGameStore((s) => s.undoLastMove)
  const [showMobileLog, setShowMobileLog] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const isGameOver = game?.phase === GamePhase.Over

  // Ctrl+Z / Cmd+Z keyboard shortcut for undo
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault()
      undoLastMove()
    }
  }, [undoLastMove])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!game) return null

  return (
    <div className="h-screen bg-obsidian flex flex-col relative overflow-hidden">
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 45%, var(--slate-stone) 0%, var(--obsidian) 60%)',
        }}
      />

      {/* Turn Banner (includes Lobby + Rules nav) */}
      <div className="relative z-10">
        <TurnBanner onLobby={resetGame} onUndo={undoLastMove} onShowHelp={() => setShowHelp(true)} />
      </div>

      {/* Main game area: three-column layout */}
      <div className="relative z-10 flex-1 flex min-h-0">
        {/* Left Panel: Player Status (desktop) */}
        <div className="hidden lg:flex flex-col items-center justify-center px-4 py-4 w-60 flex-shrink-0">
          <PlayerStatusPanel layout="vertical" />
        </div>

        {/* Center: Game Board */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <GameBoard />
        </div>

        {/* Right Panel: Action Log (desktop XL) */}
        <div className="hidden xl:flex flex-col w-70 flex-shrink-0 border-l border-carved-stone/50">
          <ActionLog />
        </div>
      </div>

      {/* Tablet: horizontal player status strip above board (md-lg) */}
      <div className="hidden md:flex lg:hidden relative z-10 gap-2 px-4 py-2 overflow-x-auto border-t border-carved-stone/50">
        <PlayerStatusPanel layout="horizontal" />
      </div>

      {/* Tablet: Action log drawer toggle (md-xl) */}
      <div className="xl:hidden fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setShowMobileLog(!showMobileLog)}
          className="w-10 h-10 rounded-full bg-slate-stone border border-rune-gold/30 text-rune-gold flex items-center justify-center shadow-lg cursor-pointer hover:bg-worn-stone transition-colors focus-ring"
          aria-label={showMobileLog ? 'Close battle log' : 'Open battle log'}
        >
          {showMobileLog ? '✕' : '📜'}
        </button>
      </div>

      {/* Mobile/Tablet: Action log drawer */}
      {showMobileLog && (
        <div className="xl:hidden fixed inset-x-0 bottom-0 z-20 h-[50vh] bg-slate-stone border-t border-rune-gold/30 shadow-[0_-4px_16px_rgba(0,0,0,0.5)]">
          <ActionLog />
        </div>
      )}

      {/* Mobile: Player status strip (horizontal, below board) */}
      <div className="md:hidden relative z-10 flex gap-2 px-4 py-2 overflow-x-auto border-t border-carved-stone/50">
        <PlayerStatusPanel layout="horizontal" />
      </div>

      {/* Help Modal */}
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      {/* Game Over Overlay */}
      <GameOverOverlay />
    </div>
  )
}
