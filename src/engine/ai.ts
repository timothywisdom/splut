// ============================================================================
// SPLUT! AI Engine
// Pure TypeScript AI move planning. 5-tier priority architecture.
// Zero React, zero Zustand, zero timers.
// ============================================================================

import {
  GameState,
  PieceType,
  PlayerPiece,
  RockPiece,
  Piece,
  Direction,
  SquareKey,
  AIMove,
  PlayerSeat,
} from './types'
import {
  ALL_VALID_SQUARES,
  isOrthogonallyAdjacent,
  stepInDirection,
  getDirectionBetween,
  manhattanDistance,
  oppositeDirection,
} from './board'
import { getPieceAt, isOccupied, isPlayerPiece } from './movement'
import { moveTroll, resolveThrowTrajectory, throwRock } from './troll'
import { moveDwarf, resolvePushChain } from './dwarf'
import { moveSorcerer } from './sorcerer'
import { isRockOnCooldown } from './rockState'

// ============================================================================
// Helper Functions
// ============================================================================

const DIRECTIONS: Direction[] = ['E', 'N', 'S', 'W']

/**
 * Get the AI's pieces from the current state.
 */
function getAIPieces(state: GameState): {
  troll: PlayerPiece | null
  dwarf: PlayerPiece | null
  sorcerer: PlayerPiece | null
} {
  const aiSeat = state.turn.currentPlayerSeat
  let troll: PlayerPiece | null = null
  let dwarf: PlayerPiece | null = null
  let sorcerer: PlayerPiece | null = null

  for (const [, piece] of state.pieces) {
    if (piece.type === PieceType.Rock) continue
    const pp = piece as PlayerPiece
    if (pp.owner !== aiSeat || !pp.alive) continue
    if (pp.type === PieceType.Troll) troll = pp
    if (pp.type === PieceType.Dwarf) dwarf = pp
    if (pp.type === PieceType.Sorcerer) sorcerer = pp
  }

  return { troll, dwarf, sorcerer }
}

/**
 * Get all enemy Sorcerers (alive, not belonging to the AI's seat).
 */
function getEnemySorcerers(state: GameState): PlayerPiece[] {
  const aiSeat = state.turn.currentPlayerSeat
  const result: PlayerPiece[] = []
  for (const [, piece] of state.pieces) {
    if (piece.type === PieceType.Rock) continue
    const pp = piece as PlayerPiece
    if (pp.type === PieceType.Sorcerer && pp.owner !== aiSeat && pp.alive) {
      result.push(pp)
    }
  }
  return result
}

/**
 * Get all Rocks on the board.
 */
function getAllRocks(state: GameState): RockPiece[] {
  const rocks: RockPiece[] = []
  for (const [, piece] of state.pieces) {
    if (piece.type === PieceType.Rock) {
      rocks.push(piece as RockPiece)
    }
  }
  return rocks
}

/**
 * Get valid move destinations for a piece (orthogonally adjacent, on board, empty).
 * For Troll: also includes squares with Rocks (which trigger throw).
 * For Dwarf: also includes occupied squares (which trigger push, if push is valid).
 */
function getValidMoveSquares(
  state: GameState,
  piece: PlayerPiece,
  visitedSquares?: Set<SquareKey>
): SquareKey[] {
  const results: SquareKey[] = []
  for (const dir of DIRECTIONS) {
    const sq = stepInDirection(piece.square, dir)
    if (!sq) continue
    if (!ALL_VALID_SQUARES.has(sq)) continue
    if (visitedSquares && visitedSquares.has(sq)) continue

    if (piece.type === PieceType.Troll) {
      // Troll can move to empty or Rock squares
      const occupant = getPieceAt(state, sq)
      if (!occupant || occupant.type === PieceType.Rock) {
        results.push(sq)
      }
    } else if (piece.type === PieceType.Dwarf) {
      // Dwarf can move anywhere (push). Check if push is valid.
      if (!isOccupied(state, sq)) {
        results.push(sq)
      } else {
        // Check if push chain resolves
        const dir2 = getDirectionBetween(piece.square, sq)
        if (dir2) {
          const pushResult = resolvePushChain(state, sq, dir2)
          if (pushResult.valid) {
            results.push(sq)
          }
        }
      }
    } else if (piece.type === PieceType.Sorcerer) {
      // Sorcerer can only move to empty squares
      if (!isOccupied(state, sq)) {
        results.push(sq)
      }
    }
  }
  return results.sort()
}

