import { describe, it, expect } from 'vitest'
import { initGame, SEAT_COLOR } from '@/engine/setup'
import { advanceTurn, consumeMove, getMovesAllowed, validateEndTurn } from '@/engine/turns'
import {
  PlayerSeat,
  PieceType,
  PlayerType,
  SetupConfig,
  GameState,
} from '@/engine/types'
import { BoardBuilder } from '../../../tests/helpers/boardBuilder'

function make4PlayerConfig(first: PlayerSeat = PlayerSeat.Right): SetupConfig {
  return {
    playerCount: 4,
    occupiedSeats: [PlayerSeat.Top, PlayerSeat.Bottom, PlayerSeat.Left, PlayerSeat.Right],
    firstPlayerSeat: first,
    playerTypes: {
      [PlayerSeat.Top]: PlayerType.Human,
      [PlayerSeat.Bottom]: PlayerType.Human,
      [PlayerSeat.Left]: PlayerType.Human,
      [PlayerSeat.Right]: PlayerType.Human,
    },
  }
}

function make2PlayerConfig(first: PlayerSeat = PlayerSeat.Top): SetupConfig {
  return {
    playerCount: 2,
    occupiedSeats: [PlayerSeat.Top, PlayerSeat.Bottom],
    firstPlayerSeat: first,
    playerTypes: {
      [PlayerSeat.Top]: PlayerType.Human,
      [PlayerSeat.Bottom]: PlayerType.Human,
    },
  }
}

