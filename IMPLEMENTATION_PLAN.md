# SPLUT! - Implementation Plan

## Executive Summary

This document is the complete implementation blueprint for SPLUT! as a Next.js 15 (App Router) single-page application. It is intended for senior developer review before any code is written.

**Visual Design Authority:** All visual implementation (colors, typography, layout, animations, component styling, and UX interactions) must conform to [`DESIGN_SPEC.md`](./DESIGN_SPEC.md). That document is the single source of truth for how the application looks and feels. Where this implementation plan describes UI components or visual behavior, the Design Spec takes precedence for pixel-level details.

---

## 0. Design Specification Reference

The companion document **[`DESIGN_SPEC.md`](./DESIGN_SPEC.md)** defines the complete visual identity and user experience for SPLUT!. It covers:

- **Visual Identity:** Dark fantasy art direction, color palette (all hex codes), typography (Cinzel/Inter/JetBrains Mono), iconography, lighting/shadow, and motion language with precise timing curves.
- **Layout and Grid:** Responsive breakpoints, board cell sizing, three-zone game layout, and spacing scale.
- **Screen-by-Screen UX:** Pixel-precise specifications for the Lobby screen, Game screen (board, turn banner, player status, action log), Throw Direction Picker, Levitation state, AI Thinking state, SPLUT! kill animation, and Game Over overlay.
- **Component Library:** All reusable components (buttons, toggles, pips, cards, tooltips, scrollbars) with dimensions, colors, and all interactive states.
- **Feedback and Delight:** Particle systems, screen shake, throw trajectory trails, sound design direction, and micro-interaction details.
- **Accessibility:** WCAG AA compliance, keyboard navigation, screen reader support, reduced motion, and colorblind considerations.
- **Implementation Notes:** Tailwind config extensions, z-index architecture, CSS variable strategy, data-testid patterns, asset format requirements, and performance guidance.

Implementation agents building UI components (Phase 3+) should read the Design Spec in full before writing any component code.

---

## 1. Project Structure

```
/Users/tim.beamish/source/splut/
├── features/                          # Existing Gherkin BDD specs (read-only reference)
│   └── *.feature
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout, global fonts/meta
│   │   ├── page.tsx                   # Home/lobby page (player count setup)
│   │   ├── game/
│   │   │   └── page.tsx               # Game page (pure client component via 'use client')
│   │   └── globals.css                # Tailwind base styles
│   │
│   ├── engine/                        # Pure TypeScript game logic (zero React dependency)
│   │   ├── board.ts                   # Board geometry: valid squares, adjacency, coordinates
│   │   ├── setup.ts                   # Game initialisation, starting positions
│   │   ├── movement.ts                # Generic movement validation (shared by all pieces)
│   │   ├── troll.ts                   # Troll-specific: move, pull-back, throw trajectory
│   │   ├── dwarf.ts                   # Dwarf-specific: move, push chain
│   │   ├── sorcerer.ts                # Sorcerer-specific: move, levitate
│   │   ├── turns.ts                   # Turn management: move counts, advance turn, skip eliminated
│   │   ├── win.ts                     # Win condition detection, team elimination
│   │   ├── rockState.ts               # Rock movement tracking (cooldown logic)
│   │   ├── ai.ts                      # AI move planning: planAITurn and 5 tier evaluators
│   │   └── types.ts                   # All TypeScript interfaces and enums
│   │
│   ├── store/                         # Zustand state management
│   │   ├── gameStore.ts               # Main game store
│   │   └── selectors.ts               # Derived selectors (valid moves, UI state)
│   │
│   ├── components/                    # React UI components
│   │   ├── lobby/
│   │   │   ├── PlayerCountSelector.tsx
│   │   │   ├── SeatSelector.tsx
│   │   │   └── PlayerTypeToggle.tsx       # Toggle per seat between Human/AI
│   │   ├── game/
│   │   │   ├── GameBoard.tsx          # Outer container, coordinates SVG/CSS grid
│   │   │   ├── BoardSquare.tsx        # Individual cell (click target, highlight state)
│   │   │   ├── Piece.tsx              # Renders any piece by type/team
│   │   │   ├── Rock.tsx               # Renders Rock (neutral, distinct visual)
│   │   │   ├── TurnBanner.tsx         # "Green's turn - 2 moves remaining"
│   │   │   ├── MoveCounter.tsx        # Visual move pip indicators
│   │   │   ├── PlayerStatus.tsx       # Per-player status strip (eliminated/active)
│   │   │   ├── ThrowDirectionPicker.tsx  # Modal/overlay for choosing throw direction
│   │   │   ├── AIThinkingIndicator.tsx    # Pulsing indicator shown during AI turns
│   │   │   ├── GameOverOverlay.tsx    # Winner announcement
│   │   │   └── ActionLog.tsx          # Scrolling log of moves (optional Phase 3)
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── Modal.tsx
│   │
│   └── lib/
│       └── constants.ts               # Board size, colour palette, animation timings
│
├── tests/
│   ├── engine/                        # Vitest unit tests (mirrors engine/ structure)
│   │   ├── board.test.ts
│   │   ├── setup.test.ts
│   │   ├── movement.test.ts
│   │   ├── troll.test.ts
│   │   ├── dwarf.test.ts
│   │   ├── sorcerer.test.ts
│   │   ├── turns.test.ts
│   │   ├── win.test.ts
│   │   ├── rockState.test.ts
│   │   ├── ai.test.ts                 # Unit tests for planAITurn and each tier evaluator
│   │   └── scenarios/                 # Full scenario-level integration tests
│   │       ├── game_setup.test.ts     # Covers 01_game_setup.feature
│   │       ├── turn_management.test.ts
│   │       ├── troll_movement.test.ts
│   │       ├── troll_throw.test.ts
│   │       ├── splut_rule.test.ts
│   │       ├── dwarf_movement.test.ts
│   │       ├── sorcerer_movement.test.ts
│   │       ├── win_condition.test.ts
│   │       ├── rock_state.test.ts
│   │       ├── general_movement.test.ts
│   │       └── ai_player.test.ts          # Maps to 11_ai_player.feature (65 scenarios + 1 outline)
│   └── e2e/                           # Playwright end-to-end tests
│       ├── lobby.spec.ts
│       ├── full_game_2p.spec.ts
│       └── full_game_4p.spec.ts
│
├── IMPLEMENTATION_PLAN.md             # This document
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## 2. Board Representation

### 2.1 Coordinate System

The board uses a column-letter / row-number system (A-I, 1-9). The centre square is E5.

The diamond shape is defined mathematically: a square (col, row) is valid if and only if:

```
|col_index - 4| + |row_index - 4| <= 4
```

where col_index is 0 for A through 8 for I, and row_index is 0 for row 1 through 8 for row 9.

This yields exactly **41 valid squares**.

### 2.2 Valid Squares (exhaustive, for verification)

```
Row 9: E9                                     (1 square)
Row 8: D8 E8 F8                               (3 squares)
Row 7: C7 D7 E7 F7 G7                         (5 squares)
Row 6: B6 C6 D6 E6 F6 G6 H6                  (7 squares)
Row 5: A5 B5 C5 D5 E5 F5 G5 H5 I5            (9 squares)
Row 4: B4 C4 D4 E4 F4 G4 H4                  (7 squares)
Row 3: C3 D3 E3 F3 G3                         (5 squares)
Row 2: D2 E2 F2                               (3 squares)
Row 1: E1                                     (1 square)
Total: 41 squares
```

### 2.3 Implementation in `/src/engine/board.ts`

```typescript
// Coordinate type - a value object
type Col = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I'
type Row = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

