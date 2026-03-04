// ============================================================================
// SPLUT! Seat Selector
// Displays seat assignment rows with Human/AI toggles.
// ============================================================================

'use client'

import { PlayerSeat, PlayerType } from '@/engine/types'
import { SEAT_COLOR } from '@/engine/setup'
import { getTeamCSSColor } from '@/store/selectors'
import PlayerTypeToggle from './PlayerTypeToggle'

interface SeatConfig {
  seat: PlayerSeat
  active: boolean
  playerType: PlayerType
}

interface SeatSelectorProps {
  playerCount: 2 | 3 | 4
  seats: SeatConfig[]
  onToggleSeat: (seat: PlayerSeat) => void
  onChangeType: (seat: PlayerSeat, type: PlayerType) => void
}

export default function SeatSelector({
  playerCount,
  seats,
  onToggleSeat,
  onChangeType,
}: SeatSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-bone tracking-wide mb-3">
        Choose seats
      </label>
      {seats.map((config, index) => {
        const colorName = SEAT_COLOR[config.seat]
        const cssColor = getTeamCSSColor(config.seat)
        const canToggle = playerCount === 3

        return (
          <div
            key={config.seat}
            data-testid={`seat-${config.seat}`}
            className={`
              flex items-center justify-between h-12 px-3 rounded-lg bg-carved-stone transition-all duration-250 animate-slide-down
              ${!config.active ? 'opacity-40' : ''}
            `}
            style={{
              animationDelay: `${index * 80}ms`,
            }}
          >
            {/* Left: team color dot + name */}
            <div className="flex items-center gap-3">
              {/* Clickable toggle for 3-player mode */}
              {canToggle ? (
                <button
                  onClick={() => onToggleSeat(config.seat)}
                  className="flex items-center gap-3 cursor-pointer"
                  aria-label={`Toggle ${colorName} seat`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.active ? cssColor : 'var(--ash)' }}
                  />
                  <span className="text-sm font-semibold" style={{ color: config.active ? cssColor : 'var(--ash)' }}>
                    {config.seat}
                  </span>
                  <span className="text-xs text-ash">({colorName})</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.active ? cssColor : 'var(--ash)' }}
                  />
                  <span className="text-sm font-semibold" style={{ color: config.active ? cssColor : 'var(--ash)' }}>
                    {config.seat}
                  </span>
                  <span className="text-xs text-ash">({colorName})</span>
                </div>
              )}
            </div>

            {/* Right: Human/AI toggle */}
            {config.active && (
              <PlayerTypeToggle
                value={config.playerType}
                onChange={(type) => onChangeType(config.seat, type)}
                seat={config.seat}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