/**
 * Check if a Troll is on a Rock (both on same square).
 */
function isTrollOnRock(state: GameState, troll: PlayerPiece): RockPiece | null {
  for (const [, piece] of state.pieces) {
    if (piece.type === PieceType.Rock && piece.square === troll.square) {
      return piece as RockPiece
    }
  }
  return null
}

/**
 * Apply a move to the game state and return the new state.
 * Returns null if the move fails.
 */
function applyMove(state: GameState, move: AIMove): GameState | null {
  const piece = state.pieces.get(move.pieceId)
  if (!piece || piece.type === PieceType.Rock) return null

  const pp = piece as PlayerPiece

  if (pp.type === PieceType.Troll) {
    const result = moveTroll(state, move.pieceId, move.targetSquare, move.opts?.pullBackRockId)
    if (!result.ok) return null
    let newState = result.value

    // Handle throw if pending
    if (move.throwDirection && newState.turn.pendingThrow) {
      const throwResult = throwRock(newState, move.throwDirection)
      if (!throwResult.ok) return null
      newState = throwResult.value
    }
    return newState
  }

  if (pp.type === PieceType.Dwarf) {
    const result = moveDwarf(state, move.pieceId, move.targetSquare)
    if (!result.ok) return null
    return result.value
  }

  if (pp.type === PieceType.Sorcerer) {
    const result = moveSorcerer(state, move.pieceId, move.targetSquare, move.opts?.levitateRockId)
    if (!result.ok) return null
    return result.value
  }

  return null
}

// ============================================================================
// Tier 1: Immediate Win
// ============================================================================

/**
 * Check if the AI can kill an enemy Sorcerer by throwing a Rock.
 * Returns the move that achieves the kill, or null.
 */
export function evaluateTier1(state: GameState): AIMove | null {
  const { troll } = getAIPieces(state)
  if (!troll) return null

  const aiSeat = state.turn.currentPlayerSeat

  // Case 1: Troll is already on a Rock (pending throw or about to be)
  const rockOnTroll = isTrollOnRock(state, troll)
  if (rockOnTroll && state.turn.pendingThrow) {
    // Find the best throw direction that kills an enemy Sorcerer
    const throwMove = selectKillThrowDirection(state, troll.square, aiSeat)
    if (throwMove) {
      return {
        pieceId: troll.id,
        targetSquare: troll.square,
        throwDirection: throwMove.direction,
      }
    }
    return null
  }

  // Case 2: Troll is adjacent to a Rock — can move onto it then throw
  for (const dir of DIRECTIONS) {
    const adjSq = stepInDirection(troll.square, dir)
    if (!adjSq) continue

    const adjPiece = getPieceAt(state, adjSq)
    if (!adjPiece || adjPiece.type !== PieceType.Rock) continue

    // Simulate: if the Troll moves onto this Rock, check all throw directions
    // from adjSq for a kill
    const killThrow = selectKillThrowFromSquare(state, adjSq, aiSeat, troll.id)
    if (killThrow) {
      // Return the movement onto the Rock
      // The throw will happen on the next iteration after pendingThrow is set
      return {
        pieceId: troll.id,
        targetSquare: adjSq,
        throwDirection: killThrow.direction,
      }
    }
  }

  return null
}

interface ThrowCandidate {
  direction: Direction
  targetSquare: SquareKey
}

/**
 * Find throw directions from a square that kill an ENEMY Sorcerer.
 * Excludes throws that would hit the AI's own Sorcerer.
 */