interface Square {
  col: Col
  row: Row
}

// Canonical string key e.g. "E5", used in Maps and Sets
type SquareKey = string  // `${Col}${Row}`

function toKey(sq: Square): SquareKey
function fromKey(key: SquareKey): Square
function isValidSquare(col: number, row: number): boolean
  // |col - 4| + |row - 4| <= 4

// Precomputed at module load:
const ALL_VALID_SQUARES: ReadonlySet<SquareKey>  // 41 entries
const ADJACENCY_MAP: ReadonlyMap<SquareKey, SquareKey[]>
  // Each square -> array of orthogonally adjacent valid squares

// Direction helpers
type Direction = 'N' | 'S' | 'E' | 'W'
function step(sq: Square, dir: Direction): Square | null
  // Returns null if the result is off the board
```

The `ADJACENCY_MAP` and `ALL_VALID_SQUARES` are computed once at module initialisation (not per-render), making board lookups O(1).

---

## 3. Game State Model

All types live in `/src/engine/types.ts`.

### 3.1 Core Enums

```typescript
enum PlayerSeat {
  Top    = 'Top',     // Green
  Bottom = 'Bottom',  // Red
  Left   = 'Left',    // Yellow
  Right  = 'Right',   // Blue
}

enum PieceType {
  Sorcerer = 'Sorcerer',
  Troll    = 'Troll',
  Dwarf    = 'Dwarf',
  Rock     = 'Rock',
}

// How a Rock was last moved - used for levitation cooldown
enum RockMoveType {
  Thrown    = 'Thrown',
  Levitated = 'Levitated',
  Pushed    = 'Pushed',
  Pulled    = 'Pulled',
}

enum GamePhase {
  Lobby    = 'Lobby',
  Playing  = 'Playing',
  Over     = 'Over',
}

enum PlayerType {
  Human = 'Human',
  AI    = 'AI',
}

type Direction = 'N' | 'S' | 'E' | 'W'
```

### 3.2 Piece Interfaces

```typescript
interface PlayerPiece {
  id: string          // e.g. "Green_Sorcerer", "Red_Troll"
  type: PieceType.Sorcerer | PieceType.Troll | PieceType.Dwarf
  owner: PlayerSeat
  square: SquareKey
  alive: boolean
}

interface RockPiece {
  id: string          // "Rock_E9", "Rock_E1", "Rock_A5", "Rock_I5" (initial identity)
  type: PieceType.Rock
  square: SquareKey
}

type Piece = PlayerPiece | RockPiece
```

### 3.3 Rock State Tracking (Levitation Cooldown)

This is one of the trickier areas. The rule is: a Rock cannot be levitated if it was moved during the **previous player's turn** (not any earlier turn, and not the *current* player's own turn).

```typescript
// Records which rocks were moved during a given turn, and how
interface RockMovementRecord {
  rockId: string
  moveType: RockMoveType
}

// Per-turn record keyed by a turn index (global monotonically incrementing)
interface TurnRockRecord {
  turnIndex: number
  playerSeat: PlayerSeat
  movedRocks: RockMovementRecord[]
}
```

At any point, the store only needs to keep the **last two** `TurnRockRecord` entries:
- `previousTurnRecord`: which rocks the previous player moved (cooldown check)
- `currentTurnRecord`: which rocks the current player has moved this turn (allowed for levitation)

When a turn advances, `currentTurnRecord` becomes `previousTurnRecord` and a new empty `currentTurnRecord` is created.

### 3.4 Turn State

```typescript
interface TurnState {
  currentPlayerSeat: PlayerSeat
  turnIndex: number          // Global monotonic counter (first turn = 0)
  movesAllowed: number       // 1, 2, or 3
  movesUsed: number
  isTerminated: boolean      // True after a Troll throw (remaining moves forfeit)

  // Levitation tracking within this turn
  levitationState: LevitationState | null
}

interface LevitationState {
  rockId: string             // Which rock is being levitated
  hasStarted: boolean        // Levitation has begun this turn
  isStopped: boolean         // Once stopped, cannot restart (even with same rock)
}
```

### 3.5 Player State

```typescript
interface PlayerState {
  seat: PlayerSeat
  playerType: PlayerType     // Whether this seat is Human or AI-controlled
  isEliminated: boolean
  turnOrder: number          // 0 = first player, 1 = second, etc. (determines move count)
}
```

### 3.6 Master Game State

```typescript
interface GameState {
  phase: GamePhase

  // Board
  pieces: Map<string, Piece>          // pieceId -> Piece
  squareOccupancy: Map<SquareKey, string>  // squareKey -> pieceId (for O(1) lookups)

  // Players
  players: PlayerState[]              // Ordered clockwise; index 0 = first player
  activePlayers: PlayerSeat[]         // Subset of players not yet eliminated, in turn order

  // Turn
  turn: TurnState

  // Rock state (cooldown)
  previousTurnRockRecord: TurnRockRecord | null
  currentTurnRockRecord: TurnRockRecord

  // Game outcome
  winner: PlayerSeat | null

  // UI hint (populated during move processing)
  lastSplutSquare: SquareKey | null
  lastThrowPath: SquareKey[]
}
```

**Design note on dual indexing:** Both `pieces` (by ID) and `squareOccupancy` (by square) are maintained in sync. This avoids scanning all pieces to find what is on a square during throw/push trajectory resolution. Every engine function that moves a piece must update both maps atomically.

---

## 4. Game Engine Design

The engine (`/src/engine/`) is a collection of **pure functions**. Every function takes `GameState` (or a subset) as input and returns either a new `GameState` or a `Result<GameState, GameError>` type. No side effects, no React, no Zustand imports.

### 4.1 Result Type

```typescript
type Result<T, E = GameError> =
  | { ok: true;  value: T }
  | { ok: false; error: E }

interface GameError {
  code: string      // machine-readable e.g. "CANNOT_MOVE_OFF_BOARD"
  message: string   // human-readable (matches Gherkin error strings exactly)
}
```

### 4.2 `board.ts` - Board Geometry

```typescript
// Exported pure functions
isValidSquare(col: number, row: number): boolean
getAdjacentSquares(sq: SquareKey): SquareKey[]
stepInDirection(sq: SquareKey, dir: Direction): SquareKey | null
isOrthogonallyAdjacent(a: SquareKey, b: SquareKey): boolean
getDirectionBetween(from: SquareKey, to: SquareKey): Direction | null
  // Returns null if not orthogonally adjacent or same square
manhattanDistance(a: SquareKey, b: SquareKey): number
```

### 4.3 `movement.ts` - Shared Validation

```typescript
// Universal move validation (used by all three piece types)
validateBasicMove(
  state: GameState,
  pieceId: string,
  targetSquare: SquareKey
): Result<void>
  // Validates: orthogonal, 1-step, on-board, correct owner, it is their turn

getPieceAt(state: GameState, square: SquareKey): Piece | null
isOccupied(state: GameState, square: SquareKey): boolean
```

### 4.4 `troll.ts` - Troll Engine

```typescript
// Validates and executes a Troll move (with optional pull-back)
// If destination has a Rock, triggers throw automatically
moveTroll(
  state: GameState,
  trollId: string,
  targetSquare: SquareKey,
  pullBackRockId?: string   // Optional: ID of Rock to pull
): Result<GameState>

