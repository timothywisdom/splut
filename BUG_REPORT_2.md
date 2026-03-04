# Bug Report 2 — AI & UI Issues

## Bug #7: AI Troll Oscillation Loop

**Severity:** Critical — AI is completely non-functional

**Description:**
The AI opponent only moves its Troll back and forth between two adjacent squares every turn, never making any strategic progress and never moving any other piece (Dwarf or Sorcerer).

**Steps to Reproduce:**
1. Start a 2-player game: Top (Green) = Human, Bottom (Red) = AI
2. Make any move as Green to end your turn
3. Observe the AI's moves in the Battle Log

**Expected Behavior:**
The AI should make strategic moves — approaching rocks, positioning pieces, eventually throwing rocks at the opponent's Sorcerer.

**Actual Behavior:**
The AI Troll oscillates between D2 and D3 every turn:
- Turn 1 (2 moves): Troll D2→D3, Troll D3→D2
- Turn 2 (3 moves): Troll D2→D3, Troll D3→D2, Troll D2→D3
- Turn 3 (3 moves): Troll D3→D2, Troll D2→D3, Troll D3→D2
- (repeats indefinitely)

No other piece (Dwarf, Sorcerer) is ever moved.

**Root Cause:**
In `src/engine/ai.ts`, `planAITurn()` re-evaluates tiers for each move within a turn but has no memory of squares already visited. The `evaluateTrollApproach()` function at Tier 4 alternates targets:

1. From D2: nearest rock is E1 (distance 2), but D3 is farther from E1 (distance 3). Falls through to rock A5 (distance 6) — D3 is closer (distance 5). **Moves to D3.**
2. From D3: nearest rock is E1 (distance 3), D2 is closer (distance 2). **Moves back to D2.**

This creates an infinite oscillation because each move evaluates the nearest rock independently with no "visited square" tracking.

**Fix:**
Add a `visitedSquares: Set<SquareKey>` parameter threaded through `planAITurn()` → tier evaluators → `getValidMoveSquares()`. Filter out any target square already visited during the current turn to prevent backtracking.

**Files Affected:**
- `src/engine/ai.ts` — `planAITurn()`, `getValidMoveSquares()`, all `evaluateTier*` functions

---

## Bug #8: Move Counter Shows "Move 4 of 3" During Pending Throw

**Severity:** Minor — cosmetic/UI display issue

**Description:**
When a Troll lands on a Rock as its last available move, the turn banner displays "Move 4 of 3" (or more generally "Move N+1 of N") while the throw direction picker is shown.

**Steps to Reproduce:**
1. Start a 2-player game
2. Move your Troll onto a Rock using your last available move (move 3 of 3)
3. Observe the turn banner while the throw direction picker is visible

**Expected Behavior:**
The move counter should indicate the throw state, e.g. display "Throw!" or cap at "Move 3 of 3", not show an impossible "Move 4 of 3".

**Actual Behavior:**
Turn banner displays "Move 4 of 3" because `TurnBanner.tsx` renders `Move {used + 1} of {allowed}` and `movesUsed` has already been incremented to 3 (equal to `movesAllowed`), producing `3 + 1 = 4`.

**Root Cause:**
`src/components/game/TurnBanner.tsx` line 69 unconditionally renders `Move {used + 1} of {allowed}` without checking for the `pendingThrow` state. When all moves are consumed and a throw is pending, this formula overflows.

**Fix:**
Check `pendingThrow` in `TurnBanner`. When true, display "Throw!" instead of the regular move counter. Also cap the displayed move number to never exceed `allowed`.

**Files Affected:**
- `src/components/game/TurnBanner.tsx`
- `src/store/selectors.ts` (add `usePendingThrow` selector export if needed)