function selectKillThrowDirection(
  state: GameState,
  fromSquare: SquareKey,
  aiSeat: PlayerSeat
): ThrowCandidate | null {
  const candidates: ThrowCandidate[] = []

  for (const dir of DIRECTIONS) {
    const trajectory = resolveThrowTrajectory(state, fromSquare, dir)
    if (trajectory.hitType === 'sorcerer' && trajectory.killedSorcererId) {
      const killed = state.pieces.get(trajectory.killedSorcererId) as PlayerPiece
      if (killed && killed.owner !== aiSeat) {
        candidates.push({
          direction: dir,
          targetSquare: trajectory.landingSquare!,
        })
      }
    }
  }

  if (candidates.length === 0) return null

  // Tiebreaker: alphabetically-first target square
  candidates.sort((a, b) => a.targetSquare.localeCompare(b.targetSquare))
  return candidates[0]
}

/**
 * Check if throwing from a given square (where Troll would land on Rock)
 * would kill an enemy Sorcerer. Accounts for the Troll being on the square.
 */
function selectKillThrowFromSquare(
  state: GameState,
  fromSquare: SquareKey,
  aiSeat: PlayerSeat,
  trollId: string
): ThrowCandidate | null {
  // We need to simulate the throw trajectory from this square.
  // The Troll will be on the same square as the Rock.
  // resolveThrowTrajectory starts from fromSquare and looks in each direction.
  // The Troll on the same square doesn't block because the trajectory
  // starts from the throw square.
  const candidates: ThrowCandidate[] = []

  for (const dir of DIRECTIONS) {
    const trajectory = resolveThrowTrajectory(state, fromSquare, dir)
    if (trajectory.hitType === 'sorcerer' && trajectory.killedSorcererId) {
      const killed = state.pieces.get(trajectory.killedSorcererId) as PlayerPiece
      if (killed && killed.owner !== aiSeat) {
        candidates.push({
          direction: dir,
          targetSquare: trajectory.landingSquare!,
        })
      }
    }
  }

  if (candidates.length === 0) return null

  candidates.sort((a, b) => a.targetSquare.localeCompare(b.targetSquare))
  return candidates[0]
}

// ============================================================================
// Tier 2: Defensive Escape
// ============================================================================

/**
 * Check if the AI's Sorcerer is threatened by an enemy Troll on a Rock.
 */
export function isSorcererThreatened(
  state: GameState,
  sorcererSquare: SquareKey
): boolean {
  const aiSeat = state.turn.currentPlayerSeat

  // Check all enemy Trolls
  for (const [, piece] of state.pieces) {
    if (piece.type === PieceType.Rock) continue
    const pp = piece as PlayerPiece
    if (pp.type !== PieceType.Troll || pp.owner === aiSeat || !pp.alive) continue

    // Is this Troll on a Rock?
    const trollOnRock = isTrollOnRock(state, pp)
    if (!trollOnRock) continue

    // Is the Troll in the same row or column as the Sorcerer?
    const trollSquare = pp.square
    if (!isInThrowLine(trollSquare, sorcererSquare)) continue

    // Is the path clear between them?
    const dir = getDirectionBetween(trollSquare, sorcererSquare)
    if (!dir) {
      // Not adjacent, need to determine direction manually
      const lineDir = getLineDirection(trollSquare, sorcererSquare)
      if (!lineDir) continue
      if (isPathClearForThrow(state, trollSquare, sorcererSquare, lineDir)) {
        return true
      }
    } else {
      // Adjacent - direct threat
      return true
    }
  }

  return false
}

/**
 * Check if two squares are in the same row or column.
 */
function isInThrowLine(sq1: SquareKey, sq2: SquareKey): boolean {
  return sq1[0] === sq2[0] || sq1.slice(1) === sq2.slice(1)
}

/**
 * Get the direction from sq1 to sq2 along a line (same row or column).
 */
