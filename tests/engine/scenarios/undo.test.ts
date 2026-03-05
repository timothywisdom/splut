import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@/store/gameStore'
import {
  PlayerSeat,
  PieceType,
  PlayerType,
  GamePhase,
  PlayerPiece,
} from '@/engine/types'
import { BoardBuilder } from '../../helpers/boardBuilder'

// Helper to get/set store state directly
const getState = () => useGameStore.getState()
const setState = (partial: Parameters<typeof useGameStore.setState>[0]) =>
  useGameStore.setState(partial)

describe('Feature: Undo Move', () => {
  beforeEach(() => {
    // Reset store to clean state
    getState().resetGame()
  })

  // -------------------------------------------------------------------
  // Basic undo
  // -------------------------------------------------------------------

  describe('Rule: Undo restores the previous board state', () => {
    it('undo a single Troll move restores previous piece positions', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({ game, screen: 'game', gameHistory: [], actionLog: [] })

      // Select and move Troll
      getState().selectPiece('Green_Troll')
      getState().movePiece('E5')

      // Verify move happened
      const afterMove = getState().game!
      const trollAfter = afterMove.pieces.get('Green_Troll') as PlayerPiece
      expect(trollAfter.square).toBe('E5')
      expect(getState().gameHistory.length).toBe(1)

      // Undo
      getState().undoLastMove()

      // Verify restored
      const afterUndo = getState().game!
      const trollUndo = afterUndo.pieces.get('Green_Troll') as PlayerPiece
      expect(trollUndo.square).toBe('E4')
      expect(getState().gameHistory.length).toBe(0)
    })

    it('undo trims action log to snapshot length', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({ game, screen: 'game', gameHistory: [], actionLog: [] })

      getState().selectPiece('Green_Troll')
      getState().movePiece('E5')

      expect(getState().actionLog.length).toBeGreaterThan(0)

      getState().undoLastMove()

      expect(getState().actionLog.length).toBe(0)
    })
  })

  // -------------------------------------------------------------------
  // Undo after throw direction
  // -------------------------------------------------------------------

  describe('Rule: Undo during pending throw restores pre-throw state', () => {
    it('undo after choosing throw direction restores pending throw state', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E2')
        .withRock('E5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withPendingThrow()
        .build()

      setState({ game, screen: 'game', gameHistory: [], actionLog: [] })

      // Choose throw direction
      getState().chooseThrowDirection('N')

      // Should have snapshot
      expect(getState().gameHistory.length).toBe(1)

      // The throw should have resolved (no more pending throw)
      expect(getState().game!.turn.pendingThrow).toBe(false)

      // Undo
      getState().undoLastMove()

      // Pending throw should be back
      expect(getState().game!.turn.pendingThrow).toBe(true)
      expect(getState().gameHistory.length).toBe(0)
    })
  })

  // -------------------------------------------------------------------
  // Undo during pending pull-back
  // -------------------------------------------------------------------

  describe('Rule: Undo during pending pull-back cancels the prompt', () => {
    it('undo while pull-back prompt is showing cancels it and restores state', () => {
      // Setup: Troll at E5, Rock at E3 (behind Troll if moving North to E6)
      // Actually, pull-back triggers when Troll moves and there's a rock behind it
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E2')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F2')
        .withRock('E4') // Rock behind Troll when moving North
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({ game, screen: 'game', gameHistory: [], actionLog: [] })

      // Select Troll and move North — should trigger pull-back prompt
      getState().selectPiece('Green_Troll')
      getState().movePiece('E6')

      // Snapshot was captured by movePiece
      expect(getState().gameHistory.length).toBe(1)
      expect(getState().pendingPullBack).not.toBeNull()

      // Undo should cancel pull-back and restore state
      getState().undoLastMove()

      expect(getState().pendingPullBack).toBeNull()
      const troll = getState().game!.pieces.get('Green_Troll') as PlayerPiece
      expect(troll.square).toBe('E5')
      expect(getState().gameHistory.length).toBe(0)
    })
  })

  // -------------------------------------------------------------------
  // UI state clearing
  // -------------------------------------------------------------------

  describe('Rule: Undo clears transient UI state', () => {
    it('undo clears piece selection and highlights', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F5')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({ game, screen: 'game', gameHistory: [], actionLog: [] })

      // Make a move
      getState().selectPiece('Green_Troll')
      getState().movePiece('E5')

      // Select another piece before undoing
      getState().selectPiece('Green_Sorcerer')
      expect(getState().selectedPieceId).toBe('Green_Sorcerer')

      // Undo
      getState().undoLastMove()

      expect(getState().selectedPieceId).toBeNull()
      expect(getState().validMoveTargets.length).toBe(0)
      expect(getState().highlightedSquares.size).toBe(0)
      expect(getState().levitateRockId).toBeNull()
    })
  })

  // -------------------------------------------------------------------
  // Availability guards
  // -------------------------------------------------------------------

  describe('Rule: Undo is not available at game start (canUndo false)', () => {
    it('canUndo is false when history is empty', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({ game, screen: 'game', gameHistory: [], actionLog: [] })

      const state = getState()
      expect(state.gameHistory.length).toBe(0)

      // undoLastMove should be a no-op
      getState().undoLastMove()
      expect(getState().game!.pieces.get('Green_Troll')).toBeDefined()
    })
  })

  describe('Rule: Undo is not available after game over', () => {
    it('canUndo is false when game phase is Over', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withWinner(PlayerSeat.Top)
        .build()

      // Manually set history to have entries
      setState({
        game,
        screen: 'game',
        gameHistory: [{ game, actionLogLength: 0 }],
        actionLog: [],
      })

      // Even with history, undo should be blocked
      const originalGame = getState().game
      getState().undoLastMove()
      expect(getState().game).toBe(originalGame)
    })
  })

  describe('Rule: Undo is not available during AI turn', () => {
    it('canUndo is false when AI is executing', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({
        game,
        screen: 'game',
        gameHistory: [{ game, actionLogLength: 0 }],
        actionLog: [],
        aiTurnState: { isExecuting: true, plannedMoves: [], currentMoveIndex: 0 },
      })

      const originalGame = getState().game
      getState().undoLastMove()
      expect(getState().game).toBe(originalGame)
    })
  })

  // -------------------------------------------------------------------
  // AI atomic undo
  // -------------------------------------------------------------------

  describe('Rule: AI turns undo atomically', () => {
    it('AI turn produces exactly one snapshot for the entire turn', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D5')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'D4')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F5')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'F6')
        .withAIPlayer(PlayerSeat.Top)
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({ game, screen: 'game', gameHistory: [], actionLog: [] })

      // triggerAITurn pushes exactly ONE snapshot
      const beforeHistory = getState().gameHistory.length
      getState().triggerAITurn()
      expect(getState().gameHistory.length).toBe(beforeHistory + 1)
    })
  })

  // -------------------------------------------------------------------
  // History lifecycle
  // -------------------------------------------------------------------

  describe('Rule: History is cleared on new game', () => {
    it('initNewGame clears all undo history', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({
        game,
        screen: 'game',
        gameHistory: [{ game, actionLogLength: 0 }],
        actionLog: [],
      })

      expect(getState().gameHistory.length).toBe(1)

      // Start a new game
      getState().initNewGame({
        playerCount: 2,
        occupiedSeats: [PlayerSeat.Top, PlayerSeat.Bottom],
        firstPlayerSeat: PlayerSeat.Top,
        playerTypes: {
          [PlayerSeat.Top]: PlayerType.Human,
          [PlayerSeat.Bottom]: PlayerType.Human,
        },
      })

      expect(getState().gameHistory.length).toBe(0)
    })

    it('resetGame clears all undo history', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({
        game,
        screen: 'game',
        gameHistory: [{ game, actionLogLength: 0 }],
        actionLog: [],
      })

      getState().resetGame()

      expect(getState().gameHistory.length).toBe(0)
    })
  })

  // -------------------------------------------------------------------
  // Multiple sequential undos
  // -------------------------------------------------------------------

  describe('Rule: Multiple undos rewind through full game history', () => {
    it('three sequential undos rewind three moves', () => {
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D5')
        .withPiece(PlayerSeat.Top, PieceType.Dwarf, 'D4')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F5')
        .withPiece(PlayerSeat.Bottom, PieceType.Dwarf, 'F6')
        .withCurrentPlayer(PlayerSeat.Top)
        .build()

      setState({ game, screen: 'game', gameHistory: [], actionLog: [] })

      // Capture original positions
      const origTroll = (game.pieces.get('Green_Troll') as PlayerPiece).square
      const origSorcerer = (game.pieces.get('Green_Sorcerer') as PlayerPiece).square
      const origDwarf = (game.pieces.get('Green_Dwarf') as PlayerPiece).square

      // Move 1: Troll E4 -> E5
      getState().selectPiece('Green_Troll')
      getState().movePiece('E5')

      // Move 2: Sorcerer D5 -> D6
      getState().selectPiece('Green_Sorcerer')
      getState().movePiece('D6')

      // Move 3: Dwarf D4 -> D5 (now vacated)
      getState().selectPiece('Green_Dwarf')
      getState().movePiece('D5')

      expect(getState().gameHistory.length).toBe(3)

      // Undo 3 times
      getState().undoLastMove()
      getState().undoLastMove()
      getState().undoLastMove()

      expect(getState().gameHistory.length).toBe(0)

      // All pieces back to original positions
      const finalTroll = getState().game!.pieces.get('Green_Troll') as PlayerPiece
      const finalSorcerer = getState().game!.pieces.get('Green_Sorcerer') as PlayerPiece
      const finalDwarf = getState().game!.pieces.get('Green_Dwarf') as PlayerPiece
      expect(finalTroll.square).toBe(origTroll)
      expect(finalSorcerer.square).toBe(origSorcerer)
      expect(finalDwarf.square).toBe(origDwarf)
    })
  })

  // -------------------------------------------------------------------
  // Undo across turn boundaries
  // -------------------------------------------------------------------

  describe('Rule: Undo across turn boundaries restores correct player', () => {
    it('undo after turn change restores previous player turn', () => {
      // Use turnIndex=0 so movesAllowed=1 (turn ends after 1 move)
      const game = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E4')
        .withPiece(PlayerSeat.Top, PieceType.Sorcerer, 'D5')
        .withPiece(PlayerSeat.Bottom, PieceType.Troll, 'E6')
        .withPiece(PlayerSeat.Bottom, PieceType.Sorcerer, 'F5')
        .withCurrentPlayer(PlayerSeat.Top)
        .withTurnIndex(0) // 1 move allowed
        .build()

      setState({ game, screen: 'game', gameHistory: [], actionLog: [] })

      expect(getState().game!.turn.currentPlayerSeat).toBe(PlayerSeat.Top)

      // Top moves Troll — this exhausts their 1 move, turn passes to Bottom
      getState().selectPiece('Green_Troll')
      getState().movePiece('E5')

      expect(getState().game!.turn.currentPlayerSeat).toBe(PlayerSeat.Bottom)

      // Undo — should restore Top's turn
      getState().undoLastMove()

      expect(getState().game!.turn.currentPlayerSeat).toBe(PlayerSeat.Top)
      const troll = getState().game!.pieces.get('Green_Troll') as PlayerPiece
      expect(troll.square).toBe('E4')
    })
  })
})
