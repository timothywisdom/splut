// ============================================================================
// SPLUT! Home / Lobby Screen
// Game setup screen: player count, seat assignment, Human/AI toggles.
// Client-only — imported with next/dynamic ssr:false from page.tsx.
// ============================================================================

'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { PlayerSeat, PlayerType, SetupConfig } from '@/engine/types'
import PlayerCountSelector from '@/components/lobby/PlayerCountSelector'
import SeatSelector from '@/components/lobby/SeatSelector'
import Button from '@/components/ui/Button'
import GamePage from '@/app/game/page'
import HelpModal from '@/components/help/HelpModal'

const ALL_SEATS: PlayerSeat[] = [
  PlayerSeat.Top,
  PlayerSeat.Bottom,
  PlayerSeat.Left,
  PlayerSeat.Right,
]

const TWO_PLAYER_PAIRS: [PlayerSeat, PlayerSeat][] = [
  [PlayerSeat.Top, PlayerSeat.Bottom],
  [PlayerSeat.Left, PlayerSeat.Right],
]

export default function Home() {
  const screen = useGameStore((s) => s.screen)
  const initNewGame = useGameStore((s) => s.initNewGame)

  const [playerCount, setPlayerCount] = useState<2 | 3 | 4 | null>(null)
  const [activeSeatSet, setActiveSeatSet] = useState<Set<PlayerSeat>>(
    new Set([PlayerSeat.Top, PlayerSeat.Bottom])
  )
  const [playerTypes, setPlayerTypes] = useState<Record<string, PlayerType>>({
    [PlayerSeat.Top]: PlayerType.Human,
    [PlayerSeat.Bottom]: PlayerType.Human,
    [PlayerSeat.Left]: PlayerType.Human,
    [PlayerSeat.Right]: PlayerType.Human,
  })
  const [firstPlayer, setFirstPlayer] = useState<PlayerSeat>(PlayerSeat.Top)

  const [showHelp, setShowHelp] = useState(false)
  const [titleAssembled, setTitleAssembled] = useState(false)
  useEffect(() => {
    const seen = sessionStorage.getItem('splut-title-seen')
    if (seen) {
      setTitleAssembled(true)
    } else {
      const timer = setTimeout(() => {
        setTitleAssembled(true)
        sessionStorage.setItem('splut-title-seen', '1')
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handlePlayerCountChange = useCallback((count: 2 | 3 | 4) => {
    setPlayerCount(count)
    if (count === 2) {
      setActiveSeatSet(new Set([PlayerSeat.Top, PlayerSeat.Bottom]))
      setFirstPlayer(PlayerSeat.Top)
    } else if (count === 4) {
      setActiveSeatSet(new Set(ALL_SEATS))
      setFirstPlayer(PlayerSeat.Top)
    } else {
      setActiveSeatSet(new Set([PlayerSeat.Top, PlayerSeat.Bottom, PlayerSeat.Left]))
      setFirstPlayer(PlayerSeat.Top)
    }
  }, [])

  const handleToggleSeat = useCallback(
    (seat: PlayerSeat) => {
      if (playerCount !== 3) return
      setActiveSeatSet((prev) => {
        const next = new Set(prev)
        if (next.has(seat)) {
          if (next.size <= 3) return prev
          next.delete(seat)
        } else {
          if (next.size >= 3) return prev
          next.add(seat)
        }
        return next
      })
    },
    [playerCount]
  )

  const handleChangeType = useCallback((seat: PlayerSeat, type: PlayerType) => {
    setPlayerTypes((prev) => ({ ...prev, [seat]: type }))
  }, [])

  const seatConfigs = useMemo(() => {
    return ALL_SEATS.map((seat) => ({
      seat,
      active: activeSeatSet.has(seat),
      playerType: playerTypes[seat],
    }))
  }, [activeSeatSet, playerTypes])

  const activeSeats = useMemo(() => ALL_SEATS.filter((s) => activeSeatSet.has(s)), [activeSeatSet])

  const isValid = useMemo(() => {
    if (!playerCount) return false
    if (activeSeats.length !== playerCount) return false
    if (!activeSeatSet.has(firstPlayer)) return false
    if (playerCount === 2) {
      return TWO_PLAYER_PAIRS.some(
        ([a, b]) => activeSeatSet.has(a) && activeSeatSet.has(b)
      )
    }
    return true
  }, [playerCount, activeSeats, activeSeatSet, firstPlayer])

  const handleStartGame = useCallback(() => {
    if (!playerCount || !isValid) return
    const config: SetupConfig = {
      playerCount,
      occupiedSeats: activeSeats,
      firstPlayerSeat: firstPlayer,
      playerTypes,
    }
    initNewGame(config)
  }, [playerCount, isValid, activeSeats, firstPlayer, playerTypes, initNewGame])

  if (screen === 'game') {
    return <GamePage />
  }

  const titleLetters = 'SPLUT!'.split('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian relative overflow-hidden">
      {/* Ambient radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--slate-stone) 0%, var(--obsidian) 60%)',
        }}
      />

      <LobbyParticles />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[480px] mx-4">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-16 bg-rune-gold/40" />
            <div className="w-2 h-2 rotate-45 bg-rune-gold/40" />
            <div className="h-px w-16 bg-rune-gold/40" />
          </div>

          <h1 className="font-display text-5xl font-bold tracking-widest mb-3 animate-title-pulse"
            style={{ color: 'var(--rune-gold-bright)' }}
          >
            {titleLetters.map((letter, i) => (
              <span
                key={i}
                className={titleAssembled ? '' : 'inline-block'}
                style={
                  titleAssembled
                    ? undefined
                    : {
                        animation: `title-assemble 400ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                        animationDelay: `${i * 100}ms`,
                      }
                }
              >
                {letter}
              </span>
            ))}
          </h1>
          <p className="text-sm text-bone italic">
            A Game of Trolls, Dwarves &amp; Sorcerers
          </p>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-px w-16 bg-rune-gold/40" />
            <div className="w-2 h-2 rotate-45 bg-rune-gold/40" />
            <div className="h-px w-16 bg-rune-gold/40" />
          </div>
        </div>

        {/* Stone tablet card */}
        <div className="bg-slate-stone border border-rune-gold/30 rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.3)]">
          <PlayerCountSelector value={playerCount} onChange={handlePlayerCountChange} />

          {playerCount && (
            <div className="mt-6">
              <SeatSelector
                playerCount={playerCount}
                seats={seatConfigs}
                onToggleSeat={handleToggleSeat}
                onChangeType={handleChangeType}
              />
            </div>
          )}

          {playerCount && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-bone tracking-wide mb-3">
                Who goes first?
              </label>
              <select
                value={firstPlayer}
                onChange={(e) => setFirstPlayer(e.target.value as PlayerSeat)}
                className="w-full h-12 px-3 bg-carved-stone text-parchment border border-rune-gold/30 rounded-lg text-sm focus-ring cursor-pointer"
              >
                {activeSeats.map((seat) => (
                  <option key={seat} value={seat}>
                    {seat} ({SEAT_COLOR_MAP[seat]})
                  </option>
                ))}
              </select>
            </div>
          )}

          {playerCount && (
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!isValid}
                data-testid="start-game"
                onClick={handleStartGame}
              >
                BEGIN THE GAME
              </Button>
            </div>
          )}
        </div>

        {/* How to Play link */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowHelp(true)}
            className="text-bone hover:text-parchment cursor-pointer focus-ring transition-colors duration-150"
            style={{
              fontSize: '14px',
              fontWeight: 400,
              textDecoration: 'underline',
              textDecorationColor: 'rgba(212, 168, 83, 0.4)',
              textUnderlineOffset: '4px',
              background: 'none',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecorationColor = 'var(--rune-gold)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecorationColor = 'rgba(212, 168, 83, 0.4)'
            }}
          >
            How to Play
          </button>
        </div>

        {/* Help Modal */}
        <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
      </div>
    </div>
  )
}

function LobbyParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      size: 2 + Math.random(),
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-0 rounded-full bg-rune-gold/15 animate-particle-rise"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

const SEAT_COLOR_MAP: Record<PlayerSeat, string> = {
  [PlayerSeat.Top]: 'Green',
  [PlayerSeat.Bottom]: 'Red',
  [PlayerSeat.Left]: 'Yellow',
  [PlayerSeat.Right]: 'Blue',
}