function getLineDirection(sq1: SquareKey, sq2: SquareKey): Direction | null {
  const col1 = sq1[0]
  const row1 = parseInt(sq1.slice(1))
  const col2 = sq2[0]
  const row2 = parseInt(sq2.slice(1))

  if (col1 === col2) {
    return row2 > row1 ? 'N' : 'S'
  }
  if (row1 === row2) {
    return col2 > col1 ? 'E' : 'W'
  }
  return null
}

/**
 * Check if the throw path from source to target is clear (no obstacles between them).
 */
function isPathClearForThrow(
  state: GameState,
  source: SquareKey,
  target: SquareKey,
  direction: Direction
): boolean {
  let current = source
  while (true) {
    const next = stepInDirection(current, direction)
    if (!next) return false
    if (next === target) return true

    // Check for obstacles (Troll, Rock block; Dwarf flies over unless SPLUT!)
    const occupant = getPieceAt(state, next)
    if (occupant) {
      if (occupant.type === PieceType.Troll || occupant.type === PieceType.Rock) {
        return false // Blocked by obstacle
      }
      // Dwarves and Sorcerers are passed over in throw trajectory
      // (Dwarves might cause SPLUT! but still counted as path)
    }
    current = next
  }
}

/**
 * Get safe squares for the Sorcerer to move to (not in any threatened line).
 */
export function getSafeSorcererMoves(
  state: GameState,
  sorcerer: PlayerPiece
): SquareKey[] {
  const validMoves = getValidMoveSquares(state, sorcerer)

  return validMoves.filter(sq => !isSorcererThreatened(state, sq))
}

/**
 * Evaluate Tier 2: If the AI's Sorcerer is threatened, move it to safety.
 */
export function evaluateTier2(state: GameState): AIMove | null {
  const { sorcerer } = getAIPieces(state)
  if (!sorcerer) return null

  if (!isSorcererThreatened(state, sorcerer.square)) return null

  // Get safe moves
  const safeMoves = getSafeSorcererMoves(state, sorcerer)

  if (safeMoves.length > 0) {
    // Pick alphabetically-first safe square
    return {
      pieceId: sorcerer.id,
      targetSquare: safeMoves[0], // Already sorted by getValidMoveSquares
    }
  }

  // No safe square - partial escape: pick first valid move (alphabetically)
  const validMoves = getValidMoveSquares(state, sorcerer)
  if (validMoves.length > 0) {
    return {
      pieceId: sorcerer.id,
      targetSquare: validMoves[0],
    }
  }

  return null
}

// ============================================================================
// Tier 3: Rock Positioning
// ============================================================================

/**
 * Evaluate Tier 3: Pull Back (higher priority) or Levitate.
 */
export function evaluateTier3(state: GameState, visitedSquares?: Set<SquareKey>): AIMove | null {
  // Sub-option 1: Pull Back
  const pullBackMove = evaluatePullBack(state, visitedSquares)
  if (pullBackMove) return pullBackMove

  // Sub-option 2: Levitate
  const levitateMove = evaluateLevitate(state, visitedSquares)
  if (levitateMove) return levitateMove

  return null
}

/**
 * Try to find a Pull Back move for the Troll.
 */
function evaluatePullBack(state: GameState, visitedSquares?: Set<SquareKey>): AIMove | null {
  const { troll } = getAIPieces(state)
  if (!troll) return null

  const candidates: AIMove[] = []

  // Check each adjacent square the Troll can move to
  for (const moveDir of DIRECTIONS) {
    const moveSq = stepInDirection(troll.square, moveDir)
    if (!moveSq) continue
    if (!ALL_VALID_SQUARES.has(moveSq)) continue
    if (visitedSquares && visitedSquares.has(moveSq)) continue
    if (isOccupied(state, moveSq)) continue

    // Check if there's a Rock behind (opposite to movement direction)
    const oppDir = oppositeDirection(moveDir)
    const behindSq = stepInDirection(troll.square, oppDir)
    if (!behindSq) continue

    const behindPiece = getPieceAt(state, behindSq)
    if (!behindPiece || behindPiece.type !== PieceType.Rock) continue

    // Check Rock is not on cooldown
    if (isRockOnCooldown(state, behindPiece.id)) continue

    candidates.push({
      pieceId: troll.id,
      targetSquare: moveSq,
      opts: { pullBackRockId: behindPiece.id },
    })
  }

  if (candidates.length === 0) return null

  // Tiebreaker: alphabetically-first target square
  candidates.sort((a, b) => a.targetSquare.localeCompare(b.targetSquare))
  return candidates[0]
}

