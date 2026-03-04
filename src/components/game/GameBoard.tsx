// ============================================================================
// SPLUT! Game Board
// 9x9 CSS Grid displayed as axis-aligned squares (no rotation).
// Renders only valid squares (41 of 81) with coordinate labels.
// ============================================================================

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useGameStore, HighlightType } from '@/store/gameStore'
import {
  useCurrentSeat,
  useIsAITurn,
  usePendingThrow,
  getTeamCSSColor,
} from '@/store/selectors'
import { ALL_VALID_SQUARES } from '@/engine/board'
import { fromKey, stepInDirection } from '@/engine/board'
import { PieceType, PlayerPiece, SquareKey, Direction } from '@/engine/types'
import { SEAT_COLOR } from '@/engine/setup'
import BoardSquare from './BoardSquare'
import Piece from './Piece'
import ThrowDirectionPicker from './ThrowDirectionPicker'
import PullBackPrompt from './PullBackPrompt'

// Column letters A=0..I=8, rows 1=0..9=8
function colToGridCol(col: string): number {
  return col.charCodeAt(0) - 'A'.charCodeAt(0) + 1
}

function rowToGridRow(row: number): number {
  // CSS grid row 1 = top of screen, but our row 9 = top of board
  // So grid row = 10 - row
  return 10 - row
}

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const ROW_LABELS = [9, 8, 7, 6, 5, 4, 3, 2, 1] // top to bottom on screen

