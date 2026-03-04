// ============================================================================
// SPLUT! Game Engine Types
// All enums and interfaces for the game engine. Zero React dependencies.
// ============================================================================

// --- Coordinate Types ---

export type Col = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I'
export type Row = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface Square {
  col: Col
  row: Row
}

/** Canonical string key e.g. "E5", used in Maps and Sets */
export type SquareKey = string // `${Col}${Row}`

export type Direction = 'N' | 'S' | 'E' | 'W'

// --- Core Enums ---

export enum PlayerSeat {
  Top = 'Top',       // Green
  Bottom = 'Bottom', // Red
  Left = 'Left',     // Yellow
  Right = 'Right',   // Blue
}

export enum PieceType {
  Sorcerer = 'Sorcerer',
  Troll = 'Troll',
  Dwarf = 'Dwarf',
  Rock = 'Rock',
}

export enum RockMoveType {
  Thrown = 'Thrown',
  Levitated = 'Levitated',
  Pushed = 'Pushed',
  Pulled = 'Pulled',
}

export enum GamePhase {
  Lobby = 'Lobby',
  Playing = 'Playing',
  Over = 'Over',
}

export enum PlayerType {
  Human = 'Human',
  AI = 'AI',
}

// --- Piece Interfaces ---

export interface PlayerPiece {
  id: string          // e.g. "Top_Sorcerer", "Bottom_Troll"
  type: PieceType.Sorcerer | PieceType.Troll | PieceType.Dwarf
  owner: PlayerSeat
  square: SquareKey
  alive: boolean
}

export interface RockPiece {
  id: string          // e.g. "Rock_E9", "Rock_E1", "Rock_A5", "Rock_I5"
  type: PieceType.Rock
  square: SquareKey
}

export type Piece = PlayerPiece | RockPiece

// --- Rock State Tracking ---

export interface RockMovementRecord {
  rockId: string
  moveType: RockMoveType
}

export interface TurnRockRecord {
  turnIndex: number
  playerSeat: PlayerSeat
  movedRocks: RockMovementRecord[]
}

// --- Turn State ---

export interface LevitationState {
  rockId: string          // Which rock is being levitated
  hasStarted: boolean     // Levitation has begun this turn
  isStopped: boolean      // Once stopped, cannot restart
}

export interface TurnState {
  currentPlayerSeat: PlayerSeat
  turnIndex: number          // Global monotonic counter (first turn = 0)
  movesAllowed: number       // 1, 2, or 3
  movesUsed: number
  isTerminated: boolean      // True after a Troll throw

  // Levitation tracking within this turn
  levitationState: LevitationState | null

  // Whether a throw is pending (Troll landed on Rock, must choose direction)
  pendingThrow: boolean
}

// --- Player State ---

export interface PlayerState {
  seat: PlayerSeat
  playerType: PlayerType
  isEliminated: boolean
  turnOrder: number      // 0 = first player, 1 = second, etc.
}

// --- Master Game State ---

export interface GameState {
  phase: GamePhase

  // Board
  pieces: Map<string, Piece>               // pieceId -> Piece
  squareOccupancy: Map<SquareKey, string>   // squareKey -> pieceId

  // Players
  players: PlayerState[]                    // Ordered by turn order
  activePlayers: PlayerSeat[]              // Non-eliminated, in turn order

  // Turn
  turn: TurnState

  // Rock state (cooldown)
  previousTurnRockRecord: TurnRockRecord | null
  currentTurnRockRecord: TurnRockRecord

  // Game outcome
  winner: PlayerSeat | null

  // UI hints (populated during move processing)
  lastSplutSquare: SquareKey | null
  lastThrowPath: SquareKey[]
}

// --- Result Type ---

export interface GameError {
  code: string      // machine-readable e.g. "CANNOT_MOVE_OFF_BOARD"
  message: string   // human-readable (matches Gherkin error strings exactly)
}

export type Result<T, E = GameError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E = GameError>(error: E): Result<never, E> {
  return { ok: false, error }
}

// --- Setup Config ---

export interface SetupConfig {
  playerCount: 2 | 3 | 4
  occupiedSeats: PlayerSeat[]
  firstPlayerSeat: PlayerSeat
  playerTypes: Record<string, PlayerType>   // Seat -> PlayerType
}

// --- Throw Result ---

export interface ThrowResult {
  landingSquare: SquareKey | null  // null = Rock does not move (immediate obstacle)
  hitType: 'obstacle' | 'sorcerer' | 'splut' | 'board_edge' | 'no_move'
  splutDwarfId?: string
  killedSorcererId?: string
  path: SquareKey[]                // All squares the Rock passed through
}

// --- Push Result ---

export interface PushResult {
  valid: boolean
  chain: Array<{ pieceId: string; fromSquare: SquareKey; toSquare: SquareKey }>
  error?: GameError
}

// --- AI Types ---

export interface AIMove {
  pieceId: string
  targetSquare: SquareKey
  opts?: MoveOpts
  throwDirection?: Direction
}

export interface MoveOpts {
  pullBackRockId?: string
  levitateRockId?: string
}

// --- Action Log Entry ---

export interface ActionLogEntry {
  turnIndex: number
  player: PlayerSeat
  action: string
  timestamp: number
}
