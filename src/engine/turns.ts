// ============================================================================
// SPLUT! Turn Management
// Pure TypeScript functions for turn order, move counts, and turn advancement.
// Zero React dependencies.
// ============================================================================

import {
  GameState,
  PlayerSeat,
  TurnState,
  TurnRockRecord,
  Result,
  ok,
  err,
} from './types'

/**
 * Returns the number of moves allowed for the given absolute turn index.
 * turnIndex 0 = first turn of game = 1 move
 * turnIndex 1 = second turn = 2 moves
 * turnIndex >= 2 = 3 moves
 */
export function getMovesAllowed(turnIndex: number): number {
  if (turnIndex === 0) return 1
  if (turnIndex === 1) return 2
  return 3
}

/**
 * Get the next active (non-eliminated) player in turn order.
 */
function getNextActivePlayer(state: GameState): PlayerSeat {
  const { activePlayers, turn } = state
  const currentIndex = activePlayers.indexOf(turn.currentPlayerSeat)

  // Cycle through active players
  for (let i = 1; i <= activePlayers.length; i++) {
    const nextSeat = activePlayers[(currentIndex + i) % activePlayers.length]
    // Active players list already excludes eliminated players
    return nextSeat
  }

  // Should never reach here if activePlayers has at least 1 entry
  return turn.currentPlayerSeat
}

/**
 * Advance to the next player's turn.
 */
export function advanceTurn(state: GameState): GameState {
  const nextPlayer = getNextActivePlayer(state)
  const nextTurnIndex = state.turn.turnIndex + 1

  const newTurn: TurnState = {
    currentPlayerSeat: nextPlayer,
    turnIndex: nextTurnIndex,
    movesAllowed: getMovesAllowed(nextTurnIndex),
    movesUsed: 0,
    isTerminated: false,
    levitationState: null,
    pendingThrow: false,
  }

  const newCurrentTurnRockRecord: TurnRockRecord = {
    turnIndex: nextTurnIndex,
    playerSeat: nextPlayer,
    movedRocks: [],
  }

  return {
    ...state,
    turn: newTurn,
    previousTurnRockRecord: state.currentTurnRockRecord,
    currentTurnRockRecord: newCurrentTurnRockRecord,
  }
}

/**
 * Consume one move. If all moves used, advance turn.
 */
export function consumeMove(state: GameState): GameState {
  const newMovesUsed = state.turn.movesUsed + 1
  const newState: GameState = {
    ...state,
    turn: {
      ...state.turn,
      movesUsed: newMovesUsed,
    },
  }

  if (newMovesUsed >= state.turn.movesAllowed) {
    return advanceTurn(newState)
  }

  return newState
}

/**
 * Terminate the current turn (e.g., after a throw).
 * Sets isTerminated flag and advances to next player.
 */
export function terminateTurn(state: GameState): GameState {
  const terminatedState: GameState = {
    ...state,
    turn: {
      ...state.turn,
      isTerminated: true,
    },
  }
  return advanceTurn(terminatedState)
}

/**
 * Check if the current player can still make moves.
 */
export function hasMovesRemaining(state: GameState): boolean {
  return !state.turn.isTerminated && state.turn.movesUsed < state.turn.movesAllowed
}

/**
 * Validate that the turn can accept an "end turn" action.
 * Returns error if moves remain.
 */
export function validateEndTurn(state: GameState): Result<void> {
  if (state.turn.movesUsed < state.turn.movesAllowed && !state.turn.isTerminated) {
    return err({ code: 'MOVES_REMAINING', message: 'all moves must be used' })
  }
  return ok(undefined)
}
