// ============================================================================
// BoardBuilder - Fluent test helper for constructing GameState
// ============================================================================

import {
  GameState,
  GamePhase,
  PlayerSeat,
  PieceType,
  PlayerType,
  PlayerPiece,
  RockPiece,
  PlayerState,
  TurnState,
  TurnRockRecord,
  RockMoveType,
  Piece,
  SquareKey,
  LevitationState,
} from '@/engine/types'
import { SEAT_COLOR } from '@/engine/setup'
import { getMovesAllowed } from '@/engine/turns'

export class BoardBuilder {
  private pieces = new Map<string, Piece>()
  private squareOccupancy = new Map<SquareKey, string>()
  private players: PlayerState[] = []
  private activePlayers: PlayerSeat[] = []
  private currentPlayerSeat: PlayerSeat = PlayerSeat.Top
  private turnIndex = 2 // Default to turn 2 (3 moves)
  private movesUsed = 0
  private isTerminated = false
  private pendingThrow = false
  private phase: GamePhase = GamePhase.Playing
  private previousTurnRockRecord: TurnRockRecord | null = null
  private currentTurnRockRecord: TurnRockRecord | null = null
  private winner: PlayerSeat | null = null
  private levitationState: LevitationState | null = null
  private lastSplutSquare: SquareKey | null = null
  private lastThrowPath: SquareKey[] = []

  /**
   * Add a player piece to the board.
   */
  withPiece(seat: PlayerSeat, type: PieceType.Sorcerer | PieceType.Troll | PieceType.Dwarf, square: SquareKey): this {
    const colorName = SEAT_COLOR[seat]
    const id = `${colorName}_${type}`
    const piece: PlayerPiece = {
      id,
      type,
      owner: seat,
      square,
      alive: true,
    }
    this.pieces.set(id, piece)
    this.squareOccupancy.set(square, id)

    // Ensure player exists
    if (!this.players.find(p => p.seat === seat)) {
      this.players.push({
        seat,
        playerType: PlayerType.Human,
        isEliminated: false,
        turnOrder: this.players.length,
      })
      this.activePlayers.push(seat)
    }

    return this
  }

  /**
   * Add a Rock to the board.
   */
  withRock(square: SquareKey): this {
    const id = `Rock_${square}`
    const rock: RockPiece = {
      id,
      type: PieceType.Rock,
      square,
    }
    this.pieces.set(id, rock)
    this.squareOccupancy.set(square, id)
    return this
  }

  /**
   * Add a Rock with custom ID.
   */
  withRockId(id: string, square: SquareKey): this {
    const rock: RockPiece = {
      id,
      type: PieceType.Rock,
      square,
    }
    this.pieces.set(id, rock)
    this.squareOccupancy.set(square, id)
    return this
  }

  /**
   * Set the current player and how many moves they've used.
   */
  withCurrentPlayer(seat: PlayerSeat, movesUsed: number = 0): this {
    this.currentPlayerSeat = seat
    this.movesUsed = movesUsed
    return this
  }

  /**
   * Set the turn index (affects move count: 0=1 move, 1=2 moves, 2+=3 moves).
   */
  withTurnIndex(turnIndex: number): this {
    this.turnIndex = turnIndex
    return this
  }

  /**
   * Mark a Rock as moved during the previous player's turn.
   */
  withPreviousTurnRockMoved(rockId: string, moveType: RockMoveType): this {
    if (!this.previousTurnRockRecord) {
      this.previousTurnRockRecord = {
        turnIndex: this.turnIndex - 1,
        playerSeat: PlayerSeat.Bottom, // Placeholder
        movedRocks: [],
      }
    }
    this.previousTurnRockRecord.movedRocks.push({ rockId, moveType })
    return this
  }

  /**
   * Mark a Rock as moved during the current player's turn.
   */
  withCurrentTurnRockMoved(rockId: string, moveType: RockMoveType): this {
    if (!this.currentTurnRockRecord) {
      this.currentTurnRockRecord = {
        turnIndex: this.turnIndex,
        playerSeat: this.currentPlayerSeat,
        movedRocks: [],
      }
    }
    this.currentTurnRockRecord.movedRocks.push({ rockId, moveType })
    return this
  }

  /**
   * Mark a player as eliminated.
   */
  withEliminated(seat: PlayerSeat): this {
    const player = this.players.find(p => p.seat === seat)
    if (player) {
      player.isEliminated = true
    }
    this.activePlayers = this.activePlayers.filter(s => s !== seat)
    return this
  }

  /**
   * Mark a seat as AI-controlled.
   */
  withAIPlayer(seat: PlayerSeat): this {
    const player = this.players.find(p => p.seat === seat)
    if (player) {
      player.playerType = PlayerType.AI
    }
    return this
  }

  /**
   * Set the game phase.
   */
  withPhase(phase: GamePhase): this {
    this.phase = phase
    return this
  }

  /**
   * Set turn as terminated.
   */
  withTerminatedTurn(): this {
    this.isTerminated = true
    return this
  }

  /**
   * Set pending throw.
   */
  withPendingThrow(): this {
    this.pendingThrow = true
    return this
  }

  /**
   * Set the winner.
   */
  withWinner(seat: PlayerSeat): this {
    this.winner = seat
    this.phase = GamePhase.Over
    return this
  }

  /**
   * Set levitation state.
   */
  withLevitation(rockId: string, hasStarted: boolean, isStopped: boolean): this {
    this.levitationState = { rockId, hasStarted, isStopped }
    return this
  }

  /**
   * Build the GameState.
   */
  build(): GameState {
    // Ensure current player is in the players list
    if (!this.players.find(p => p.seat === this.currentPlayerSeat)) {
      this.players.push({
        seat: this.currentPlayerSeat,
        playerType: PlayerType.Human,
        isEliminated: false,
        turnOrder: this.players.length,
      })
      this.activePlayers.push(this.currentPlayerSeat)
    }

    const turn: TurnState = {
      currentPlayerSeat: this.currentPlayerSeat,
      turnIndex: this.turnIndex,
      movesAllowed: getMovesAllowed(this.turnIndex),
      movesUsed: this.movesUsed,
      isTerminated: this.isTerminated,
      levitationState: this.levitationState,
      pendingThrow: this.pendingThrow,
    }

    const currentTurnRockRecord = this.currentTurnRockRecord ?? {
      turnIndex: this.turnIndex,
      playerSeat: this.currentPlayerSeat,
      movedRocks: [],
    }

    return {
      phase: this.phase,
      pieces: new Map(this.pieces),
      squareOccupancy: new Map(this.squareOccupancy),
      players: [...this.players],
      activePlayers: [...this.activePlayers],
      turn,
      previousTurnRockRecord: this.previousTurnRockRecord,
      currentTurnRockRecord,
      winner: this.winner,
      lastSplutSquare: this.lastSplutSquare,
      lastThrowPath: this.lastThrowPath,
    }
  }
}
