# SPLUT! Design System Memory

## Project Overview
- SPLUT! is a 2-4 player fantasy board game, Next.js 15 + Tailwind CSS SPA
- Diamond-shaped board (41 valid squares, 9x9 grid, NOT rotated per Bug #6)
- Three piece types per team (Troll, Dwarf, Sorcerer) + 4 neutral Rocks
- Design spec lives at `/Users/tim.beamish/source/splut/DESIGN_SPEC.md`
- Implementation plan at `/Users/tim.beamish/source/splut/IMPLEMENTATION_PLAN.md`
- Help/Rules spec at `/Users/tim.beamish/source/splut/HELP_RULES_DESIGN_SPEC.md`

## Art Direction: Dark Fantasy Arcana
- Stone textures + magical luminescence on dark backgrounds
- References: Darkest Dungeon UI, Armello board, Hades effects, Slay the Spire readability
- All effects CSS/SVG only -- no WebGL, no Canvas, no raster images

## Key Color Decisions
- Background: Obsidian `#0D0D12`, Slate Stone `#1A1A2E`, Carved Stone `#2A2A3E`
- Teams: Green `#22C55E`, Red `#EF4444`, Yellow `#EAB308`, Blue `#3B82F6`
- Accent: Rune Gold `#D4A853` (universal decorative), Magic Purple `#A855F7` (levitation)
- Throw Orange `#F97316`, SPLUT Red `#FF2D55` (reserved exclusively for SPLUT kill + rules SPLUT! heading)
- Valid Move Cyan `#22D3EE`

## Typography
- Display/Headings: Cinzel (Google Fonts) - fantasy serif
- Body/UI: Inter (Google Fonts) - clean sans-serif
- Mono/Log: JetBrains Mono - action log and coordinates

## Critical Design Patterns
- Board is CSS Grid (NOT rotated), standard axis-aligned squares
- Pieces are inline SVGs accepting fill/stroke via CSS (single color channel)
- Each team has 3 color variants: primary, glow (animated states), dim (eliminated)
- SPLUT! is THE signature visual moment: 600ms sequence with shake, flash, particles, text
- All animations respect `prefers-reduced-motion: reduce`
- Z-index architecture: background(0) < board(10-15) < overlays(18-25) < panels(30-35) < modals(50-51)

## Established Overlay/Modal Patterns
- `Modal.tsx`: bg-slate-stone, border-rune-gold/30, rounded-2xl, standard shadow
- GameOverOverlay: fixed z-50, obsidian/85 backdrop, game-over-entrance animation
- Help modal: full-screen overlay, obsidian/88 backdrop with blur(4px), scale entrance
- Modal entrance: scale(0.95)->1.0 with cubic-bezier(0.16, 1, 0.3, 1), 300ms

## Help/Rules Feature
- Full-screen modal (not a page) -- preserves game/lobby state
- Tabbed sections: Overview, Board, Pieces, SPLUT!, Winning, Quick Ref
- Callout box component: 4 variants (info=rune-gold, magic=purple, warning=orange, danger=splut-red)
- Board diagram reuses engine data (ALL_VALID_SQUARES, INITIAL_POSITIONS)
- Inline piece icons at 16px in rune-gold throughout rules text
- Entry: lobby="How to Play" ghost link; game=Rules button integrated into TurnBanner header
- No tab-switch animation (instant swap for speed during gameplay)

## Animation Principles
- Interactions: snappy (120-200ms)
- Game events: visible/trackable (300-400ms)
- Dramatic moments: emphatic (600-800ms)
- Piece moves use spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`

## Header Banner Pattern (Bug Fix)
- TurnBanner is the single unified header: Lobby (left) | Turn Info (center) | Rules (right)
- NO fixed-positioned nav buttons overlaying the banner -- everything is flex children
- Lobby + Rules buttons are passed as callbacks (onLobby, onShowHelp) into TurnBanner
- Side zones use min-w-[80px] flex-shrink-0 as balanced anchors for centering
- Mobile: text labels hidden (arrow-only, ?-only), turn text reduced to 18px
- GameOver state: TurnBanner still renders with Lobby only, neutral border
- Header banner design spec: `/Users/tim.beamish/source/splut/HEADER_BANNER_DESIGN_SPEC.md`

## Accessibility Commitments
- WCAG AA contrast on all text (verified in both specs)
- Keyboard navigation + focus trap in modals
- aria-labels on all interactive elements
- Shape-based disambiguation for colorblind users (piece silhouettes are unique)
- Focus indicators: Rune Gold Bright `#F0D078` outline
