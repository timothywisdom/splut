// ============================================================================
// SPLUT! Shared Movement Validation
// Universal move validation used by all piece types.
// Zero React dependencies.
// ============================================================================

import {
  GameState,
  Piece,
  PlayerPiece,
  RockPiece,
  PieceType,
  SquareKey,
  Result,
  GameError,
  ok,
  err,
} from './types'
import {
  ALL_VALID_SQUARES,
  isOrthogonallyAdjacent,
  manhattanDistance,
  fromKey,
  colIndex,
  rowIndex,
} from './board'

/**
 * Get the piece at a specific square. Returns null if empty.
 */
export function getPieceAt(state: GameState, square: SquareKey): Piece | null {
  const pieceId = state.squareOccupancy.get(square)
  if (!pieceId) return null
  return state.pieces.get(pieceId) ?? null
}

/**
 * Check if a square is occupied.
 */
export function isOccupied(state: GameState, square: SquareKey): boolean {
  return state.squareOccupancy.has(square)
}

/**
 * Check if a piece is a Rock.
 */
export function isRock(piece: Piece): piece is RockPiece {
  return piece.type === PieceType.Rock
}

/**
 * Check if a piece is a player piece.
 */
export function isPlayerPiece(piece: Piece): piece is PlayerPiece {
  return piece.type !== PieceType.Rock
}

/**
 * Universal move validation (shared by all three player piece types).
 * Validates: orthogonal, 1-step, on-board, correct owner, it is their turn,
 * moves remaining, turn not terminated.
 * Does NOT check destination occupancy (Dwarf can push, Troll can land on Rock).
 */
export function validateBasicMove(
  state: GameState,
  pieceId: string,
  targetSquare: SquareKey
): Result<void> {
  // Check game is in playing phase
  if (state.phase !== 'Playing') {
    return err({ code: 'GAME_NOT_IN_PROGRESS', message: 'game is not in progress' })
  }

  // Check pending throw
  if (state.turn.pendingThrow) {
    return err({ code: 'PENDING_THROW', message: 'must choose a throw direction first' })
  }

  // Check turn not terminated
  if (state.turn.isTerminated) {
    return err({ code: 'TURN_TERMINATED', message: 'turn has been terminated by a throw' })
  }

  // Check moves remaining
  if (state.turn.movesUsed >= state.turn.movesAllowed) {
    return err({ code: 'NO_MOVES_REMAINING', message: 'all moves must be used' })
  }

  // Get the piece
  const piece = state.pieces.get(pieceId)
  if (!piece) {
    return err({ code: 'PIECE_NOT_FOUND', message: 'piece not found' })
  }

  // Check it's not a Rock
  if (piece.type === PieceType.Rock) {
    return err({ code: 'CANNOT_MOVE_ROCK', message: 'Rocks cannot be moved directly' })
  }

  const playerPiece = piece as PlayerPiece

  // Check piece is alive
  if (!playerPiece.alive) {
    return err({ code: 'PIECE_DEAD', message: 'piece is not alive' })
  }

  // Check it belongs to the current player
  if (playerPiece.owner !== state.turn.currentPlayerSeat) {
    return err({ code: 'NOT_YOUR_PIECE', message: "cannot move opponent's piece" })
  }

  // Check target is on the board
  if (!ALL_VALID_SQUARES.has(targetSquare)) {
    return err({ code: 'CANNOT_MOVE_OFF_BOARD', message: 'cannot move off the board' })
  }

  // Check orthogonal adjacency (1 step)
  if (!isOrthogonallyAdjacent(playerPiece.square, targetSquare)) {
    const fromSq = fromKey(playerPiece.square)
    const toSq = fromKey(targetSquare)
    const colDiff = Math.abs(colIndex(fromSq.col) - colIndex(toSq.col))
    const rowDiff = Math.abs(rowIndex(fromSq.row) - rowIndex(toSq.row))

    // Check if it's a diagonal move (both col and row differ)
    if (colDiff >= 1 && rowDiff >= 1) {
      return err({ code: 'DIAGONAL_MOVE', message: 'diagonal movement is not allowed' })
    }

    // Otherwise it's too far (more than 1 step in one direction)
    if (colDiff > 1 || rowDiff > 1) {
      return err({ code: 'TOO_FAR', message: 'can only move one square at a time' })
    }

    // Same square
    return err({ code: 'SAME_SQUARE', message: 'must move to a different square' })
  }

  return ok(undefined)
}

/**
 * Move a piece to a new square, updating both maps atomically.
 * Returns a new GameState with the piece moved.
 */
export function movePieceToSquare(
  state: GameState,
  pieceId: string,
  newSquare: SquareKey
): GameState {
  const pieces = new Map(state.pieces)
  const squareOccupancy = new Map(state.squareOccupancy)

  const piece = pieces.get(pieceId)!
  const oldSquare = piece.square

  // Remove from old square
  squareOccupancy.delete(oldSquare)

  // Update piece
  const updatedPiece = { ...piece, square: newSquare }
  pieces.set(pieceId, updatedPiece)

  // Add to new square
  squareOccupancy.set(newSquare, pieceId)

  return {
    ...state,
    pieces,
    squareOccupancy,
  }
}

/**
 * Remove a piece from the board entirely.
 */
export function removePiece(state: GameState, pieceId: string): GameState {
  const pieces = new Map(state.pieces)
  const squareOccupancy = new Map(state.squareOccupancy)

  const piece = pieces.get(pieceId)
  if (piece) {
    squareOccupancy.delete(piece.square)
    if (isPlayerPiece(piece)) {
      pieces.set(pieceId, { ...piece, alive: false })
    } else {
      pieces.delete(pieceId)
    }
  }

  return {
    ...state,
    pieces,
    squareOccupancy,
  }
}
