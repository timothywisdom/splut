// ============================================================================
// SPLUT! Board Geometry
// Pure TypeScript functions for board coordinate system and adjacency.
// Zero React dependencies.
// ============================================================================

import { Col, Row, Square, SquareKey, Direction } from './types'

// --- Column and Row Mappings ---

const COLS: Col[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const ROWS: Row[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const COL_TO_INDEX: Record<string, number> = {
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8,
}

const INDEX_TO_COL: Col[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

// --- Coordinate Conversion ---

export function toKey(sq: Square): SquareKey {
  return `${sq.col}${sq.row}`
}

export function fromKey(key: SquareKey): Square {
  const col = key[0] as Col
  const row = parseInt(key.slice(1), 10) as Row
  return { col, row }
}

export function colIndex(col: Col): number {
  return COL_TO_INDEX[col]
}

export function rowIndex(row: Row): number {
  return row - 1
}

// --- Validation ---

/**
 * A square (col, row) is valid if and only if:
 * |col_index - 4| + |row_index - 4| <= 4
 * where col_index is 0 for A through 8 for I,
 * and row_index is 0 for row 1 through 8 for row 9.
 */
export function isValidSquare(colIdx: number, rowIdx: number): boolean {
  return Math.abs(colIdx - 4) + Math.abs(rowIdx - 4) <= 4
}

export function isValidSquareKey(key: SquareKey): boolean {
  const sq = fromKey(key)
  const ci = colIndex(sq.col)
  const ri = rowIndex(sq.row)
  return isValidSquare(ci, ri)
}

// --- Precomputed Sets ---

function computeAllValidSquares(): ReadonlySet<SquareKey> {
  const result = new Set<SquareKey>()
  for (let ci = 0; ci < 9; ci++) {
    for (let ri = 0; ri < 9; ri++) {
      if (isValidSquare(ci, ri)) {
        result.add(`${INDEX_TO_COL[ci]}${ROWS[ri]}`)
      }
    }
  }
  return result
}

export const ALL_VALID_SQUARES: ReadonlySet<SquareKey> = computeAllValidSquares()

// --- Direction Helpers ---

const DIRECTION_DELTAS: Record<Direction, { dc: number; dr: number }> = {
  N: { dc: 0, dr: 1 },   // North = increasing row
  S: { dc: 0, dr: -1 },  // South = decreasing row
  E: { dc: 1, dr: 0 },   // East = increasing column
  W: { dc: -1, dr: 0 },  // West = decreasing column
}

export function oppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'N': return 'S'
    case 'S': return 'N'
    case 'E': return 'W'
    case 'W': return 'E'
  }
}

/**
 * Step one square in a direction. Returns null if the result is off the board.
 */
export function stepInDirection(key: SquareKey, dir: Direction): SquareKey | null {
  const sq = fromKey(key)
  const ci = colIndex(sq.col)
  const ri = rowIndex(sq.row)
  const delta = DIRECTION_DELTAS[dir]
  const newCi = ci + delta.dc
  const newRi = ri + delta.dr

  if (newCi < 0 || newCi > 8 || newRi < 0 || newRi > 8) return null
  if (!isValidSquare(newCi, newRi)) return null

  return `${INDEX_TO_COL[newCi]}${ROWS[newRi]}`
}

// --- Adjacency ---

function computeAdjacencyMap(): ReadonlyMap<SquareKey, SquareKey[]> {
  const result = new Map<SquareKey, SquareKey[]>()
  const directions: Direction[] = ['N', 'S', 'E', 'W']

  for (const sq of ALL_VALID_SQUARES) {
    const neighbors: SquareKey[] = []
    for (const dir of directions) {
      const neighbor = stepInDirection(sq, dir)
      if (neighbor !== null) {
        neighbors.push(neighbor)
      }
    }
    result.set(sq, neighbors)
  }
  return result
}

export const ADJACENCY_MAP: ReadonlyMap<SquareKey, SquareKey[]> = computeAdjacencyMap()

/**
 * Get all orthogonally adjacent valid squares.
 */
export function getAdjacentSquares(key: SquareKey): SquareKey[] {
  return ADJACENCY_MAP.get(key) ?? []
}

/**
 * Check if two squares are orthogonally adjacent.
 */
export function isOrthogonallyAdjacent(a: SquareKey, b: SquareKey): boolean {
  const neighbors = ADJACENCY_MAP.get(a)
  return neighbors !== undefined && neighbors.includes(b)
}

/**
 * Get the direction from one square to another.
 * Returns null if not orthogonally adjacent.
 */
export function getDirectionBetween(from: SquareKey, to: SquareKey): Direction | null {
  if (!isOrthogonallyAdjacent(from, to)) return null

  const fromSq = fromKey(from)
  const toSq = fromKey(to)
  const dc = colIndex(toSq.col) - colIndex(fromSq.col)
  const dr = rowIndex(toSq.row) - rowIndex(fromSq.row)

  if (dc === 0 && dr === 1) return 'N'
  if (dc === 0 && dr === -1) return 'S'
  if (dc === 1 && dr === 0) return 'E'
  if (dc === -1 && dr === 0) return 'W'

  return null
}

/**
 * Manhattan distance between two squares.
 */
export function manhattanDistance(a: SquareKey, b: SquareKey): number {
  const aSq = fromKey(a)
  const bSq = fromKey(b)
  return Math.abs(colIndex(aSq.col) - colIndex(bSq.col)) +
         Math.abs(rowIndex(aSq.row) - rowIndex(bSq.row))
}

/**
 * Check if two squares are in the same row.
 */
export function sameRow(a: SquareKey, b: SquareKey): boolean {
  return fromKey(a).row === fromKey(b).row
}

/**
 * Check if two squares are in the same column.
 */
export function sameCol(a: SquareKey, b: SquareKey): boolean {
  return fromKey(a).col === fromKey(b).col
}

/**
 * Get all valid squares as an array (useful for iteration).
 */
export function getAllValidSquaresArray(): SquareKey[] {
  return Array.from(ALL_VALID_SQUARES)
}
