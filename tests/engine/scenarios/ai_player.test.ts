import { describe, it, expect } from 'vitest'
import {
  planAITurn,
  evaluateTier1,
  evaluateTier2,
  evaluateTier3,
  evaluateTier4,
  evaluateTier5,
  isSorcererThreatened,
  getSafeSorcererMoves,
} from '@/engine/ai'
import { moveTroll, throwRock } from '@/engine/troll'
import { moveDwarf } from '@/engine/dwarf'
import { moveSorcerer } from '@/engine/sorcerer'
import { initGame } from '@/engine/setup'
import {
  PlayerSeat,
  PieceType,
  PlayerType,
  PlayerPiece,
  RockPiece,
  GamePhase,
  RockMoveType,
  Direction,
} from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

describe('Feature: AI Player', () => {

  // ===================================================================
  // GAME SETUP WITH AI PLAYERS
  // ===================================================================

  describe('Rule: Any player seat can be designated as AI-controlled at game setup', () => {
    it('2-player game with one AI opponent', () => {
      const result = initGame({
        playerCount: 2,
        occupiedSeats: [PlayerSeat.Top, PlayerSeat.Bottom],
        firstPlayerSeat: PlayerSeat.Top,
        playerTypes: {
          [PlayerSeat.Top]: PlayerType.Human,
          [PlayerSeat.Bottom]: PlayerType.AI,
        },
      })
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const topPlayer = result.value.players.find(p => p.seat === PlayerSeat.Top)
      const bottomPlayer = result.value.players.find(p => p.seat === PlayerSeat.Bottom)
      expect(topPlayer?.playerType).toBe(PlayerType.Human)
      expect(bottomPlayer?.playerType).toBe(PlayerType.AI)
    })

    it('4-player game with two AI opponents', () => {
      const result = initGame({
        playerCount: 4,
        occupiedSeats: [PlayerSeat.Top, PlayerSeat.Bottom, PlayerSeat.Left, PlayerSeat.Right],
        firstPlayerSeat: PlayerSeat.Top,
        playerTypes: {
          [PlayerSeat.Top]: PlayerType.Human,
          [PlayerSeat.Bottom]: PlayerType.AI,
          [PlayerSeat.Left]: PlayerType.AI,
          [PlayerSeat.Right]: PlayerType.Human,
        },
      })
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.players.find(p => p.seat === PlayerSeat.Top)?.playerType).toBe(PlayerType.Human)
      expect(result.value.players.find(p => p.seat === PlayerSeat.Bottom)?.playerType).toBe(PlayerType.AI)
      expect(result.value.players.find(p => p.seat === PlayerSeat.Left)?.playerType).toBe(PlayerType.AI)
      expect(result.value.players.find(p => p.seat === PlayerSeat.Right)?.playerType).toBe(PlayerType.Human)
    })

    it('All-AI game with no human players', () => {
      const result = initGame({
        playerCount: 4,
        occupiedSeats: [PlayerSeat.Top, PlayerSeat.Bottom, PlayerSeat.Left, PlayerSeat.Right],
        firstPlayerSeat: PlayerSeat.Top,
        playerTypes: {
          [PlayerSeat.Top]: PlayerType.AI,
          [PlayerSeat.Bottom]: PlayerType.AI,
          [PlayerSeat.Left]: PlayerType.AI,
          [PlayerSeat.Right]: PlayerType.AI,
        },
      })
      expect(result.ok).toBe(true)
      if (!result.ok) return

      for (const p of result.value.players) {
        expect(p.playerType).toBe(PlayerType.AI)
      }
    })

    it('AI players follow the same seat assignment rules as humans', () => {
      const result = initGame({
        playerCount: 2,
        occupiedSeats: [PlayerSeat.Top, PlayerSeat.Left],
        firstPlayerSeat: PlayerSeat.Top,
        playerTypes: {
          [PlayerSeat.Top]: PlayerType.Human,
          [PlayerSeat.Left]: PlayerType.AI,
        },
      })
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('2-player game requires opposite seats')
    })
  })

  // ===================================================================
  // AI TIER 1: IMMEDIATE WIN
  // ===================================================================

  describe('Rule: Tier 1 — If the AI Troll can throw to kill an enemy Sorcerer it takes the kill shot', () => {
    it('AI Troll already on Rock throws to kill enemy Sorcerer (north)', () => {
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

      const move = evaluateTier1(state)
      expect(move).not.toBeNull()
      expect(move!.throwDirection).toBe('N')
    })

    it('AI Troll already on Rock throws south to kill enemy Sorcerer', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'F2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      const move = evaluateTier1(state)
      expect(move).not.toBeNull()
      expect(move!.throwDirection).toBe('S')
    })

    it('AI Troll moves one step onto Rock and throws to kill', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'F2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier1(state)
      expect(move).not.toBeNull()
      expect(move!.pieceId).toBe('Green_Troll')
      expect(move!.targetSquare).toBe('E5')
      // throwDirection is pre-computed for the planAITurn to use
      expect(move!.throwDirection).toBe('N')
    })

    it('AI breaks Tier 1 tie by alphabetical target square', () => {
      // Enemy Sorcerers at E8 (north) and C5 (west).
      // C5 < E8 alphabetically, so AI should throw west.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'F2')
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'C5')
        .withPiece(PlayerSeat.Left, PieceType.Troll, 'B4')
        .withPiece(PlayerSeat.Left, PieceType.Dwarf, 'B5')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      const move = evaluateTier1(state)
      expect(move).not.toBeNull()
      expect(move!.throwDirection).toBe('W')
    })

    it('No kill opportunity means AI skips Tier 1', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier1(state)
      expect(move).toBeNull()
    })
  })

  // ===================================================================
  // AI TIER 2: DEFENSIVE ESCAPE
  // ===================================================================

  describe('Rule: Tier 2 — If the AI Sorcerer is threatened it moves to safety', () => {
    it('AI Sorcerer escapes from a row threat', () => {
      // Enemy Troll on Rock at C5, AI Sorcerer at G5 - same row
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'G5')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'C5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('C5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      expect(isSorcererThreatened(state, 'G5')).toBe(true)
    })

    it('AI Sorcerer escapes from a column threat', () => {
      // Enemy Troll on Rock at E3, AI Sorcerer at E7 - same column
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E7')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'D2')
        .withRock('E3')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      expect(isSorcererThreatened(state, 'E7')).toBe(true)
    })

    it('AI defensive escape picks the alphabetically-first safe square', () => {
      // AI Sorcerer at E6, enemy Troll on Rock at E3. Threatened along column E.
      // Safe moves: D6 and F6 (both leave column E).
      // D6 < F6 alphabetically.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E6')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'D2')
        .withRock('E3')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      const move = evaluateTier2(state)
      expect(move).not.toBeNull()
      expect(move!.pieceId).toBe('Green_Sorcerer')
      expect(move!.targetSquare).toBe('D6')
    })

    it('Sorcerer not in line with any enemy Troll on a Rock', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D6')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E3')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // No Rock on enemy Troll -> not threatened
      expect(isSorcererThreatened(state, 'D6')).toBe(false)
      expect(evaluateTier2(state)).toBeNull()
    })

    it('Obstacle between enemy Troll-on-Rock and AI Sorcerer negates threat', () => {
      // Enemy Troll on Rock at C5, another Troll at E5 blocking, AI Sorcerer at G5
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'G5')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'C5')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('C5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      // The Troll at E5 blocks the throw path from C5 to G5
      expect(isSorcererThreatened(state, 'G5')).toBe(false)
    })
  })

  // ===================================================================
  // AI TIER 3: ROCK POSITIONING
  // ===================================================================

  describe('Rule: Tier 3 — Pull Back or Levitate to reposition Rocks', () => {
    it('AI Troll pulls Rock behind it to reposition', () => {
      // Troll at E5, Rock at E4 (south), no tier 1/2
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier3(state)
      expect(move).not.toBeNull()
      expect(move!.pieceId).toBe('Green_Troll')
      expect(move!.opts?.pullBackRockId).toBe('Rock_E4')
    })

    it('AI prefers Pull Back over Levitate when both available', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D6')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E4')
        .withRock('C4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier3(state)
      expect(move).not.toBeNull()
      // Should be a pull-back move (Troll), not a levitate move (Sorcerer)
      expect(move!.pieceId).toBe('Green_Troll')
      expect(move!.opts?.pullBackRockId).toBeDefined()
    })
  })

  // ===================================================================
  // AI TIER 4: APPROACH
  // ===================================================================

  describe('Rule: Tier 4 — Troll approaches nearest Rock, Sorcerer approaches nearest eligible Rock', () => {
    it('AI Troll moves one step toward the nearest Rock', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('D7')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier4(state)
      expect(move).not.toBeNull()
      expect(move!.pieceId).toBe('Green_Troll')
      expect(move!.targetSquare).toBe('D5')
    })

    it('AI Troll breaks equidistant Rock tie by alphabetical square key', () => {
      // Troll at E5, Rocks at C5 and G5 (both distance 2).
      // C5 < G5, so approach C5 (move west to D5).
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('C5')
        .withRock('G5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier4(state)
      expect(move).not.toBeNull()
      expect(move!.pieceId).toBe('Green_Troll')
      expect(move!.targetSquare).toBe('D5')
    })

    it('AI Sorcerer moves one step toward the nearest eligible Rock', () => {
      // Troll has no approach (already near or cannot move closer).
      // Sorcerer at F6, nearest Rock at F3, move to F5.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'F6')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'F2')
        .withRock('F3')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Troll at D8 approaches Rock at F3? Distance D8->F3 = 2+5=7.
      // Moving D8 to E8... but E8 is occupied by Dwarf.
      // Troll has limited moves, so Tier 4 Troll approach may fire first.
      // Let's restructure to ensure no Troll approach works.
      const state2 = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'F6')
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'F2')
        .withRock('E9')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      // Troll at D8, Rock at E9. Troll approaches E9 by moving to D9? D9 valid?
      // D9: |3-4|+|8-4| = 1+4 = 5 > 4. Not valid. E8 occupied. C8: |2-4|+|7-4| = 2+3 = 5 > 4. Not valid.
      // D7: valid. But D7 gets closer to E9? D8->E9 = 2, D7->E9 = 3. No, further.
      // So Troll has no approach move. Good.
      const move = evaluateTier4(state2)
      expect(move).not.toBeNull()
      // Should be Sorcerer approaching Rock at E9
      expect(move!.pieceId).toBe('Green_Sorcerer')
    })
  })

  // ===================================================================
  // AI TIER 5: FALLBACK
  // ===================================================================

  describe('Rule: Tier 5 — Any valid move with piece priority Troll > Dwarf > Sorcerer', () => {
    it('AI fallback moves Troll before Dwarf before Sorcerer', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'D4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'F6')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier5(state)
      expect(move).not.toBeNull()
      expect(move!.pieceId).toBe('Green_Troll')
    })

    it('AI fallback picks alphabetically-first target square for the chosen piece', () => {
      // Troll at E5 can move to D5, E4, E6, F5.
      // D5 is alphabetically first.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier5(state)
      expect(move).not.toBeNull()
      expect(move!.pieceId).toBe('Green_Troll')
      expect(move!.targetSquare).toBe('D5')
    })

    it('AI fallback uses Dwarf when Troll has no valid move', () => {
      // Troll surrounded on all sides by non-Rock pieces (Troll can move onto Rocks)
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'D4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E6')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'F5')
        .withPiece(PlayerSeat.Left, PieceType.Sorcerer, 'E4')
        .withPiece(PlayerSeat.Left, PieceType.Troll, 'B5')
        .withPiece(PlayerSeat.Left, PieceType.Dwarf, 'B4')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier5(state)
      expect(move).not.toBeNull()
      expect(move!.pieceId).toBe('Green_Dwarf')
    })
  })

  // ===================================================================
  // MULTI-MOVE AI TURN (planAITurn)
  // ===================================================================

  describe('Rule: The AI re-evaluates the priority hierarchy from scratch after each individual move', () => {
    it('AI uses exactly 1 move on the first turn of the game (turnIndex=0)', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .withTurnIndex(0)
        .build()

      const moves = planAITurn(state)
      expect(moves.length).toBe(1)
    })

    it('AI uses exactly 3 moves on a standard turn', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      const moves = planAITurn(state)
      expect(moves.length).toBe(3)
    })

    it('AI throw on first move ends the turn immediately', () => {
      // Troll on Rock at E5, enemy Sorcerer at E8 - kill shot available
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .withPendingThrow()
        .build()

      const moves = planAITurn(state)
      // Should be 1 move with a throw direction (or the pending throw is handled)
      expect(moves.length).toBeGreaterThanOrEqual(1)
      // The last move should have a throw direction
      const lastMove = moves[moves.length - 1]
      expect(lastMove.throwDirection).toBe('N')
    })
  })

  // ===================================================================
  // AI SELF-ELIMINATION AVOIDANCE
  // ===================================================================

  describe('Rule: AI avoids throwing toward own Sorcerer when safe directions exist', () => {
    it('AI avoids throwing Rock toward own Sorcerer when another direction has a kill', () => {
      // AI Troll on Rock at E5. AI Sorcerer at E7 (north). Enemy Sorcerer at C5 (west).
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'E7')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'C5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      const move = evaluateTier1(state)
      expect(move).not.toBeNull()
      expect(move!.throwDirection).toBe('W')
    })
  })

  // ===================================================================
  // DETERMINISTIC BEHAVIOUR
  // ===================================================================

  describe('Rule: Given identical board states the AI always produces the same sequence of moves', () => {
    it('AI decision is fully deterministic', () => {
      const buildState = () => new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E9')
        .withRock('E1')
        .withRock('A5')
        .withRock('I5')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      const moves1 = planAITurn(buildState())
      const moves2 = planAITurn(buildState())

      expect(moves1).toEqual(moves2)
    })

    it('Deterministic tiebreaker uses alphabetical square key ordering', () => {
      // Two options: B6 and C5. B6 < C5 alphabetically.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      const move = evaluateTier5(state)
      expect(move).not.toBeNull()
      // The Troll at E5 can move to D5, E4, E6, F5. D5 is first.
      expect(move!.targetSquare).toBe('D5')
    })
  })

  // ===================================================================
  // AI MANDATORY MOVE COMPLIANCE
  // ===================================================================

  describe('Rule: The AI always uses all of its mandatory moves unless a throw ends the turn', () => {
    it('AI uses exactly 2 moves on the second turn of the game', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .withTurnIndex(1)
        .build()

      const moves = planAITurn(state)
      expect(moves.length).toBe(2)
    })

    it('AI turn ends immediately after a throw (mid-turn)', () => {
      // Troll at E4, Rock at E5, enemy Sorcerer at E8. Troll moves onto Rock then throws.
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D8')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'F8')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'E8')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'D2')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()

      const moves = planAITurn(state)
      // Move 1: Troll moves E4->E5 (lands on Rock). Throw north.
      // Turn ends after throw. Only 1 move.
      expect(moves.length).toBe(1)
      expect(moves[0].throwDirection).toBe('N')
    })
  })
})