/**
 * Try to find a Levitate move for the Sorcerer.
 * Move Sorcerer 1 step closer to the nearest enemy Sorcerer's row or column,
 * levitating an eligible Rock in the same direction.
 */
function evaluateLevitate(state: GameState, visitedSquares?: Set<SquareKey>): AIMove | null {
  const { sorcerer } = getAIPieces(state)
  if (!sorcerer) return null

  const enemySorcerers = getEnemySorcerers(state)
  if (enemySorcerers.length === 0) return null

  const allRocks = getAllRocks(state)
  const eligibleRocks = allRocks.filter(r => !isRockOnCooldown(state, r.id))

  if (eligibleRocks.length === 0) return null

  const candidates: AIMove[] = []

  // For each direction the Sorcerer can move
  for (const dir of DIRECTIONS) {
    const sorcererDest = stepInDirection(sorcerer.square, dir)
    if (!sorcererDest) continue
    if (!ALL_VALID_SQUARES.has(sorcererDest)) continue
    if (visitedSquares && visitedSquares.has(sorcererDest)) continue
    if (isOccupied(state, sorcererDest)) continue

    // For each eligible Rock, check if levitation in this direction works
    for (const rock of eligibleRocks) {
      const rockDest = stepInDirection(rock.square, dir)
      if (!rockDest) continue
      if (!ALL_VALID_SQUARES.has(rockDest)) continue
      if (isOccupied(state, rockDest)) continue

      // Check if this move gets the Rock closer to an enemy Sorcerer
      let movesCloser = false
      for (const enemy of enemySorcerers) {
        const currentDist = manhattanDistance(rock.square, enemy.square)
        const newDist = manhattanDistance(rockDest, enemy.square)
        if (newDist < currentDist) {
          movesCloser = true
          break
        }
      }

      if (movesCloser) {
        // Verify the levitation would actually succeed
        const result = moveSorcerer(state, sorcerer.id, sorcererDest, rock.id)
        if (result.ok) {
          candidates.push({
            pieceId: sorcerer.id,
            targetSquare: sorcererDest,
            opts: { levitateRockId: rock.id },
          })
        }
      }
    }
  }

  if (candidates.length === 0) return null

  // Tiebreaker: alphabetically-first target square
  candidates.sort((a, b) => a.targetSquare.localeCompare(b.targetSquare))
  return candidates[0]
}

// ============================================================================
// Tier 4: Approach
// ============================================================================

/**
 * Evaluate Tier 4: Troll approaches nearest Rock, or Sorcerer approaches nearest eligible Rock.
 */
export function evaluateTier4(state: GameState, visitedSquares?: Set<SquareKey>): AIMove | null {
  // Sub-option 1: Troll approaches nearest Rock
  const trollApproach = evaluateTrollApproach(state, visitedSquares)
  if (trollApproach) return trollApproach

  // Sub-option 2: Sorcerer approaches nearest eligible Rock
  const sorcererApproach = evaluateSorcererApproach(state, visitedSquares)
  if (sorcererApproach) return sorcererApproach

  return null
}

/**
 * Move the Troll one step closer to the nearest Rock.
 */
