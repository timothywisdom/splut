// ============================================================================
// SPLUT! Store Selectors
// Derived state from the game store.
// ============================================================================

import { useGameStore } from './gameStore'
import { useShallow } from 'zustand/react/shallow'
import {
  GameState,
  GamePhase,
  PlayerSeat,
  PieceType,
  PlayerType,
  PlayerPiece,
  RockPiece,
  Piece,
  SquareKey,
} from '@/engine/types'
import { SEAT_COLOR } from '@/engine/setup'

export function useCurrentPlayer() {
  return useGameStore((s) => {
    if (!s.game) return null
    return s.game.players.find(p => p.seat === s.game!.turn.currentPlayerSeat) ?? null
  })
}

export function useIsAITurn() {
  return useGameStore((s) => s.aiTurnState?.isExecuting ?? false)
}

export function useGamePhase() {
  return useGameStore((s) => s.game?.phase ?? GamePhase.Lobby)
}

export function useWinner() {
  return useGameStore((s) => s.game?.winner ?? null)
}

export function usePendingThrow() {
  return useGameStore((s) => s.game?.turn.pendingThrow ?? false)
}

export function useMovesInfo() {
  return useGameStore(
    useShallow((s) => {
      if (!s.game) return { used: 0, allowed: 0 }
      return {
        used: s.game.turn.movesUsed,
        allowed: s.game.turn.movesAllowed,
      }
    })
  )
}

export function usePieceAt(square: SquareKey) {
  return useGameStore((s) => {
    if (!s.game) return null
    const pieceId = s.game.squareOccupancy.get(square)
    if (!pieceId) return null
    return s.game.pieces.get(pieceId) ?? null
  })
}

const EMPTY_PIECES: Piece[] = []

export function useAllPieces() {
  return useGameStore(
    useShallow((s) => {
      if (!s.game) return EMPTY_PIECES
      return Array.from(s.game.pieces.values())
    })
  )
}

const EMPTY_PLAYERS: GameState['players'] = []
const EMPTY_ACTIVE: PlayerSeat[] = []

export function usePlayers() {
  return useGameStore((s) => s.game?.players ?? EMPTY_PLAYERS)
}

export function useActivePlayers() {
  return useGameStore((s) => s.game?.activePlayers ?? EMPTY_ACTIVE)
}

export function useTurnIndex() {
  return useGameStore((s) => s.game?.turn.turnIndex ?? 0)
}

export function useCurrentSeat() {
  return useGameStore((s) => s.game?.turn.currentPlayerSeat ?? null)
}

export function getSeatColor(seat: PlayerSeat): string {
  return SEAT_COLOR[seat]
}

export function getTeamCSSColor(seat: PlayerSeat): string {
  switch (seat) {
    case PlayerSeat.Top: return 'var(--team-green)'
    case PlayerSeat.Bottom: return 'var(--team-red)'
    case PlayerSeat.Left: return 'var(--team-yellow)'
    case PlayerSeat.Right: return 'var(--team-blue)'
  }
}

export function useCanUndo() {
  return useGameStore((s) => {
    if (s.gameHistory.length === 0) return false
    if (s.game?.phase === GamePhase.Over) return false
    if (s.aiTurnState?.isExecuting) return false
    return true
  })
}

export function getTeamCSSClass(seat: PlayerSeat): string {
  switch (seat) {
    case PlayerSeat.Top: return 'text-team-green'
    case PlayerSeat.Bottom: return 'text-team-red'
    case PlayerSeat.Left: return 'text-team-yellow'
    case PlayerSeat.Right: return 'text-team-blue'
  }
}