// Validates and executes a throw in a direction
// This is a separate step called after moveTroll returns a "must throw" signal
throwRock(
  state: GameState,
  direction: Direction
): Result<GameState>

// Internal trajectory resolver
resolveThrowTrajectory(
  state: GameState,
  fromSquare: SquareKey,
  direction: Direction
): ThrowResult

interface ThrowResult {
  landingSquare: SquareKey | null    // null = Rock does not move (immediate obstacle)
  hitType: 'obstacle' | 'sorcerer' | 'splut' | 'board_edge'
  splutDwarfSquare?: SquareKey
  killedSorcererSquare?: SquareKey
  path: SquareKey[]                  // All squares the Rock passed through
}
```

**Throw Trajectory Algorithm** (implemented in `resolveThrowTrajectory`):

```
Start at the Troll's square (the Rock's starting position).
Walk step-by-step in the chosen direction.
For each next square:
  - If next square is OFF the board:
      Rock stops on current square (board edge is obstacle, stop BEFORE).
      Return { hitType: 'board_edge', landingSquare: currentSquare }
  - If next square contains a Troll or another Rock:
      Rock stops on current square (stop BEFORE obstacle).
      Check if currentSquare has a Dwarf → if so, that's SPLUT!
      Return { hitType: 'obstacle', landingSquare: currentSquare }
  - If next square contains a Sorcerer:
      Rock lands on Sorcerer square (Sorcerer is a Target).
      Return { hitType: 'sorcerer', landingSquare: nextSquare }
  - If next square contains a Dwarf:
      Peek at the square AFTER the Dwarf:
        If that square is OFF board, or contains a Troll/Rock → SPLUT!
          Return { hitType: 'splut', landingSquare: dwarfSquare, splutDwarfSquare: dwarfSquare }
        Otherwise → Rock flies over the Dwarf, advance to dwarfSquare, continue loop.
  - If next square is empty:
      Advance to next square, continue loop.

Special case: If next square is immediately an obstacle from starting position,
  Rock stays at starting square (Troll square), hitType = 'obstacle', landingSquare = startSquare.
```

**Critical subtlety (multiple Dwarves in sequence):** When iterating over a sequence of Dwarves, only the peek-ahead of the **last Dwarf in the consecutive run** matters for SPLUT!. The algorithm above handles this naturally because it processes one square at a time and only peeks ahead once a Dwarf is found.

### 4.5 `dwarf.ts` - Dwarf Engine

```typescript
moveDwarf(
  state: GameState,
  dwarfId: string,
  targetSquare: SquareKey
): Result<GameState>

// Internal push chain resolver
resolvePushChain(
  state: GameState,
  fromSquare: SquareKey,     // Where the Dwarf is moving TO (first piece to push)
  direction: Direction
): PushResult

interface PushResult {
  valid: boolean
  chain: Array<{ pieceId: string; fromSquare: SquareKey; toSquare: SquareKey }>
  error?: GameError
}
```

**Push Algorithm:**

```
Collect the chain: starting at targetSquare, walk direction until empty square.
  Each occupied square's piece is added to the chain in order.
Check termination:
  If the square after the last piece is OFF the board → invalid (cannot push off board).
  If the square after the last piece is empty → valid.
Apply chain in reverse order: move last piece first, then second-to-last, etc.
Move Dwarf into targetSquare.
Mark all Rocks in the chain as "Pushed" in currentTurnRockRecord.
```

### 4.6 `sorcerer.ts` - Sorcerer Engine

```typescript
moveSorcerer(
  state: GameState,
  sorcererId: string,
  targetSquare: SquareKey,
  levitateRockId?: string    // Optional: Rock to levitate alongside
): Result<GameState>

validateLevitationEligibility(
  state: GameState,
  rockId: string
): Result<void>
  // Checks: rock exists, not on cooldown (previousTurnRockRecord),
  //         no other rock being levitated this turn,
  //         levitation not stopped this turn

checkLevitationBlocked(
  state: GameState,
  rockSquare: SquareKey,
  direction: Direction
): boolean
  // True if the Rock's destination in 'direction' is blocked by:
  // board edge, Troll, another Rock, Dwarf, or any Sorcerer
```

**Levitation UX model:** When the player selects a Sorcerer, all eligible Rocks (not on cooldown, not interrupted) are highlighted with `levitate-eligible` style on the board. The player can click an eligible Rock to select it for levitation — this updates `levitateRockId` in the store and filters valid move targets to only directions where the Rock can also move. Clicking the selected Rock again deselects it. When the player clicks a valid move target, `levitateRockId` is passed to `moveSorcerer`. The engine enforces continuity (cannot resume after stopping) and the one-Rock-per-turn rule.

**Pull-Back UX model:** When a Troll moves to an empty square and there is a Rock directly behind it (opposite to the movement direction), the UI shows a `PullBackPrompt` overlay with "Pull Rock" and "Move Only" buttons. The store holds a `pendingPullBack` state containing the Troll ID, target square, and eligible Rock ID. Confirming calls `moveTroll` with or without the `pullBackRockId`. When the Troll lands on a Rock (triggering a throw), no pull-back prompt is shown.

### 4.7 `turns.ts` - Turn Management

```typescript
// Returns the number of moves allowed for the given absolute turn index
// turnIndex 0 = first turn of game = 1 move
// turnIndex 1 = second turn = 2 moves
// turnIndex >= 2 = 3 moves
getMovesAllowed(turnIndex: number): number

advanceTurn(state: GameState): GameState
  // 1. Roll previousTurnRockRecord = currentTurnRockRecord
  // 2. Reset currentTurnRockRecord
  // 3. Find next active (non-eliminated) player in clockwise order
  // 4. Increment turnIndex
  // 5. Set movesAllowed, reset movesUsed, reset isTerminated
  // 6. Reset levitationState

consumeMove(state: GameState): GameState
  // Increment movesUsed; if movesUsed === movesAllowed, call advanceTurn
```

**Critical: First-player seating.** The turn order array (`activePlayers`) is populated during setup. The `players` array stores a `turnOrder` index that is permanent for the duration of the game. `getMovesAllowed` uses the **global `turnIndex`**, not the player's own turn count.

### 4.8 `win.ts` - Win and Elimination

```typescript
// Called after any throw that kills a Sorcerer
eliminateTeam(state: GameState, seat: PlayerSeat): GameState
  // 1. Remove all pieces belonging to seat from pieces map and squareOccupancy
  // 2. Rock that killed the Sorcerer stays (already placed by throw resolution)
  // 3. Mark player as eliminated in activePlayers
  // 4. Check if only 1 active player remains → set phase = Over, winner

checkWinCondition(state: GameState): GameState
  // Pure check: if activePlayers.length === 1 → set winner and phase
```

### 4.9 `setup.ts` - Initialisation

```typescript
interface SetupConfig {
  playerCount: 2 | 3 | 4
  occupiedSeats: PlayerSeat[]                       // Must have correct count
  firstPlayerSeat: PlayerSeat                       // Determined externally (dice roll / UI selection)
  playerTypes: Record<PlayerSeat, PlayerType>       // Human or AI per occupied seat
}

initGame(config: SetupConfig): Result<GameState>
  // Validates config (seat rules), places pieces, initialises TurnState
  // Stores playerType on each PlayerState; validates seat rules regardless of PlayerType
```

**2-player seat constraint:** Only opposite seat pairs are valid: (Top, Bottom) or (Left, Right). All other pairings are invalid and must return a setup error. This constraint applies regardless of whether seats are Human or AI.

---

## 5. Zustand Store Design

`/src/store/gameStore.ts`

```typescript
interface GameStore {
  // --- State ---
  game: GameState

