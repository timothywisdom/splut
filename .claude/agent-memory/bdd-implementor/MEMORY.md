# SPLUT! Project Memory

## Project Overview
- **Stack:** Next.js 16.1 (App Router), TypeScript, Tailwind CSS v4, Zustand 5, Vitest 4
- **Path:** `/Users/tim.beamish/source/splut/`
- **Theme:** "Dark Fantasy Arcana" - dark stone/magic aesthetic

## Key Architecture Decisions
- Engine is pure TypeScript functions in `src/engine/` - zero React dependencies
- Uses `Result<T, E>` pattern for all engine operations (see `src/engine/types.ts`)
- Zustand store in `src/store/gameStore.ts` bridges engine to UI
- AI engine (`src/engine/ai.ts`) is pure functions, Zustand handles setTimeout orchestration
- Board is 41 valid squares (diamond shape), rendered as 9x9 CSS grid (NOT rotated - see Bug #6)
- Board coordinates: A-I columns, 1-9 rows, e.g. "E5" = center

## Test Suite
- 245 tests across 14 files, all Vitest
- Run with `npx vitest run`
- Test files in `tests/engine/scenarios/` map to Gherkin features
- `tests/helpers/boardBuilder.ts` is the fluent test helper for constructing GameState

## Common Gotchas (See [debugging.md](./debugging.md))
- Pull-back requires Rock directly behind Troll relative to movement direction
- `require()` for lazy imports fails in Vitest - use direct imports
- TypeScript switch exhaustiveness: always include default case for PlayerSeat enums
- CSS `@import url()` must precede `@import "tailwindcss"` to avoid warnings
- `SEAT_COLOR` is exported from `src/engine/setup.ts` (maps seat to color name)
- Avoid `<style jsx>` - Next.js 16 may not include styled-jsx; use globals.css keyframes instead

## File Layout
- `src/engine/` - Pure game engine (types, board, setup, troll, dwarf, sorcerer, turns, win, rockState, ai)
- `src/store/` - Zustand store (gameStore.ts, selectors.ts)
- `src/components/lobby/` - Lobby UI (PlayerCountSelector, SeatSelector, PlayerTypeToggle)
- `src/components/game/` - Game UI (GameBoard, BoardSquare, Piece, PieceIcons, TurnBanner, MoveCounter, PlayerStatus, ThrowDirectionPicker, AIThinkingIndicator, GameOverOverlay, ActionLog)
- `src/components/help/` - Help/Rules modal (HelpModal, HelpTabs, HelpContent, BoardDiagram, SplatDiagram, CalloutBox, RulesTable, InlinePiece, sections/)
- `src/components/ui/` - Shared UI (Button, Modal)
- `src/app/page.tsx` - Lobby page (also renders GamePage via screen state)
- `src/app/game/page.tsx` - Game page component

## Design Spec Reference
- Colors defined as CSS custom properties in `globals.css` and Tailwind theme
- Team colors: Green(Top)=#22C55E, Red(Bottom)=#EF4444, Yellow(Left)=#EAB308, Blue(Right)=#3B82F6
- Fonts: Cinzel (display), Inter (body), JetBrains Mono (log/coords)
