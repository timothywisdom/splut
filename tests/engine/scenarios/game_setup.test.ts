import { describe, it, expect } from 'vitest'
import { initGame, SEAT_COLOR, getStartingPositions } from '@/engine/setup'
import {
  PlayerSeat,
  PieceType,
  PlayerType,
  PlayerPiece,
  RockPiece,
  SetupConfig,
  GamePhase,
} from '@/engine/types'

function makeConfig(overrides: Partial<SetupConfig> = {}): SetupConfig {
  return {
    playerCount: 4,
    occupiedSeats: [PlayerSeat.Top, PlayerSeat.Bottom, PlayerSeat.Left, PlayerSeat.Right],
    firstPlayerSeat: PlayerSeat.Right,
    playerTypes: {
      [PlayerSeat.Top]: PlayerType.Human,
      [PlayerSeat.Bottom]: PlayerType.Human,
      [PlayerSeat.Left]: PlayerType.Human,
      [PlayerSeat.Right]: PlayerType.Human,
    },
    ...overrides,
  }
}

function make2PlayerConfig(
  seats: [PlayerSeat, PlayerSeat] = [PlayerSeat.Top, PlayerSeat.Bottom],
  first: PlayerSeat = seats[0]
): SetupConfig {
  return {
    playerCount: 2,
    occupiedSeats: seats,
    firstPlayerSeat: first,
    playerTypes: {
      [seats[0]]: PlayerType.Human,
      [seats[1]]: PlayerType.Human,
    },
  }
}

function make3PlayerConfig(
  seats: [PlayerSeat, PlayerSeat, PlayerSeat] = [PlayerSeat.Top, PlayerSeat.Bottom, PlayerSeat.Left],
  first: PlayerSeat = seats[0]
): SetupConfig {
  return {
    playerCount: 3,
    occupiedSeats: seats,
    firstPlayerSeat: first,
    playerTypes: {
      [seats[0]]: PlayerType.Human,
      [seats[1]]: PlayerType.Human,
      [seats[2]]: PlayerType.Human,
    },
  }
}

