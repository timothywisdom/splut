# Design QA Expert Memory — SPLUT! Project

## Project Overview
SPLUT! is a Next.js (App Router) board game using Tailwind CSS v4, Zustand, and inline SVGs.
Design spec: `/Users/tim.beamish/source/splut/DESIGN_SPEC.md` (authoritative, version 1.0).
QA Report: `/Users/tim.beamish/source/splut/DESIGN_QA_REPORT.md` (initial 2026-03-03; re-review appended same date).

## Compliance Status (Post Second-Pass Review, 2026-03-03)
Overall compliance: ~90-92% (up from ~55-60% in initial review).
All 20 original major items resolved. 7 residual minor/advisory items remain (RES-01 through RES-07).

## Tailwind Configuration
- Project uses Tailwind v4 with CSS-first `@theme inline` in `globals.css` (NO `tailwind.config.ts`).
- Spec was written assuming v3 config, but v4 CSS approach is acceptable equivalent.
- All team glow/dim color variants ARE now registered in `@theme inline`.
- All required animation utilities ARE now registered: `animate-float-bob`, `animate-splut-shake`,
  `animate-ai-thinking`, `animate-particle-rise`, `animate-dash-flow`, `animate-shimmer`,
  `animate-title-pulse`, `animate-celebration-rise`, `animate-slide-down`, `animate-slide-in-right`,
  `animate-game-over-entrance`, plus original `animate-pulse-glow`, `animate-piece-settle`, `animate-splut-flash`.

## Design System Tokens (Key Values)
- Obsidian: `#0D0D12` | Slate Stone: `#1A1A2E` | Carved Stone: `#2A2A3E` | Worn Stone: `#3A3A52`
- Ash: `#6B6B8A` | Bone: `#C8C8D4` | Parchment: `#E8E4DC` | Pure Light: `#F5F0E8`
- Green: `#22C55E` | Red: `#EF4444` | Yellow: `#EAB308` | Blue: `#3B82F6`
- Rune Gold: `#D4A853` | Rune Gold Bright: `#F0D078` | Magic Purple: `#A855F7`
- Throw Orange: `#F97316` | SPLUT Red: `#FF2D55` | Valid Move: `#22D3EE`

## Resolved Patterns (Now Correct)
- Button gradient: inline style `linear-gradient(135deg, var(--rune-gold), #B8922E)` — correct.
- Button shadows: default, hover, pressed all implemented.
- Piece hover: `style={{ transform: 'scale(1.08)' }}` inline — `scale-108` Tailwind class is silently broken.
- AI thinking: 3 dots, `animate-ai-thinking`, 4px size (`w-1 h-1`), `gap-1.5`, inline in TurnBanner.
- Piece sizes: Troll=32px, Sorcerer=32px (fixed). Dwarf still 24px (should be 28px — RES-07 open).
- Accessibility: All 6 ARIA items now implemented (board squares, pieces, TurnBanner, ActionLog, GameOverOverlay, SPLUT announcer).
- Focus indicators: `.focus-ring` and `.focus-ring-inset` defined in globals.css, applied throughout.
- Keyboard nav: Enter/Space/Escape/Arrows on board squares; Enter/Space on throw picker buttons.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` block in globals.css.

## Open Issues (7 Remaining After Second Pass)
- RES-01: Celebration particle duration 2-4s; spec requires 3-5s. Fix: `3 + Math.random() * 2`.
- RES-02: SPLUT announcer omits team name. Needs `lastSplutTeam` in store.
- RES-03: `PlayerTypeToggle` data-testid is static `"player-type-toggle"` — needs seat identifier.
- RES-04: Button hover gradient change absent (only shadow changes on hover, not gradient).
- RES-05: `AIThinkingIndicator.tsx` is dead/orphaned code with wrong animation — delete or fix.
- RES-06: Board size `min(70vh, 70vw, 560px)` — spec requires `min(available - 48px)`. Use CSS min() with container-relative units.
- RES-07: Dwarf piece size is 24px; spec requires 28px. Fix: `size={28}` in `Piece.tsx`.

## Not Yet Implemented (Delight/Advanced Features)
- Arcane decorative ring around the board (MINOR-37).
- SPLUT! text overlay component + particle burst on kill square (MINOR-39).
- Levitation orbiting rune circles (spec section 3.4).
- Lobby entry/exit transitions (ADVISORY-07).
- Board coordinate labels A-I / 1-9 (spec section 4.10).
- Invalid-move feedback flash on wrong click (spec section 5.1).
- Rock throw trajectory orange afterimage trail (spec section 5.5).

## Components Reference
- Lobby: `src/app/page.tsx` (includes LobbyParticles inline)
- Game: `src/app/game/page.tsx`
- Board: `src/components/game/GameBoard.tsx`
- Square: `src/components/game/BoardSquare.tsx`
- Piece: `src/components/game/Piece.tsx`
- Piece SVGs: `src/components/game/PieceIcons.tsx`
- TurnBanner: `src/components/game/TurnBanner.tsx` (AI thinking inline, role=status)
- ActionLog: `src/components/game/ActionLog.tsx` (role=log, custom scrollbar, top gradient)
- GameOverOverlay: `src/components/game/GameOverOverlay.tsx` (includes CelebrationParticles inline)
- ThrowDirectionPicker: `src/components/game/ThrowDirectionPicker.tsx` (grid-position-aware)
- PlayerStatus: `src/components/game/PlayerStatus.tsx` (piece mini-icons, shimmer bar)
- MoveCounter: `src/components/game/MoveCounter.tsx`
- AIThinkingIndicator: `src/components/game/AIThinkingIndicator.tsx` — ORPHANED, do not use
- Button: `src/components/ui/Button.tsx`
- Store: `src/store/gameStore.ts` | Selectors: `src/store/selectors.ts`