  // UI state (not part of engine GameState)
  selectedPieceId: string | null
  validMoveTargets: SquareKey[]
  pendingThrowDirection: boolean   // True when Troll has landed on Rock, awaiting direction
  highlightedSquares: Map<SquareKey, HighlightType>

  // AI configuration
  aiConfig: AIConfig

  // AI execution state (null when no AI turn is in progress)
  aiTurnState: AITurnState | null

  // --- Actions ---
  initGame: (config: SetupConfig) => void

  selectPiece: (pieceId: string) => void
    // Computes valid move targets and stores in validMoveTargets
    // No-op when aiTurnState.isExecuting === true

  movePiece: (targetSquare: SquareKey, opts?: MoveOpts) => void
    // Delegates to correct engine function based on piece type
    // If Troll lands on Rock → sets pendingThrowDirection = true
    // No-op when aiTurnState.isExecuting === true

  chooseThrowDirection: (dir: Direction) => void
    // Called from ThrowDirectionPicker; delegates to throwRock engine function

  chooseLevitateRock: (rockId: string | null) => void
    // Sets levitation choice; when a rock is selected, filters valid move targets
    // to only directions where the rock can also move. Deselecting restores all targets.

  confirmPullBack: (doPull: boolean) => void
    // Called from PullBackPrompt; executes the pending Troll move with or without pull-back

  triggerAITurn: () => void
    // Called automatically when advanceTurn results in an AI player's turn.
    // Calls planAITurn(state.game), stores result in aiTurnState.plannedMoves,
    // sets aiTurnState.isExecuting = true, then schedules first executeNextAIMove.

  cancelAITurn: () => void
    // Internal: clears aiTurnState (used when game ends mid-AI-turn)

  resetGame: () => void

  // --- Selectors (computed) ---
  // These live in selectors.ts and are derived from game state
}

interface AIConfig {
  moveDelayMs: number    // Default 500ms; set to 0 for instant AI (tests / spectate)
}

interface AITurnState {
  isExecuting: boolean           // True while the AI is mid-turn; blocks human interaction
  currentMoveIndex: number       // Index into plannedMoves for the next move to execute
  plannedMoves: AIMove[]         // Full move list returned by planAITurn
}

interface AIMove {
  pieceId: string
  targetSquare: SquareKey
  opts?: MoveOpts
  throwDirection?: Direction     // Pre-planned throw direction (AI never needs the picker UI)
}

type HighlightType = 'selected' | 'valid-move' | 'throw-path' | 'splut' | 'levitate-eligible'

interface MoveOpts {
  pullBackRockId?: string
  levitateRockId?: string
}

interface PendingPullBack {
  trollId: string
  targetSquare: SquareKey
  rockId: string
  rockSquare: SquareKey
}
```

**Human interaction lock:** All store actions that affect game state (`selectPiece`, `movePiece`, `chooseThrowDirection`, `chooseLevitateRock`) check `aiTurnState?.isExecuting === true` at their entry point and return immediately (no-op) if true. The `ThrowDirectionPicker` component is not rendered during AI turns because the throw direction is pre-planned and stored in `AIMove.throwDirection`.

**Key design decision: Valid move computation in the store, not engine.** The engine validates whether a specific attempted move is legal. The store pre-computes the set of valid destination squares when a piece is selected (for UI highlighting). This pre-computation calls engine validators speculatively for each candidate square.

`/src/store/selectors.ts`:

```typescript
// Computes which squares a selected piece can legally move to
getValidMoveTargets(game: GameState, pieceId: string): SquareKey[]

// Whether the current player can levitate a specific rock
canLevitateRock(game: GameState, rockId: string): boolean

// All rocks eligible for levitation this turn
getEligibleRocksForLevitation(game: GameState): string[]
```

---

## 5A. AI Engine (`/src/engine/ai.ts`)

The AI engine is a **pure TypeScript module** — zero React, zero Zustand, zero timers. It takes a `GameState` and returns an ordered list of `AIMove` objects representing the complete move plan for the AI's current turn.

### 5A.1 Main Entry Point

```typescript
// Returns the complete ordered move plan for the AI's current turn.
// Calls tier evaluators repeatedly (once per available move), simulating each
// chosen move against the state before evaluating the next.
function planAITurn(state: GameState): AIMove[]
```

The function loops up to `movesAllowed` times. On each iteration:
1. Call tier evaluators in priority order (Tier 1 → Tier 5) against the current simulated state.
2. Append the chosen `AIMove` to the result list.
3. Apply the move to get a new simulated `GameState` for the next iteration.
4. If the move includes a throw (`throwDirection` is set), stop immediately — throw terminates the turn.

### 5A.2 Priority Tier Architecture

#### Tier 1 — Immediate Win

```typescript
evaluateTier1(state: GameState): AIMove | null
```

Scans all positions where:
- The AI's own Troll is already on a Rock (can throw immediately), OR
- The AI's own Troll is orthogonally adjacent to a Rock (can move onto Rock in one step, then throw).

For each candidate, call `resolveThrowTrajectory` for all 4 directions. A direction qualifies if it kills an **enemy** Sorcerer (not the AI's own Sorcerer — see self-elimination avoidance below).

If qualifying throws exist, select the one whose target square is **alphabetically first** (`SquareKey` string sort). In practice, `planAITurn` calls `evaluateTier1` once per iteration; if the Troll must first move onto a Rock, that movement is returned on the current iteration and the throw is returned on the next iteration's Tier 1 re-evaluation.

Returns `null` if no qualifying throw exists.

**Self-elimination avoidance:** Filter out any throw direction where `resolveThrowTrajectory` would hit the AI's own Sorcerer. Only directions that kill enemy Sorcerers are eligible for Tier 1.

#### Tier 2 — Defensive Escape

```typescript
evaluateTier2(state: GameState): AIMove | null
isSorcererThreatened(state: GameState, sorcererId: string): boolean
getSafeSorcererMoves(state: GameState, sorcererId: string): SquareKey[]
```

Check if the AI's own Sorcerer is threatened:
- An enemy Troll is on a Rock in the same row **or** same column as the AI Sorcerer.
- No obstacle (Troll, Rock, Dwarf, or board edge) exists between that enemy Troll and the AI Sorcerer.

If threatened, filter valid Sorcerer destinations to only "safe" squares (not in any threatened row or column). Pick the **alphabetically-first** safe destination. If no safe destination exists, pick the **alphabetically-first** valid destination regardless (partial escape is better than none).

Returns `null` if the Sorcerer is not threatened.

#### Tier 3 — Rock Positioning

```typescript
evaluateTier3(state: GameState): AIMove | null
```

Two sub-options, evaluated in order:

1. **Pull Back (higher priority):** If the AI's Troll is orthogonally adjacent to a Rock not on cooldown (`previousTurnRockRecord`), and `isPullEligible` passes, return the pull-back move.

2. **Levitate:** If the AI's Sorcerer can levitate an eligible Rock, move 1 step closer to the nearest enemy Sorcerer's row or column. Only if that direction is not blocked.

Returns `null` if neither sub-option applies.

#### Tier 4 — Approach

```typescript
evaluateTier4(state: GameState): AIMove | null
```

1. **Troll approaches nearest Rock:** Manhattan distance; tiebreaker = alphabetically-first Rock `SquareKey`, then alphabetically-first move target.

2. **Sorcerer approaches nearest eligible Rock (if Troll has no approach move):** Same tiebreaker rules.

Returns `null` if no approach is available.

#### Tier 5 — Fallback

```typescript
evaluateTier5(state: GameState): AIMove | null
```

Any valid move. Piece priority order: **Troll > Dwarf > Sorcerer**. For the highest-priority piece with at least one valid destination, return the move to the **alphabetically-first** valid `SquareKey`. Returns `null` only in pathological no-valid-moves edge case.

### 5A.3 Throw Direction Selection (Non-Tier-1 Throws)

When `planAITurn` detects a Troll has landed on a Rock (mandatory throw), direction is selected by priority:

1. Any direction where `resolveThrowTrajectory` kills an enemy Sorcerer (alphabetically-first target).
2. Any direction that does NOT hit the AI's own Sorcerer (alphabetically-first direction string: `'E' < 'N' < 'S' < 'W'`).
3. Any direction (pathological fallback if all directions hit own Sorcerer).

### 5A.4 Key Functions Summary

```typescript
// Main entry point
planAITurn(state: GameState): AIMove[]

