import { describe, it, expect } from 'vitest'
import { resolveThrowTrajectory, throwRock, moveTroll } from '@/engine/troll'
import { PlayerSeat, PieceType, PlayerPiece } from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: SPLUT! Rule - Dwarf Crushed by Thrown Rock', () => {

  // -------------------------------------------------------------------
  // Core SPLUT! Mechanic
  // -------------------------------------------------------------------

  describe('Rule: Rock lands on Dwarf when next square is an Obstacle', () => {
    it('SPLUT! - Rock crushes Dwarf when next square is board border', () => {
      // E5 throw N: E6 empty, E7 (Dwarf), peek E8... actually let's use D7 area
      // D8 is valid, peek D9: |3-4|+|8-4| = 5 > 4, so D9 is OFF board
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'D8')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Throw west from E5: D5 (empty) ... need to set up along a row
      // Let me use a proper setup: Troll at E5 with Rock, Dwarf at E8, board edge after E9
      // Actually E9 IS valid, so peek from E8 -> E9 is valid and empty. Not SPLUT.
      // Let me use: Troll at D5, Rock at D5, Dwarf at D7, peek D8 is valid.
      // D8 IS valid. So we need: Dwarf where the next square is invalid.
      // Setup: throw from E5 going north: Dwarf at E9, peek beyond E9 = off board.
      // But E9 is the tip corner. Stepping N from E9 -> null. So SPLUT!

      const state2 = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E9')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state2, 'E5', 'N')
      expect(trajectory.hitType).toBe('splut')
      expect(trajectory.landingSquare).toBe('E9')
      expect(trajectory.splutDwarfId).toBe('Red_Dwarf')
    })

    it('SPLUT! - Rock crushes Dwarf when next square has a Troll', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E6')
        .withPiece(PlayerSeat.Left, PieceType.Troll, 'E7')
        .withRock('E3')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // E3 -> E4 (empty) -> E5 (empty) -> E6 (Dwarf), peek E7 (Troll, obstacle) -> SPLUT!
      const trajectory = resolveThrowTrajectory(state, 'E3', 'N')
      expect(trajectory.hitType).toBe('splut')
      expect(trajectory.landingSquare).toBe('E6')
      expect(trajectory.splutDwarfId).toBe('Red_Dwarf')
    })

    it('SPLUT! - Rock crushes Dwarf when next square has another Rock', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E6')
        .withRock('E3') // thrown Rock
        .withRock('E7') // obstacle Rock
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E3', 'N')
      expect(trajectory.hitType).toBe('splut')
      expect(trajectory.landingSquare).toBe('E6')
      expect(trajectory.splutDwarfId).toBe('Red_Dwarf')
    })
  })

  // -------------------------------------------------------------------
  // SPLUT! Does NOT Trigger
  // -------------------------------------------------------------------

  describe('Rule: SPLUT! does not trigger if square after Dwarf is empty or non-Obstacle', () => {
    it('No SPLUT! - Rock flies over Dwarf when next square is empty', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E5')
        .withRock('E3')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // E3 -> E4 (empty) -> E5 (Dwarf), peek E6 (empty) -> fly over
      const trajectory = resolveThrowTrajectory(state, 'E3', 'N')
      expect(trajectory.hitType).not.toBe('splut')
    })

    it('No SPLUT! - Rock flies over Dwarf when next square has a Sorcerer', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E5')
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'E6')
        .withRock('E3')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // E3 -> E4 (empty) -> E5 (Dwarf), peek E6 (Sorcerer, not obstacle) -> fly over -> E6 (Sorcerer, killed)
      const trajectory = resolveThrowTrajectory(state, 'E3', 'N')
      expect(trajectory.hitType).toBe('sorcerer')
      expect(trajectory.landingSquare).toBe('E6')
      expect(trajectory.killedSorcererId).toBe('Yellow_Sorcerer')
    })

    it('No SPLUT! - Rock flies over Dwarf when next square has another Dwarf', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E5')
        .withPiece(PlayerSeat.Left, PieceType.Dwarf, 'E6')
        .withRock('E3')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // E3 -> E4 (empty) -> E5 (Dwarf), peek E6 (Dwarf, not obstacle) -> fly over
      // -> E6 (Dwarf), peek E7 (empty) -> fly over
      const trajectory = resolveThrowTrajectory(state, 'E3', 'N')
      expect(trajectory.hitType).not.toBe('splut')
    })
  })

  // -------------------------------------------------------------------
  // Multiple Dwarves in Path
  // -------------------------------------------------------------------

  describe('Rule: SPLUT! only affects the Dwarf immediately before the Obstacle', () => {
    it('Only the last Dwarf before the Obstacle is killed by SPLUT!', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E5')
        .withPiece(PlayerSeat.Left, PieceType.Dwarf, 'E6')
        .withPiece(PlayerSeat.Right, PieceType.Troll, 'E7')
        .withRock('E3')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // E3 -> E4 (empty) -> E5 (Dwarf), peek E6 (Dwarf, not obstacle) -> fly over
      // -> E6 (Dwarf), peek E7 (Troll, obstacle) -> SPLUT! on E6
      const trajectory = resolveThrowTrajectory(state, 'E3', 'N')
      expect(trajectory.hitType).toBe('splut')
      expect(trajectory.landingSquare).toBe('E6')
      expect(trajectory.splutDwarfId).toBe('Yellow_Dwarf')
    })

    it('Three Dwarves in a row before an Obstacle - only the last is killed', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E4')
        .withPiece(PlayerSeat.Left, PieceType.Dwarf, 'E5')
        .withPiece(PlayerSeat.Right, PieceType.Dwarf, 'E6')
        .withRock('E2') // thrown Rock
        .withRock('E7') // obstacle Rock
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // E2 -> E3 (empty) -> E4 (Dwarf), peek E5 (Dwarf) -> fly over
      // -> E5 (Dwarf), peek E6 (Dwarf) -> fly over
      // -> E6 (Dwarf), peek E7 (Rock, obstacle) -> SPLUT! on E6
      const trajectory = resolveThrowTrajectory(state, 'E2', 'N')
      expect(trajectory.hitType).toBe('splut')
      expect(trajectory.landingSquare).toBe('E6')
      expect(trajectory.splutDwarfId).toBe('Blue_Dwarf')
    })
  })

  // -------------------------------------------------------------------
  // SPLUT! Combined with Sorcerer Kill
  // -------------------------------------------------------------------

  describe('Rule: A single throw resolves one collision at a time following trajectory order', () => {
    it('SPLUT! kills Dwarf and Rock stays - does not continue to a Sorcerer behind', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E6')
        .withPiece(PlayerSeat.Left, PieceType.Troll, 'E7')
        .withPiece(PlayerSeat.Right, PieceType.Sorcerer, 'E8')
        .withRock('E3')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const trajectory = resolveThrowTrajectory(state, 'E3', 'N')
      expect(trajectory.hitType).toBe('splut')
      expect(trajectory.landingSquare).toBe('E6')
      // Sorcerer at E8 should NOT be affected
      expect(trajectory.killedSorcererId).toBeUndefined()
    })
  })

  // -------------------------------------------------------------------
  // Bug 3 Regression: Troll occupancy preserved after throw
  // -------------------------------------------------------------------

  describe('Regression: Throwing Troll remains on board after throw (Bug 3)', () => {
    it('Troll stays in squareOccupancy after SPLUT! throw', () => {
      // Full moveTroll -> throwRock flow
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E9')  // board edge behind
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Move Troll onto Rock
      const moveResult = moveTroll(state, 'Green_Troll', 'E6')
      expect(moveResult.ok).toBe(true)
      if (!moveResult.ok) return

      expect(moveResult.value.turn.pendingThrow).toBe(true)

      // Throw Rock north — Dwarf at E9, board edge after → SPLUT!
      const throwResult = throwRock(moveResult.value, 'N')
      expect(throwResult.ok).toBe(true)
      if (!throwResult.ok) return

      const finalState = throwResult.value

      // SPLUT! should have occurred
      expect(finalState.lastSplutSquare).toBe('E9')

      // The SPLUT!-ed Dwarf should be dead
      const redDwarf = finalState.pieces.get('Red_Dwarf') as PlayerPiece
      expect(redDwarf.alive).toBe(false)

      // The throwing Troll MUST still be on E6 in squareOccupancy
      const trollPiece = finalState.pieces.get('Green_Troll') as PlayerPiece
      expect(trollPiece.square).toBe('E6')
      expect(trollPiece.alive).toBe(true)
      expect(finalState.squareOccupancy.get('E6')).toBe('Green_Troll')

      // All Green team pieces must still be alive
      const greenSorcerer = finalState.pieces.get('Green_Sorcerer') as PlayerPiece
      expect(greenSorcerer.alive).toBe(true)
      const greenDwarf = finalState.pieces.get('Green_Dwarf') as PlayerPiece
      expect(greenDwarf.alive).toBe(true)

      // Red team should NOT be eliminated (only Dwarf died, not Sorcerer)
      const redSorcerer = finalState.pieces.get('Red_Sorcerer') as PlayerPiece
      expect(redSorcerer.alive).toBe(true)
      const redPlayer = finalState.players.find(p => p.seat === PlayerSeat.Bottom)
      expect(redPlayer?.isEliminated).toBe(false)
    })

    it('Troll stays in squareOccupancy after obstacle throw (no SPLUT)', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D3')
        .withRock('E6')
        .withRock('E9') // obstacle Rock
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const moveResult = moveTroll(state, 'Green_Troll', 'E6')
      expect(moveResult.ok).toBe(true)
      if (!moveResult.ok) return

      const throwResult = throwRock(moveResult.value, 'N')
      expect(throwResult.ok).toBe(true)
      if (!throwResult.ok) return

      const finalState = throwResult.value

      // Troll must remain at E6
      expect(finalState.squareOccupancy.get('E6')).toBe('Green_Troll')
      const troll = finalState.pieces.get('Green_Troll') as PlayerPiece
      expect(troll.square).toBe('E6')
      expect(troll.alive).toBe(true)

      // Rock should have stopped before the obstacle Rock at E9
      const thrownRock = finalState.pieces.get('Rock_E6')
      expect(thrownRock).toBeDefined()
      expect(thrownRock!.square).toBe('E8')
      expect(finalState.squareOccupancy.get('E8')).toBe('Rock_E6')
    })

    it('Troll stays in squareOccupancy after Sorcerer-kill throw', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D3')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const moveResult = moveTroll(state, 'Green_Troll', 'E6')
      expect(moveResult.ok).toBe(true)
      if (!moveResult.ok) return

      const throwResult = throwRock(moveResult.value, 'N')
      expect(throwResult.ok).toBe(true)
      if (!throwResult.ok) return

      const finalState = throwResult.value

      // Troll must remain at E6
      expect(finalState.squareOccupancy.get('E6')).toBe('Green_Troll')
      const troll = finalState.pieces.get('Green_Troll') as PlayerPiece
      expect(troll.alive).toBe(true)

      // Red team should be eliminated (Sorcerer killed)
      const redPlayer = finalState.players.find(p => p.seat === PlayerSeat.Bottom)
      expect(redPlayer?.isEliminated).toBe(true)

      // But Green team must be fully intact
      const greenTroll = finalState.pieces.get('Green_Troll') as PlayerPiece
      const greenSorcerer = finalState.pieces.get('Green_Sorcerer') as PlayerPiece
      const greenDwarf = finalState.pieces.get('Green_Dwarf') as PlayerPiece
      expect(greenTroll.alive).toBe(true)
      expect(greenSorcerer.alive).toBe(true)
      expect(greenDwarf.alive).toBe(true)
    })

    it('Troll stays in squareOccupancy when Rock does not move (blocked in all directions)', () => {
      // Rock at E5 with Troll, obstacle in the throw direction
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6') // obstacle N
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      // Throw north — immediately blocked by Troll on E6
      const throwResult = throwRock(state, 'N')
      expect(throwResult.ok).toBe(true)
      if (!throwResult.ok) return

      // Rock didn't move — Troll and Rock both still at E5
      // squareOccupancy should have the Troll (since the Rock didn't leave)
      expect(throwResult.value.squareOccupancy.has('E5')).toBe(true)
    })
  })
})