function evaluateTrollApproach(state: GameState, visitedSquares?: Set<SquareKey>): AIMove | null {
  const { troll } = getAIPieces(state)
  if (!troll) return null

  const allRocks = getAllRocks(state)
  if (allRocks.length === 0) return null

  // Sort Rocks by distance, then alphabetically by square key
  const sortedRocks = [...allRocks].sort((a, b) => {
    const distA = manhattanDistance(troll.square, a.square)
    const distB = manhattanDistance(troll.square, b.square)
    if (distA !== distB) return distA - distB
    return a.square.localeCompare(b.square)
  })

  // For each Rock (nearest first), find the best move toward it
  for (const rock of sortedRocks) {
    const validMoves = getValidMoveSquares(state, troll, visitedSquares)

    // Filter moves that get closer to this Rock
    const approachMoves = validMoves.filter(sq => {
      const currentDist = manhattanDistance(troll.square, rock.square)
      const newDist = manhattanDistance(sq, rock.square)
      return newDist < currentDist
    })

    if (approachMoves.length > 0) {
      // Tiebreaker: alphabetically-first target square
      approachMoves.sort()
      return {
        pieceId: troll.id,
        targetSquare: approachMoves[0],
      }
    }
  }

  return null
}

/**
 * Move the Sorcerer one step closer to the nearest eligible Rock.
 */
function evaluateSorcererApproach(state: GameState, visitedSquares?: Set<SquareKey>): AIMove | null {
  const { sorcerer } = getAIPieces(state)
  if (!sorcerer) return null

  const allRocks = getAllRocks(state)
  const eligibleRocks = allRocks.filter(r => !isRockOnCooldown(state, r.id))
  if (eligibleRocks.length === 0) return null

  // Sort Rocks by distance, then alphabetically
  const sortedRocks = [...eligibleRocks].sort((a, b) => {
    const distA = manhattanDistance(sorcerer.square, a.square)
    const distB = manhattanDistance(sorcerer.square, b.square)
    if (distA !== distB) return distA - distB
    return a.square.localeCompare(b.square)
  })

  for (const rock of sortedRocks) {
    const validMoves = getValidMoveSquares(state, sorcerer, visitedSquares)

    const approachMoves = validMoves.filter(sq => {
      const currentDist = manhattanDistance(sorcerer.square, rock.square)
      const newDist = manhattanDistance(sq, rock.square)
      return newDist < currentDist
    })

    if (approachMoves.length > 0) {
      approachMoves.sort()
      return {
        pieceId: sorcerer.id,
        targetSquare: approachMoves[0],
      }
    }
  }

  return null
}

// ============================================================================
// Tier 5: Fallback
// ============================================================================

/**
 * Evaluate Tier 5: Any valid move. Priority order: Troll > Dwarf > Sorcerer.
 * For each piece, pick the alphabetically-first valid target square.
 */
export function evaluateTier5(state: GameState, visitedSquares?: Set<SquareKey>): AIMove | null {
  const { troll, dwarf, sorcerer } = getAIPieces(state)

  // Try Troll first
  if (troll) {
    const moves = getValidMoveSquares(state, troll, visitedSquares)
    if (moves.length > 0) {
      return {
        pieceId: troll.id,
        targetSquare: moves[0],
      }
    }
  }

  // Try Dwarf
  if (dwarf) {
    const moves = getValidMoveSquares(state, dwarf, visitedSquares)
    if (moves.length > 0) {
      return {
        pieceId: dwarf.id,
        targetSquare: moves[0],
      }
    }
  }

  // Try Sorcerer
  if (sorcerer) {
    const moves = getValidMoveSquares(state, sorcerer, visitedSquares)
    if (moves.length > 0) {
      return {
        pieceId: sorcerer.id,
        targetSquare: moves[0],
      }
    }
  }

  return null
}

// ============================================================================
// Throw Direction Selection (Non-Tier-1 Throws)
// ============================================================================

/**
 * Select the best throw direction when the AI must throw but it's not a Tier 1 kill.
 * Priority:
 * 1. Direction that kills an enemy Sorcerer (alphabetically-first target).
 * 2. Direction that does NOT hit own Sorcerer (alphabetically-first direction: E < N < S < W).
 * 3. Any direction (pathological fallback).
 */