// Tier evaluators — each returns the best single AIMove for that tier, or null
evaluateTier1(state: GameState): AIMove | null   // Immediate win
evaluateTier2(state: GameState): AIMove | null   // Defensive escape
evaluateTier3(state: GameState): AIMove | null   // Rock positioning
evaluateTier4(state: GameState): AIMove | null   // Approach
evaluateTier5(state: GameState): AIMove | null   // Fallback

// Threat detection helpers
isSorcererThreatened(state: GameState, sorcererId: string): boolean
getSafeSorcererMoves(state: GameState, sorcererId: string): SquareKey[]
```

**No side effects.** None of these functions use `setTimeout`, mutate global state, or import from React or Zustand. All are fully testable with Vitest using synchronous assertions.

---

## 5B. AI Turn Orchestration (Zustand Store)

The Zustand store is the boundary between pure engine logic and time-based UI behaviour. It is responsible for **timing** the AI moves via `setTimeout`.

### 5B.1 Orchestration Flow

1. `advanceTurn` (in `turns.ts`) returns a new `GameState`. The store checks whether `newState.players.find(p => p.seat === newState.turn.currentPlayerSeat)?.playerType === PlayerType.AI`.
2. If yes, the store automatically calls `triggerAITurn()`.
3. `triggerAITurn`:
   - Calls `planAITurn(store.game)` to get the complete `AIMove[]` list.
   - Sets `aiTurnState = { isExecuting: true, currentMoveIndex: 0, plannedMoves: moves }`.
   - Schedules the first `executeNextAIMove` via `setTimeout(executeNextAIMove, aiConfig.moveDelayMs)`.
4. `executeNextAIMove` (internal store function):
   - Reads `aiTurnState.plannedMoves[currentMoveIndex]`.
   - Applies the move to `game` using the appropriate engine function.
   - Increments `currentMoveIndex`.
   - If more moves remain AND turn has not ended (`!game.turn.isTerminated`): schedules next `executeNextAIMove`.
   - If done: sets `aiTurnState = null`.
   - `advanceTurn` within AI move execution may immediately trigger another AI turn — the store re-checks and calls `triggerAITurn` again (handles AI vs AI chaining).

### 5B.2 React Component Behaviour During AI Turns

- `ThrowDirectionPicker` is **not rendered** when `aiTurnState !== null` (throw direction is pre-planned in `AIMove.throwDirection`).
- `TurnBanner` shows **"AI is thinking..."** with a `animate-pulse` Tailwind animation.
- `GameBoard` receives `pointer-events: none` via a CSS class when `aiTurnState?.isExecuting === true`.
- `AIThinkingIndicator` is rendered alongside `TurnBanner` during AI turns.

### 5B.3 Test Configuration

For unit and integration tests, `aiConfig.moveDelayMs` is set to `0`. AI turns execute with zero-delay `setTimeout` calls, testable with Vitest's `vi.useFakeTimers()` / `vi.runAllTimers()`. All 65 AI scenarios can be tested without real time delays.

---

## 6. UI Component Architecture

### 6.1 Component Tree

```
app/page.tsx (Lobby)
└── PlayerCountSelector
    └── SeatSelector
        ├── PlayerTypeToggle (per seat — toggles Human/AI)
        └── [Start Game] → navigate to /game

app/game/page.tsx ('use client', h-screen overflow-hidden)
└── GameBoard (CSS grid container, no rotation; pointer-events: none during AI turns)
    ├── Coordinate labels (A-I top, 9-1 left)
    ├── BoardSquare × 41 (click targets, highlight states)
    │   └── Piece? (if occupied: Sorcerer | Troll | Dwarf | Rock)
    ├── TurnBanner (top of screen; shows "AI is thinking..." during AI turns)
    ├── AIThinkingIndicator (conditional — rendered only during AI turns)
    ├── MoveCounter (pip indicators)
    ├── PlayerStatus × N (side panel; AI-controlled seats show "AI" badge)
    ├── PullBackPrompt (modal, conditional; shown when Troll has pull-eligible Rock)
    ├── ThrowDirectionPicker (modal, conditional; suppressed during AI turns)
    └── GameOverOverlay (conditional)
```

### 6.2 Board Rendering Strategy

**Recommended approach: CSS Grid with absolute positioning.**

The board is a 9×9 CSS grid where only valid squares are rendered. Invalid squares render as transparent spacer `div`s (or are simply absent with `grid-column`/`grid-row` placement). This is simpler than SVG, works well with Tailwind, and supports accessible click targets.

Each valid square has its CSS grid position computed from its column and row:

```
grid-column: <col_index + 1>   (A=1, B=2, ... I=9)
grid-row:    <10 - row>        (row 9 → grid row 1, row 1 → grid row 9)
```

The board is displayed without rotation — standard axis-aligned squares. The diamond shape of the valid play area is formed naturally by only rendering the 41 valid squares. No CSS rotation is applied, which means cardinal directions map intuitively: N = up, S = down, E = right, W = left. This avoids confusion when choosing throw directions and makes coordinate labels straightforward.

**Coordinate labels:** Column labels (A-I) along the top and row labels (9-1) along the left side of the board, using JetBrains Mono 13px in Ash color. These allow players to trace positions referenced in the battle log.

### 6.3 Visual Design

**Colour scheme:**
- Green team: `emerald-500`
- Red team: `red-500`
- Yellow team: `amber-400`
- Blue team: `blue-500`
- Rock: `stone-600` with a rough texture (CSS radial-gradient)
- Board squares: alternating `stone-100` / `stone-200` (light mode); highlight variants for valid moves (`emerald-200`), selected (`ring-2 ring-yellow-400`), throw path (`orange-100`)

**Piece rendering (`/src/components/game/Piece.tsx`):** Each piece type has a distinct shape:
- Sorcerer: a star or wizard-hat icon (SVG path)
- Troll: a squat chunky shape
- Dwarf: a small round shape
- Rock: a circle with texture

All pieces display their team colour as a fill, with a dark border. Size: approximately 80% of cell size.

**SPLUT! feedback:** When a SPLUT! occurs, the affected Dwarf square flashes red with a brief animation and a "SPLUT!" text overlay for 1.5 seconds.

### 6.4 Interaction Model

1. **Idle state:** No piece selected. All pieces belonging to the current player are subtly highlighted (hover state).

2. **Piece selected:** Click a current player's piece. Valid move destinations highlighted (green dots). If the piece is a Sorcerer and levitation is possible, eligible rocks are also highlighted (purple ring).

3. **Move execution:** Click a highlighted destination. The store dispatches `movePiece`.

4. **Troll lands on Rock:** The `ThrowDirectionPicker` overlay appears showing 4 direction arrows. Only valid throw directions are enabled (blocked directions are greyed out). The player clicks a direction arrow.

5. **Dwarf push:** Happens automatically as part of the move. Push chain animation shows pieces sliding.

6. **Levitation:** When a Sorcerer is selected and eligible Rocks exist, the UI enters a "choose Rock to levitate" sub-mode (or the player can proceed without levitating). Selected Rock is highlighted. The move then proceeds with the Rock mirroring.

7. **Turn end:** After all moves consumed (or throw terminates turn), `advanceTurn` is called, UI transitions to next player's turn with a brief banner animation.

### 6.5 AI-Specific Components

**`AIThinkingIndicator.tsx`**
Rendered alongside `TurnBanner` when `aiTurnState?.isExecuting === true`. Displays a pulsing animation (`animate-pulse` Tailwind class) with text "AI is thinking...". Hidden (`hidden` class) when `aiTurnState` is `null`.

**`PlayerTypeToggle.tsx`** (`src/components/lobby/`)
A per-seat toggle rendered inside `SeatSelector`. Allows the player to switch each occupied seat between `PlayerType.Human` and `PlayerType.AI` before starting the game. Passes the resulting `playerTypes` record through to `SetupConfig` when the game is initialised.

**`PlayerStatus.tsx` (updated)**
Each player entry conditionally renders an `"AI"` badge when `player.playerType === PlayerType.AI`. The badge is suppressed for Human players.

---

## 7. Turn Flow State Machine

The turn flow is best modelled as a state machine. The states and transitions:

```
IDLE_AWAITING_SELECTION
  → [player clicks own piece] → PIECE_SELECTED