export default function GameBoard() {
  const game = useGameStore((s) => s.game)
  const selectedPieceId = useGameStore((s) => s.selectedPieceId)
  const validMoveTargets = useGameStore((s) => s.validMoveTargets)
  const highlightedSquares = useGameStore((s) => s.highlightedSquares)
  const levitateRockId = useGameStore((s) => s.levitateRockId)
  const selectPiece = useGameStore((s) => s.selectPiece)
  const movePiece = useGameStore((s) => s.movePiece)
  const clearSelection = useGameStore((s) => s.clearSelection)
  const chooseLevitateRock = useGameStore((s) => s.chooseLevitateRock)
  const currentSeat = useCurrentSeat()
  const isAITurn = useIsAITurn()
  const pendingThrow = usePendingThrow()

  const [hoveredSquare, setHoveredSquare] = useState<SquareKey | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  // SPLUT! announcer
  const [splatAnnouncement, setSplatAnnouncement] = useState('')
  const lastSplutSquare = game?.lastSplutSquare
  useEffect(() => {
    if (lastSplutSquare) {
      const splatPiece = game?.lastSplutSquare ? Array.from(game.pieces.values()).find(p => p.square === lastSplutSquare && p.type === PieceType.Dwarf) : null
      const teamName = splatPiece && 'owner' in splatPiece ? SEAT_COLOR[(splatPiece as PlayerPiece).owner] : ''
      setSplatAnnouncement(`SPLUT! ${teamName} Dwarf on ${lastSplutSquare} has been crushed.`)
      const timer = setTimeout(() => setSplatAnnouncement(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastSplutSquare])

  const validSquares = Array.from(ALL_VALID_SQUARES)

  const handleSquareClick = useCallback(
    (square: SquareKey) => {
      if (!game || isAITurn) return
      if (pendingThrow) return

      if (selectedPieceId && validMoveTargets.includes(square)) {
        movePiece(square)
        return
      }

      const pieceId = game.squareOccupancy.get(square)
      if (pieceId) {
        const piece = game.pieces.get(pieceId)

        // Handle rock clicks for Sorcerer levitation
        if (piece && piece.type === PieceType.Rock && selectedPieceId) {
          const selectedPiece = game.pieces.get(selectedPieceId)
          if (selectedPiece && selectedPiece.type === PieceType.Sorcerer) {
            const highlight = highlightedSquares.get(square)
            if (highlight === 'levitate-eligible') {
              // Toggle: if this rock is already selected, deselect it
              if (levitateRockId === pieceId) {
                chooseLevitateRock(null)
              } else {
                chooseLevitateRock(pieceId)
              }
              return
            }
          }
        }

        if (piece && piece.type !== PieceType.Rock) {
          const pp = piece as PlayerPiece
          if (pp.owner === currentSeat && pp.alive) {
            selectPiece(pieceId)
            return
          }
        }
      }

      clearSelection()
    },
    [game, isAITurn, pendingThrow, selectedPieceId, validMoveTargets, currentSeat, highlightedSquares, levitateRockId, selectPiece, movePiece, clearSelection, chooseLevitateRock]
  )

  const handleSquareKeyDown = useCallback(
    (square: SquareKey, e: React.KeyboardEvent) => {
      if (!game || isAITurn) return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSquareClick(square)
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
        return
      }

      // Arrow key navigation between valid targets
      const dirMap: Record<string, Direction> = {
        ArrowUp: 'N',
        ArrowDown: 'S',
        ArrowRight: 'E',
        ArrowLeft: 'W',
      }
      const dir = dirMap[e.key]
      if (dir) {
        e.preventDefault()
        const next = stepInDirection(square, dir)
        if (next && ALL_VALID_SQUARES.has(next)) {
          const el = boardRef.current?.querySelector(`[data-square="${next}"]`) as HTMLElement
          el?.focus()
        }
      }
    },
    [game, isAITurn, handleSquareClick, clearSelection]
  )

  if (!game) return null

  // Find the selected piece's square for throw picker positioning
  let throwPieceSquare: SquareKey | null = null
  let throwPieceGridPos: { col: number; row: number } | null = null
  if (pendingThrow && !isAITurn) {
    for (const [, piece] of game.pieces) {
      if (piece.type !== PieceType.Rock) {
        const pp = piece as PlayerPiece
        if (pp.type === PieceType.Troll && pp.owner === currentSeat) {
          const occupants = Array.from(game.pieces.values()).filter(
            (p) => p.square === pp.square
          )
          if (occupants.some((p) => p.type === PieceType.Rock)) {
            throwPieceSquare = pp.square
            const sq = fromKey(pp.square)
            throwPieceGridPos = {
              col: colToGridCol(sq.col),
              row: rowToGridRow(sq.row),
            }
            break
          }
        }
      }
    }
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full" ref={boardRef}>
      {/* SPLUT! assertive announcer (screen reader) */}
      <div
        id="splut-announcer"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {splatAnnouncement}
      </div>

      {/* Board with coordinate labels */}
      <div className="flex flex-col items-center">
        {/* Column labels (top) */}
        <div
          className="flex"
          style={{ width: 'min(calc(100vh - 120px), calc(100vw - 48px), 560px)', paddingLeft: '20px' }}
        >
          {COL_LABELS.map((col) => (
            <div key={col} className="flex-1 text-center font-mono text-xs text-ash select-none">
              {col}
            </div>
          ))}
        </div>

        <div className="flex items-stretch">
          {/* Row labels (left) */}
          <div
            className="flex flex-col justify-between py-0"
            style={{ width: '20px', height: 'min(calc(100vh - 120px), calc(100vw - 48px), 560px)' }}
          >
            {ROW_LABELS.map((row) => (
              <div key={row} className="flex-1 flex items-center justify-center font-mono text-xs text-ash select-none">
                {row}
              </div>
            ))}
          </div>

          {/* Board grid */}
          <div
            className={`board-diamond ${highlightedSquares.has(game.lastSplutSquare ?? '') ? 'animate-splut-shake' : ''}`}
            role="grid"
            aria-label="SPLUT! game board"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(9, 1fr)',
              gridTemplateRows: 'repeat(9, 1fr)',
              gap: '1px',
              width: 'min(calc(100vh - 120px), calc(100vw - 48px), 560px)',
              height: 'min(calc(100vh - 120px), calc(100vw - 48px), 560px)',
              aspectRatio: '1',
            }}
          >
            {validSquares.map((square) => {
              const sq = fromKey(square)
              const gridCol = colToGridCol(sq.col)
              const gridRow = rowToGridRow(sq.row)
              const highlight = highlightedSquares.get(square) ?? null
              const pieceId = game.squareOccupancy.get(square)
              const piece = pieceId ? game.pieces.get(pieceId) : null

              let hasOwnPiece = false
              let teamColor: string | null = null
              let occupantLabel = ''
              if (piece && piece.type !== PieceType.Rock) {
                const pp = piece as PlayerPiece
                if (pp.owner === currentSeat) {
                  hasOwnPiece = true
                }
                teamColor = getTeamCSSColor(pp.owner)
                occupantLabel = `${SEAT_COLOR[pp.owner]} ${pp.type}`
              } else if (piece && piece.type === PieceType.Rock) {
                occupantLabel = 'Rock'
              }

              const isValidTarget = validMoveTargets.includes(square)
              const effectiveHighlight: HighlightType | null = isValidTarget
                ? 'valid-move'
                : highlight

              const isPieceSelected = pieceId === selectedPieceId
              const isLevitating = piece?.type === PieceType.Rock && levitateRockId === pieceId

              // Make own pieces, valid targets, and levitate-eligible rocks focusable
              const isLevitateEligible = highlight === 'levitate-eligible'
              const isInteractive = hasOwnPiece || isValidTarget || isLevitateEligible
              const tabIdx = isInteractive ? 0 : -1

              return (
                <BoardSquare
                  key={square}
                  square={square}
                  gridCol={gridCol}
                  gridRow={gridRow}
                  highlight={effectiveHighlight}
                  isHovered={hoveredSquare === square}
                  hasOwnPiece={hasOwnPiece}
                  teamColor={teamColor}
                  occupantLabel={occupantLabel}
                  onClick={() => handleSquareClick(square)}
                  onMouseEnter={() => setHoveredSquare(square)}
                  onMouseLeave={() => setHoveredSquare(null)}
                  onKeyDown={(e) => handleSquareKeyDown(square, e)}
                  tabIndex={tabIdx}
                >
                  {piece && (
                    <Piece
                      piece={piece}
                      square={square}
                      isSelected={isPieceSelected}
                      isHovered={hoveredSquare === square && hasOwnPiece}
                      isLevitating={isLevitating}
                      onClick={() => {
                        if (hasOwnPiece && !isAITurn && !pendingThrow) {
                          selectPiece(pieceId!)
                        }
                      }}
                    />
                  )}
                </BoardSquare>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pull-Back confirmation prompt */}
      <PullBackPrompt />

      {/* Throw Direction Picker overlay — positioned relative to Troll's square */}
      {pendingThrow && !isAITurn && throwPieceSquare && throwPieceGridPos && (
        <ThrowDirectionPicker
          pieceSquare={throwPieceSquare}
          gridCol={throwPieceGridPos.col}
          gridRow={throwPieceGridPos.row}
          totalCols={9}
          totalRows={9}
        />
      )}

      {/* AI turn overlay (subtle) */}
      {isAITurn && (
        <div className="absolute inset-0 bg-obsidian/15 pointer-events-none rounded-lg" />
      )}
    </div>
  )
}
