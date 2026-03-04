# Comprehensive Playtest Notes

## Session Info
- Date: 2026-03-03
- Setup: 2-player, Top (Green) = Human, Bottom (Red) = AI
- Goal: Test every piece interaction at least once

## Interactions Tested
- [x] Sorcerer: basic movement (D8→D7, D7→D6)
- [x] Sorcerer: levitate a rock (E9 rock levitated to E8 via south direction)
- [x] Troll: basic movement (F8→F7)
- [x] Troll: move onto rock (trigger throw) — F8→E8 (rock), throw direction picker appeared
- [x] Troll: throw south — triggered SPLUT on own Dwarf. Throw path highlighted correctly
- [ ] Troll: pull-back (not reached — requires specific setup)
- [x] Troll: throw blocked direction — N/E/S/W all shown; AI threw from G7 East into invalid diamond = Bug #11
- [x] Dwarf: basic movement (E8→E7)
- [ ] Dwarf: push chain (own Dwarf dead — needs new game)
- [ ] Win condition: kill enemy sorcerer (not reached yet)
- [x] Clicking enemy piece during own turn — correctly ignored, no selection
- [x] UI: turn banner display (Move X of Y works correctly)
- [ ] UI: battle log entries for special actions
- [x] UI: player status panel (Green/Red with AI badge visible)
- [ ] UI: game over overlay

## Bugs & Issues Found

### Bug #9: Battle log does not mention rock levitation
- **Severity:** Minor/UX
- **Steps:** Select Sorcerer, select an eligible rock for levitation, move Sorcerer in a valid levitation direction
- **Expected:** Battle log should show that a rock was levitated (e.g. "Sorcerer D7 → D6 (levitated Rock E9 → E8)")
- **Actual:** Battle log only shows "Green Sorcerer D7 → D6" with no mention of the levitated rock
- **Root cause:** In `gameStore.ts` `movePiece()`, the levitation log entry uses the same description format as a regular move. The `kind` field is set to 'levitate' but the `description` text doesn't include rock movement info.
- **File:** `src/store/gameStore.ts` lines ~406-412

### Bug #10: SPLUT! battle log entry lacks detail
- **Severity:** Minor/UX
- **Steps:** Throw a rock at a Dwarf with an obstacle behind it
- **Expected:** SPLUT! log entry should say which piece was crushed and at what square (e.g. "SPLUT! Green Dwarf crushed at E7")
- **Actual:** Battle log just shows "SPLUT!" in red text with no piece name, team, or square info
- **Root cause:** The SPLUT! log entry in `chooseThrowDirection()` only logs the square from `lastSplutSquare` but the displayed text just says "SPLUT! at {square}" - it doesn't include the crushed piece info. However looking at the zoomed screenshot, it doesn't even show the square - just "SPLUT!"
- **File:** `src/store/gameStore.ts` lines ~560-569

### Bug #11: Rock disappears when thrown off the edge of the board
- **Severity:** Critical — game-breaking, rock permanently lost
- **Steps:**
  1. Red AI Troll moved to G7 (onto rock)
  2. Red AI threw rock East from G7
  3. H7 is NOT a valid square (Manhattan distance 5 > 4)
  4. The rock vanished entirely — only 3 rocks remain on the board instead of 4
- **Expected:** The throw should either be blocked (rock stays at G7 with the Troll) or the direction should be marked as unavailable
- **Actual:** The rock disappears from the game. Accessibility tree confirms G7 only has "Red Troll" with no Rock, and the rock is not on any other square
- **Root cause:** `resolveThrowTrajectory()` in `troll.ts` likely returns an invalid/null landing square when the first step is off-board, and `throwRock()` doesn't handle this gracefully — it may delete the rock from the pieces map without placing it anywhere
- **Files:** `src/engine/troll.ts` — `resolveThrowTrajectory()`, `throwRock()`

### Bug #12: Rock disappears after pull-back + Dwarf push sequence
- **Severity:** Critical — rock permanently lost
- **Steps:**
  1. Troll at E8, Rock at E9
  2. Move Troll south to E7, selecting "Pull Rock" → Rock should move from E9 to E8
  3. Move Dwarf from D8 to E8 (where rock should be) → should push rock east to F8
  4. Rock is gone — F8 is empty. Only 3 rocks remain
- **Expected:** Rock pushed from E8 to F8 by Dwarf
- **Actual:** Rock disappeared entirely. Battle log shows "Green Dwarf D8 → E8" with no push mention — suggesting E8 was treated as empty when the Dwarf moved there
- **Root cause candidates:**
  1. Pull-back didn't properly place the rock at E8 (squareOccupancy not updated)
  2. Pull-back placed the rock but occupancy was overwritten/lost
  3. Dwarf moved to E8 treating it as empty (no push), and the rock piece was orphaned
- **Files:** `src/engine/troll.ts` (pull-back logic), `src/engine/movement.ts` (occupancy handling)

### Observations (not bugs)
- Throw mechanic works correctly - throw south from E8 hit own Dwarf at E7 with Red Troll at E6 as obstacle = SPLUT!
- "Throw!" label in turn banner works correctly (Bug #8 fix verified)
- AI responds intelligently after SPLUT - grabbed the rock at E7 and threw it east
- Dwarf icon in player status panel appears dimmer/greyed after death - good visual feedback

## AI Behavior Observations (post-fix)
- AI Troll now makes real forward progress: D2→D3→E3 (turn 1), E3→E4→E5→E6 (turn 2)
- No more oscillation observed - visited-square fix is working correctly
- AI seized opportunity: moved Troll onto rock left by SPLUT and threw it immediately
