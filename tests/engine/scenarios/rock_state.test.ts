import { describe, it, expect } from 'vitest'
import { moveTroll, throwRock } from '@/engine/troll'
import { moveDwarf } from '@/engine/dwarf'
import { moveSorcerer } from '@/engine/sorcerer'
import { isRockOnCooldown, wasRockMovedThisTurn } from '@/engine/rockState'
import { advanceTurn } from '@/engine/turns'
import { PlayerSeat, PieceType, RockMoveType, RockPiece, PlayerPiece } from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: Rock State Tracking for Levitation Eligibility', () => {

  // -------------------------------------------------------------------
  // Tracking Rock Movement Types
  // -------------------------------------------------------------------

  describe('Rule: Every Rock movement is recorded with the movement type and the turn it occurred on', () => {
    it('Thrown Rock is tracked as moved', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      const result = throwRock(state, 'N')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // After throw, the turn advances. Check previous turn rock record.
      const movedRocks = result.value.previousTurnRockRecord?.movedRocks ?? []
      expect(movedRocks).toContainEqual({
        rockId: 'Rock_E5',
        moveType: 'Thrown',
      })
    })

    it('Levitated Rock is tracked as moved', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const movedRocks = result.value.currentTurnRockRecord.movedRocks
      expect(movedRocks).toContainEqual({
        rockId: 'Rock_D4',
        moveType: 'Levitated',
      })
    })

    it('Pushed Rock is tracked as moved', () => {
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

    it('Pulled Rock is tracked as moved', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('E4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Troll moves north from E5 to E6, pulling Rock_E4 from E4 to E5
      const result = moveTroll(state, 'Green_Troll', 'E6', 'Rock_E4')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const movedRocks = result.value.currentTurnRockRecord.movedRocks
      expect(movedRocks).toContainEqual({
        rockId: 'Rock_E4',
        moveType: 'Pulled',
      })
    })
  })

  // -------------------------------------------------------------------
  // Cooldown Applies Only to Previous Player's Turn
  // -------------------------------------------------------------------

  describe('Rule: The levitation cooldown only blocks Rocks moved during the immediately previous player\'s turn', () => {
    it('Rock moved by the immediately previous player is NOT eligible for levitation', () => {
      // Red levitated Rock_D4 during their turn (previous turn)
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Left)
        .withPreviousTurnRockMoved('Rock_D4', RockMoveType.Levitated)
        .build()

      const result = moveSorcerer(state, 'Yellow_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('Rock was moved during the previous turn')
    })

    it('Rock not moved by anyone in the previous turn is always eligible', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Left)
        .build()

      // No previous turn rock record, so Rock_D4 is eligible
      const result = moveSorcerer(state, 'Yellow_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(true)
    })

    it('Rock moved two turns ago (not in previous turn) is eligible', () => {
      // previousTurnRockRecord does NOT contain Rock_D4
      // (the two-turns-ago record is already gone)
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Left)
        .withPreviousTurnRockMoved('Rock_E9', RockMoveType.Thrown)
        .build()

      // Rock_D4 not in previous turn record, should be allowed
      const result = moveSorcerer(state, 'Yellow_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(true)
    })
  })

  // -------------------------------------------------------------------
  // Multiple Rocks Tracked Independently
  // -------------------------------------------------------------------

  describe('Rule: Each Rock\'s movement state is tracked independently', () => {
    it('Only the specific Rock that was moved is restricted', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withRock('F4')
        .withRock('E9')
        .withCurrentPlayer(PlayerSeat.Bottom)
        .withPreviousTurnRockMoved('Rock_D4', RockMoveType.Thrown)
        .build()

      // Rock_D4 should be blocked
      const r1 = moveSorcerer(state, 'Red_Sorcerer', 'E6', 'Rock_D4')
      expect(r1.ok).toBe(false)

      // Rock_F4 should be allowed
      const r2 = moveSorcerer(state, 'Red_Sorcerer', 'E6', 'Rock_F4')
      expect(r2.ok).toBe(true)
    })

    it('Multiple Rocks moved in one turn are all restricted', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withRock('F4')
        .withCurrentPlayer(PlayerSeat.Bottom)
        .withPreviousTurnRockMoved('Rock_D4', RockMoveType.Pushed)
        .withPreviousTurnRockMoved('Rock_F4', RockMoveType.Pulled)
        .build()

      // Both should be blocked
      const r1 = moveSorcerer(state, 'Red_Sorcerer', 'E6', 'Rock_D4')
      expect(r1.ok).toBe(false)
      if (!r1.ok) expect(r1.error.message).toBe('Rock was moved during the previous turn')

      const r2 = moveSorcerer(state, 'Red_Sorcerer', 'E6', 'Rock_F4')
      expect(r2.ok).toBe(false)
      if (!r2.ok) expect(r2.error.message).toBe('Rock was moved during the previous turn')
    })
  })

  // -------------------------------------------------------------------
  // Current Turn vs Previous Turn Distinction
  // -------------------------------------------------------------------

  describe('Rule: Rocks moved during YOUR OWN current turn CAN be levitated', () => {
    it('Rock pushed by own Dwarf on move 1 can be levitated on move 2', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D5')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E5')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      // Move 1: Dwarf pushes Rock_E6 north
      const r1 = moveDwarf(state, 'Green_Dwarf', 'E6')
      expect(r1.ok).toBe(true)
      if (!r1.ok) return

      // Rock_E6 is now at E7, tracked as Pushed in currentTurnRockRecord
      expect(wasRockMovedThisTurn(r1.value, 'Rock_E6')).toBe(true)

      // Move 2: Sorcerer levitates the same Rock (should be allowed)
      const r2 = moveSorcerer(r1.value, 'Green_Sorcerer', 'D6', 'Rock_E6')
      expect(r2.ok).toBe(true)
    })

    it('Rock pulled by own Troll on move 1 can be levitated on move 2', () => {
      // Troll at E5, Rock at F5 (east of Troll, "behind" for westward movement).
      // Troll moves west E5->D5, pulling Rock_F5 to E5.
      // Sorcerer at D6 moves north D6->D7, Rock_F5 (at E5) moves north E5->E6.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D6')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('F5')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      // Move 1: Troll moves west E5->D5, pulling Rock_F5 to E5
      const r1 = moveTroll(state, 'Green_Troll', 'D5', 'Rock_F5')
      expect(r1.ok).toBe(true)
      if (!r1.ok) return

      expect(wasRockMovedThisTurn(r1.value, 'Rock_F5')).toBe(true)
      // Rock_F5 should now be at E5
      expect((r1.value.pieces.get('Rock_F5') as RockPiece).square).toBe('E5')

      // Move 2: Sorcerer levitates the same Rock (should be allowed)
      // Sorcerer moves north D6->D7, Rock moves north E5->E6
      const r2 = moveSorcerer(r1.value, 'Green_Sorcerer', 'D7', 'Rock_F5')
      expect(r2.ok).toBe(true)
    })

    it('Rock thrown by own Troll ends the turn so levitation is moot', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      const result = throwRock(state, 'W')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // After throw, the turn terminates and advances to the next player
      // The thrown Rock should now be in the previous turn record
      expect(result.value.turn.currentPlayerSeat).not.toBe(PlayerSeat.Top)
    })
  })

  // -------------------------------------------------------------------
  // State Reset Between Turns
  // -------------------------------------------------------------------

  describe('Rule: Rock movement tracking rolls forward each turn keeping only the previous turn\'s state', () => {
    it('Previous turn\'s movement state replaces the one before it', () => {
      // Turn N-1: Red moved Rock_F4 (but not Rock_D4)
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withRock('F4')
        .withCurrentPlayer(PlayerSeat.Left)
        .withPreviousTurnRockMoved('Rock_F4', RockMoveType.Pushed)
        .build()

      // Rock_D4 was moved two turns ago (not in previousTurnRockRecord) => eligible
      expect(isRockOnCooldown(state, 'Rock_D4')).toBe(false)

      // Rock_F4 was moved during previous turn => on cooldown
      expect(isRockOnCooldown(state, 'Rock_F4')).toBe(true)
    })

    it('After advanceTurn, current turn record becomes previous turn record', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .withCurrentTurnRockMoved('Rock_D4', RockMoveType.Pushed)
        .build()

      // Advance turn
      const newState = advanceTurn(state)

      // The current turn's Rock_D4 movement should now be in previousTurnRockRecord
      expect(newState.previousTurnRockRecord?.movedRocks).toContainEqual({
        rockId: 'Rock_D4',
        moveType: 'Pushed',
      })

      // The new current turn record should be empty
      expect(newState.currentTurnRockRecord.movedRocks).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------
  // Tracking Through Team Elimination
  // -------------------------------------------------------------------

  describe('Rule: Rock state tracking continues correctly when teams are eliminated', () => {
    it('Rock that killed a Sorcerer is tracked as moved in the next turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'B6')
        .withPiece(PlayerSeat.Left, PieceType.Troll, 'B4')
        .withPiece(PlayerSeat.Left, PieceType.Dwarf, 'B5')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      // Throw north - kills Red Sorcerer at E8
      const result = throwRock(state, 'N')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // Rock_E5 should be tracked as moved in the previous turn record
      const movedRocks = result.value.previousTurnRockRecord?.movedRocks ?? []
      expect(movedRocks).toContainEqual({
        rockId: 'Rock_E5',
        moveType: 'Thrown',
      })

      // Next player should not be able to levitate that Rock
      expect(isRockOnCooldown(result.value, 'Rock_E5')).toBe(true)
    })
  })

  // -------------------------------------------------------------------
  // Dwarf Push Tracking Multiple Rocks
  // -------------------------------------------------------------------

  describe('Rule: When a Dwarf push moves multiple Rocks in a chain all are tracked', () => {
    it('Dwarf pushes a chain containing two Rocks', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E3')
        .withRock('E4')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveDwarf(state, 'Green_Dwarf', 'E4')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const movedRocks = result.value.currentTurnRockRecord.movedRocks
      expect(movedRocks).toContainEqual({
        rockId: 'Rock_E4',
        moveType: 'Pushed',
      })
      expect(movedRocks).toContainEqual({
        rockId: 'Rock_E5',
        moveType: 'Pushed',
      })
    })
  })

  // -------------------------------------------------------------------
  // Levitation Eligibility Summary (Scenario Outline)
  // -------------------------------------------------------------------

  describe('Rule: Levitation eligibility follows precise rules based on who moved the Rock and when', () => {
    it.each([
      { mover: 'previous player', action: RockMoveType.Thrown, when: 'previous', result: 'rejected' },
      { mover: 'previous player', action: RockMoveType.Levitated, when: 'previous', result: 'rejected' },
      { mover: 'previous player', action: RockMoveType.Pushed, when: 'previous', result: 'rejected' },
      { mover: 'previous player', action: RockMoveType.Pulled, when: 'previous', result: 'rejected' },
    ])('$action by $mover during $when turn -> $result', ({ action, result: expected }) => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPreviousTurnRockMoved('Rock_D4', action)
        .build()

      const moveResult = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      if (expected === 'rejected') {
        expect(moveResult.ok).toBe(false)
      } else {
        expect(moveResult.ok).toBe(true)
      }
    })

    it('Rock not moved by anyone is eligible (allowed)', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E5')
        .withRock('D4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveSorcerer(state, 'Green_Sorcerer', 'E6', 'Rock_D4')
      expect(result.ok).toBe(true)
    })
  })
})