PIECE_SELECTED
  → [player clicks valid destination (non-Rock)]
      → if Dwarf: execute push chain → MOVE_EXECUTED
      → if Troll/Sorcerer: execute move → MOVE_EXECUTED
  → [player clicks destination with Rock (Troll only)]
      → execute move → AWAITING_THROW_DIRECTION
  → [player clicks elsewhere] → IDLE_AWAITING_SELECTION

SORCERER_SELECTED (substate of PIECE_SELECTED)
  → [player clicks eligible Rock to levitate] → LEVITATION_ROCK_CHOSEN
  → [player clicks non-Rock destination] → MOVE_EXECUTED (no levitation)

LEVITATION_ROCK_CHOSEN
  → [player clicks valid destination]
      → if Rock destination blocked → show error hint, stay in PIECE_SELECTED
      → otherwise: execute sorcerer + rock move → MOVE_EXECUTED

AWAITING_THROW_DIRECTION
  → [player clicks direction arrow] → THROW_EXECUTED

MOVE_EXECUTED / THROW_EXECUTED
  → if game over → GAME_OVER
  → if moves remaining → IDLE_AWAITING_SELECTION
  → if no moves remaining → advanceTurn → IDLE_AWAITING_SELECTION (next player)

GAME_OVER
  → [player clicks "Play Again"] → LOBBY
```

This state machine is implemented within the Zustand store (the `selectedPieceId`, `pendingThrowDirection`, and related fields encode the current UI state).

---

## 8. Tricky Rules - Special Implementation Attention

### 8.1 Levitation Continuity Rule

The rule is: once you start levitating within a turn, if you stop (either by moving another piece or moving the Sorcerer without levitation), you **cannot resume levitation** that turn.

Implementation: `LevitationState.isStopped` flag. Set to `true` when:
- The player moves any piece that is not the levitating Sorcerer.
- The player moves the Sorcerer without passing a `levitateRockId`.

The `validateLevitationEligibility` check will fail with `"cannot resume levitation after interruption"` if `isStopped === true`.

### 8.2 Rock Cooldown - Current Turn Exception

The cooldown blocks levitation of rocks moved during the **previous player's** turn. However, the current player **can** levitate a rock they themselves moved earlier in the same turn (via push or pull).

Implementation: The `previousTurnRockRecord` stores rocks from the immediately previous turn. The check is:

```
isOnCooldown(rockId) = previousTurnRockRecord?.movedRocks.some(r => r.rockId === rockId) ?? false
```

This check deliberately ignores `currentTurnRockRecord`. Rocks in `currentTurnRockRecord` are **not** on cooldown.

### 8.3 Pull Back Direction Constraint

Pull Back only works if the Rock is **directly behind** the Troll relative to its movement direction. If moving N (from E5 to E6), the Rock must be at E4 (directly S of E5).

```typescript
function isPullEligible(fromSquare: SquareKey, toSquare: SquareKey, rockSquare: SquareKey): boolean {
  const moveDir = getDirectionBetween(fromSquare, toSquare)  // e.g. N
  const oppositeDir = opposite(moveDir)                       // S
  const pullFromSquare = stepInDirection(fromSquare, oppositeDir)  // E4
  return pullFromSquare === rockSquare
}
```

### 8.4 Throw - Rock Does Not Move if Immediate Obstacle

If the very next square in the throw direction is an obstacle (Troll, Rock, or board edge), the thrown Rock stays on the Troll's square. The Troll and Rock occupy the same square simultaneously. This is a valid game state.

Special UI treatment: show the Troll overlaid on the Rock visually.

### 8.5 SPLUT! Algorithm - Consecutive Dwarves

The throw trajectory algorithm must correctly handle: Dwarf@E5, Dwarf@E6, Troll@E7. The Rock flies over E5 Dwarf (peek: E6 = Dwarf, not obstacle → continue), then flies over E6 Dwarf (peek: E7 = Troll = obstacle → SPLUT! on E6). Only E6 Dwarf dies.

This is naturally handled by the single-step algorithm in Section 4.4.

### 8.6 Push Cannot Kill

A Dwarf pushing a Rock into the same square as a Sorcerer does not kill the Sorcerer. The entire chain shifts - if the chain includes both a Rock and a Sorcerer, both are pushed until they hit the board edge. Only **thrown** Rocks kill.

### 8.7 Levitation Range

Levitation is NOT limited by distance. A Sorcerer on B5 can levitate a Rock on H5. The Rock simply moves in the same direction as the Sorcerer each step, without needing proximity.

### 8.8 Turn Termination by Throw

A throw terminates the turn **immediately**, even if moves remain. The `isTerminated` flag prevents further moves being accepted. This must be checked first in any move-execution path.

### 8.9 2-Player Seat Validation

Only opposite seat pairs are valid: (Top, Bottom) or (Left, Right). The pairings (Top, Left), (Top, Right), (Bottom, Left), (Bottom, Right) are all invalid.

### 8.10 3-Player Seat Assignment

For 3 players, any 3 of the 4 seats can be occupied (no restriction like 2-player). All 4 Rocks always appear regardless of player count.

---

## 9. Testing Approach

### 9.1 Philosophy

The game engine is pure TypeScript with no UI dependencies, making it ideal for comprehensive unit testing. Each Gherkin scenario maps 1:1 to a Vitest test case.

### 9.2 Test Helpers

```typescript
// tests/helpers/boardBuilder.ts
// Fluent builder for constructing GameState for test scenarios