describe('Feature: Game Setup', () => {

  // -------------------------------------------------------------------
  // Board Geometry (covered in board.test.ts, but also here for scenarios)
  // -------------------------------------------------------------------

  describe('Rule: The board is a diamond-shaped grid', () => {
    it('Scenario: Valid board squares form a diamond shape', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      // Board geometry is already tested in board.test.ts
    })
  })

  // -------------------------------------------------------------------
  // Rock Placement
  // -------------------------------------------------------------------

  describe('Rule: Four Rocks are placed at the outermost corner squares at game start', () => {
    it('Rocks are placed at the four corner squares', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = result.value
      const rockSquares = ['E9', 'E1', 'A5', 'I5']
      for (const sq of rockSquares) {
        const pieceId = state.squareOccupancy.get(sq)
        expect(pieceId).toBeDefined()
        const piece = state.pieces.get(pieceId!)
        expect(piece).toBeDefined()
        expect(piece!.type).toBe(PieceType.Rock)
      }
    })

    it('Rocks are neutral and not owned by any player', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = result.value
      for (const [, piece] of state.pieces) {
        if (piece.type === PieceType.Rock) {
          expect('owner' in piece).toBe(false)
        }
      }
    })

    it('Exactly 4 Rocks are present on the board', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const rockCount = Array.from(result.value.pieces.values()).filter(p => p.type === PieceType.Rock).length
      expect(rockCount).toBe(4)
    })
  })

  // -------------------------------------------------------------------
  // 4-Player Setup
  // -------------------------------------------------------------------

  describe('Rule: In a 4-player game each player\'s team is placed near their assigned Rock', () => {
    it('4-player game places Green team at the top', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = result.value
      expect((state.pieces.get('Green_Sorcerer') as PlayerPiece).square).toBe('D8')
      expect((state.pieces.get('Green_Dwarf') as PlayerPiece).square).toBe('E8')
      expect((state.pieces.get('Green_Troll') as PlayerPiece).square).toBe('F8')
    })

    it('4-player game places Red team at the bottom', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = result.value
      expect((state.pieces.get('Red_Sorcerer') as PlayerPiece).square).toBe('F2')
      expect((state.pieces.get('Red_Dwarf') as PlayerPiece).square).toBe('E2')
      expect((state.pieces.get('Red_Troll') as PlayerPiece).square).toBe('D2')
    })

    it('4-player game places Yellow team at the left', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = result.value
      expect((state.pieces.get('Yellow_Sorcerer') as PlayerPiece).square).toBe('B6')
      expect((state.pieces.get('Yellow_Dwarf') as PlayerPiece).square).toBe('B5')
      expect((state.pieces.get('Yellow_Troll') as PlayerPiece).square).toBe('B4')
    })

    it('4-player game places Blue team at the right', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = result.value
      expect((state.pieces.get('Blue_Sorcerer') as PlayerPiece).square).toBe('H6')
      expect((state.pieces.get('Blue_Dwarf') as PlayerPiece).square).toBe('H5')
      expect((state.pieces.get('Blue_Troll') as PlayerPiece).square).toBe('H4')
    })

    it('4-player game has 16 pieces on the board', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const playerPieces = Array.from(result.value.pieces.values()).filter(p => p.type !== PieceType.Rock)
      expect(playerPieces.length).toBe(12)
      const rocks = Array.from(result.value.pieces.values()).filter(p => p.type === PieceType.Rock)
      expect(rocks.length).toBe(4)
    })
  })

  // -------------------------------------------------------------------
  // 2-Player Setup
  // -------------------------------------------------------------------

  describe('Rule: In a 2-player game the players sit at opposite seats', () => {
    it('2-player game with Top and Bottom seats', () => {
      const result = initGame(make2PlayerConfig([PlayerSeat.Top, PlayerSeat.Bottom]))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = result.value
      // Top (Green) team present
      expect(state.pieces.has('Green_Sorcerer')).toBe(true)
      expect(state.pieces.has('Green_Dwarf')).toBe(true)
      expect(state.pieces.has('Green_Troll')).toBe(true)
      // Bottom (Red) team present
      expect(state.pieces.has('Red_Sorcerer')).toBe(true)
      expect(state.pieces.has('Red_Dwarf')).toBe(true)
      expect(state.pieces.has('Red_Troll')).toBe(true)
      // Left and Right teams absent
      expect(state.pieces.has('Yellow_Sorcerer')).toBe(false)
      expect(state.pieces.has('Blue_Sorcerer')).toBe(false)
    })

    it('2-player game with Left and Right seats', () => {
      const result = initGame(make2PlayerConfig([PlayerSeat.Left, PlayerSeat.Right], PlayerSeat.Left))
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = result.value
      expect(state.pieces.has('Yellow_Sorcerer')).toBe(true)
      expect(state.pieces.has('Blue_Sorcerer')).toBe(true)
      expect(state.pieces.has('Green_Sorcerer')).toBe(false)
      expect(state.pieces.has('Red_Sorcerer')).toBe(false)
    })

    it('2-player game still places all 4 Rocks', () => {
      const result = initGame(make2PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const rocks = Array.from(result.value.pieces.values()).filter(p => p.type === PieceType.Rock)
      expect(rocks.length).toBe(4)
    })

    it('2-player game has 10 pieces total on the board', () => {
      const result = initGame(make2PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const playerPieces = Array.from(result.value.pieces.values()).filter(p => p.type !== PieceType.Rock)
      expect(playerPieces.length).toBe(6)
      const rocks = Array.from(result.value.pieces.values()).filter(p => p.type === PieceType.Rock)
      expect(rocks.length).toBe(4)
    })
  })

  // -------------------------------------------------------------------
  // 3-Player Setup
  // -------------------------------------------------------------------

  describe('Rule: In a 3-player game three seats are occupied and one is empty', () => {
    it('3-player game occupies three seats', () => {
      const result = initGame(make3PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const state = result.value
      expect(state.pieces.has('Green_Sorcerer')).toBe(true)
      expect(state.pieces.has('Red_Sorcerer')).toBe(true)
      expect(state.pieces.has('Yellow_Sorcerer')).toBe(true)
      expect(state.pieces.has('Blue_Sorcerer')).toBe(false)
    })

    it('3-player game has 13 pieces total on the board', () => {
      const result = initGame(make3PlayerConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const playerPieces = Array.from(result.value.pieces.values()).filter(p => p.type !== PieceType.Rock)
      expect(playerPieces.length).toBe(9)
      const rocks = Array.from(result.value.pieces.values()).filter(p => p.type === PieceType.Rock)
      expect(rocks.length).toBe(4)
    })
  })

  // -------------------------------------------------------------------
  // Team Composition
  // -------------------------------------------------------------------

  describe('Rule: Each player\'s team consists of exactly one Sorcerer, one Troll, and one Dwarf', () => {
    it.each(['Green', 'Red', 'Yellow', 'Blue'])(
      'the %s player should have exactly 1 Sorcerer, 1 Troll, and 1 Dwarf',
      (team) => {
        const result = initGame(makeConfig())
        expect(result.ok).toBe(true)
        if (!result.ok) return

        const teamPieces = Array.from(result.value.pieces.values())
          .filter((p): p is PlayerPiece => p.type !== PieceType.Rock && 'owner' in p)
          .filter(p => SEAT_COLOR[p.owner] === team)

        expect(teamPieces.filter(p => p.type === PieceType.Sorcerer)).toHaveLength(1)
        expect(teamPieces.filter(p => p.type === PieceType.Troll)).toHaveLength(1)
        expect(teamPieces.filter(p => p.type === PieceType.Dwarf)).toHaveLength(1)
      }
    )
  })

  // -------------------------------------------------------------------
  // Starting Position Validation
  // -------------------------------------------------------------------

  describe('Rule: Starting positions must conform to the Dwarf-in-front-of-Rock pattern', () => {
    it('Dwarf starts directly adjacent to its team\'s Rock', () => {
      const result = initGame(makeConfig())
      expect(result.ok).toBe(true)
      if (!result.ok) return

      // Top/Green: Rock at E9, Dwarf at E8 (adjacent to E9)
      expect((result.value.pieces.get('Green_Dwarf') as PlayerPiece).square).toBe('E8')
      // Bottom/Red: Rock at E1, Dwarf at E2 (adjacent to E1)
      expect((result.value.pieces.get('Red_Dwarf') as PlayerPiece).square).toBe('E2')
      // Left/Yellow: Rock at A5, Dwarf at B5 (adjacent to A5)
      expect((result.value.pieces.get('Yellow_Dwarf') as PlayerPiece).square).toBe('B5')
      // Right/Blue: Rock at I5, Dwarf at H5 (adjacent to I5)
      expect((result.value.pieces.get('Blue_Dwarf') as PlayerPiece).square).toBe('H5')
    })
  })

  // -------------------------------------------------------------------
  // Error Conditions
  // -------------------------------------------------------------------

  describe('Rule: Game setup must reject invalid configurations', () => {
    it('Cannot start a game with fewer than 2 players', () => {
      const result = initGame({
        playerCount: 1 as any,
        occupiedSeats: [PlayerSeat.Top],
        firstPlayerSeat: PlayerSeat.Top,
        playerTypes: { [PlayerSeat.Top]: PlayerType.Human },
      })
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('minimum 2 players required')
    })

    it('Cannot start a game with more than 4 players', () => {
      const result = initGame({
        playerCount: 5 as any,
        occupiedSeats: [PlayerSeat.Top, PlayerSeat.Bottom, PlayerSeat.Left, PlayerSeat.Right, PlayerSeat.Top],
        firstPlayerSeat: PlayerSeat.Top,
        playerTypes: {},
      })
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('maximum 4 players allowed')
    })

    it('2-player game rejects non-opposite seating', () => {
      const result = initGame({
        playerCount: 2,
        occupiedSeats: [PlayerSeat.Top, PlayerSeat.Left],
        firstPlayerSeat: PlayerSeat.Top,
        playerTypes: {
          [PlayerSeat.Top]: PlayerType.Human,
          [PlayerSeat.Left]: PlayerType.Human,
        },
      })
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error.message).toBe('2-player game requires opposite seats')
    })
  })
})
