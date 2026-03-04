import { describe, it, expect } from 'vitest'
import { moveTroll, throwRock, resolveThrowTrajectory } from '@/engine/troll'
import { PlayerSeat, PieceType, PlayerPiece, RockPiece, GamePhase } from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: Troll Throw', () => {

  // -------------------------------------------------------------------
  // Mandatory Throw Trigger
  // -------------------------------------------------------------------

  describe('Rule: When a Troll ends its move on a Rock it MUST throw immediately', () => {
    it('Troll landing on a Rock must throw it', () => {
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

    it('Throwing a Rock immediately ends the player\'s entire turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      // Move Troll onto Rock
      const moveResult = moveTroll(state, 'Green_Troll', 'E6')
      expect(moveResult.ok).toBe(true)
      if (!moveResult.ok) return

      // Throw
      const throwResult = throwRock(moveResult.value, 'S')
      expect(throwResult.ok).toBe(true)
      if (!throwResult.ok) return

      // Turn should have advanced to next player
      expect(throwResult.value.turn.currentPlayerSeat).not.toBe(PlayerSeat.Top)
    })
  })

  // -------------------------------------------------------------------
  // Throw Direction
  // -------------------------------------------------------------------

  describe('Rule: The Troll may throw the Rock in any cardinal direction', () => {
    it.each(['N', 'S', 'E', 'W'] as const)('Troll throws Rock %s', (direction) => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withRock('E5') // Rock on same square as Troll
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .withPendingThrow()
        .build()

      const result = throwRock(state, direction)
      expect(result.ok).toBe(true)
    })
  })

  // -------------------------------------------------------------------
  // Rock Trajectory - Obstacles (Stops Before)
  // -------------------------------------------------------------------

  describe('Rule: A thrown Rock stops on the square before an Obstacle', () => {
    it('Rock stops before hitting the board border', () => {
      // E5 -> throw north. E9 is the corner, E8 is the last valid before E9
      // Actually E9 IS valid (the corner). Board edge is beyond E9.
      // But from E5 going N: E6, E7, E8, E9, then off board.
      // If E8 is the "row 8" square... let's check: from E5 throwing N toward E9
      // Actually let me use a setup where the board edge matters
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D7')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withRock('D7') // Rock on Troll square
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      // From D7 going N: D8 is valid. D9 is NOT valid (|3-4|+|8-4| = 5 > 4).
      // So Rock should stop at D8.
      const trajectory = resolveThrowTrajectory(state, 'D7', 'N')
      expect(trajectory.landingSquare).toBe('D8')
    })

    it('Rock stops before hitting another Troll', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E8')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E5', 'N')
      expect(trajectory.landingSquare).toBe('E7')
      expect(trajectory.hitType).toBe('obstacle')
    })

    it('Rock stops before hitting another Rock', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('E5') // thrown rock
        .withRock('E8')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E5', 'N')
      expect(trajectory.landingSquare).toBe('E7')
      expect(trajectory.hitType).toBe('obstacle')
    })

    it('Rock stops immediately if obstacle is on the adjacent square', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('E5')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E5', 'N')
      expect(trajectory.landingSquare).toBe('E5')
      expect(trajectory.hitType).toBe('obstacle')
    })
  })

  // -------------------------------------------------------------------
  // Rock Trajectory - Targets (Sorcerer Kill)
  // -------------------------------------------------------------------

  describe('Rule: A thrown Rock lands on a Sorcerer\'s square and kills it', () => {
    it('Rock kills an enemy Sorcerer by landing on it', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E5', 'N')
      expect(trajectory.landingSquare).toBe('E8')
      expect(trajectory.hitType).toBe('sorcerer')
      expect(trajectory.killedSorcererId).toBe('Red_Sorcerer')
    })

    it('Rock kills the current player\'s own Sorcerer if in the path', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E5', 'N')
      expect(trajectory.landingSquare).toBe('E8')
      expect(trajectory.hitType).toBe('sorcerer')
      expect(trajectory.killedSorcererId).toBe('Green_Sorcerer')
    })

    it('Rock lands on the first Sorcerer in its path', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E7')
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'E8')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E5', 'N')
      expect(trajectory.landingSquare).toBe('E7')
      expect(trajectory.hitType).toBe('sorcerer')
      expect(trajectory.killedSorcererId).toBe('Red_Sorcerer')
    })
  })

  // -------------------------------------------------------------------
  // Rock Trajectory - Dwarves (Flies Over)
  // -------------------------------------------------------------------

  describe('Rule: A thrown Rock flies over Dwarves without affecting them', () => {
    it('Rock flies over a Dwarf and continues', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E6')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // From E5 N: E6 (Dwarf) -> peek E7 (empty) -> fly over -> E7, E8, E9 (board edge after)
      const trajectory = resolveThrowTrajectory(state, 'E5', 'N')
      expect(trajectory.hitType).toBe('board_edge')
      // Rock should end at E9 (last valid square)
      expect(trajectory.landingSquare).toBe('E9')
    })

    it('Rock flies over multiple Dwarves', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E6')
        .withPiece(PlayerSeat.Left, PieceType.Dwarf, 'E7')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E5', 'N')
      // Both dwarves are flown over since E8 and then E9 are valid
      expect(trajectory.landingSquare).toBe('E9')
    })

    it('Rock flies over a Dwarf and hits an Obstacle after a gap', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E4')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withRock('E3')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // E3 -> E4 (Dwarf, peek E5 empty, fly over) -> E5 (empty) -> E6 (Troll, obstacle, stop at E5)
      const trajectory = resolveThrowTrajectory(state, 'E3', 'N')
      expect(trajectory.landingSquare).toBe('E5')
      expect(trajectory.hitType).toBe('obstacle')
    })
  })

  // -------------------------------------------------------------------
  // Throw Edge Cases
  // -------------------------------------------------------------------

  describe('Rule: Special throw trajectory edge cases', () => {
    it('Rock thrown into an immediately adjacent Obstacle does not move', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E5', 'N')
      expect(trajectory.landingSquare).toBe('E5')
      expect(trajectory.hitType).toBe('obstacle')
    })
  })
})