class BoardBuilder {
  withPiece(seat: PlayerSeat, type: PieceType, square: SquareKey): this
  withRock(square: SquareKey): this
  withCurrentPlayer(seat: PlayerSeat, movesUsed: number): this
  withPreviousTurnRockMoved(rockId: string, moveType: RockMoveType): this
  withCurrentTurnRockMoved(rockId: string, moveType: RockMoveType): this
  withEliminated(seat: PlayerSeat): this
  withAIPlayer(seat: PlayerSeat): this   // Marks the given seat as PlayerType.AI
  build(): GameState
}
```

### 9.3 Test Structure Mapping

Each test file in `tests/engine/scenarios/` directly maps to a Gherkin feature file. Example:

```typescript
// tests/engine/scenarios/troll_throw.test.ts

describe('Feature: Troll Throw', () => {
  describe('Rule: When a Troll ends its move on a Rock it MUST throw the Rock', () => {
    it('Troll landing on a Rock must throw it', () => {
      const state = new BoardBuilder()
        .withPiece(PlayerSeat.Top, PieceType.Troll, 'E5')
        .withRock('E6')
        .withCurrentPlayer(PlayerSeat.Top, 0)
        .build()
      const result = moveTroll(state, 'Top_Troll', 'E6')
      expect(result.ok).toBe(true)
      expect(result.value.turn.pendingThrow).toBe(true)
    })
  })
})
```

The AI engine test files follow the same pattern:

```typescript
// tests/engine/ai.test.ts
// Unit tests for planAITurn and each tier evaluator in isolation.
describe('AI Engine', () => {
  describe('evaluateTier1 — Immediate Win', () => { ... })
  describe('evaluateTier2 — Defensive Escape', () => { ... })
  describe('evaluateTier3 — Rock Positioning', () => { ... })
  describe('evaluateTier4 — Approach', () => { ... })
  describe('evaluateTier5 — Fallback', () => { ... })
  describe('isSorcererThreatened', () => { ... })
  describe('planAITurn — multi-move re-evaluation', () => { ... })
})

