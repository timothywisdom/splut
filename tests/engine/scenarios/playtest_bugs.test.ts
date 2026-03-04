import { describe, it, expect } from 'vitest'
import { throwRock, resolveThrowTrajectory, moveTroll } from '@/engine/troll'
import { moveDwarf } from '@/engine/dwarf'
import { PlayerSeat, PieceType, PlayerPiece, RockPiece } from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'
import { ALL_VALID_SQUARES } from '@/engine/board'

describe('Feature: Playtest Bug Fixes', () => {

  // -------------------------------------------------------------------
  // Bug #11: Rock disappears when thrown off diamond edge
  // -------------------------------------------------------------------

  describe('Rule: A thrown Rock that would leave the diamond stays on its current square', () => {

    it('Rock thrown East from G7 stays at G7 because H7 is off-diamond', () => {
      // G7 is valid: |6-4|+|6-4| = 4. H7 is invalid: |7-4|+|6-4| = 5 > 4.
      expect(ALL_VALID_SQUARES.has('G7')).toBe(true)
      expect(ALL_VALID_SQUARES.has('H7')).toBe(false)

      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'G7')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withRock('G7') // Rock on Troll square
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      // Throw East — H7 is off-diamond, so Rock should not move
      const trajectory = resolveThrowTrajectory(state, 'G7', 'E')
      expect(trajectory.landingSquare).toBe('G7')
      expect(trajectory.hitType).toBe('no_move')

      // Full throw execution should succeed and Rock stays at G7
      const result = throwRock(state, 'E')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const rock = Array.from(result.value.pieces.values()).find(
        p => p.type === PieceType.Rock && p.square === 'G7'
      )
      expect(rock).toBeDefined()
      expect(rock!.square).toBe('G7')
    })

    it('Rock thrown North from I5 stays at I5 because I6 is off-diamond', () => {
      // I5 is valid: |8-4|+|4-4| = 4. I6 is invalid: |8-4|+|5-4| = 5 > 4.
      expect(ALL_VALID_SQUARES.has('I5')).toBe(true)
      expect(ALL_VALID_SQUARES.has('I6')).toBe(false)

      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'I5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withRock('I5') // Rock on Troll square
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      // Throw North — I6 is off-diamond, so Rock should not move
      const trajectory = resolveThrowTrajectory(state, 'I5', 'N')
      expect(trajectory.landingSquare).toBe('I5')
      expect(trajectory.hitType).toBe('no_move')

      // Full throw execution should succeed and Rock stays at I5
      const result = throwRock(state, 'N')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const rock = Array.from(result.value.pieces.values()).find(
        p => p.type === PieceType.Rock && p.square === 'I5'
      )
      expect(rock).toBeDefined()
      expect(rock!.square).toBe('I5')
    })

    it('Rock thrown inward from diamond-edge square G7 moves normally toward center', () => {
      // G7 is on the edge. Throwing West goes toward F7 (valid: |5-4|+|6-4| = 3).
      expect(ALL_VALID_SQUARES.has('G7')).toBe(true)
      expect(ALL_VALID_SQUARES.has('F7')).toBe(true)

      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'G7')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withRock('G7') // Rock on Troll square
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      // Throw West — should travel inward across the board
      const trajectory = resolveThrowTrajectory(state, 'G7', 'W')
      expect(trajectory.hitType).not.toBe('no_move')
      expect(trajectory.landingSquare).not.toBe('G7')

      // Full throw execution should move the Rock away from G7
      const result = throwRock(state, 'W')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // Rock should no longer be at G7
      const rockAtG7 = Array.from(result.value.pieces.values()).find(
        p => p.type === PieceType.Rock && p.square === 'G7'
      )
      expect(rockAtG7).toBeUndefined()

      // Troll should still be at G7
      const troll = result.value.pieces.get('Green_Troll') as PlayerPiece
      expect(troll.square).toBe('G7')
      expect(troll.alive).toBe(true)
      expect(result.value.squareOccupancy.get('G7')).toBe('Green_Troll')
    })
  })

  // -------------------------------------------------------------------
  // Bug #12: Rock disappears after pull-back + Dwarf push
  // -------------------------------------------------------------------

  describe('Rule: After pull-back, the pulled Rock has valid occupancy', () => {

    it('Pulled Rock retains occupancy and can be pushed by Dwarf', () => {
      // Troll at E8, Rock at E9. Troll moves south to E7 with pull-back.
      // Rock should end up at E8. Then Dwarf at D8 pushes Rock to F8.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D7')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E9')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Step 1: Troll pull-back (E8 → E7, pulling Rock E9 → E8)
      const pullResult = moveTroll(state, 'Green_Troll', 'E7', 'Rock_E9')
      expect(pullResult.ok).toBe(true)
      if (!pullResult.ok) return

      const afterPull = pullResult.value

      // Verify: Rock should be at E8 with proper occupancy
      const rock = afterPull.pieces.get('Rock_E9') as RockPiece
      expect(rock.square).toBe('E8')
      expect(afterPull.squareOccupancy.get('E8')).toBe('Rock_E9')

      // Verify: Troll should be at E7
      const troll = afterPull.pieces.get('Green_Troll') as PlayerPiece
      expect(troll.square).toBe('E7')
      expect(afterPull.squareOccupancy.get('E7')).toBe('Green_Troll')

      // Step 2: Dwarf pushes Rock from E8 to F8
      const pushResult = moveDwarf(afterPull, 'Green_Dwarf', 'E8')
      expect(pushResult.ok).toBe(true)
      if (!pushResult.ok) return

      const afterPush = pushResult.value

      // Verify: Rock should be at F8
      const rockAfterPush = afterPush.pieces.get('Rock_E9') as RockPiece
      expect(rockAfterPush.square).toBe('F8')
      expect(afterPush.squareOccupancy.get('F8')).toBe('Rock_E9')

      // Verify: Dwarf should be at E8
      const dwarf = afterPush.pieces.get('Green_Dwarf') as PlayerPiece
      expect(dwarf.square).toBe('E8')
      expect(afterPush.squareOccupancy.get('E8')).toBe('Green_Dwarf')
    })

    it('Pull-back does not corrupt occupancy - both pieces have correct entries', () => {
      // Troll at E5, Rock at E6 (south of Troll). Troll moves north to E4.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D7')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'D8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const result = moveTroll(state, 'Green_Troll', 'E4', 'Rock_E6')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const newState = result.value

      // Rock should be at E5 (Troll's old square)
      expect((newState.pieces.get('Rock_E6') as RockPiece).square).toBe('E5')
      expect(newState.squareOccupancy.get('E5')).toBe('Rock_E6')

      // Troll should be at E4
      expect((newState.pieces.get('Green_Troll') as PlayerPiece).square).toBe('E4')
      expect(newState.squareOccupancy.get('E4')).toBe('Green_Troll')

      // E6 should be empty (rock moved away)
      expect(newState.squareOccupancy.has('E6')).toBe(false)
    })
  })
})
