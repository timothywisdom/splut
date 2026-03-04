import { describe, it, expect } from 'vitest'
import {
  ALL_VALID_SQUARES,
  ADJACENCY_MAP,
  getAdjacentSquares,
  isOrthogonallyAdjacent,
  getDirectionBetween,
  stepInDirection,
  manhattanDistance,
  toKey,
  fromKey,
  isValidSquare,
  isValidSquareKey,
  oppositeDirection,
} from '@/engine/board'

describe('Board Geometry', () => {
  // ============================================================
  // Feature: Game Setup - Board Geometry
  // ============================================================

  describe('Rule: The board is a diamond-shaped grid with columns A-I and rows 1-9', () => {

    it('valid board squares form a diamond shape (41 squares)', () => {
      expect(ALL_VALID_SQUARES.size).toBe(41)
    })

    it('has correct number of squares per row', () => {
      const rowCounts: Record<number, number> = {}
      for (const key of ALL_VALID_SQUARES) {
        const sq = fromKey(key)
        rowCounts[sq.row] = (rowCounts[sq.row] || 0) + 1
      }
      expect(rowCounts[9]).toBe(1) // E9
      expect(rowCounts[8]).toBe(3) // D8, E8, F8
      expect(rowCounts[7]).toBe(5) // C7-G7
      expect(rowCounts[6]).toBe(7) // B6-H6
      expect(rowCounts[5]).toBe(9) // A5-I5
      expect(rowCounts[4]).toBe(7) // B4-H4
      expect(rowCounts[3]).toBe(5) // C3-G3
      expect(rowCounts[2]).toBe(3) // D2, E2, F2
      expect(rowCounts[1]).toBe(1) // E1
    })

    it('squares outside the diamond boundary should not exist', () => {
      // Check corners of the 9x9 grid that should NOT be valid
      expect(ALL_VALID_SQUARES.has('A1')).toBe(false)
      expect(ALL_VALID_SQUARES.has('A9')).toBe(false)
      expect(ALL_VALID_SQUARES.has('I1')).toBe(false)
      expect(ALL_VALID_SQUARES.has('I9')).toBe(false)
      expect(ALL_VALID_SQUARES.has('A1')).toBe(false)
      expect(ALL_VALID_SQUARES.has('B2')).toBe(false)
      expect(ALL_VALID_SQUARES.has('H8')).toBe(false)
    })

    it('specific valid squares exist', () => {
      // Row 9: E9
      expect(ALL_VALID_SQUARES.has('E9')).toBe(true)
      // Row 8: D8, E8, F8
      expect(ALL_VALID_SQUARES.has('D8')).toBe(true)
      expect(ALL_VALID_SQUARES.has('E8')).toBe(true)
      expect(ALL_VALID_SQUARES.has('F8')).toBe(true)
      // Row 5 (widest): A5 through I5
      expect(ALL_VALID_SQUARES.has('A5')).toBe(true)
      expect(ALL_VALID_SQUARES.has('E5')).toBe(true)
      expect(ALL_VALID_SQUARES.has('I5')).toBe(true)
      // Row 1: E1
      expect(ALL_VALID_SQUARES.has('E1')).toBe(true)
    })

    it('every square should have only horizontal and vertical neighbours', () => {
      for (const [sq, neighbors] of ADJACENCY_MAP) {
        const sqObj = fromKey(sq)
        for (const neighbor of neighbors) {
          const nObj = fromKey(neighbor)
          // Neighbors must differ in exactly one axis by 1
          const colDiff = Math.abs(
            'ABCDEFGHI'.indexOf(sqObj.col) - 'ABCDEFGHI'.indexOf(nObj.col)
          )
          const rowDiff = Math.abs(sqObj.row - nObj.row)
          // Must be orthogonal: one diff is 1 and the other is 0
          expect(colDiff + rowDiff).toBe(1)
        }
      }
    })

    it('no square should have diagonal neighbours', () => {
      for (const [sq, neighbors] of ADJACENCY_MAP) {
        const sqObj = fromKey(sq)
        for (const neighbor of neighbors) {
          const nObj = fromKey(neighbor)
          const colDiff = Math.abs(
            'ABCDEFGHI'.indexOf(sqObj.col) - 'ABCDEFGHI'.indexOf(nObj.col)
          )
          const rowDiff = Math.abs(sqObj.row - nObj.row)
          // Diagonal would mean both diffs are 1
          expect(colDiff === 1 && rowDiff === 1).toBe(false)
        }
      }
    })
  })

  describe('Corner squares', () => {
    it('E9 has exactly 1 adjacent square', () => {
      expect(getAdjacentSquares('E9')).toHaveLength(1)
      expect(getAdjacentSquares('E9')).toContain('E8')
    })

    it('E1 has exactly 1 adjacent square', () => {
      expect(getAdjacentSquares('E1')).toHaveLength(1)
      expect(getAdjacentSquares('E1')).toContain('E2')
    })

    it('A5 has exactly 1 adjacent square', () => {
      expect(getAdjacentSquares('A5')).toHaveLength(1)
      expect(getAdjacentSquares('A5')).toContain('B5')
    })

    it('I5 has exactly 1 adjacent square', () => {
      expect(getAdjacentSquares('I5')).toHaveLength(1)
      expect(getAdjacentSquares('I5')).toContain('H5')
    })
  })

  describe('Center square E5', () => {
    it('has exactly 4 adjacent squares', () => {
      const adj = getAdjacentSquares('E5')
      expect(adj).toHaveLength(4)
      expect(adj).toContain('E6')
      expect(adj).toContain('E4')
      expect(adj).toContain('D5')
      expect(adj).toContain('F5')
    })
  })

  describe('Coordinate conversion', () => {
    it('toKey and fromKey are inverse operations', () => {
      for (const key of ALL_VALID_SQUARES) {
        expect(toKey(fromKey(key))).toBe(key)
      }
    })
  })

  describe('isOrthogonallyAdjacent', () => {
    it('returns true for adjacent squares', () => {
      expect(isOrthogonallyAdjacent('E5', 'E6')).toBe(true)
      expect(isOrthogonallyAdjacent('E5', 'D5')).toBe(true)
    })

    it('returns false for non-adjacent squares', () => {
      expect(isOrthogonallyAdjacent('E5', 'E7')).toBe(false)
      expect(isOrthogonallyAdjacent('E5', 'F6')).toBe(false)
    })
  })

  describe('getDirectionBetween', () => {
    it('returns correct direction for adjacent squares', () => {
      expect(getDirectionBetween('E5', 'E6')).toBe('N')
      expect(getDirectionBetween('E5', 'E4')).toBe('S')
      expect(getDirectionBetween('E5', 'F5')).toBe('E')
      expect(getDirectionBetween('E5', 'D5')).toBe('W')
    })

    it('returns null for non-adjacent squares', () => {
      expect(getDirectionBetween('E5', 'E7')).toBeNull()
      expect(getDirectionBetween('E5', 'F6')).toBeNull()
    })
  })

  describe('stepInDirection', () => {
    it('steps correctly in cardinal directions', () => {
      expect(stepInDirection('E5', 'N')).toBe('E6')
      expect(stepInDirection('E5', 'S')).toBe('E4')
      expect(stepInDirection('E5', 'E')).toBe('F5')
      expect(stepInDirection('E5', 'W')).toBe('D5')
    })

    it('returns null when stepping off the board', () => {
      expect(stepInDirection('E9', 'N')).toBeNull()
      expect(stepInDirection('E1', 'S')).toBeNull()
      expect(stepInDirection('A5', 'W')).toBeNull()
      expect(stepInDirection('I5', 'E')).toBeNull()
    })

    it('returns null when stepping to invalid diamond square', () => {
      // B4 stepping south would be B3, but B3 is not valid (|1-4|+|2-4|=5 > 4)
      expect(stepInDirection('B4', 'S')).toBeNull()
    })
  })

  describe('manhattanDistance', () => {
    it('returns 0 for same square', () => {
      expect(manhattanDistance('E5', 'E5')).toBe(0)
    })

    it('returns correct distance for adjacent squares', () => {
      expect(manhattanDistance('E5', 'E6')).toBe(1)
    })

    it('returns correct distance for distant squares', () => {
      expect(manhattanDistance('A5', 'I5')).toBe(8)
      expect(manhattanDistance('E1', 'E9')).toBe(8)
    })
  })

  describe('oppositeDirection', () => {
    it('returns correct opposites', () => {
      expect(oppositeDirection('N')).toBe('S')
      expect(oppositeDirection('S')).toBe('N')
      expect(oppositeDirection('E')).toBe('W')
      expect(oppositeDirection('W')).toBe('E')
    })
  })

  describe('isValidSquare / isValidSquareKey', () => {
    it('validates center square', () => {
      expect(isValidSquare(4, 4)).toBe(true) // E5
      expect(isValidSquareKey('E5')).toBe(true)
    })

    it('rejects corner of 9x9 grid', () => {
      expect(isValidSquare(0, 0)).toBe(false) // A1
      expect(isValidSquareKey('A1')).toBe(false)
    })
  })
})
