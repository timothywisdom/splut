// ============================================================================
// SPLUT! Game Over Overlay
// Winner announcement with ceremony.
// ============================================================================

'use client'

import { useMemo } from 'react'
import { useGamePhase, useWinner, getTeamCSSColor } from '@/store/selectors'
import { useGameStore } from '@/store/gameStore'
import { SEAT_COLOR } from '@/engine/setup'
import { GamePhase, PlayerSeat } from '@/engine/types'
import Button from '@/components/ui/Button'
import { SorcererIcon } from './PieceIcons'

export default function GameOverOverlay() {
  const phase = useGamePhase()
  const winner = useWinner()
  const resetGame = useGameStore((s) => s.resetGame)

  if (phase !== GamePhase.Over || !winner) return null

  const colorName = SEAT_COLOR[winner]
  const teamColor = getTeamCSSColor(winner)
  const hexColor = getTeamHexColor(winner)

  return (
    <div
      data-testid="game-over-overlay"
      role="alertdialog"
      aria-labelledby="victory-heading"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop with fade */}
      <div className="absolute inset-0 bg-obsidian/85 animate-in fade-in duration-400" />

      {/* Celebration particles */}
      <CelebrationParticles teamColor={teamColor} />

      {/* Victory card with entrance animation */}
      <div className="relative z-10 max-w-[400px] w-full mx-4 p-8 bg-slate-stone border border-rune-gold/25 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)] text-center animate-game-over-entrance">
        {/* Victory title */}
        <h1
          id="victory-heading"
          className="font-display text-3xl font-bold tracking-wide text-rune-gold-bright mb-6"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          VICTORY
        </h1>

        {/* Winner icon with float animation */}
        <div
          className="flex justify-center mb-4"
          style={{ animationDelay: '400ms', animationFillMode: 'both' }}
        >
          <div className="animate-float-bob" style={{ filter: `drop-shadow(0 0 12px ${teamColor})` }}>
            <SorcererIcon color={hexColor} size={64} />
          </div>
        </div>

        {/* Winner name */}
        <h2
          className="font-display text-2xl font-semibold tracking-wide mb-2"
          style={{ color: teamColor, animationDelay: '600ms', animationFillMode: 'both' }}
        >
          {colorName} Team Wins!
        </h2>

        {/* Flavor text */}
        <p className="text-bone italic text-sm mb-8">
          &ldquo;The last Sorcerer standing.&rdquo;
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            data-testid="play-again"
            onClick={resetGame}
          >
            PLAY AGAIN
          </Button>
          <button
            onClick={resetGame}
            className="text-sm text-ash underline hover:text-bone transition-colors cursor-pointer focus-ring"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  )
}

function CelebrationParticles({ teamColor }: { teamColor: string }) {
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      size: 4 + Math.random() * 4,
      color: i % 3 === 0 ? 'var(--rune-gold)' : teamColor,
      duration: `${3 + Math.random() * 2}s`,
    }))
  }, [teamColor])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-0 animate-celebration-rise"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: 'rotate(45deg)',
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}

function getTeamHexColor(seat: PlayerSeat): string {
  switch (seat) {
    case 'Top': return '#22C55E'
    case 'Bottom': return '#EF4444'
    case 'Left': return '#EAB308'
    case 'Right': return '#3B82F6'
    default: return '#22C55E'
  }
}
