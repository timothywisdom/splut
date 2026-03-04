import { describe, it, expect } from 'vitest'
import {
  planAITurn,
  evaluateTier4,
  evaluateTier5,
} from '@/engine/ai'
import {
  PlayerSeat,
  PieceType,
  SquareKey,
} from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: AI Anti-Oscillation (Bug #7)', () => {

  // ===================================================================
  // RULE: AI must not move a piece back to a square it already occupied
  // ===================================================================

  describe('Rule: The AI must not move a piece back to a square it already occupied during the same turn', () => {

    it('AI Troll does not oscillate between two squares in a 2-move turn', () => {
      // Reproduce the exact bug scenario:
      // Red Troll at D2, Rocks at E1 (dist 2) and A5 (dist 6).
      // Without the fix, AI would: D2→D3 (approach A5), D3→D2 (approach E1).
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'F8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E8')
        .withRock('E1')
        .withRock('A5')
        .withRock('E9')
        .withRock('I5')
        .withCurrentPlayer(PlayerSeat.Bottom, 0)
        .withTurnIndex(1) // 2 moves
        .build()

      const moves = planAITurn(state)
      expect(moves.length).toBe(2)

      // The Troll should NOT end up back at D2
      const trollMoves = moves.filter(m => m.pieceId === 'Red_Troll')
      if (trollMoves.length >= 2) {
        // The second move should not return to the starting square
        expect(trollMoves[1].targetSquare).not.toBe('D2')
      }
    })

    it('AI Troll does not oscillate between two squares in a 3-move turn', () => {
      // Same scenario with 3 moves
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'F8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E8')
        .withRock('E1')
        .withRock('A5')
        .withRock('E9')
        .withRock('I5')
        .withCurrentPlayer(PlayerSeat.Bottom, 0)
        .withTurnIndex(2) // 3 moves
        .build()

      const moves = planAITurn(state)
      expect(moves.length).toBe(3)

      // Collect all Troll target squares
      const trollTargets = moves
        .filter(m => m.pieceId === 'Red_Troll')
        .map(m => m.targetSquare)

      // The Troll should NOT return to D2 during the turn
      expect(trollTargets).not.toContain('D2')
    })

    it('AI visited-square tracking prevents backtracking', () => {
      // Troll at E5, Rock at A5 (closest that the Troll can approach).
      // Without visited tracking, the Troll could oscillate.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('A5')
        .withRock('I5')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      const moves = planAITurn(state)
      expect(moves.length).toBe(3)

      // Collect all squares visited by the Troll
      const trollSquares = new Set<SquareKey>()
      trollSquares.add('E5') // starting square
      for (const move of moves) {
        if (move.pieceId === 'Green_Troll') {
          trollSquares.add(move.targetSquare)
        }
      }

      // Each target should be unique (no backtracking)
      const trollTargets = moves
        .filter(m => m.pieceId === 'Green_Troll')
        .map(m => m.targetSquare)
      const uniqueTargets = new Set(trollTargets)
      expect(uniqueTargets.size).toBe(trollTargets.length)
    })

    it('AI uses all 3 moves making net forward progress', () => {
      // Starting position for a 2-player game
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E8')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withRock('E9')
        .withRock('E1')
        .withRock('A5')
        .withRock('I5')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      const moves = planAITurn(state)
      expect(moves.length).toBe(3)

      // All moves should target distinct squares
      const targets = moves.map(m => m.targetSquare)
      const uniqueTargets = new Set(targets)
      expect(uniqueTargets.size).toBe(targets.length)
    })
  })

  // ===================================================================
  // RULE: visited squares filter works correctly in tier evaluators
  // ===================================================================

  describe('Rule: Tier evaluators respect visited squares', () => {

    it('evaluateTier4 excludes visited squares from approach moves', () => {
      // Troll at D3, Rock at E1. D2 gets closer but is in visited set.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D3')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E1')
        .withRock('A5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Without visited set, should approach E1 via D2
      const moveNoFilter = evaluateTier4(state)
      // D2 is occupied by Bottom Troll, so Troll can't move there anyway.
      // Let's use a cleaner setup.

      const state2 = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E7')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Without visited: Troll at E4, Rock at E7 (dist 3). E5 gets closer (dist 2).
      const move1 = evaluateTier4(state2)
      expect(move1).not.toBeNull()
      expect(move1!.targetSquare).toBe('E5')

      // With E5 in visited set: should pick another approach direction
      const visited = new Set<SquareKey>(['E5' as SquareKey])
      const move2 = evaluateTier4(state2, visited)
      expect(move2).not.toBeNull()
      expect(move2!.targetSquare).not.toBe('E5')
    })

    it('evaluateTier5 excludes visited squares from fallback moves', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Without visited: first alphabetical target D5
      const move1 = evaluateTier5(state)
      expect(move1).not.toBeNull()
      expect(move1!.targetSquare).toBe('D5')

      // With D5 in visited: should pick next target
      const visited = new Set<SquareKey>(['D5' as SquareKey])
      const move2 = evaluateTier5(state, visited)
      expect(move2).not.toBeNull()
      expect(move2!.targetSquare).not.toBe('D5')
    })
  })
})
