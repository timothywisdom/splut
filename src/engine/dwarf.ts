// ============================================================================
// SPLUT! Dwarf Engine
// Dwarf movement and push chain resolution.
// Zero React dependencies.
// ============================================================================

import {
  GameState,
  PieceType,
  PlayerPiece,
  Direction,
  SquareKey,
  PushResult,
  RockMoveType,
  Result,
  ok,
  err,
} from './types'
import {
  stepInDirection,
  getDirectionBetween,
} from './board'
import {
  validateBasicMove,
  getPieceAt,
  isOccupied,
  movePieceToSquare,
} from './movement'
import { consumeMove } from './turns'
import { recordRockMovement } from './rockState'

/**
 * Resolve a push chain starting from a target square in a given direction.
 * Collects all consecutive occupied squares, checks if the last piece can be pushed.
 */
export function resolvePushChain(
  state: GameState,
  fromSquare: SquareKey,
  direction: Direction
): PushResult {
  const chain: Array<{ pieceId: string; fromSquare: SquareKey; toSquare: SquareKey }> = []

  let currentSquare = fromSquare
  const occupiedSquares: Array<{ pieceId: string; square: SquareKey }> = []

  // Walk in the direction until we find an empty square or board edge
  while (true) {
    const piece = getPieceAt(state, currentSquare)
    if (!piece) {
      // Empty square found - this is where the last piece will push to
      break
    }

    occupiedSquares.push({ pieceId: piece.id, square: currentSquare })

    const nextSquare = stepInDirection(currentSquare, direction)
    if (nextSquare === null) {
      // Board edge - cannot push
      return {
        valid: false,
        chain: [],
        error: {
          code: 'CANNOT_PUSH_OFF_BOARD',
          message: 'cannot push pieces off the board',
        },
      }
    }

    currentSquare = nextSquare
  }

  // Build chain: each piece moves to the next square in the direction
  for (let i = 0; i < occupiedSquares.length; i++) {
    const piece = occupiedSquares[i]
    let toSquare: SquareKey
    if (i + 1 < occupiedSquares.length) {
      toSquare = occupiedSquares[i + 1].square
    } else {
      toSquare = currentSquare // The empty square
    }
    // Actually each piece moves one step forward
    const nextSq = stepInDirection(piece.square, direction)!
    chain.push({
      pieceId: piece.pieceId,
      fromSquare: piece.square,
      toSquare: nextSq,
    })
  }

  return { valid: true, chain }
}

/**
 * Move a Dwarf. If the destination is occupied, pushes the chain.
 */
export function moveDwarf(
  state: GameState,
  dwarfId: string,
  targetSquare: SquareKey
): Result<GameState> {
  // Basic validation
  const basicResult = validateBasicMove(state, dwarfId, targetSquare)
  if (!basicResult.ok) return basicResult as Result<GameState>

  const dwarf = state.pieces.get(dwarfId)! as PlayerPiece
  const dwarfSquare = dwarf.square

  // Get direction of movement
  const direction = getDirectionBetween(dwarfSquare, targetSquare)
  if (!direction) {
    return err({ code: 'INVALID_DIRECTION', message: 'invalid movement direction' })
  }

  let newState = state

  // Check if destination is occupied -> push
  if (isOccupied(state, targetSquare)) {
    const pushResult = resolvePushChain(state, targetSquare, direction)
    if (!pushResult.valid) {
      return err(pushResult.error!)
    }

    // Apply push chain in REVERSE order (last piece first)
    const reversedChain = [...pushResult.chain].reverse()
    for (const move of reversedChain) {
      newState = movePieceToSquare(newState, move.pieceId, move.toSquare)

      // Track pushed Rocks
      const piece = state.pieces.get(move.pieceId)
      if (piece && piece.type === PieceType.Rock) {
        newState = recordRockMovement(newState, move.pieceId, RockMoveType.Pushed)
      }
    }
  }

  // Move Dwarf to target square
  newState = movePieceToSquare(newState, dwarfId, targetSquare)

  // Update levitation state if needed (moving a non-sorcerer stops levitation)
  if (newState.turn.levitationState?.hasStarted && !newState.turn.levitationState.isStopped) {
    newState = {
      ...newState,
      turn: {
        ...newState.turn,
        levitationState: {
          ...newState.turn.levitationState,
          isStopped: true,
        },
      },
    }
  }

  // Consume move
  newState = consumeMove(newState)

  return ok(newState)
}
