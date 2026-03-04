// ============================================================================
// SPLUT! Piece SVG Icons
// Hand-carved style SVG icons for each piece type.
// ============================================================================

'use client'

interface PieceIconProps {
  color: string
  size?: number
  className?: string
}

/**
 * Troll: Broad-shouldered silhouette with hunched posture.
 * Reads as "big and heavy."
 */
export function TrollIcon({ color, size = 32, className = '' }: PieceIconProps) {
  const strokeColor = adjustBrightness(color, 0.7)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Troll"
    >
      {/* Body - broad shouldered hunched shape */}
      <path
        d="M10 26 L10 18 Q10 14 13 12 L13 10 Q13 7 16 6 Q19 7 19 10 L19 12 Q22 14 22 18 L22 26 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {/* Head - heavy brow */}
      <circle cx="16" cy="8" r="4" fill={color} stroke={strokeColor} strokeWidth="1.5" />
      <line
        x1="12.5"
        y1="7"
        x2="19.5"
        y2="7"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Arms reaching down */}
      <path
        d="M10 18 Q7 20 8 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M22 18 Q25 20 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Cross-hatch texture */}
      <line
        x1="13"
        y1="16"
        x2="15"
        y2="20"
        stroke={strokeColor}
        strokeWidth="0.75"
        opacity="0.5"
      />
      <line
        x1="17"
        y1="15"
        x2="19"
        y2="21"
        stroke={strokeColor}
        strokeWidth="0.75"
        opacity="0.5"
      />
    </svg>
  )
}

/**
 * Dwarf: Compact, round-helmeted figure with shield motif.
 * Shorter and wider proportioned.
 */
export function DwarfIcon({ color, size = 28, className = '' }: PieceIconProps) {
  const strokeColor = adjustBrightness(color, 0.7)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      aria-label="Dwarf"
    >
      {/* Helmet - round with visor slit */}
      <path
        d="M8 12 Q8 5 14 4 Q20 5 20 12 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <line
        x1="10"
        y1="10"
        x2="18"
        y2="10"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Body - compact and wide */}
      <path
        d="M8 12 L7 22 Q7 24 14 25 Q21 24 21 22 L20 12 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {/* Shield motif on body */}
      <path
        d="M11 15 L14 14 L17 15 L14 21 Z"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  )
}

/**
 * Sorcerer: Tall, narrow silhouette with pointed hat and spark hand.
 * The most vertical piece.
 */
export function SorcererIcon({ color, size = 32, className = '' }: PieceIconProps) {
  const strokeColor = adjustBrightness(color, 0.7)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Sorcerer"
    >
      {/* Pointed hat */}
      <path
        d="M16 2 L11 14 L21 14 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Head */}
      <circle cx="16" cy="15" r="3" fill={color} stroke={strokeColor} strokeWidth="1.5" />
      {/* Robed body - tall and narrow */}
      <path
        d="M12 18 L10 29 L22 29 L20 18 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {/* Raised hand with sparks */}
      <path
        d="M20 18 Q24 14 23 11"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Three spark lines */}
      <line
        x1="23"
        y1="11"
        x2="25"
        y2="9"
        stroke={strokeColor}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
      <line
        x1="23"
        y1="11"
        x2="26"
        y2="11"
        stroke={strokeColor}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
      <line
        x1="23"
        y1="11"
        x2="24"
        y2="8"
        stroke={strokeColor}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

/**
 * Rock: Irregular octagonal shape with crack lines.
 * Neutral, heavy-looking.
 */
export function RockIcon({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      aria-label="Rock"
    >
      {/* Irregular octagonal shape */}
      <path
        d="M10 3 L18 3 L24 8 L26 14 L24 20 L18 25 L10 25 L4 20 L2 14 L4 8 Z"
        fill="var(--rock-granite)"
        stroke="#5C5652"
        strokeWidth="2"
      />
      {/* Crack lines */}
      <line x1="8" y1="10" x2="14" y2="16" stroke="#5C5652" strokeWidth="1" opacity="0.6" />
      <line x1="16" y1="8" x2="20" y2="14" stroke="#5C5652" strokeWidth="1" opacity="0.6" />
      <line x1="12" y1="18" x2="16" y2="22" stroke="#5C5652" strokeWidth="0.75" opacity="0.5" />
      {/* Light edge highlight */}
      <path
        d="M10 3 L18 3 L24 8"
        fill="none"
        stroke="var(--rock-granite-light)"
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  )
}

/** Adjust hex color brightness. Factor < 1 = darker, > 1 = brighter. */
function adjustBrightness(hex: string, factor: number): string {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) return hex
  const r = Math.min(255, Math.round(parseInt(match[1], 16) * factor))
  const g = Math.min(255, Math.round(parseInt(match[2], 16) * factor))
  const b = Math.min(255, Math.round(parseInt(match[3], 16) * factor))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
