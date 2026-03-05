# Debugging Notes

## Pull-back Rock Positioning
- Pull-back requires Rock to be directly BEHIND the Troll relative to movement direction
- "Behind" means opposite side from movement: if Troll moves West, Rock must be East of Troll
- Example: Troll at E5, Rock at F5 (east). Troll moves west to D5. Pull carries Rock from F5 to E5.

## Module Resolution in Vitest
- Using `require('./module')` for lazy loading does NOT work in Vitest
- Always use standard ES `import` at the top of the file instead
- The `src/engine/ai.ts` originally used require for resolvePushChain - failed with "Cannot find module"

## TypeScript Switch Exhaustiveness
- Switch statements on PlayerSeat enum: always add a `default` return case
- Without it, TypeScript reports "Function lacks ending return statement"
- This was caught in GameOverOverlay's getTeamHexColor function

## CSS Import Ordering
- In `globals.css`, `@import url(...)` for Google Fonts must come BEFORE `@import "tailwindcss"`
- Otherwise you get: "@import rules must precede all rules aside from @charset and @layer statements"

## AI Pending Throw at Turn Start
- When `pendingThrow` is true at the START of planAITurn (Troll already on Rock from previous move)
- The moves array is empty, so attaching throwDirection to moves[moves.length-1] fails
- Solution: push a synthetic throw-only move with the Troll's current square as targetSquare

## Board Coordinate System
- Columns A(0) through I(8), Rows 1(0) through 9(8)
- Valid square formula: |col_index - 4| + |row_index - 4| <= 4
- North = increasing row (N: dr=+1), South = decreasing row (S: dr=-1)
- East = increasing col (E: dc=+1), West = decreasing col (W: dc=-1)
- Board diamond rotation: Grid N = screen top-left, Grid E = screen top-right
