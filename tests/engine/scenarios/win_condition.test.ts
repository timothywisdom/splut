import { describe, it, expect } from 'vitest'
import { moveTroll, throwRock } from '@/engine/troll'
import { eliminateTeam, checkWinCondition } from '@/engine/win'
import { PlayerSeat, PieceType, PlayerPiece, GamePhase } from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: Win Condition and Team Elimination', () => {

  // -------------------------------------------------------------------
  // Sorcerer Death Triggers Team Elimination
  // -------------------------------------------------------------------

  describe('Rule: When a Sorcerer is killed the entire team is removed', () => {
    it('Killing a Sorcerer removes all three team pieces', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E7')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D6')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'F6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const newState = eliminateTeam(state, PlayerSeat.Bottom)

      // All Red pieces should be dead
      const redSorcerer = newState.pieces.get('Red_Sorcerer') as PlayerPiece
      const redTroll = newState.pieces.get('Red_Troll') as PlayerPiece
      const redDwarf = newState.pieces.get('Red_Dwarf') as PlayerPiece

      expect(redSorcerer.alive).toBe(false)
      expect(redTroll.alive).toBe(false)
      expect(redDwarf.alive).toBe(false)

      // Squares should be freed
      expect(newState.squareOccupancy.has('E7')).toBe(false)
      expect(newState.squareOccupancy.has('D6')).toBe(false)
      expect(newState.squareOccupancy.has('F6')).toBe(false)
    })

    it('Rock stays on the square where the Sorcerer was killed', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      const result = throwRock(state, 'N')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // Rock should be at E8 (where Sorcerer was)
      const rockOnE8 = result.value.squareOccupancy.get('E8')
      expect(rockOnE8).toBeDefined()
      expect(result.value.pieces.get(rockOnE8!)?.type).toBe(PieceType.Rock)
    })
  })

  // -------------------------------------------------------------------
  // Win Detection
  // -------------------------------------------------------------------

  describe('Rule: The last Sorcerer standing wins the game', () => {
    it('Game ends when only one Sorcerer remains in a 2-player game', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      const result = throwRock(state, 'N')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.phase).toBe(GamePhase.Over)
      expect(result.value.winner).toBe(PlayerSeat.Top)
    })

    it('Game does not end when 2 or more Sorcerers remain', () => {
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

      const result = throwRock(state, 'N')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // Red eliminated, but Green and Yellow remain
      expect(result.value.phase).toBe(GamePhase.Playing)
      expect(result.value.winner).toBeNull()
      expect(result.value.activePlayers).toContain(PlayerSeat.Top)
      expect(result.value.activePlayers).toContain(PlayerSeat.Left)
    })
  })

  // -------------------------------------------------------------------
  // Self-elimination
  // -------------------------------------------------------------------

  describe('Rule: Self-elimination', () => {
    it('Self-elimination in a 2-player game results in opponent winning', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      // Throw north - hits own Sorcerer at E8
      const result = throwRock(state, 'N')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.phase).toBe(GamePhase.Over)
      expect(result.value.winner).toBe(PlayerSeat.Bottom)
    })
  })

  // -------------------------------------------------------------------
  // Rocks Persist After Elimination
  // -------------------------------------------------------------------

  describe('Rule: All 4 Rocks remain on the board', () => {
    it('Rocks remain after a team is eliminated', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withRock('E9')
        .withRock('A5')
        .withRock('I5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      const result = throwRock(state, 'N')
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const rockCount = Array.from(result.value.pieces.values())
        .filter(p => p.type === PieceType.Rock)
        .length
      expect(rockCount).toBe(4)
    })
  })
})