describe('Feature: Turn Management', () => {

  // -------------------------------------------------------------------
  // Turn Order Determination
  // -------------------------------------------------------------------

  describe('Rule: Turn order proceeds clockwise starting from the determined first player', () => {
    it('4-player game starts with the designated first player (Blue)', () => {
      const result = initGame(make4PlayerConfig(PlayerSeat.Right))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.turn.currentPlayerSeat).toBe(PlayerSeat.Right)
    })

    it('Turns proceed clockwise after the first player', () => {
      // Clockwise: Top -> Right -> Bottom -> Left
      // If Blue (Right) goes first, next is Bottom (Red)
      const result = initGame(make4PlayerConfig(PlayerSeat.Right))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = result.value
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Right)

      // Advance to next turn
      state = advanceTurn(state)
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Bottom)

      state = advanceTurn(state)
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Left)

      state = advanceTurn(state)
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Top)
    })

    it('Turn order cycles back to the first player after all players have taken a turn', () => {
      const result = initGame(make4PlayerConfig(PlayerSeat.Right))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = result.value
      // Advance through all 4 players
      state = advanceTurn(state) // -> Bottom
      state = advanceTurn(state) // -> Left
      state = advanceTurn(state) // -> Top
      state = advanceTurn(state) // -> Right again
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Right)
    })
  })

  // -------------------------------------------------------------------
  // 2-Player Turn Order
  // -------------------------------------------------------------------

  describe('Rule: In a 2-player game turns alternate between the two players', () => {
    it('2-player game alternates turns', () => {
      const result = initGame(make2PlayerConfig(PlayerSeat.Top))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = result.value
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Top)

      state = advanceTurn(state)
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Bottom)
    })

    it('2-player turn alternation continues indefinitely', () => {
      const result = initGame(make2PlayerConfig(PlayerSeat.Top))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = result.value
      state = advanceTurn(state) // -> Bottom
      state = advanceTurn(state) // -> Top
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Top)
    })
  })

  // -------------------------------------------------------------------
  // Move Counts
  // -------------------------------------------------------------------

  describe('Rule: The first player gets 1 move, the second gets 2, and subsequent turns get 3', () => {
    it('First player\'s first turn allows exactly 1 move', () => {
      expect(getMovesAllowed(0)).toBe(1)

      const result = initGame(make4PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.value.turn.movesAllowed).toBe(1)
    })

    it('Second player\'s first turn allows exactly 2 moves', () => {
      expect(getMovesAllowed(1)).toBe(2)

      const result = initGame(make4PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = advanceTurn(result.value)
      expect(state.turn.movesAllowed).toBe(2)
    })

    it('Third turn and beyond allow exactly 3 moves', () => {
      expect(getMovesAllowed(2)).toBe(3)
      expect(getMovesAllowed(3)).toBe(3)
      expect(getMovesAllowed(100)).toBe(3)
    })

    it('First player\'s second turn allows 3 moves', () => {
      const result = initGame(make2PlayerConfig(PlayerSeat.Top))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = result.value
      state = advanceTurn(state) // turn 1 -> Bottom
      state = advanceTurn(state) // turn 2 -> Top
      expect(state.turn.movesAllowed).toBe(3)
    })

    it.each([
      { turn_number: 1, move_count: 1 },
      { turn_number: 2, move_count: 2 },
      { turn_number: 3, move_count: 3 },
      { turn_number: 4, move_count: 3 },
    ])('Move count progression: turn $turn_number = $move_count moves', ({ turn_number, move_count }) => {
      expect(getMovesAllowed(turn_number - 1)).toBe(move_count)
    })
  })

  // -------------------------------------------------------------------
  // Mandatory Moves
  // -------------------------------------------------------------------

  describe('Rule: All moves in a turn are mandatory and must be used', () => {
    it('Player must use all 3 moves in a standard turn', () => {
      const result = initGame(make4PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // Advance to turn index 2 (3 moves)
      let state = advanceTurn(advanceTurn(result.value))
      expect(state.turn.movesAllowed).toBe(3)

      // After 2 moves, should still have 1 remaining
      state = { ...state, turn: { ...state.turn, movesUsed: 2 } }
      expect(state.turn.movesUsed).toBe(2)
      expect(state.turn.movesAllowed - state.turn.movesUsed).toBe(1)
    })

    it('Player cannot end turn with unused moves', () => {
      const result = initGame(make4PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = advanceTurn(advanceTurn(result.value))
      state = { ...state, turn: { ...state.turn, movesUsed: 1 } }

      const endResult = validateEndTurn(state)
      expect(endResult.ok).toBe(false)
      if (endResult.ok) return
      expect(endResult.error.message).toBe('all moves must be used')
    })

    it('Turn ends automatically after all moves are used', () => {
      const result = initGame(make4PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = advanceTurn(advanceTurn(result.value))
      expect(state.turn.movesAllowed).toBe(3)

      const currentPlayer = state.turn.currentPlayerSeat
      state = consumeMove(state)
      state = consumeMove(state)
      state = consumeMove(state)
      // After 3 consumeMove calls, turn should have advanced
      expect(state.turn.currentPlayerSeat).not.toBe(currentPlayer)
    })

    it('First player\'s turn ends after 1 move', () => {
      const result = initGame(make4PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const firstPlayer = result.value.turn.currentPlayerSeat
      const state = consumeMove(result.value)
      expect(state.turn.currentPlayerSeat).not.toBe(firstPlayer)
    })

    it('Second player\'s turn ends after 2 moves', () => {
      const result = initGame(make4PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = advanceTurn(result.value) // turn 1 -> second player
      const secondPlayer = state.turn.currentPlayerSeat
      state = consumeMove(state)
      state = consumeMove(state)
      expect(state.turn.currentPlayerSeat).not.toBe(secondPlayer)
    })
  })

  // -------------------------------------------------------------------
  // Move Distribution Among Pieces
  // -------------------------------------------------------------------

  describe('Rule: Moves may be freely distributed among the player\'s three pieces', () => {
    it('All moves count against the same counter regardless of which piece is moved', () => {
      const result = initGame(make4PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = advanceTurn(advanceTurn(result.value))
      expect(state.turn.movesAllowed).toBe(3)

      state = consumeMove(state) // Move 1
      expect(state.turn.movesUsed).toBe(1)
      state = consumeMove(state) // Move 2
      expect(state.turn.movesUsed).toBe(2)
      state = consumeMove(state) // Move 3 -> turn ends
      // After consuming 3rd move, turn advances
      expect(state.turn.movesUsed).toBe(0) // New turn resets
    })
  })

  // -------------------------------------------------------------------
  // Eliminated Player Turn Skipping
  // -------------------------------------------------------------------

  describe('Rule: Eliminated players are skipped in the turn order', () => {
    it('Turn skips an eliminated player', () => {
      // Build a state where Red is eliminated
      // Clockwise from Right: Right -> Bottom -> Left -> Top
      const result = initGame(make4PlayerConfig(PlayerSeat.Top))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // Remove Red (Bottom) from active players
      let state = result.value
      state = {
        ...state,
        activePlayers: state.activePlayers.filter(s => s !== PlayerSeat.Bottom),
        players: state.players.map(p =>
          p.seat === PlayerSeat.Bottom ? { ...p, isEliminated: true } : p
        ),
      }
      // Top is current, advance
      // Clockwise from Top: Top -> Right -> Bottom (skip) -> Left
      state = advanceTurn(state)
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Right)
    })

    it('Turn skips multiple eliminated players', () => {
      const result = initGame(make4PlayerConfig(PlayerSeat.Top))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      let state = result.value
      // Eliminate Bottom and Left
      state = {
        ...state,
        activePlayers: state.activePlayers.filter(
          s => s !== PlayerSeat.Bottom && s !== PlayerSeat.Left
        ),
        players: state.players.map(p =>
          (p.seat === PlayerSeat.Bottom || p.seat === PlayerSeat.Left)
            ? { ...p, isEliminated: true }
            : p
        ),
      }
      // Clockwise from Top: Top -> Right -> Bottom (skip) -> Left (skip) -> Top
      state = advanceTurn(state) // -> Right
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Right)
      state = advanceTurn(state) // -> Top (skipping Bottom and Left)
      expect(state.turn.currentPlayerSeat).toBe(PlayerSeat.Top)
    })
  })
})