// tests/engine/scenarios/ai_player.test.ts
// Full scenario coverage for 11_ai_player.feature (65 scenarios + 1 outline).
// Each test: construct board via BoardBuilder.withAIPlayer(), call planAITurn or
// relevant tier evaluator, assert chosen move and tier triggered.
```

### 9.4 Test Priority

- `@critical` tagged scenarios → implemented in Phase 1 and 2
- `@error` tagged scenarios → implemented alongside the relevant feature
- `@edge-case` tagged scenarios → implemented in Phase 3
- `@ai` tagged scenarios → implemented in Phase 6
- AI tier tests are fully synchronous (no timer mocking needed for `planAITurn` itself)
- Store-level AI orchestration tests use `vi.useFakeTimers()` with `aiConfig.moveDelayMs = 0`

### 9.5 Playwright E2E Tests

E2E tests use `data-testid` attributes on all interactive elements. Three test files:
- `lobby.spec.ts`: Player count selection, validation errors
- `full_game_2p.spec.ts`: Complete 2-player game setup → moves → throw → win
- `full_game_4p.spec.ts`: 4-player game with multiple eliminations

---

## 10. Implementation Phases

### Phase 1: Foundation (Engine + Board)

**Goal:** The game engine can be fully tested without any UI.

1. Project scaffolding: `npx create-next-app@latest` with TypeScript, Tailwind, App Router
2. Install: `zustand`, `vitest`, `@testing-library/react`, `@playwright/test`
3. Configure `vitest.config.ts` (path aliases, test environment)
4. Implement `types.ts` - all enums and interfaces
5. Implement `board.ts` - valid squares, adjacency map, direction helpers
6. Implement `setup.ts` - game initialisation for 2/3/4 players
7. Write and pass all tests in `game_setup.test.ts`
8. Implement `movement.ts` - basic validation shared by all pieces
9. Implement `turns.ts` - move count rules, turn advancement
10. Write and pass all tests in `turn_management.test.ts`

**Exit criteria:** `pnpm test` passes `game_setup` and `turn_management` with zero failures.

---

### Phase 2: Core Game Mechanics (All Move Types)

**Goal:** All piece movement rules implemented and tested.

1. Implement `troll.ts` - basic move, pull back
2. Write and pass `troll_movement.test.ts` (@critical first)
3. Implement throw trajectory in `troll.ts`
4. Implement `win.ts` - team elimination, win detection
5. Write and pass `troll_throw.test.ts` and `win_condition.test.ts`
6. Implement `dwarf.ts` - move, push chain
7. Write and pass `dwarf_movement.test.ts`
8. Implement SPLUT! rule within `troll.ts` throw resolution
9. Write and pass `splut_rule.test.ts`
10. Implement `rockState.ts` - movement tracking, cooldown
11. Implement `sorcerer.ts` - move, levitation
12. Write and pass `rock_state.test.ts`, `sorcerer_movement.test.ts`, `general_movement.test.ts`

**Exit criteria:** All 10 scenario test files pass with zero failures.

---

### Phase 3: UI Shell + Basic Board Rendering

**Goal:** A working visual board with pieces, no interaction yet.

1. Implement `gameStore.ts` with `initGame` and basic piece/square tracking
2. Implement `selectors.ts`
3. Implement `GameBoard.tsx` - CSS Grid with 45-degree rotation, 41 valid cells
4. Implement `BoardSquare.tsx` - highlight states
5. Implement `Piece.tsx`, `Rock.tsx` - visual representations
6. Implement `app/page.tsx` (Lobby) - player count and first player selection
7. Implement `app/game/page.tsx` - initialises store and renders `GameBoard`
8. Implement `TurnBanner.tsx` and `MoveCounter.tsx`

**Exit criteria:** App renders correctly in browser. Starting positions match rulebook. No interaction yet.

---

### Phase 4: Full Interaction (Playable Game)

**Goal:** A fully playable game with all rules enforced.

1. Implement `selectPiece` store action + valid move highlighting
2. Implement `movePiece` store action - basic moves
3. Implement Dwarf push interaction + visual chain animation
4. Implement `ThrowDirectionPicker.tsx` - direction selection overlay
5. Implement `chooseThrowDirection` store action
6. Implement Troll pull-back UX
7. Implement levitation UX - Rock selection mode for Sorcerer
8. Implement `GameOverOverlay.tsx`
9. Implement `PlayerStatus.tsx` - elimination display
10. Write Playwright E2E tests

**Exit criteria:** A complete 2-player game can be played from setup to win without manual state manipulation.

---

### Phase 5: Polish + Edge Cases

**Goal:** Full rule coverage, animations, and accessibility.

1. Implement `ActionLog.tsx` - scrolling history of moves
2. Add CSS transitions: piece movement, throw trajectory flash, SPLUT! effect
3. Implement all @edge-case test scenarios
4. Add keyboard navigation support (arrow keys for direction selection)
5. Add `aria-label` attributes to board squares and pieces
6. Responsive layout (mobile-friendly board scaling)
7. Add "Reset Game" / "New Game" functionality
8. Performance audit (React DevTools profiler)
9. Cross-browser testing (Chrome, Firefox, Safari)

**Exit criteria:** All 10 feature files (features 01–10) have 100% scenario coverage. App passes Lighthouse accessibility audit (score > 90).

---

### Phase 6: AI Player Implementation

**Goal:** A human player can play a complete game against one or more AI opponents. All-AI spectate mode works. All 65 AI feature scenarios pass.

**Prerequisite:** Phase 5 complete (all engine rules implemented and tested).

1. Implement `src/engine/ai.ts` — `planAITurn` and all 5 tier evaluators, plus `isSorcererThreatened` and `getSafeSorcererMoves`. No React, no timers, no Zustand.
2. Write and pass `tests/engine/ai.test.ts` — unit tests for each tier function in isolation; every tiebreaker, every edge-case path (cooldown exclusion, self-elimination avoidance, no-valid-moves fallback) must have at least one test.
3. Write and pass `tests/engine/scenarios/ai_player.test.ts` — all 65 regular scenarios and 1 outline from `11_ai_player.feature`. Use `BoardBuilder.withAIPlayer()` to mark seats. Call `planAITurn` directly; assert move sequence and which tier was triggered.
4. Update `src/engine/types.ts` — add `PlayerType` enum; add `playerType: PlayerType` to `PlayerState`; add `playerTypes: Record<PlayerSeat, PlayerType>` to `SetupConfig`.
5. Update `src/engine/setup.ts` — accept `playerTypes` in `SetupConfig`; store `playerType` on each `PlayerState`; validate seat rules regardless of `PlayerType`.
6. Update `src/store/gameStore.ts` — add `aiConfig: AIConfig` (default `moveDelayMs: 500`); add `aiTurnState: AITurnState | null`; implement `triggerAITurn` and internal `executeNextAIMove`; add AI-player check in the post-`advanceTurn` hook.
7. Implement AI turn orchestration — `setTimeout`-based move execution loop; chain AI-vs-AI turns automatically; clear `aiTurnState` on turn completion or game over.
8. Block human interaction — add `aiTurnState?.isExecuting` guard at entry of `selectPiece`, `movePiece`, `chooseThrowDirection`, and `chooseLevitateRock`.
9. Update lobby UI — implement `PlayerTypeToggle.tsx`; add it to `SeatSelector`; wire `playerTypes` record through to `initGame`.
10. Implement `AIThinkingIndicator.tsx` — pulsing Tailwind component; conditionally rendered when `aiTurnState !== null`.
11. Update `TurnBanner.tsx` — show "AI is thinking..." when `aiTurnState?.isExecuting === true`.
12. Update `PlayerStatus.tsx` — render "AI" badge for `player.playerType === PlayerType.AI` seats.
13. Manual testing: human vs 1 AI (2-player), human vs 3 AI (4-player), all-AI spectate mode (4-player game runs to completion).

**Exit criteria:** All 65 AI feature scenarios (plus 9 outline examples) pass in Vitest. A human can play a complete game from lobby through win against at least 1 AI opponent. An all-AI 4-player game runs to completion without hanging.

---

## 11. Architectural Decision Record

### ADR-1: Pure Engine, No React in Game Logic

**Decision:** The entire `/src/engine/` has zero imports from React, Next.js, or Zustand.

**Rationale:** Pure TypeScript functions are trivially testable. They can later power a server-side game, AI opponent, or different UI framework without modification.

### ADR-2: Dual Board Indexing

**Decision:** Maintain `pieces: Map<pieceId, Piece>` and `squareOccupancy: Map<SquareKey, pieceId>` in sync.

**Rationale:** Throw and push chain resolution require frequent O(1) "what is on this square?" lookups. Without `squareOccupancy`, each lookup would be O(n). Every piece movement must update both maps via a helper function `movePieceToSquare`.

### ADR-3: Immutable State

**Decision:** All engine functions return new `GameState` objects. Zustand's `immer` middleware used in the store.

**Rationale:** Pure functions with immutable state make testing trivial (no teardown needed). React rendering benefits from reference equality checks.

### ADR-4: Throw Direction as Separate User Action

**Decision:** Moving a Troll onto a Rock and choosing throw direction are two separate interactions.

**Rationale:** The player must choose direction after seeing where they land. The store tracks `pendingThrowDirection` to coordinate the UI overlay.

### ADR-5: CSS Grid + 45° Rotation for Board Rendering

**Decision:** Render as 9×9 CSS grid, rotate container 45°, counter-rotate piece content.

**Rationale:** Avoids complex SVG coordinate math. Tailwind handles all layout. Interaction hitboxes remain square.

### ADR-6: SquareKey as String

**Decision:** Use `string` (e.g. `"E5"`) as the canonical square identifier.

**Rationale:** Native string hashability for Maps/Sets. Readable in test output and error messages. O(1) parsing back to `{col, row}`.

### ADR-7: AI Decision Logic in Pure Engine (No Side Effects)

**Decision:** The AI planning function `planAITurn` is a pure function in `/src/engine/ai.ts`. It takes `GameState` and returns `AIMove[]`. Timing and delays are handled exclusively in the Zustand store.

**Rationale:** A pure AI function is fully testable with Vitest using synchronous assertions — no timer mocking, no React rendering, no store setup. The separation also makes it trivial to run AI-vs-AI at full speed (no delays) by simply applying all planned moves synchronously, which is exactly how `ai_player.test.ts` operates. The store orchestrates timing separately, keeping UI concerns cleanly separated from game logic.

### ADR-8: AI Move Delay in Store, Not Engine

**Decision:** The `aiConfig.moveDelayMs` delay between AI moves is applied by the Zustand store using `setTimeout`. The AI engine has no awareness of timing.

**Rationale:** Pure functions must not produce side effects such as timers. The store is the correct and only boundary between pure game logic and time-based UI behaviour. This allows `moveDelayMs` to be set to `0` in tests for instant AI execution, and allows the delay to be made configurable per-game without touching any engine code.

---

## 12. Critical Files for Implementation

| File | Priority | Reason |
|------|----------|--------|
| `src/engine/types.ts` | P0 | Contract every module depends on; must be written first |
| `src/engine/board.ts` | P0 | Foundation for all movement logic |
| `src/engine/troll.ts` | P1 | Most complex module; throw trajectory + SPLUT! + pull back + turn termination |
| `src/store/gameStore.ts` | P2 | Bridges pure engine to React UI; encodes interaction state machine |
| `src/components/game/GameBoard.tsx` | P2 | Establishes CSS Grid + rotation pattern; all square/piece components depend on it |
| `src/engine/ai.ts` | P3 (Phase 6) | All tier evaluators and `planAITurn`; most algorithmically complex new module in Phase 6; must be written before any store or UI AI work |

---

## 13. Gherkin Feature File Reference

All 11 feature files are in `/Users/tim.beamish/source/splut/features/`:

| File | Scenarios | Focus |
|------|-----------|-------|
| `01_game_setup.feature` | 11 + 1 outline | Board init, piece placement |
| `02_turn_management.feature` | 20 + 1 outline | Turn order, move counts, mandatory moves |
| `03_troll_movement.feature` | 15 + 1 outline | Troll moves + Pull Back |
| `04_troll_throw.feature` | 20 + 1 outline | Throw trajectories, obstacles, targets |
| `05_splut_rule.feature` | 11 | Dwarf SPLUT! mechanic |
| `06_dwarf_movement.feature` | 20 + 1 outline | Dwarf moves + Push chains |
| `07_sorcerer_movement.feature` | 32 + 1 outline | Sorcerer moves + Levitate (all edge cases) |
| `08_win_condition.feature` | 14 | Win/elimination |
| `09_rock_state_tracking.feature` | 17 + 1 outline | Levitation cooldown system |
| `10_general_movement.feature` | 8 + 2 outlines | Universal movement rules |
| `11_ai_player.feature` | 65 + 1 outline | AI setup, turn execution, 5 priority tiers, multi-move re-evaluation, AI vs AI |
| **Total** | **233 + 10 outlines** | |
