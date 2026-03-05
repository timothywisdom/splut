# Feature File Index

| # | File | Scenarios | Focus |
|---|------|-----------|-------|
| 1 | `01_game_setup.feature` | 18 | Board geometry, Rock placement, 2/3/4-player team placement, validation |
| 2 | `02_turn_management.feature` | 18 | Turn order, move counts (1/2/3), mandatory moves, move distribution, throw interruption, elimination skipping |
| 3 | `03_troll_movement.feature` | 14 | Basic Troll movement, Pull Back ability, direction constraints |
| 4 | `04_troll_throw.feature` | 16 | Mandatory throw, direction choice, trajectory (empty/Obstacle/Target/Dwarf), edge cases |
| 5 | `05_splut_rule.feature` | 9 | SPLUT! mechanic, non-trigger conditions, multiple Dwarves, team impact |
| 6 | `06_dwarf_movement.feature` | 17 | Basic Dwarf movement, Push chains, push-to-edge, piece type interactions, Rock state |
| 7 | `07_sorcerer_movement.feature` | 24 | Basic Sorcerer movement, Levitate mechanic, one-Rock limit, continuity, cooldown, obstacles, cannot-kill |
| 8 | `08_win_condition.feature` | 15 | Team elimination, win detection, self-elimination, multi-player progression, Rock persistence |
| 9 | `09_rock_state_tracking.feature` | 15 | Movement tracking per Rock, cooldown rules, current-vs-previous turn, chain push tracking |
| 10 | `10_general_movement.feature` | 9 | Universal movement constraints, occupied squares, boundary enforcement, move consumption |
| 11 | `11_ai_player.feature` | 65 (64 Scenarios + 1 Outline with 9 rows) | AI seat designation, turn execution, 5-tier decision algorithm, multi-move re-evaluation, AI vs AI, UI/UX, edge cases |
| 12 | `12_ui_bug_fixes.feature` | 11 | Bug 3 (SPLUT kill logic), Bug 4 (battle log overflow), Bug 5 (coord labels), Bug 6 (board rotation) |
| 13 | `13_troll_pull_back_ux.feature` | 7 | Pull-back prompt, confirm/decline, eligible highlighting, edge cases |
| 14 | `14_sorcerer_levitate_ux.feature` | 8 | Rock selection for levitation, move filtering, levitation state within turn |
| 15 | `15_ai_oscillation_fix.feature` | -- | AI Troll oscillation loop prevention |
| 16 | `16_playtest_bug_fixes.feature` | -- | Bugs 8-12 from playtesting |
| 17 | `17_help_rules.feature` | 89 (75 Scenarios + 2 Outlines with 14 example rows) | Help modal entry points, tab navigation, content for all 6 tabs, closing, accessibility, responsive, edge cases |

**Total scenarios: ~290+**
