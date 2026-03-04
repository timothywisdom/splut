import { describe, it, expect } from 'vitest'
import { moveTroll } from '@/engine/troll'
import { PlayerSeat, PieceType, PlayerPiece, RockPiece } from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: Troll Movement and Pull Back', () => {

  // -------------------------------------------------------------------
  // Basic Troll Movement
  // -------------------------------------------------------------------

  describe('Rule: The Troll moves exactly one square horizontally or vertically', () => {
    it.each([
      { from: 'E5', to: 'E6' },
      { from: 'E5', to: 'E4' },
      { from: 'E5', to: 'D5' },
      { from: 'E5', to: 'F5' },
    ])('Troll moves from $from to $to', ({ from, to }) => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, from)
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', to)
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Troll') as PlayerPiece).square).toBe(to)
      expect(result.value.squareOccupancy.has(from)).toBe(false)
    })

    it('Troll cannot move diagonally', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'F6')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('diagonal movement is not allowed')
    })

    it('Troll cannot move more than one square', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E7')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('can only move one square at a time')
    })

    it('Troll cannot move to an occupied square (non-Rock)', () => {
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

    it('Troll cannot move off the board', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E9')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E10' as any)
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('cannot move off the board')
    })
  })

  // -------------------------------------------------------------------
  // Pull Back
  // -------------------------------------------------------------------

  describe('Rule: When moving, the Troll may optionally drag a Rock behind it', () => {
    it('Troll pulls a Rock behind it when moving forward (N)', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('E4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E6', 'Rock_E4')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Troll') as PlayerPiece).square).toBe('E6')
      expect((result.value.pieces.get('Rock_E4') as RockPiece).square).toBe('E5')
      expect(result.value.squareOccupancy.has('E4')).toBe(false)
    })

    it('Troll pulls Rock from the left when moving right', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('D5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'F5', 'Rock_D5')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Troll') as PlayerPiece).square).toBe('F5')
      expect((result.value.pieces.get('Rock_D5') as RockPiece).square).toBe('E5')
    })

    it('Troll pulls Rock from the right when moving left', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('F5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'D5', 'Rock_F5')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Troll') as PlayerPiece).square).toBe('D5')
      expect((result.value.pieces.get('Rock_F5') as RockPiece).square).toBe('E5')
    })

    it('Pull Back is optional', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('E4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Troll') as PlayerPiece).square).toBe('E6')
      expect((result.value.pieces.get('Rock_E4') as RockPiece).square).toBe('E4')
    })
  })

  // -------------------------------------------------------------------
  // Pull Back Constraints
  // -------------------------------------------------------------------

  describe('Rule: Pull Back only works with a Rock directly behind the Troll', () => {
    it('Cannot Pull Back a Rock that is not in line with movement', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('D5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Moving north, trying to pull Rock from west (D5)
      const result = moveTroll(state, 'Green_Troll', 'E6', 'Rock_D5')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('Rock must be in line with movement direction')
    })

    it('Cannot Pull Back when there is no Rock adjacent in the pull direction', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E6', 'Rock_E4')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('no Rock to pull')
    })

    it('Cannot Pull Back a piece that is not a Rock', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E6', 'Green_Dwarf')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('can only pull a Rock')
    })
  })

  // -------------------------------------------------------------------
  // Pull Back and Throw Interaction
  // -------------------------------------------------------------------

  describe('Rule: Pull Back occurs before any throw check', () => {
    it('Troll cannot Pull Back a Rock onto itself to trigger a throw', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('E4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E6', 'Rock_E4')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // Rock moves to E5 (Troll's old square), Troll is at E6
      // No throw should be triggered
      expect(result.value.turn.pendingThrow).toBe(false)
    })
  })
})
