// ============================================================================
// SPLUT! Troll Engine
// Troll movement, pull-back, throw trajectory, and SPLUT! resolution.
// Zero React dependencies.
// ============================================================================

import {
  GameState,
  PieceType,
  PlayerPiece,
  RockPiece,
  Direction,
  SquareKey,
  ThrowResult,
  RockMoveType,
  Result,
  ok,
  err,
} from './types'
import {
  stepInDirection,
  getDirectionBetween,
  oppositeDirection,
  ALL_VALID_SQUARES,
} from './board'
import {
  validateBasicMove,
  getPieceAt,
  isOccupied,
  movePieceToSquare,
  isRock,
  isPlayerPiece,
} from './movement'
import { consumeMove, terminateTurn } from './turns'
import { recordRockMovement } from './rockState'
import { eliminateTeam } from './win'

/**
 * Check if pull-back is valid: Rock must be directly behind the Troll
 * relative to its movement direction.
 */
export function isPullEligible(
  fromSquare: SquareKey,
  toSquare: SquareKey,
  rockSquare: SquareKey
): boolean {
  const moveDir = getDirectionBetween(fromSquare, toSquare)
  if (!moveDir) return false
  const oppDir = oppositeDirection(moveDir)
  const pullFromSquare = stepInDirection(fromSquare, oppDir)
  return pullFromSquare === rockSquare
}

/**
 * Move a Troll.
 * - If destination is a Rock, the Troll lands on the Rock and pendingThrow is set.
 * - If pullBackRockId is provided, validates and executes pull-back.
 * - Troll cannot move to a square occupied by a non-Rock piece.
 */
export function moveTroll(
  state: GameState,
  trollId: string,
  targetSquare: SquareKey,
  pullBackRockId?: string
): Result<GameState> {
  // Basic validation
  const basicResult = validateBasicMove(state, trollId, targetSquare)
  if (!basicResult.ok) return basicResult as Result<GameState>

  const troll = state.pieces.get(trollId)! as PlayerPiece
  const trollSquare = troll.square

  // Check destination occupancy
  const destPiece = getPieceAt(state, targetSquare)
  if (destPiece) {
    if (destPiece.type === PieceType.Rock) {
      // Troll will land on Rock -> trigger throw
    } else {
      return err({ code: 'OCCUPIED', message: 'cannot move to an occupied square' })
    }
  }

  // Handle pull-back
  let newState = state
  let pullBackValidated = false
  if (pullBackRockId) {
    const rock = state.pieces.get(pullBackRockId)
    if (!rock) {
      return err({ code: 'NO_ROCK_TO_PULL', message: 'no Rock to pull' })
    }
    if (rock.type !== PieceType.Rock) {
      return err({ code: 'NOT_A_ROCK', message: 'can only pull a Rock' })
    }

    // Validate Rock is in line with movement direction (directly behind)
    if (!isPullEligible(trollSquare, targetSquare, rock.square)) {
      return err({
        code: 'PULL_NOT_IN_LINE',
        message: 'Rock must be in line with movement direction',
      })
    }

    pullBackValidated = true
  }

  // Move Troll to target FIRST (frees trollSquare for the Rock)
  newState = movePieceToSquare(newState, trollId, targetSquare)

  // Then pull Rock into Troll's vacated square (avoids occupancy collision)
  if (pullBackValidated && pullBackRockId) {
    newState = movePieceToSquare(newState, pullBackRockId, trollSquare)
    newState = recordRockMovement(newState, pullBackRockId, RockMoveType.Pulled)
  }

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

  // Check if Troll landed on Rock
  if (destPiece && destPiece.type === PieceType.Rock) {
    // Set pending throw flag
    newState = {
      ...newState,
      turn: {
        ...newState.turn,
        pendingThrow: true,
        movesUsed: newState.turn.movesUsed + 1,
      },
    }
    return ok(newState)
  }

  // Normal move complete - consume move
  newState = consumeMove(newState)
  return ok(newState)
}

/**
 * Resolve a throw trajectory from a starting square in a direction.
 */
