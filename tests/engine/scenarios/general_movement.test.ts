import { describe, it, expect } from 'vitest'
import { moveTroll } from '@/engine/troll'
import { moveDwarf } from '@/engine/dwarf'
import { moveSorcerer } from '@/engine/sorcerer'
import { PlayerSeat, PieceType, PlayerPiece, RockPiece } from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: General Movement Rules', () => {

  // -------------------------------------------------------------------
  // Universal Movement Constraints
  // -------------------------------------------------------------------

  describe('Rule: All player pieces move exactly one square horizontally or vertically', () => {
    it.each([
      { piece: 'Troll', type: PieceType.Troll },
      { piece: 'Dwarf', type: PieceType.Dwarf },
      { piece: 'Sorcerer', type: PieceType.Sorcerer },
    ])('$piece cannot move diagonally', ({ piece, type }) => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, type as PieceType.Troll | PieceType.Dwarf | PieceType.Sorcerer, 'E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const id = `Green_${piece}`
      let result
      if (type === PieceType.Troll) {
        result = moveTroll(state, id, 'F6')
      } else if (type === PieceType.Dwarf) {
        result = moveDwarf(state, id, 'F6')
      } else {
        result = moveSorcerer(state, id, 'F6')
      }

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('diagonal movement is not allowed')
    })

    it.each([
      { piece: 'Troll', type: PieceType.Troll },
      { piece: 'Dwarf', type: PieceType.Dwarf },
      { piece: 'Sorcerer', type: PieceType.Sorcerer },
    ])('$piece cannot move more than one square at a time', ({ piece, type }) => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, type as PieceType.Troll | PieceType.Dwarf | PieceType.Sorcerer, 'E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const id = `Green_${piece}`
      let result
      if (type === PieceType.Troll) {
        result = moveTroll(state, id, 'E7')
      } else if (type === PieceType.Dwarf) {
        result = moveDwarf(state, id, 'E7')
      } else {
        result = moveSorcerer(state, id, 'E7')
      }

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('can only move one square at a time')
    })
  })

  // -------------------------------------------------------------------
  // Occupied Square Rules
  // -------------------------------------------------------------------

  describe('Rule: Pieces cannot move into occupied squares except where special abilities apply', () => {
    it('Troll cannot move into a square occupied by a Sorcerer', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E6')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('cannot move to an occupied square')
    })

    it('Sorcerer cannot move into a square occupied by a Dwarf', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('cannot move to an occupied square')
    })

    it('Troll CAN move onto a Rock square (triggers throw)', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Troll') as PlayerPiece).square).toBe('E6')
      expect(result.value.turn.pendingThrow).toBe(true)
    })

    it('Dwarf CAN move into an occupied square (triggers push)', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E5')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Dwarf') as PlayerPiece).square).toBe('E6')
      // Rock should have been pushed to E7
      expect((result.value.pieces.get('Rock_E6') as RockPiece).square).toBe('E7')
    })
  })

  // -------------------------------------------------------------------
  // Board Boundary Enforcement
  // -------------------------------------------------------------------

  describe('Rule: No piece can move off the valid board area', () => {
    it('Cannot move to a square outside the diamond boundary', () => {
      // F9 is at the edge: col F=5, row 9=8. |5-4|+|8-4| = 1+4 = 5 > 4. Not valid.
      // E9 is valid: |4-4|+|8-4| = 0+4 = 4. Troll at E9, trying to move to E10 (off board).
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E9')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E10' as any)
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('cannot move off the board')
    })

    it('Cannot move to an invalid diamond square', () => {
      // A1 is outside diamond: |0-4|+|0-4| = 4+4 = 8 > 4
      // B4 is valid: |1-4|+|3-4| = 3+1 = 4. Move from B4 to A3.
      // A3: |0-4|+|2-4| = 4+2 = 6 > 4. Not valid.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'B4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'A3' as any)
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('cannot move off the board')
    })
  })

  // -------------------------------------------------------------------
  // Move Consumption
  // -------------------------------------------------------------------

  describe('Rule: Each piece movement consumes exactly one move from the player\'s move allowance', () => {
    it('Moving a piece reduces the remaining move count by 1', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      // Default turnIndex=2 gives 3 moves
      expect(state.turn.movesAllowed).toBe(3)
      expect(state.turn.movesUsed).toBe(0)

      const result = moveTroll(state, 'Green_Troll', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.turn.movesUsed).toBe(1)
      expect(result.value.turn.movesAllowed).toBe(3)
    })

    it('Move count reaches 0 after the final move and turn ends', () => {
      // Set turnIndex=0 so only 1 move is allowed
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .withTurnIndex(0)
        .build()

      expect(state.turn.movesAllowed).toBe(1)

      const result = moveTroll(state, 'Green_Troll', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // Turn should have advanced to the next player
      expect(result.value.turn.currentPlayerSeat).toBe(PlayerSeat.Bottom)
    })

    it('Failed move does not consume a move', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      // Try an invalid diagonal move
      const result = moveTroll(state, 'Green_Troll', 'F6')
      expect(result.ok).toBe(false)

      // Moves used should remain 0
      // (State is not modified on error, so we check the original)
      expect(state.turn.movesUsed).toBe(0)
    })
  })
})
