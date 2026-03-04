import { describe, it, expect } from 'vitest'
import { moveDwarf } from '@/engine/dwarf'
import { PlayerSeat, PieceType, PlayerPiece, RockPiece } from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: Dwarf Movement and Push', () => {

  // -------------------------------------------------------------------
  // Basic Dwarf Movement
  // -------------------------------------------------------------------

  describe('Rule: The Dwarf moves exactly one square horizontally or vertically', () => {
    it.each([
      { from: 'E5', to: 'E6' },
      { from: 'E5', to: 'E4' },
      { from: 'E5', to: 'D5' },
      { from: 'E5', to: 'F5' },
    ])('Dwarf moves from $from to $to into empty square', ({ from, to }) => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, from)
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', to)
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Dwarf') as PlayerPiece).square).toBe(to)
      expect(result.value.squareOccupancy.has(from)).toBe(false)
    })

    it('Dwarf cannot move diagonally', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'F6')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('diagonal movement is not allowed')
    })

    it('Dwarf cannot move more than one square', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E7')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('can only move one square at a time')
    })

    it('Dwarf cannot move off the board', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E9')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E10' as any)
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('cannot move off the board')
    })
  })

  // -------------------------------------------------------------------
  // Push Mechanic
  // -------------------------------------------------------------------

  describe('Rule: When a Dwarf moves into an occupied square it pushes ALL pieces', () => {
    it('Dwarf pushes a single piece one square', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E5')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Dwarf') as PlayerPiece).square).toBe('E6')
      expect((result.value.pieces.get('Rock_E6') as RockPiece).square).toBe('E7')
    })

    it('Dwarf pushes a chain of adjacent pieces', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E4')
        .withRock('E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E5')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Dwarf') as PlayerPiece).square).toBe('E5')
      expect((result.value.pieces.get('Rock_E5') as RockPiece).square).toBe('E6')
      expect((result.value.pieces.get('Red_Troll') as PlayerPiece).square).toBe('E7')
    })

    it('Dwarf pushes three pieces in a chain', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E3')
        .withRock('E4')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E5')
        .withPiece(PlayerSeat.Left, PieceType.Troll, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E4')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Dwarf') as PlayerPiece).square).toBe('E4')
      expect((result.value.pieces.get('Rock_E4') as RockPiece).square).toBe('E5')
      expect((result.value.pieces.get('Red_Sorcerer') as PlayerPiece).square).toBe('E6')
      expect((result.value.pieces.get('Yellow_Troll') as PlayerPiece).square).toBe('E7')
    })
  })

  // -------------------------------------------------------------------
  // Push to Board Edge
  // -------------------------------------------------------------------

  describe('Rule: Cannot push pieces off the board', () => {
    it('Dwarf cannot push if the last piece is at the board edge', () => {
      // E8 north -> D8 is not in line. We need to push along column E.
      // E8 going N: E9 is valid (corner). E9 going N: off board.
      // So a Rock at E9, Dwarf at E8 pushing north -> Rock can't go past E9.
      // Actually: Dwarf at E8, Rock at E9. Push north from E9: off board. Rejected.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E8')
        .withRock('E9')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E9')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('cannot push pieces off the board')
    })

    it('Dwarf cannot push a chain when the last piece has no room', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E6')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E7')
        .withRock('E8')
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'E9')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E7')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('cannot push pieces off the board')
    })
  })

  // -------------------------------------------------------------------
  // Push Interactions with Piece Types
  // -------------------------------------------------------------------

  describe('Rule: The Dwarf push can move any piece type', () => {
    it('Dwarf pushes an opponent\'s Sorcerer (does not kill)', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const sorcerer = result.value.pieces.get('Red_Sorcerer') as PlayerPiece
      expect(sorcerer.square).toBe('E7')
      expect(sorcerer.alive).toBe(true)
    })

    it('Dwarf pushes a friendly piece', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Troll') as PlayerPiece).square).toBe('E7')
    })
  })

  // -------------------------------------------------------------------
  // Push Does NOT Kill
  // -------------------------------------------------------------------

  describe('Rule: Pushing a piece does not kill or damage it', () => {
    it('Pushing a Sorcerer does not kill it', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const sorcerer = result.value.pieces.get('Red_Sorcerer') as PlayerPiece
      expect(sorcerer.alive).toBe(true)
      expect(sorcerer.square).toBe('E7')
    })

    it('Pushing a Rock onto a Sorcerer does not kill the Sorcerer', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E4')
        .withRock('E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E5')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const sorcerer = result.value.pieces.get('Red_Sorcerer') as PlayerPiece
      expect(sorcerer.alive).toBe(true)
      expect(sorcerer.square).toBe('E7')
      expect((result.value.pieces.get('Rock_E5') as RockPiece).square).toBe('E6')
    })
  })

  // -------------------------------------------------------------------
  // Push and Rock State
  // -------------------------------------------------------------------

  describe('Rule: Rocks pushed by a Dwarf are marked as moved', () => {
    it('A Rock pushed during the current turn is marked as pushed', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E5')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const movedRocks = result.value.currentTurnRockRecord.movedRocks
      expect(movedRocks).toContainEqual({
        rockId: 'Rock_E6',
        moveType: 'Pushed',
      })
    })
  })
})
