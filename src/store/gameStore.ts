// ============================================================================
// SPLUT! Zustand Game Store
// Central state management connecting engine to UI.
// ============================================================================

import { create } from 'zustand'
import {
  GameState,
  GamePhase,
  PlayerSeat,
  PieceType,
  PlayerType,
  PlayerPiece,
  Direction,
  SquareKey,
  SetupConfig,
  AIMove,
  MoveOpts,
} from '@/engine/types'
import { initGame, SEAT_COLOR } from '@/engine/setup'
import { moveTroll, throwRock, isPullEligible } from '@/engine/troll'
import { moveDwarf } from '@/engine/dwarf'
import { moveSorcerer, validateLevitationEligibility, checkLevitationBlocked } from '@/engine/sorcerer'
import { planAITurn } from '@/engine/ai'
import {
  ALL_VALID_SQUARES,
  isOrthogonallyAdjacent,
  stepInDirection,
  oppositeDirection,
} from '@/engine/board'
import { getPieceAt, isOccupied } from '@/engine/movement'
import { resolvePushChain } from '@/engine/dwarf'
import { getDirectionBetween } from '@/engine/board'

// ============================================================================
// Types
// ============================================================================

export type HighlightType = 'valid-move' | 'selected' | 'throw-path' | 'splut' | 'levitate-eligible'

interface AIConfig {
  moveDelayMs: number
}

interface AITurnState {
  isExecuting: boolean
  plannedMoves: AIMove[]
  currentMoveIndex: number
}

export type GameScreen = 'lobby' | 'game'

export interface HistorySnapshot {
  game: GameState
  actionLogLength: number
}

export interface PendingPullBack {
  trollId: string
  targetSquare: SquareKey
  rockId: string
  rockSquare: SquareKey
}

export interface UILogEntry {
  id: number
  timestamp: string
  playerSeat: PlayerSeat | null
  colorName: string
  teamColor: string
  pieceType: string
  fromSquare: string
  toSquare: string
  description: string
  kind: 'move' | 'throw' | 'splut' | 'kill' | 'push' | 'levitate' | 'eliminate' | 'win'
}

let logEntryId = 0
function nextLogId(): number { return ++logEntryId }

