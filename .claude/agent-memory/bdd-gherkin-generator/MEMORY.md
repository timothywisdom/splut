# SPLUT! BDD Gherkin Generator - Agent Memory

## Project Overview
- SPLUT! is an abstract strategy board game for 2-4 players
- Project root: `/Users/tim.beamish/source/splut/`
- Feature files: `/Users/tim.beamish/source/splut/features/`
- Rulebook PDF: `/Users/tim.beamish/source/splut/SPLUT_Rulebook_ENG_v4.pdf`
- Greenfield project as of 2026-03-03 -- no application code yet

## Domain Terminology
- **Sorcerer**: Mage piece, can Levitate Rocks. Killing it eliminates the whole team.
- **Troll**: Warrior piece, can Pull Back Rocks and must Throw when landing on one.
- **Dwarf**: Small piece, Pushes everything in its path. Rocks fly over Dwarves (unless SPLUT!).
- **Rock**: Neutral piece (4 total). Weapons via Throw/Levitate. Never owned by a team.
- **SPLUT!**: Named mechanic -- Rock crushes a Dwarf when the square after the Dwarf is an Obstacle.
- **Obstacle**: Board border, any Troll, another Rock. Rock stops one square before these.
- **Target**: Any Sorcerer. Rock lands on the Sorcerer's square and kills it.
- **Passthrough**: Dwarves. Rock flies over (unless SPLUT! applies).
- **Pull Back**: Troll drags a Rock from behind onto the vacated square during movement.
- **Levitate**: Sorcerer mirrors a Rock's movement with its own. One Rock per turn, cooldown from previous player's turn.

## Board Geometry
- Diamond-shaped grid, columns A-I, rows 1-9
- Corner (outermost) squares: E9 (top), E1 (bottom), A5 (left), I5 (right)
- Movement is orthogonal only (horizontal/vertical), never diagonal

## Key Business Rules
- Turn 1: 1 move. Turn 2: 2 moves. All subsequent turns: 3 moves. All mandatory.
- Throw immediately ends the entire turn (remaining moves are forfeited).
- Levitation cooldown: cannot levitate a Rock moved (Thrown/Levitated/Pushed/Pulled) during the PREVIOUS player's turn.
- CAN levitate a Rock Pushed/Pulled during YOUR OWN current turn.
- Levitation continuity: once stopped, cannot resume within the same turn.
- Levitated Rocks blocked by Obstacles, Sorcerers, AND Dwarves (unlike thrown Rocks).
- Cannot levitate a Rock onto a Troll (would auto-trigger throw).
- Cannot kill a Sorcerer via levitation.
- Dwarf push moves ALL pieces in the chain; cannot push pieces off the board.
- Push does NOT kill anything; it just repositions.

## Feature File Structure (17 files)
See [feature-files.md](feature-files.md) for the full index.

## Tagging Convention
- `@critical` -- core happy paths and must-pass scenarios
- `@error` -- invalid input / rejection scenarios
- `@edge-case` -- boundary conditions and unusual interactions
- `@setup`, `@turns`, `@troll`, `@throw`, `@splut`, `@dwarf`, `@sorcerer`, `@movement`, `@levitate`, `@win-condition`, `@rock-state`, `@general`, `@ai`, `@ui`, `@help`, `@bug-fix`, `@pull-back` -- feature-level tags

## AI Player Domain
- **AI Tiers**: 5-tier priority hierarchy (Immediate Win > Defensive Escape > Rock Positioning > Approach > Fallback)
- **Tiebreaker**: Alphabetical square key order (e.g., "B6" before "C5")
- **Fallback piece priority**: Troll > Dwarf > Sorcerer
- **Re-evaluation**: AI re-evaluates from Tier 1 after every individual move within a turn
- **Throw-ends-turn**: If AI Troll lands on Rock (even via non-Tier-1 move), mandatory throw applies and turn ends
