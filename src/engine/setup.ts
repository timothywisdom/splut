// ============================================================================
// SPLUT! Game Initialization
// Pure TypeScript functions for setting up a new game.
// Zero React dependencies.
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
  SetupConfig,
  Piece,
  SquareKey,
  Result,
  ok,
  err,
} from './types'
import { getMovesAllowed } from './turns'

// --- Starting Positions ---

/** Each seat's team starting positions: [Sorcerer, Dwarf, Troll] */
const STARTING_POSITIONS: Record<PlayerSeat, { sorcerer: SquareKey; dwarf: SquareKey; troll: SquareKey }> = {
  [PlayerSeat.Top]: { sorcerer: 'D8', dwarf: 'E8', troll: 'F8' },
  [PlayerSeat.Bottom]: { sorcerer: 'F2', dwarf: 'E2', troll: 'D2' },
  [PlayerSeat.Left]: { sorcerer: 'B6', dwarf: 'B5', troll: 'B4' },
  [PlayerSeat.Right]: { sorcerer: 'H6', dwarf: 'H5', troll: 'H4' },
}

/** Rock starting positions (at the 4 corner tips of the diamond) */
const ROCK_POSITIONS: SquareKey[] = ['E9', 'E1', 'A5', 'I5']

/** Seat to color name mapping */
export const SEAT_COLOR: Record<PlayerSeat, string> = {
  [PlayerSeat.Top]: 'Green',
  [PlayerSeat.Bottom]: 'Red',
  [PlayerSeat.Left]: 'Yellow',
  [PlayerSeat.Right]: 'Blue',
}

/** Color name to seat mapping */
export const COLOR_TO_SEAT: Record<string, PlayerSeat> = {
  Green: PlayerSeat.Top,
  Red: PlayerSeat.Bottom,
  Yellow: PlayerSeat.Left,
  Blue: PlayerSeat.Right,
}

/** Clockwise turn order starting from Top */
const CLOCKWISE_ORDER: PlayerSeat[] = [
  PlayerSeat.Top,    // Green
  PlayerSeat.Right,  // Blue
  PlayerSeat.Bottom, // Red
  PlayerSeat.Left,   // Yellow
]

/**
 * Get turn order starting from the given first player, clockwise.
 */
function getTurnOrder(firstPlayerSeat: PlayerSeat, occupiedSeats: PlayerSeat[]): PlayerSeat[] {
  const startIndex = CLOCKWISE_ORDER.indexOf(firstPlayerSeat)
  const ordered: PlayerSeat[] = []

  for (let i = 0; i < 4; i++) {
    const seat = CLOCKWISE_ORDER[(startIndex + i) % 4]
    if (occupiedSeats.includes(seat)) {
      ordered.push(seat)
    }
  }

  return ordered
}

/**
 * Valid 2-player seat pairs: only opposite seats.
 */
function isValidTwoPlayerPair(seats: PlayerSeat[]): boolean {
  if (seats.length !== 2) return false
  const sorted = [...seats].sort()
  return (
    (sorted[0] === PlayerSeat.Bottom && sorted[1] === PlayerSeat.Top) ||
    (sorted[0] === PlayerSeat.Left && sorted[1] === PlayerSeat.Right)
  )
}

/**
 * Initialize a new game.
 */
export function initGame(config: SetupConfig): Result<GameState> {
  // Validate player count
  if (config.playerCount < 2) {
    return err({ code: 'TOO_FEW_PLAYERS', message: 'minimum 2 players required' })
  }
  if (config.playerCount > 4) {
    return err({ code: 'TOO_MANY_PLAYERS', message: 'maximum 4 players allowed' })
  }

  // Validate seat count matches player count
  if (config.occupiedSeats.length !== config.playerCount) {
    return err({
      code: 'SEAT_COUNT_MISMATCH',
      message: `expected ${config.playerCount} seats, got ${config.occupiedSeats.length}`,
    })
  }

  // Validate 2-player opposite seat constraint
  if (config.playerCount === 2 && !isValidTwoPlayerPair(config.occupiedSeats)) {
    return err({
      code: 'INVALID_SEAT_PAIR',
      message: '2-player game requires opposite seats',
    })
  }

  // Validate first player is an occupied seat
  if (!config.occupiedSeats.includes(config.firstPlayerSeat)) {
    return err({
      code: 'INVALID_FIRST_PLAYER',
      message: 'first player must occupy a seat',
    })
  }

  // Create pieces
  const pieces = new Map<string, Piece>()
  const squareOccupancy = new Map<SquareKey, string>()

  // Place Rocks
  for (const pos of ROCK_POSITIONS) {
    const rockId = `Rock_${pos}`
    const rock: RockPiece = {
      id: rockId,
      type: PieceType.Rock,
      square: pos,
    }
    pieces.set(rockId, rock)
    squareOccupancy.set(pos, rockId)
  }

  // Place player pieces
  for (const seat of config.occupiedSeats) {
    const positions = STARTING_POSITIONS[seat]
    const colorName = SEAT_COLOR[seat]

    const sorcerer: PlayerPiece = {
      id: `${colorName}_Sorcerer`,
      type: PieceType.Sorcerer,
      owner: seat,
      square: positions.sorcerer,
      alive: true,
    }
    pieces.set(sorcerer.id, sorcerer)
    squareOccupancy.set(positions.sorcerer, sorcerer.id)

    const dwarf: PlayerPiece = {
      id: `${colorName}_Dwarf`,
      type: PieceType.Dwarf,
      owner: seat,
      square: positions.dwarf,
      alive: true,
    }
    pieces.set(dwarf.id, dwarf)
    squareOccupancy.set(positions.dwarf, dwarf.id)

    const troll: PlayerPiece = {
      id: `${colorName}_Troll`,
      type: PieceType.Troll,
      owner: seat,
      square: positions.troll,
      alive: true,
    }
    pieces.set(troll.id, troll)
    squareOccupancy.set(positions.troll, troll.id)
  }

  // Determine turn order
  const turnOrder = getTurnOrder(config.firstPlayerSeat, config.occupiedSeats)

  // Create player states
  const players: PlayerState[] = turnOrder.map((seat, index) => ({
    seat,
    playerType: config.playerTypes[seat] ?? PlayerType.Human,
    isEliminated: false,
    turnOrder: index,
  }))

  // Create turn state
  const turn: TurnState = {
    currentPlayerSeat: config.firstPlayerSeat,
    turnIndex: 0,
    movesAllowed: getMovesAllowed(0),
    movesUsed: 0,
    isTerminated: false,
    levitationState: null,
    pendingThrow: false,
  }

  // Create rock tracking
  const currentTurnRockRecord: TurnRockRecord = {
    turnIndex: 0,
    playerSeat: config.firstPlayerSeat,
    movedRocks: [],
  }

  const state: GameState = {
    phase: GamePhase.Playing,
    pieces,
    squareOccupancy,
    players,
    activePlayers: turnOrder,
    turn,
    previousTurnRockRecord: null,
    currentTurnRockRecord,
    winner: null,
    lastSplutSquare: null,
    lastThrowPath: [],
  }

  return ok(state)
}

/**
 * Get starting positions for a given seat.
 */
export function getStartingPositions(seat: PlayerSeat) {
  return STARTING_POSITIONS[seat]
}