export function resolveThrowTrajectory(
  state: GameState,
  fromSquare: SquareKey,
  direction: Direction
): ThrowResult {
  const path: SquareKey[] = []
  let currentSquare = fromSquare

  while (true) {
    const nextSquare = stepInDirection(currentSquare, direction)

    // Off the board or outside the valid diamond
    if (nextSquare === null || !ALL_VALID_SQUARES.has(nextSquare)) {
      return {
        landingSquare: currentSquare === fromSquare ? fromSquare : currentSquare,
        hitType: currentSquare === fromSquare ? 'no_move' : 'board_edge',
        path,
      }
    }

    // Check what's on the next square
    const nextPiece = getPieceAt(state, nextSquare)

    if (!nextPiece) {
      // Empty square - Rock flies over
      path.push(nextSquare)
      currentSquare = nextSquare
      continue
    }

    // Troll or Rock -> obstacle (stop BEFORE)
    if (nextPiece.type === PieceType.Troll || nextPiece.type === PieceType.Rock) {
      const landingSquare = currentSquare
      // Check if there's a Dwarf on the landing square (already behind us)
      // Actually SPLUT check: if currentSquare has a Dwarf, that's not how it works
      // SPLUT is checked when we encounter a Dwarf and peek ahead
      return {
        landingSquare,
        hitType: 'obstacle',
        path,
      }
    }

    // Sorcerer -> target (lands ON, kills)
    if (nextPiece.type === PieceType.Sorcerer) {
      path.push(nextSquare)
      return {
        landingSquare: nextSquare,
        hitType: 'sorcerer',
        killedSorcererId: nextPiece.id,
        path,
      }
    }

    // Dwarf -> check for SPLUT! (peek ahead)
    if (nextPiece.type === PieceType.Dwarf) {
      const peekSquare = stepInDirection(nextSquare, direction)

      if (peekSquare === null) {
        // Board edge after Dwarf -> SPLUT!
        path.push(nextSquare)
        return {
          landingSquare: nextSquare,
          hitType: 'splut',
          splutDwarfId: nextPiece.id,
          path,
        }
      }

      const peekPiece = getPieceAt(state, peekSquare)
      if (peekPiece && (peekPiece.type === PieceType.Troll || peekPiece.type === PieceType.Rock)) {
        // Obstacle after Dwarf -> SPLUT!
        path.push(nextSquare)
        return {
          landingSquare: nextSquare,
          hitType: 'splut',
          splutDwarfId: nextPiece.id,
          path,
        }
      }

      // Next square after Dwarf is empty, a Sorcerer, or another Dwarf -> fly over
      path.push(nextSquare)
      currentSquare = nextSquare
      continue
    }

    // Should not reach here
    currentSquare = nextSquare
    path.push(nextSquare)
  }
}

/**
 * Execute a throw in a direction.
 * Called after moveTroll sets pendingThrow = true.
 */
export function throwRock(
  state: GameState,
  direction: Direction
): Result<GameState> {
  if (!state.turn.pendingThrow) {
    return err({ code: 'NO_PENDING_THROW', message: 'no throw is pending' })
  }

  // Validate direction is cardinal
  if (!['N', 'S', 'E', 'W'].includes(direction)) {
    return err({
      code: 'INVALID_DIRECTION',
      message: 'can only throw in cardinal directions',
    })
  }

  // Find the Troll and the Rock on the same square
  const currentPlayer = state.turn.currentPlayerSeat
  let trollId: string | null = null
  let rockId: string | null = null
  let throwFromSquare: SquareKey | null = null

  for (const [id, piece] of state.pieces) {
    if (isPlayerPiece(piece) && piece.type === PieceType.Troll && piece.owner === currentPlayer) {
      trollId = id
      throwFromSquare = piece.square
    }
  }

  if (!trollId || !throwFromSquare) {
    return err({ code: 'NO_TROLL', message: 'current player has no Troll' })
  }

  // Find Rock on the same square as the Troll
  for (const [id, piece] of state.pieces) {
    if (piece.type === PieceType.Rock && piece.square === throwFromSquare) {
      rockId = id
    }
  }

  if (!rockId) {
    return err({ code: 'NO_ROCK_ON_TROLL', message: 'no Rock on Troll square' })
  }

  // Resolve trajectory
  const trajectory = resolveThrowTrajectory(state, throwFromSquare, direction)

  let newState = state

  // Move Rock to landing square
  if (trajectory.landingSquare && trajectory.landingSquare !== throwFromSquare) {
    newState = movePieceToSquare(newState, rockId, trajectory.landingSquare)

    // Restore Troll's occupancy: movePieceToSquare deletes the Rock's old square
    // from squareOccupancy, but the Troll is still on that square. Since
    // squareOccupancy can only track one piece per square, the Troll's entry
    // was lost when the Rock was co-located. Re-establish it now.
    const occ = new Map(newState.squareOccupancy)
    occ.set(throwFromSquare, trollId!)
    newState = { ...newState, squareOccupancy: occ }
  }

  // Record Rock as thrown
  newState = recordRockMovement(newState, rockId, RockMoveType.Thrown)

  // Store throw path for UI
  newState = {
    ...newState,
    lastThrowPath: trajectory.path,
    lastSplutSquare: null,
  }

  // Handle kill
  if (trajectory.hitType === 'sorcerer' && trajectory.killedSorcererId) {
    const killedPiece = newState.pieces.get(trajectory.killedSorcererId) as PlayerPiece
    if (killedPiece) {
      newState = eliminateTeam(newState, killedPiece.owner)
    }
  }

  // Handle SPLUT!
  if (trajectory.hitType === 'splut' && trajectory.splutDwarfId) {
    const dwarfPiece = newState.pieces.get(trajectory.splutDwarfId) as PlayerPiece
    if (dwarfPiece) {
      // Kill the Dwarf but do NOT eliminate the team
      const pieces = new Map(newState.pieces)
      const squareOccupancy = new Map(newState.squareOccupancy)

      squareOccupancy.delete(dwarfPiece.square)
      pieces.set(trajectory.splutDwarfId, { ...dwarfPiece, alive: false })

      // Rock lands on the Dwarf's square
      squareOccupancy.set(dwarfPiece.square, rockId)

      newState = {
        ...newState,
        pieces,
        squareOccupancy,
        lastSplutSquare: dwarfPiece.square,
      }
    }
  }

  // Clear pending throw and terminate turn
  newState = {
    ...newState,
    turn: {
      ...newState.turn,
      pendingThrow: false,
    },
  }

  // Check if game is over before terminating
  if (newState.phase === 'Over') {
    return ok(newState)
  }

  newState = terminateTurn(newState)

  return ok(newState)
}
