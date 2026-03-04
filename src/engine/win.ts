// ============================================================================
// SPLUT! Win Condition and Team Elimination
// Pure TypeScript functions for detecting elimination and game end.
// Zero React dependencies.
// ============================================================================

import {
  GameState,
  GamePhase,
  PlayerSeat,
  PieceType,
  PlayerPiece,
  Piece,
  SquareKey,
} from './types'

/**
 * Eliminate a team: remove all their pieces from the board.
 * The Rock that killed the Sorcerer stays (already placed by throw resolution).
 */
export function eliminateTeam(state: GameState, seat: PlayerSeat): GameState {
  const pieces = new Map(state.pieces)
  const squareOccupancy = new Map(state.squareOccupancy)

  // Find and remove all player pieces belonging to this seat
  for (const [pieceId, piece] of pieces) {
    if (piece.type !== PieceType.Rock && (piece as PlayerPiece).owner === seat) {
      // Only remove from occupancy if this piece actually occupies that square
      // (the square may have been taken by a Rock that killed the Sorcerer)
      if (squareOccupancy.get(piece.square) === pieceId) {
        squareOccupancy.delete(piece.square)
      }
      // Mark as dead
      pieces.set(pieceId, { ...piece, alive: false } as PlayerPiece)
    }
  }

  // Update players
  const players = state.players.map(p =>
    p.seat === seat ? { ...p, isEliminated: true } : p
  )

  // Update active players
  const activePlayers = state.activePlayers.filter(s => s !== seat)

  let newState: GameState = {
    ...state,
    pieces,
    squareOccupancy,
    players,
    activePlayers,
  }

  // Check win condition
  newState = checkWinCondition(newState)

  return newState
}

/**
 * Check if only 1 active player remains -> set phase = Over, winner.
 */
export function checkWinCondition(state: GameState): GameState {
  if (state.activePlayers.length === 1) {
    return {
      ...state,
      phase: GamePhase.Over,
      winner: state.activePlayers[0],
    }
  }
  return state
}
