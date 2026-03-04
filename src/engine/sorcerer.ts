// ============================================================================
// SPLUT! Sorcerer Engine
// Sorcerer movement and levitation.
// Zero React dependencies.
// ============================================================================

import {
  GameState,
  PieceType,
  PlayerPiece,
  RockPiece,
  Direction,
  SquareKey,
  RockMoveType,
  LevitationState,
  Result,
  ok,
  err,
} from './types'
import {
  stepInDirection,
  getDirectionBetween,
  ALL_VALID_SQUARES,
} from './board'
import {
  validateBasicMove,
  getPieceAt,
  isOccupied,
  movePieceToSquare,
} from './movement'
import { consumeMove } from './turns'
import { recordRockMovement, isRockOnCooldown } from './rockState'

/**
 * Validate whether a Rock is eligible for levitation.
 */
export function validateLevitationEligibility(
  state: GameState,
  rockId: string
): Result<void> {
  // Check rock exists
  const rock = state.pieces.get(rockId)
  if (!rock || rock.type !== PieceType.Rock) {
    return err({ code: 'INVALID_ROCK', message: 'Rock not found' })
  }

  // Check cooldown (was moved during the previous player's turn)
  if (isRockOnCooldown(state, rockId)) {
    return err({
      code: 'ROCK_ON_COOLDOWN',
      message: 'Rock was moved during the previous turn',
    })
  }

  // Check if levitation was stopped this turn (cannot resume)
  if (state.turn.levitationState?.isStopped) {
    return err({
      code: 'LEVITATION_INTERRUPTED',
      message: 'cannot resume levitation after interruption',
    })
  }

  // Check if a different Rock is being levitated this turn
  if (
    state.turn.levitationState?.hasStarted &&
    state.turn.levitationState.rockId !== rockId
  ) {
    return err({
      code: 'DIFFERENT_ROCK',
      message: 'can only levitate one Rock per turn',
    })
  }

  return ok(undefined)
}

/**
 * Check if levitation is blocked for a Rock moving in a given direction.
 * A levitated Rock is blocked by: board edge, Troll, another Rock, Dwarf, or any Sorcerer.
 */
export function checkLevitationBlocked(
  state: GameState,
  rockSquare: SquareKey,
  direction: Direction
): boolean {
  const destSquare = stepInDirection(rockSquare, direction)

  // Board edge
  if (destSquare === null) return true

  // Check destination occupancy
  const destPiece = getPieceAt(state, destSquare)
  if (destPiece) {
    // Any piece blocks levitation
    return true
  }

  return false
}

/**
 * Move a Sorcerer, optionally levitating a Rock.
 */
export function moveSorcerer(
  state: GameState,
  sorcererId: string,
  targetSquare: SquareKey,
  levitateRockId?: string
): Result<GameState> {
  // Basic validation
  const basicResult = validateBasicMove(state, sorcererId, targetSquare)
  if (!basicResult.ok) return basicResult as Result<GameState>

  const sorcerer = state.pieces.get(sorcererId)! as PlayerPiece
  const sorcererSquare = sorcerer.square

  // Check destination is not occupied
  if (isOccupied(state, targetSquare)) {
    return err({ code: 'OCCUPIED', message: 'cannot move to an occupied square' })
  }

  // Get direction of movement
  const direction = getDirectionBetween(sorcererSquare, targetSquare)
  if (!direction) {
    return err({ code: 'INVALID_DIRECTION', message: 'invalid movement direction' })
  }

  let newState = state
  let newLevitationState: LevitationState | null = state.turn.levitationState

  // Handle levitation
  if (levitateRockId) {
    // Validate eligibility
    const eligResult = validateLevitationEligibility(state, levitateRockId)
    if (!eligResult.ok) return eligResult as Result<GameState>

    const rock = state.pieces.get(levitateRockId) as RockPiece

    // Check if levitation is blocked for this direction
    if (checkLevitationBlocked(state, rock.square, direction)) {
      return err({
        code: 'LEVITATION_BLOCKED',
        message: 'levitation is blocked in this direction',
      })
    }

    // Move the Rock in the same direction as the Sorcerer
    const rockDestSquare = stepInDirection(rock.square, direction)!
    newState = movePieceToSquare(newState, levitateRockId, rockDestSquare)
    newState = recordRockMovement(newState, levitateRockId, RockMoveType.Levitated)

    // Update levitation state
    newLevitationState = {
      rockId: levitateRockId,
      hasStarted: true,
      isStopped: false,
    }
  } else {
    // Sorcerer moved without levitation
    if (newLevitationState?.hasStarted && !newLevitationState.isStopped) {
      // Was levitating but stopped - mark as stopped
      newLevitationState = {
        ...newLevitationState,
        isStopped: true,
      }
    }
  }

  // Move Sorcerer
  newState = movePieceToSquare(newState, sorcererId, targetSquare)

  // Update turn with levitation state
  newState = {
    ...newState,
    turn: {
      ...newState.turn,
      levitationState: newLevitationState,
    },
  }

  // Consume move
  newState = consumeMove(newState)

  return ok(newState)
}
