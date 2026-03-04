// ============================================================================
// SPLUT! Rock State Tracking
// Tracks which Rocks were moved and how, for levitation cooldown.
// Zero React dependencies.
// ============================================================================

import {
  GameState,
  RockMoveType,
  RockMovementRecord,
  TurnRockRecord,
  SquareKey,
} from './types'

/**
 * Record a Rock movement during the current turn.
 */
export function recordRockMovement(
  state: GameState,
  rockId: string,
  moveType: RockMoveType
): GameState {
  const currentTurnRockRecord: TurnRockRecord = {
    ...state.currentTurnRockRecord,
    movedRocks: [
      ...state.currentTurnRockRecord.movedRocks,
      { rockId, moveType },
    ],
  }

  return {
    ...state,
    currentTurnRockRecord,
  }
}

/**
 * Check if a Rock is on cooldown (moved during the previous player's turn).
 * Rocks moved during the CURRENT player's own turn are NOT on cooldown.
 */
export function isRockOnCooldown(state: GameState, rockId: string): boolean {
  return state.previousTurnRockRecord?.movedRocks.some(
    r => r.rockId === rockId
  ) ?? false
}

/**
 * Check if a Rock was moved during the current turn.
 */
export function wasRockMovedThisTurn(state: GameState, rockId: string): boolean {
  return state.currentTurnRockRecord.movedRocks.some(
    r => r.rockId === rockId
  )
}