function selectThrowDirection(
  state: GameState,
  fromSquare: SquareKey,
  aiSeat: PlayerSeat
): Direction {
  // Priority 1: Kill an enemy Sorcerer
  const killThrow = selectKillThrowDirection(state, fromSquare, aiSeat)
  if (killThrow) return killThrow.direction

  // Priority 2: Safe direction (doesn't hit own Sorcerer)
  const safeDirections: Direction[] = []
  for (const dir of DIRECTIONS) {
    const trajectory = resolveThrowTrajectory(state, fromSquare, dir)
    if (trajectory.hitType === 'sorcerer' && trajectory.killedSorcererId) {
      const killed = state.pieces.get(trajectory.killedSorcererId) as PlayerPiece
      if (killed && killed.owner === aiSeat) {
        continue // Would hit own Sorcerer
      }
    }
    safeDirections.push(dir)
  }

  if (safeDirections.length > 0) {
    // Already sorted alphabetically (DIRECTIONS = ['E', 'N', 'S', 'W'])
    return safeDirections[0]
  }

  // Priority 3: Pathological fallback - any direction
  return DIRECTIONS[0]
}

// ============================================================================
// Main Entry Point: planAITurn
// ============================================================================

/**
 * Returns the complete ordered move plan for the AI's current turn.
 * Calls tier evaluators repeatedly (once per available move), simulating each
 * chosen move against the state before evaluating the next.
 */
export function planAITurn(state: GameState): AIMove[] {
  const moves: AIMove[] = []
  let currentState = state
  const maxMoves = currentState.turn.movesAllowed - currentState.turn.movesUsed
  // Track visited squares per piece to prevent oscillation (e.g. D2→D3→D2)
  const visitedSquares = new Map<string, Set<SquareKey>>()

  for (let i = 0; i < maxMoves; i++) {
    // Check if a throw is pending (Troll landed on Rock in previous move)
    if (currentState.turn.pendingThrow) {
      const aiSeat = currentState.turn.currentPlayerSeat
      const { troll } = getAIPieces(currentState)
      if (!troll) break

      const throwDir = selectThrowDirection(currentState, troll.square, aiSeat)

      // Apply the throw
      const throwResult = throwRock(currentState, throwDir)
      if (!throwResult.ok) break

      // Record the throw as part of the last move, or create a throw-only move
      if (moves.length > 0) {
        moves[moves.length - 1].throwDirection = throwDir
      } else {
        // Pending throw at entry (e.g. Troll already on Rock at start of turn)
        moves.push({
          pieceId: troll.id,
          targetSquare: troll.square,
          throwDirection: throwDir,
        })
      }

      // Throw terminates the turn
      break
    }

    // Build a merged visited set from all pieces for this evaluation
    const allVisited = new Set<SquareKey>()
    for (const visited of visitedSquares.values()) {
      for (const sq of visited) {
        allVisited.add(sq)
      }
    }

    // Evaluate tiers in priority order
    const move =
      evaluateTier1(currentState) ??
      evaluateTier2(currentState) ??
      evaluateTier3(currentState, allVisited) ??
      evaluateTier4(currentState, allVisited) ??
      evaluateTier5(currentState, allVisited)

    if (!move) break // No valid move found

    // Record the piece's current square as visited before it moves
    if (!visitedSquares.has(move.pieceId)) {
      visitedSquares.set(move.pieceId, new Set())
    }
    const piece = currentState.pieces.get(move.pieceId)
    if (piece) {
      visitedSquares.get(move.pieceId)!.add(piece.square)
    }

    moves.push(move)

    // Apply the move to get new state
    const newState = applyMove(currentState, move)
    if (!newState) break

    currentState = newState

    // Check if the turn ended (auto-advance or throw termination)
    if (currentState.turn.currentPlayerSeat !== state.turn.currentPlayerSeat) {
      break
    }

    // Check if game is over
    if (currentState.phase === 'Over') {
      break
    }

    // Check if there's a pending throw from this move
    if (currentState.turn.pendingThrow) {
      // Handle throw on next iteration
      continue
    }
  }

  return moves
}
