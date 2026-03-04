import { describe, it, expect } from 'vitest'
import { moveSorcerer, validateLevitationEligibility, checkLevitationBlocked } from '@/engine/sorcerer'
import { moveTroll } from '@/engine/troll'
import { moveDwarf } from '@/engine/dwarf'
import { PlayerSeat, PieceType, PlayerPiece, RockPiece, RockMoveType } from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: Sorcerer Movement and Levitate', () => {

  // -------------------------------------------------------------------
  // Basic Sorcerer Movement
  // -------------------------------------------------------------------

  describe('Rule: The Sorcerer moves exactly one square horizontally or vertically', () => {
    it.each([
      { from: 'E5', to: 'E6' },
      { from: 'E5', to: 'E4' },
      { from: 'E5', to: 'D5' },
      { from: 'E5', to: 'F5' },
    ])('Sorcerer moves from $from to $to', ({ from, to }) => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, from)
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', to)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect((result.value.pieces.get('Green_Sorcerer') as PlayerPiece).square).toBe(to)
    })

    it('Sorcerer cannot move diagonally', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'F6')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('diagonal movement is not allowed')
    })

    it('Sorcerer cannot move to an occupied square', () => {
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

    it('Sorcerer cannot move off the board', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E9')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E10' as any)
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('cannot move off the board')
    })
  })

  // -------------------------------------------------------------------
  // Levitate - Basic Mechanic
  // -------------------------------------------------------------------

  describe('Rule: Sorcerer can levitate one Rock that mirrors every move', () => {
    it('Sorcerer levitates a Rock - Rock mirrors the movement (north)', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Sorcerer') as PlayerPiece).square).toBe('E6')
      expect((result.value.pieces.get('Rock_D4') as RockPiece).square).toBe('D5')
    })

    it('Levitated Rock moves in the same direction as the Sorcerer', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('F6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Sorcerer moves N (E5->E6), Rock should also move N (F6->F7)
      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_F6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Sorcerer') as PlayerPiece).square).toBe('E6')
      expect((result.value.pieces.get('Rock_F6') as RockPiece).square).toBe('F7')
    })

    it('Sorcerer moves east while levitating a Rock - Rock moves east too', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('E7')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'F5', 'Rock_E7')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Sorcerer') as PlayerPiece).square).toBe('F5')
      expect((result.value.pieces.get('Rock_E7') as RockPiece).square).toBe('F7')
    })
  })

  // -------------------------------------------------------------------
  // Levitate - One Rock Per Turn
  // -------------------------------------------------------------------

  describe('Rule: A Sorcerer can only levitate one Rock per turn', () => {
    it('Sorcerer cannot switch to levitating a different Rock mid-turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withRock('F6')
        .withCurrentPlayer(PlayerSeat.Top, 1)
        .withLevitation('Rock_D4', true, false)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_F6')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('can only levitate one Rock per turn')
    })

    it('Sorcerer can levitate the same Rock across multiple moves', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      // Move 1: levitate
      const r1 = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(r1.ok).toBe(true)
      if (!r1.ok) return

      // Move 2: continue levitating same rock
      const r2 = moveSorcerer(r1.value, 'Green_Sorcerer', 'E7', 'Rock_D4')
      expect(r2.ok).toBe(true)
    })
  })

  // -------------------------------------------------------------------
  // Levitate - Continuity Within a Turn
  // -------------------------------------------------------------------

  describe('Rule: Once you stop levitating you cannot resume', () => {
    it('Sorcerer stops levitating by moving another piece - cannot resume', () => {
      // Simulate: Move 1 = levitate, Move 2 = Troll move (stops levitation)
      // Place Troll at C5 so it doesn't block Rock_D4 moving north to D5
      let state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'C5')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      // Move 1: Sorcerer levitates Rock_D4 north (D4->D5)
      const r1 = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(r1.ok).toBe(true)
      if (!r1.ok) return

      // Move 2: Troll moves (stops levitation)
      const r2 = moveTroll(r1.value, 'Green_Troll', 'C6')
      expect(r2.ok).toBe(true)
      if (!r2.ok) return

      // Move 3: Try to resume levitation - Rock_D4 is now at D5
      const r3 = moveSorcerer(r2.value, 'Green_Sorcerer', 'E7', 'Rock_D4')
      expect(r3.ok).toBe(false)
      if (r3.ok) return
      expect(r3.error.message).toBe('cannot resume levitation after interruption')
    })

    it('Sorcerer stops levitating by moving without the Rock - cannot resume', () => {
      let state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      // Move 1: Sorcerer levitates
      const r1 = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(r1.ok).toBe(true)
      if (!r1.ok) return

      // Move 2: Sorcerer moves without levitating
      const r2 = moveSorcerer(r1.value, 'Green_Sorcerer', 'E7')
      expect(r2.ok).toBe(true)
      if (!r2.ok) return

      // Move 3: Try to resume
      const r3 = moveSorcerer(r2.value, 'Green_Sorcerer', 'E8', 'Rock_D4')
      expect(r3.ok).toBe(false)
      if (r3.ok) return
      expect(r3.error.message).toBe('cannot resume levitation after interruption')
    })

    it('Sorcerer starts levitating on move 2 after a non-levitation move 1', () => {
      let state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      // Move 1: Troll moves
      const r1 = moveTroll(state, 'Green_Troll', 'D6')
      expect(r1.ok).toBe(true)
      if (!r1.ok) return

      // Move 2: Sorcerer levitates
      const r2 = moveSorcerer(r1.value, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(r2.ok).toBe(true)
    })
  })

  // -------------------------------------------------------------------
  // Levitate - Cooldown From Previous Turn
  // -------------------------------------------------------------------

  describe('Rule: Cannot levitate a Rock moved during the previous turn', () => {
    it('Cannot levitate a Rock that was Thrown during the previous turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPreviousTurnRockMoved('Rock_D4', RockMoveType.Thrown)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('Rock was moved during the previous turn')
    })

    it('Cannot levitate a Rock that was Levitated during the previous turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPreviousTurnRockMoved('Rock_D4', RockMoveType.Levitated)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('Rock was moved during the previous turn')
    })

    it('Cannot levitate a Rock that was Pushed during the previous turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPreviousTurnRockMoved('Rock_D4', RockMoveType.Pushed)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('Rock was moved during the previous turn')
    })

    it('Cannot levitate a Rock that was Pulled during the previous turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPreviousTurnRockMoved('Rock_D4', RockMoveType.Pulled)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('Rock was moved during the previous turn')
    })

    it('Can levitate a Rock that was NOT moved during the previous turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(true)
    })
  })

  // -------------------------------------------------------------------
  // Levitate - Can Use Rocks Moved During YOUR Turn
  // -------------------------------------------------------------------

  describe('Rule: Can levitate a Rock moved by own team during current turn', () => {
    it('Can levitate a Rock that was Pushed by own Dwarf earlier this turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'D3')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top, 1)
        .withCurrentTurnRockMoved('Rock_D4', RockMoveType.Pushed)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(true)
    })

    it('Can levitate a Rock that was Pulled by own Troll earlier this turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D6')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top, 1)
        .withCurrentTurnRockMoved('Rock_D4', RockMoveType.Pulled)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(true)
    })
  })

  // -------------------------------------------------------------------
  // Levitate - Obstacles Block
  // -------------------------------------------------------------------

  describe('Rule: Obstacles block levitated Rocks', () => {
    it('Levitated Rock is blocked by the board border', () => {
      // Rock at D8, moving N: D8 -> D9 is NOT valid. Blocked.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D8')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D8')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('levitation is blocked in this direction')
    })

    it('Levitated Rock is blocked by a Troll', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D5')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('levitation is blocked in this direction')
    })

    it('Levitated Rock is blocked by another Rock', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D5')
        .withRock('D6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D5')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('levitation is blocked in this direction')
    })

    it('Levitated Rock is blocked by a Dwarf', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'D6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D5')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('levitation is blocked in this direction')
    })

    it('Levitated Rock is blocked by a Sorcerer', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'D6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D5')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('levitation is blocked in this direction')
    })
  })

  // -------------------------------------------------------------------
  // Levitate - Cannot Kill Sorcerer
  // -------------------------------------------------------------------

  describe('Rule: Cannot kill an enemy Sorcerer by levitation', () => {
    it('Levitating a Rock onto an enemy Sorcerer is blocked', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'D6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D5')
      expect(result.ok).toBe(false)
    })
  })

  // -------------------------------------------------------------------
  // Sorcerer Can Still Move Without Levitating
  // -------------------------------------------------------------------

  describe('Rule: If levitation is blocked, Sorcerer can move without levitating', () => {
    it('Sorcerer moves without levitation when Rock destination is blocked', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Move without levitating
      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Sorcerer') as PlayerPiece).square).toBe('E6')
      expect((result.value.pieces.get('Rock_D5') as RockPiece).square).toBe('D5')
    })
  })

  // -------------------------------------------------------------------
  // Levitate - Edge Cases
  // -------------------------------------------------------------------

  describe('Rule: Various edge conditions around levitation', () => {
    it('Sorcerer can levitate a Rock that is far away on the board', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'B5')
        .withRock('H5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Move N: B5->B6, Rock H5->H6
      const result = moveSorcerer(state, 'Green_Sorcerer', 'B6', 'Rock_H5')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect((result.value.pieces.get('Green_Sorcerer') as PlayerPiece).square).toBe('B6')
      expect((result.value.pieces.get('Rock_H5') as RockPiece).square).toBe('H6')
    })
  })
})