function makeTimestamp(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

function seatToColor(seat: PlayerSeat): string {
  switch (seat) {
    case PlayerSeat.Top: return 'var(--team-green)'
    case PlayerSeat.Bottom: return 'var(--team-red)'
    case PlayerSeat.Left: return 'var(--team-yellow)'
    case PlayerSeat.Right: return 'var(--team-blue)'
  }
}

interface GameStore {
  // --- State ---
  screen: GameScreen
  game: GameState | null

  // UI state
  selectedPieceId: string | null
  validMoveTargets: SquareKey[]
  highlightedSquares: Map<SquareKey, HighlightType>
  levitateRockId: string | null
  pendingPullBack: PendingPullBack | null

  // Action log
  actionLog: UILogEntry[]

  // Undo history
  gameHistory: HistorySnapshot[]

  // AI
  aiConfig: AIConfig
  aiTurnState: AITurnState | null
  aiTimerId: ReturnType<typeof setTimeout> | null

  // --- Actions ---
  initNewGame: (config: SetupConfig) => void
  selectPiece: (pieceId: string) => void
  clearSelection: () => void
  movePiece: (targetSquare: SquareKey) => void
  chooseThrowDirection: (dir: Direction) => void
  chooseLevitateRock: (rockId: string | null) => void
  confirmPullBack: (doPull: boolean) => void
  triggerAITurn: () => void
  cancelAITurn: () => void
  undoLastMove: () => void
  resetGame: () => void
  setScreen: (screen: GameScreen) => void
}

// ============================================================================
// Helper: Compute valid move targets for a selected piece
// ============================================================================

function computeValidMoveTargets(game: GameState, pieceId: string): SquareKey[] {
  const piece = game.pieces.get(pieceId)
  if (!piece || piece.type === PieceType.Rock) return []

  const pp = piece as PlayerPiece
  if (!pp.alive || pp.owner !== game.turn.currentPlayerSeat) return []

  const targets: SquareKey[] = []
  const directions: Direction[] = ['N', 'S', 'E', 'W']

  for (const dir of directions) {
    const sq = stepInDirection(pp.square, dir)
    if (!sq || !ALL_VALID_SQUARES.has(sq)) continue

    if (pp.type === PieceType.Troll) {
      const occupant = getPieceAt(game, sq)
      if (!occupant || occupant.type === PieceType.Rock) {
        targets.push(sq)
      }
    } else if (pp.type === PieceType.Dwarf) {
      if (!isOccupied(game, sq)) {
        targets.push(sq)
      } else {
        const pushDir = getDirectionBetween(pp.square, sq)
        if (pushDir) {
          const pushResult = resolvePushChain(game, sq, pushDir)
          if (pushResult.valid) targets.push(sq)
        }
      }
    } else if (pp.type === PieceType.Sorcerer) {
      if (!isOccupied(game, sq)) {
        targets.push(sq)
      }
    }
  }

  return targets.sort()
}

// ============================================================================
// Undo: snapshot helper
// ============================================================================

function deepCloneGame(game: GameState): GameState {
  return {
    ...game,
    pieces: new Map(Array.from(game.pieces.entries()).map(([k, v]) => [k, { ...v }])),
    squareOccupancy: new Map(game.squareOccupancy),
    players: game.players.map(p => ({ ...p })),
    activePlayers: [...game.activePlayers],
    turn: { ...game.turn, levitationState: game.turn.levitationState ? { ...game.turn.levitationState } : null },
    previousTurnRockRecord: game.previousTurnRockRecord
      ? { ...game.previousTurnRockRecord, movedRocks: game.previousTurnRockRecord.movedRocks.map(r => ({ ...r })) }
      : null,
    currentTurnRockRecord: {
      ...game.currentTurnRockRecord,
      movedRocks: game.currentTurnRockRecord.movedRocks.map(r => ({ ...r })),
    },
    lastThrowPath: [...game.lastThrowPath],
  }
}

function pushSnapshot(get: () => GameStore, set: (partial: Partial<GameStore>) => void): void {
  const { game, actionLog, gameHistory } = get()
  if (!game) return
  set({
    gameHistory: [...gameHistory, { game: deepCloneGame(game), actionLogLength: actionLog.length }],
  })
}

// ============================================================================
// Store
// ============================================================================

export const useGameStore = create<GameStore>((set, get) => ({
  // --- Initial State ---
  screen: 'lobby',
  game: null,
  selectedPieceId: null,
  validMoveTargets: [],
  highlightedSquares: new Map(),
  levitateRockId: null,
  pendingPullBack: null,
  actionLog: [],
  gameHistory: [],
  aiConfig: { moveDelayMs: 500 },
  aiTurnState: null,
  aiTimerId: null,

  // --- Actions ---

  setScreen: (screen) => set({ screen }),

  initNewGame: (config) => {
    const result = initGame(config)
    if (!result.ok) return

    logEntryId = 0
    set({
      game: result.value,
      screen: 'game',
      selectedPieceId: null,
      validMoveTargets: [],
      highlightedSquares: new Map(),
      levitateRockId: null,
      pendingPullBack: null,
      actionLog: [],
      gameHistory: [],
      aiTurnState: null,
    })

    // Check if first player is AI
    const state = result.value
    const currentPlayer = state.players.find(
      p => p.seat === state.turn.currentPlayerSeat
    )
    if (currentPlayer?.playerType === PlayerType.AI) {
      setTimeout(() => get().triggerAITurn(), 100)
    }
  },

  selectPiece: (pieceId) => {
    const { game, aiTurnState } = get()
    if (!game || game.phase !== GamePhase.Playing) return
    if (aiTurnState?.isExecuting) return
    if (game.turn.pendingThrow) return

    const piece = game.pieces.get(pieceId)
    if (!piece || piece.type === PieceType.Rock) return

    const pp = piece as PlayerPiece
    if (!pp.alive || pp.owner !== game.turn.currentPlayerSeat) return

    // Check if the current player is human
    const currentPlayer = game.players.find(
      p => p.seat === game.turn.currentPlayerSeat
    )
    if (currentPlayer?.playerType !== PlayerType.Human) return

    const targets = computeValidMoveTargets(game, pieceId)
    const highlights = new Map<SquareKey, HighlightType>()

    // Highlight selected piece
    highlights.set(pp.square, 'selected')

    // Highlight valid move targets
    for (const sq of targets) {
      highlights.set(sq, 'valid-move')
    }

    // If Sorcerer, highlight levitation-eligible rocks
    if (pp.type === PieceType.Sorcerer) {
      for (const [rockPieceId, rockPiece] of game.pieces) {
        if (rockPiece.type === PieceType.Rock) {
          const eligResult = validateLevitationEligibility(game, rockPieceId)
          if (eligResult.ok) {
            highlights.set(rockPiece.square, 'levitate-eligible')
          }
        }
      }
    }

    set({
      selectedPieceId: pieceId,
      validMoveTargets: targets,
      highlightedSquares: highlights,
      levitateRockId: null,
    })
  },

  clearSelection: () => {
    set({
      selectedPieceId: null,
      validMoveTargets: [],
      highlightedSquares: new Map(),
      levitateRockId: null,
      pendingPullBack: null,
    })
  },

  chooseLevitateRock: (rockId) => {
    const { game, selectedPieceId } = get()
    if (!game || !selectedPieceId) {
      set({ levitateRockId: rockId })
      return
    }

    const piece = game.pieces.get(selectedPieceId)
    if (!piece || piece.type !== PieceType.Sorcerer) {
      set({ levitateRockId: rockId })
      return
    }

    const pp = piece as PlayerPiece
    const highlights = new Map<SquareKey, HighlightType>()
    highlights.set(pp.square, 'selected')

    if (rockId) {
      // Rock selected for levitation — filter move targets to valid directions
      const rock = game.pieces.get(rockId)
      if (!rock) return

      highlights.set(rock.square, 'levitate-eligible')

      const directions: Direction[] = ['N', 'S', 'E', 'W']
      const filteredTargets: SquareKey[] = []

      for (const dir of directions) {
        const sq = stepInDirection(pp.square, dir)
        if (!sq || !ALL_VALID_SQUARES.has(sq)) continue
        if (isOccupied(game, sq)) continue

        // Check if the rock can also move in this direction
        if (!checkLevitationBlocked(game, rock.square, dir)) {
          filteredTargets.push(sq)
        }
      }

      for (const sq of filteredTargets) {
        highlights.set(sq, 'valid-move')
      }

      // Also show other eligible rocks
      for (const [rId, rPiece] of game.pieces) {
        if (rPiece.type === PieceType.Rock && rId !== rockId) {
          const eligResult = validateLevitationEligibility(game, rId)
          if (eligResult.ok) {
            highlights.set(rPiece.square, 'levitate-eligible')
          }
        }
      }

      set({ levitateRockId: rockId, validMoveTargets: filteredTargets.sort(), highlightedSquares: highlights })
    } else {
      // Rock deselected — show all valid move targets
      const targets = computeValidMoveTargets(game, selectedPieceId)
      for (const sq of targets) {
        highlights.set(sq, 'valid-move')
      }

      // Show eligible rocks again
      for (const [rId, rPiece] of game.pieces) {
        if (rPiece.type === PieceType.Rock) {
          const eligResult = validateLevitationEligibility(game, rId)
          if (eligResult.ok) {
            highlights.set(rPiece.square, 'levitate-eligible')
          }
        }
      }

      set({ levitateRockId: null, validMoveTargets: targets, highlightedSquares: highlights })
    }
  },

  movePiece: (targetSquare) => {
    const { game, selectedPieceId, validMoveTargets, levitateRockId, actionLog } = get()
    if (!game || !selectedPieceId) return
    if (!validMoveTargets.includes(targetSquare)) return

    const piece = game.pieces.get(selectedPieceId)
    if (!piece || piece.type === PieceType.Rock) return
    const pp = piece as PlayerPiece
    const fromSquare = pp.square

    // Snapshot for undo (before any mutation — covers pull-back and normal moves)
    pushSnapshot(get, set)

    // Check for Troll pull-back eligibility before executing the move
    if (pp.type === PieceType.Troll) {
      const destPiece = getPieceAt(game, targetSquare)
      // Only offer pull-back if NOT landing on a Rock (landing on Rock triggers throw)
      if (!destPiece || destPiece.type !== PieceType.Rock) {
        const moveDir = getDirectionBetween(fromSquare, targetSquare)
        if (moveDir) {
          const oppDir = oppositeDirection(moveDir)
          const pullFromSquare = stepInDirection(fromSquare, oppDir)
          if (pullFromSquare) {
            const pullPiece = getPieceAt(game, pullFromSquare)
            if (pullPiece && pullPiece.type === PieceType.Rock) {
              // Eligible rock found — show pull-back confirmation
              set({
                pendingPullBack: {
                  trollId: selectedPieceId,
                  targetSquare,
                  rockId: pullPiece.id,
                  rockSquare: pullFromSquare,
                },
              })
              return
            }
          }
        }
      }
    }

    // Capture rock position before move for levitation log
    const rockOldSquare = levitateRockId
      ? game.pieces.get(levitateRockId)?.square ?? null
      : null

    let result
    if (pp.type === PieceType.Troll) {
      result = moveTroll(game, selectedPieceId, targetSquare)
    } else if (pp.type === PieceType.Dwarf) {
      result = moveDwarf(game, selectedPieceId, targetSquare)
    } else if (pp.type === PieceType.Sorcerer) {
      result = moveSorcerer(game, selectedPieceId, targetSquare, levitateRockId ?? undefined)
    }

    if (!result || !result.ok) return

    const newGame = result.value
    const highlights = new Map<SquareKey, HighlightType>()
    const newEntries: UILogEntry[] = []
    const ts = makeTimestamp()
    const colorName = SEAT_COLOR[pp.owner]
    const teamColor = seatToColor(pp.owner)

    // Build move description, including rock levitation info if applicable
    let moveDescription = `${fromSquare} → ${targetSquare}`
    if (levitateRockId && rockOldSquare) {
      const rockNewSquare = newGame.pieces.get(levitateRockId)?.square ?? null
      if (rockNewSquare) {
        moveDescription = `${fromSquare} → ${targetSquare} (levitated Rock ${rockOldSquare} → ${rockNewSquare})`
      }
    }

    // Log the move
    newEntries.push({
      id: nextLogId(), timestamp: ts, playerSeat: pp.owner,
      colorName, teamColor, pieceType: pp.type,
      fromSquare, toSquare: targetSquare,
      description: moveDescription,
      kind: levitateRockId ? 'levitate' : 'move',
    })

    // Log push if Dwarf pushed pieces
    if (pp.type === PieceType.Dwarf && isOccupied(game, targetSquare)) {
      newEntries.push({
        id: nextLogId(), timestamp: ts, playerSeat: pp.owner,
        colorName, teamColor, pieceType: 'Dwarf',
        fromSquare: targetSquare, toSquare: '',
        description: `pushed from ${targetSquare}`,
        kind: 'push',
      })
    }

    // Pending throw notice
    if (newGame.turn.pendingThrow) {
      newEntries.push({
        id: nextLogId(), timestamp: ts, playerSeat: pp.owner,
        colorName, teamColor, pieceType: 'Troll',
        fromSquare: targetSquare, toSquare: '',
        description: 'landed on Rock — must throw!',
        kind: 'throw',
      })
    }

    // Show throw path if present
    if (newGame.lastThrowPath.length > 0) {
      for (const sq of newGame.lastThrowPath) {
        highlights.set(sq, 'throw-path')
      }
    }
    if (newGame.lastSplutSquare) {
      highlights.set(newGame.lastSplutSquare, 'splut')
    }

    set({
      game: newGame,
      selectedPieceId: null,
      validMoveTargets: [],
      highlightedSquares: highlights,
      levitateRockId: null,
      pendingPullBack: null,
      actionLog: [...actionLog, ...newEntries],
    })

    // Check if AI should take over
    if (newGame.phase === GamePhase.Playing && !newGame.turn.pendingThrow) {
      const nextPlayer = newGame.players.find(
        p => p.seat === newGame.turn.currentPlayerSeat
      )
      if (nextPlayer?.playerType === PlayerType.AI) {
        setTimeout(() => get().triggerAITurn(), 300)
      }
    }
  },

  confirmPullBack: (doPull) => {
    const { game, pendingPullBack, actionLog } = get()
    if (!game || !pendingPullBack) return

    const { trollId, targetSquare, rockId } = pendingPullBack
    const piece = game.pieces.get(trollId)
    if (!piece || piece.type === PieceType.Rock) return
    const pp = piece as PlayerPiece
    const fromSquare = pp.square

    const result = moveTroll(game, trollId, targetSquare, doPull ? rockId : undefined)
    if (!result.ok) return

    const newGame = result.value
    const highlights = new Map<SquareKey, HighlightType>()
    const newEntries: UILogEntry[] = []
    const ts = makeTimestamp()
    const colorName = SEAT_COLOR[pp.owner]
    const teamColor = seatToColor(pp.owner)

    newEntries.push({
      id: nextLogId(), timestamp: ts, playerSeat: pp.owner,
      colorName, teamColor, pieceType: pp.type,
      fromSquare, toSquare: targetSquare,
      description: doPull
        ? `${fromSquare} → ${targetSquare} (pulled Rock)`
        : `${fromSquare} → ${targetSquare}`,
      kind: 'move',
    })

    if (newGame.turn.pendingThrow) {
      newEntries.push({
        id: nextLogId(), timestamp: ts, playerSeat: pp.owner,
        colorName, teamColor, pieceType: 'Troll',
        fromSquare: targetSquare, toSquare: '',
        description: 'landed on Rock — must throw!',
        kind: 'throw',
      })
    }

    set({
      game: newGame,
      selectedPieceId: null,
      validMoveTargets: [],
      highlightedSquares: highlights,
      levitateRockId: null,
      pendingPullBack: null,
      actionLog: [...actionLog, ...newEntries],
    })

    if (newGame.phase === GamePhase.Playing && !newGame.turn.pendingThrow) {
      const nextPlayer = newGame.players.find(
        p => p.seat === newGame.turn.currentPlayerSeat
      )
      if (nextPlayer?.playerType === PlayerType.AI) {
        setTimeout(() => get().triggerAITurn(), 300)
      }
    }
  },

  chooseThrowDirection: (dir) => {
    const { game, aiTurnState, actionLog } = get()
    if (!game || !game.turn.pendingThrow) return
    if (aiTurnState?.isExecuting) return

    // Snapshot for undo
    pushSnapshot(get, set)

    const currentSeat = game.turn.currentPlayerSeat
    const result = throwRock(game, dir)
    if (!result.ok) return

    const newGame = result.value
    const highlights = new Map<SquareKey, HighlightType>()
    const newEntries: UILogEntry[] = []
    const ts = makeTimestamp()
    const colorName = SEAT_COLOR[currentSeat]
    const teamColor = seatToColor(currentSeat)

    // Log the throw
    const dirLabel = { N: 'North', S: 'South', E: 'East', W: 'West' }[dir]
    newEntries.push({
      id: nextLogId(), timestamp: ts, playerSeat: currentSeat,
      colorName, teamColor, pieceType: 'Troll',
      fromSquare: '', toSquare: '',
      description: `threw Rock ${dirLabel}`,
      kind: 'throw',
    })

    if (newGame.lastThrowPath.length > 0) {
      for (const sq of newGame.lastThrowPath) {
        highlights.set(sq, 'throw-path')
      }
    }

    // Log SPLUT!
    if (newGame.lastSplutSquare) {
      highlights.set(newGame.lastSplutSquare, 'splut')

      // Find which Dwarf was crushed
      let splutDescription = `SPLUT! at ${newGame.lastSplutSquare}`
      for (const [, piece] of game.pieces) {
        if (piece.type === PieceType.Dwarf && (piece as PlayerPiece).alive) {
          const updatedPiece = newGame.pieces.get(piece.id) as PlayerPiece | undefined
          if (updatedPiece && !updatedPiece.alive) {
            const crushedColor = SEAT_COLOR[(piece as PlayerPiece).owner]
            splutDescription = `SPLUT! ${crushedColor} Dwarf crushed at ${newGame.lastSplutSquare}`
            break
          }
        }
      }

      newEntries.push({
        id: nextLogId(), timestamp: ts, playerSeat: null,
        colorName: '', teamColor: 'var(--splut-red)', pieceType: '',
        fromSquare: newGame.lastSplutSquare, toSquare: '',
        description: splutDescription,
        kind: 'splut',
      })
    }

    // Log eliminated players
    for (const player of game.players) {
      if (!player.isEliminated) {
        const updatedPlayer = newGame.players.find(p => p.seat === player.seat)
        if (updatedPlayer?.isEliminated) {
          newEntries.push({
            id: nextLogId(), timestamp: ts, playerSeat: player.seat,
            colorName: SEAT_COLOR[player.seat], teamColor: seatToColor(player.seat),
            pieceType: '', fromSquare: '', toSquare: '',
            description: `${SEAT_COLOR[player.seat]} team eliminated!`,
            kind: 'eliminate',
          })
        }
      }
    }

    // Log winner
    if (newGame.phase === GamePhase.Over && newGame.winner) {
      newEntries.push({
        id: nextLogId(), timestamp: ts, playerSeat: newGame.winner,
        colorName: SEAT_COLOR[newGame.winner], teamColor: seatToColor(newGame.winner),
        pieceType: '', fromSquare: '', toSquare: '',
        description: `${SEAT_COLOR[newGame.winner]} wins!`,
        kind: 'win',
      })
    }

    set({
      game: newGame,
      highlightedSquares: highlights,
      actionLog: [...actionLog, ...newEntries],
    })

    // Check if AI should take over after throw
    if (newGame.phase === GamePhase.Playing) {
      const nextPlayer = newGame.players.find(
        p => p.seat === newGame.turn.currentPlayerSeat
      )
      if (nextPlayer?.playerType === PlayerType.AI) {
        setTimeout(() => get().triggerAITurn(), 300)
      }
    }
  },

  triggerAITurn: () => {
    const { game } = get()
    if (!game || game.phase !== GamePhase.Playing) return

    // Snapshot for undo (one snapshot for entire AI turn)
    pushSnapshot(get, set)

    const moves = planAITurn(game)
    if (moves.length === 0) return

    set({
      aiTurnState: {
        isExecuting: true,
        plannedMoves: moves,
        currentMoveIndex: 0,
      },
      selectedPieceId: null,
      validMoveTargets: [],
      highlightedSquares: new Map(),
    })

    // Execute first move after delay
    const { aiConfig } = get()
    const timerId = setTimeout(() => executeNextAIMove(get, set), aiConfig.moveDelayMs)
    set({ aiTimerId: timerId })
  },

  cancelAITurn: () => {
    const { aiTimerId } = get()
    if (aiTimerId) clearTimeout(aiTimerId)
    set({
      aiTurnState: null,
      aiTimerId: null,
    })
  },

  undoLastMove: () => {
    const { gameHistory, game, aiTurnState } = get()
    if (gameHistory.length === 0) return
    if (game?.phase === GamePhase.Over) return
    if (aiTurnState?.isExecuting) return

    const snapshot = gameHistory[gameHistory.length - 1]
    const { actionLog } = get()
    const trimmedLog = actionLog.slice(0, snapshot.actionLogLength)

    // Restore logEntryId to match trimmed log
    logEntryId = trimmedLog.length > 0 ? trimmedLog[trimmedLog.length - 1].id : 0

    set({
      game: snapshot.game,
      gameHistory: gameHistory.slice(0, -1),
      actionLog: trimmedLog,
      selectedPieceId: null,
      validMoveTargets: [],
      highlightedSquares: new Map(),
      levitateRockId: null,
      pendingPullBack: null,
      aiTurnState: null,
      aiTimerId: null,
    })
  },

  resetGame: () => {
    const { aiTimerId } = get()
    if (aiTimerId) clearTimeout(aiTimerId)
    logEntryId = 0
    set({
      screen: 'lobby',
      game: null,
      selectedPieceId: null,
      validMoveTargets: [],
      highlightedSquares: new Map(),
      levitateRockId: null,
      pendingPullBack: null,
      actionLog: [],
      gameHistory: [],
      aiTurnState: null,
      aiTimerId: null,
    })
  },
}))

// ============================================================================
// AI Move Execution (private)
// ============================================================================

function executeNextAIMove(
  get: () => GameStore,
  set: (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void
) {
  const { game, aiTurnState, aiConfig } = get()
  if (!game || !aiTurnState || !aiTurnState.isExecuting) return

  const { plannedMoves, currentMoveIndex } = aiTurnState
  if (currentMoveIndex >= plannedMoves.length) {
    // All moves executed
    set({ aiTurnState: null, aiTimerId: null })

    // Check if next player is also AI
    const currentGame = get().game
    if (currentGame && currentGame.phase === GamePhase.Playing) {
      const nextPlayer = currentGame.players.find(
        p => p.seat === currentGame.turn.currentPlayerSeat
      )
      if (nextPlayer?.playerType === PlayerType.AI) {
        setTimeout(() => get().triggerAITurn(), aiConfig.moveDelayMs)
      }
    }
    return
  }

  const move = plannedMoves[currentMoveIndex]
  const piece = game.pieces.get(move.pieceId)
  if (!piece || piece.type === PieceType.Rock) {
    set({ aiTurnState: null, aiTimerId: null })
    return
  }

  const pp = piece as PlayerPiece
  const fromSquare = pp.square
  let result
  const newEntries: UILogEntry[] = []
  const ts = makeTimestamp()
  const colorName = SEAT_COLOR[pp.owner]
  const teamColor = seatToColor(pp.owner)

  // Handle pending throw first
  if (game.turn.pendingThrow && move.throwDirection) {
    result = throwRock(game, move.throwDirection)
    const dirLabel = { N: 'North', S: 'South', E: 'East', W: 'West' }[move.throwDirection]
    newEntries.push({
      id: nextLogId(), timestamp: ts, playerSeat: pp.owner,
      colorName, teamColor, pieceType: 'Troll',
      fromSquare: '', toSquare: '',
      description: `threw Rock ${dirLabel}`,
      kind: 'throw',
    })
  } else {
    // Capture rock position before move for levitation log
    const aiRockOldSquare = move.opts?.levitateRockId
      ? game.pieces.get(move.opts.levitateRockId)?.square ?? null
      : null

    // Execute the piece movement
    if (pp.type === PieceType.Troll) {
      result = moveTroll(game, move.pieceId, move.targetSquare, move.opts?.pullBackRockId)
    } else if (pp.type === PieceType.Dwarf) {
      result = moveDwarf(game, move.pieceId, move.targetSquare)
    } else if (pp.type === PieceType.Sorcerer) {
      result = moveSorcerer(game, move.pieceId, move.targetSquare, move.opts?.levitateRockId)
    }

    // Build move description, including rock levitation info if applicable
    let aiMoveDescription = `${fromSquare} → ${move.targetSquare}`
    if (move.opts?.levitateRockId && aiRockOldSquare && result?.ok) {
      const rockNewSquare = result.value.pieces.get(move.opts.levitateRockId)?.square ?? null
      if (rockNewSquare) {
        aiMoveDescription = `${fromSquare} → ${move.targetSquare} (levitated Rock ${aiRockOldSquare} → ${rockNewSquare})`
      }
    }

    newEntries.push({
      id: nextLogId(), timestamp: ts, playerSeat: pp.owner,
      colorName, teamColor, pieceType: pp.type,
      fromSquare, toSquare: move.targetSquare,
      description: aiMoveDescription,
      kind: move.opts?.levitateRockId ? 'levitate' : 'move',
    })
  }

  if (!result || !result.ok) {
    set({ aiTurnState: null, aiTimerId: null })
    return
  }

  let newGame = result.value

  // Handle throw if move resulted in pending throw
  if (newGame.turn.pendingThrow && move.throwDirection) {
    const throwResult = throwRock(newGame, move.throwDirection)
    if (throwResult.ok) {
      newGame = throwResult.value
      const dirLabel = { N: 'North', S: 'South', E: 'East', W: 'West' }[move.throwDirection]
      newEntries.push({
        id: nextLogId(), timestamp: ts, playerSeat: pp.owner,
        colorName, teamColor, pieceType: 'Troll',
        fromSquare: '', toSquare: '',
        description: `threw Rock ${dirLabel}`,
        kind: 'throw',
      })
    }
  }

  const highlights = new Map<SquareKey, HighlightType>()
  if (newGame.lastThrowPath.length > 0) {
    for (const sq of newGame.lastThrowPath) {
      highlights.set(sq, 'throw-path')
    }
  }
  if (newGame.lastSplutSquare) {
    highlights.set(newGame.lastSplutSquare, 'splut')

    // Find which Dwarf was crushed
    let splutDescription = `SPLUT! at ${newGame.lastSplutSquare}`
    for (const [, piece] of game.pieces) {
      if (piece.type === PieceType.Dwarf && (piece as PlayerPiece).alive) {
        const updatedPiece = newGame.pieces.get(piece.id) as PlayerPiece | undefined
        if (updatedPiece && !updatedPiece.alive) {
          const crushedColor = SEAT_COLOR[(piece as PlayerPiece).owner]
          splutDescription = `SPLUT! ${crushedColor} Dwarf crushed at ${newGame.lastSplutSquare}`
          break
        }
      }
    }

    newEntries.push({
      id: nextLogId(), timestamp: ts, playerSeat: null,
      colorName: '', teamColor: 'var(--splut-red)', pieceType: '',
      fromSquare: newGame.lastSplutSquare, toSquare: '',
      description: splutDescription,
      kind: 'splut',
    })
  }

  const { actionLog } = get()
  set({
    game: newGame,
    highlightedSquares: highlights,
    actionLog: [...actionLog, ...newEntries],
    aiTurnState: {
      ...aiTurnState,
      currentMoveIndex: currentMoveIndex + 1,
    },
  })

  // Check if game is over
  if (newGame.phase === GamePhase.Over) {
    set({ aiTurnState: null, aiTimerId: null })
    return
  }

  // Check if turn ended (current player changed)
  if (newGame.turn.currentPlayerSeat !== game.turn.currentPlayerSeat) {
    set({ aiTurnState: null, aiTimerId: null })

    // Check if next player is AI
    const nextPlayer = newGame.players.find(
      p => p.seat === newGame.turn.currentPlayerSeat
    )
    if (nextPlayer?.playerType === PlayerType.AI) {
      setTimeout(() => get().triggerAITurn(), aiConfig.moveDelayMs)
    }
    return
  }

  // Schedule next move
  const timerId = setTimeout(
    () => executeNextAIMove(get, set),
    aiConfig.moveDelayMs
  )
  set({ aiTimerId: timerId })
}
