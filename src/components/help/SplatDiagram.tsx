// ============================================================================
// SPLUT! Throw Diagram
// Visual diagram showing the SPLUT! mechanic (Troll throws East, crushes Dwarf).
// ============================================================================

'use client'

import { TrollIcon, DwarfIcon, RockIcon } from '@/components/game/PieceIcons'

export default function SplatDiagram() {
  const squareSize = 48
  const gap = 4
  const totalWidth = squareSize * 4 + gap * 3

  return (
    <div
      className="flex flex-col items-center rounded-lg p-4 my-4"
      style={{
        background: 'rgba(13, 13, 18, 0.5)',
        border: '1px solid var(--carved-stone)',
      }}
    >
      {/* Arrow label */}
      <div className="relative w-full flex justify-center mb-2">
        <div style={{ width: totalWidth }} className="relative">
          {/* Label text */}
          <div
            className="text-center italic mb-1"
            style={{
              fontSize: '11px',
              color: 'var(--throw-orange)',
            }}
          >
            Troll throws East
          </div>
          {/* Arrow SVG */}
          <svg
            width={totalWidth}
            height="12"
            viewBox={`0 0 ${totalWidth} 12`}
            className="block"
          >
            <line
              x1={squareSize / 2}
              y1={6}
              x2={totalWidth - 20}
              y2={6}
              stroke="var(--throw-orange)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <polygon
              points={`${totalWidth - 8},6 ${totalWidth - 18},1 ${totalWidth - 18},11`}
              fill="var(--throw-orange)"
            />
          </svg>
        </div>
      </div>

      {/* Four squares */}
      <div className="flex" style={{ gap: `${gap}px` }}>
        {/* Square 1: Troll */}
        <div
          className="flex items-center justify-center rounded-[4px]"
          style={{
            width: squareSize,
            height: squareSize,
            background: 'var(--carved-stone)',
            border: '1px solid rgba(58, 58, 82, 0.5)',
          }}
        >
          <TrollIcon color="var(--rune-gold)" size={28} />
        </div>

        {/* Square 2: Empty */}
        <div
          className="flex items-center justify-center rounded-[4px]"
          style={{
            width: squareSize,
            height: squareSize,
            background: 'var(--slate-stone)',
            border: '1px solid rgba(58, 58, 82, 0.5)',
          }}
        />

        {/* Square 3: Dwarf (SPLUT!) */}
        <div
          className="flex items-center justify-center rounded-[4px] relative"
          style={{
            width: squareSize,
            height: squareSize,
            background: 'rgba(255, 45, 85, 0.15)',
            border: '2px solid rgba(255, 45, 85, 0.4)',
          }}
        >
          <DwarfIcon color="var(--bone)" size={24} />
        </div>

        {/* Square 4: Rock */}
        <div
          className="flex items-center justify-center rounded-[4px]"
          style={{
            width: squareSize,
            height: squareSize,
            background: 'var(--carved-stone)',
            border: '1px solid rgba(58, 58, 82, 0.5)',
          }}
        >
          <RockIcon size={24} />
        </div>
      </div>

      {/* SPLUT! label below square 3 */}
      <div className="relative w-full flex justify-center mt-1">
        <div style={{ width: totalWidth }} className="relative">
          {/* Position the label centered under square 3 */}
          <div
            className="absolute text-center"
            style={{
              left: (squareSize + gap) * 2,
              width: squareSize,
            }}
          >
            {/* Upward caret */}
            <div className="flex justify-center">
              <svg width="12" height="8" viewBox="0 0 12 8">
                <polygon
                  points="6,0 0,8 12,8"
                  fill="rgba(255, 45, 85, 0.6)"
                />
              </svg>
            </div>
            {/* SPLUT! text */}
            <div
              className="font-display font-bold"
              style={{
                fontSize: '14px',
                color: 'var(--splut-red)',
              }}
            >
              SPLUT!
            </div>
          </div>
          {/* Description text centered under diagram */}
          <div
            className="text-center text-ash mt-10"
            style={{ fontSize: '11px' }}
          >
            Rock lands here, Dwarf is crushed
          </div>
        </div>
      </div>
    </div>
  )
}
