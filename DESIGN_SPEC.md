# SPLUT! - Visual Design Specification

**Version:** 1.0
**Status:** Authoritative - All visual implementation must conform to this document.
**Companion:** See `IMPLEMENTATION_PLAN.md` for engine architecture, game rules, and component structure.

---

## Table of Contents

1. [Visual Identity and Art Direction](#1-visual-identity-and-art-direction)
2. [Layout and Grid System](#2-layout-and-grid-system)
3. [Screen-by-Screen UX and Visual Specifications](#3-screen-by-screen-ux-and-visual-specifications)
4. [Component Library Specifications](#4-component-library-specifications)
5. [Feedback and Delight Systems](#5-feedback-and-delight-systems)
6. [Accessibility and Usability Standards](#6-accessibility-and-usability-standards)
7. [Implementation Notes for Developers](#7-implementation-notes-for-developers)

---

## 1. Visual Identity and Art Direction

### 1.1 Art Style

**Dark Fantasy Arcana** -- a rich, atmospheric aesthetic that evokes ancient stone board games played in torchlit halls. The visual language merges hewn-stone tactility with magical luminescence. Surfaces feel carved, worn, and real. Light sources are warm and magical -- runes glow from within, energy arcs shimmer, and spell effects cast colored light onto nearby surfaces.

Key references:
- The stone-and-magic aesthetic of Darkest Dungeon's UI
- The board texture quality of Armello
- The glow and particle language of Hades' ability effects
- The clean readability of Slay the Spire despite its dark palette

**Rationale:** A dark background provides maximum contrast for the four vivid team colors and magical effects. The stone aesthetic grounds the fantasy theme while providing natural texture variation that makes the board feel tactile and premium.

### 1.2 Color Palette

#### Primary Palette

| Name | Hex | Role | Usage |
|------|-----|------|-------|
| Obsidian | `#0D0D12` | Background Primary | Page background, deepest layer |
| Slate Stone | `#1A1A2E` | Background Secondary | Board container, panel backgrounds |
| Carved Stone | `#2A2A3E` | Surface | Board squares (default), card surfaces |
| Worn Stone | `#3A3A52` | Surface Elevated | Hovered squares, raised elements |
| Ash | `#6B6B8A` | Text Muted | Secondary labels, disabled text |
| Bone | `#C8C8D4` | Text Secondary | Body text, descriptions |
| Parchment | `#E8E4DC` | Text Primary | Headings, primary labels, piece labels |
| Pure Light | `#F5F0E8` | Text Emphasis | Active turn banner, winner text |

#### Team Colors

Each team has three tonal variants: a **primary** (piece fill), a **glow** (selection/highlight aura), and a **dim** (eliminated/inactive state).

| Team | Primary | Glow | Dim | CSS Variable |
|------|---------|------|-----|--------------|
| Green (Top) | `#22C55E` | `#4ADE80` | `#166534` | `--team-green` |
| Red (Bottom) | `#EF4444` | `#F87171` | `#991B1B` | `--team-red` |
| Yellow (Left) | `#EAB308` | `#FACC15` | `#854D0E` | `--team-yellow` |
| Blue (Right) | `#3B82F6` | `#60A5FA` | `#1E3A8A` | `--team-blue` |

#### Accent and Semantic Colors

| Name | Hex | Role |
|------|-----|------|
| Rune Gold | `#D4A853` | Decorative accents, rune glow, UI borders |
| Rune Gold Bright | `#F0D078` | Active rune highlights, hover states |
| Magic Purple | `#A855F7` | Levitation effects, sorcerer magic |
| Magic Purple Glow | `#C084FC` | Levitation connection line |
| Throw Orange | `#F97316` | Throw trajectory, throw direction arrows |
| Throw Orange Bright | `#FB923C` | Throw path flash |
| SPLUT Red | `#FF2D55` | SPLUT! impact flash, danger states |
| Rock Granite | `#78716C` | Rock piece base color |
| Rock Granite Light | `#A8A29E` | Rock highlight |
| Valid Move | `#22D3EE` | Valid move target indicator (cyan) |
| Valid Move Dim | `#0E7490` | Valid move subtle ring |

#### Usage Rules

1. **Background layering:** Obsidian > Slate Stone > Carved Stone > Worn Stone. Never skip a level.
2. **Team colors on dark backgrounds only.** Never place team primary colors on light surfaces.
3. **Glow variants** are used exclusively for animated/pulsing states -- never as static fills.
4. **SPLUT Red** is reserved solely for the SPLUT! kill moment and critical errors. No other UI element uses this color.
5. **Rune Gold** is the universal decorative accent. All non-team-colored borders and ornamental lines use Rune Gold or its bright variant.

### 1.3 Typography

**Primary Font:** `"Cinzel"` (Google Fonts) -- a classically-proportioned serif with strong vertical strokes. Used for headings, the game title, and dramatic text (winner announcement, SPLUT! callout).

**Secondary Font:** `"Inter"` (Google Fonts) -- a highly readable geometric sans-serif. Used for all body text, labels, counters, and UI elements.

**Monospace Font:** `"JetBrains Mono"` -- used exclusively for the action log and coordinate labels (A-I, 1-9).

| Style | Font | Weight | Size | Line Height | Letter Spacing | Usage |
|-------|------|--------|------|-------------|----------------|-------|
| Display | Cinzel | 700 | 48px | 1.1 | `0.04em` | Game title "SPLUT!" on lobby |
| H1 | Cinzel | 700 | 32px | 1.2 | `0.03em` | Screen titles, winner name |
| H2 | Cinzel | 600 | 24px | 1.3 | `0.02em` | Section headers, turn banner player name |
| H3 | Cinzel | 600 | 18px | 1.4 | `0.01em` | Panel headers, overlay titles |
| Body | Inter | 400 | 16px | 1.5 | `0` | General text, descriptions |
| Body Small | Inter | 400 | 14px | 1.5 | `0` | Action log entries, tooltips |
| Label | Inter | 600 | 14px | 1.2 | `0.02em` | Button text, form labels, badges |
| Label Small | Inter | 600 | 12px | 1.2 | `0.04em` | Move counter, coordinate labels |
| Caption | Inter | 400 | 12px | 1.4 | `0.01em` | Footnotes, help text |
| Mono | JetBrains Mono | 400 | 13px | 1.6 | `0` | Action log, coordinate overlays |

**Fallback stacks:**
- Cinzel: `"Cinzel", "Palatino Linotype", "Book Antiqua", Palatino, serif`
- Inter: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- JetBrains Mono: `"JetBrains Mono", "Fira Code", "Cascadia Mono", Consolas, monospace`

### 1.4 Iconography

**Style:** Custom SVG icons with a hand-carved, slightly irregular aesthetic. Line weight varies subtly to suggest chisel strokes rather than digital precision.

**Piece Icons (game-critical, highest detail):**

- **Troll:** A broad-shouldered silhouette with hunched posture, thick arms reaching down, a heavy brow ridge. Instantly reads as "big and heavy." Rendered at `32x32px` with `2px` stroke weight. The interior has subtle cross-hatch texture lines suggesting rough skin.
- **Dwarf:** A compact, round-helmeted figure with a shield motif. Shorter and wider proportioned than the Troll. The helmet has a single horizontal visor slit. Rendered at `28x28px` with `1.5px` stroke.
- **Sorcerer:** A tall, narrow silhouette with a pointed hat/hood and a raised hand emanating three small spark lines. The most vertical of the three piece shapes. Rendered at `32x32px` with `1.5px` stroke.
- **Rock:** An irregular octagonal shape (not a circle) with 2-3 crack lines across the face. Suggests weight and rough-hewn stone. Rendered at `28x28px` with `2px` stroke.

**UI Icons:**

- Direction arrows (throw picker): `24x24px`, `2px` stroke, pointed arrowhead with short tail
- Close/dismiss: `20x20px` X mark, `2px` stroke
- Human/AI toggle: simplified person silhouette / circuit-brain icon, `20x20px`
- Move pip (filled): `8x8px` filled circle
- Move pip (empty): `8x8px` hollow circle with `1.5px` stroke

**Icon grid:** All icons conform to a `24px` base grid with `2px` padding (20px live area). Game piece icons use the full grid for maximum visual presence on the board.

### 1.5 Lighting and Shadow

**Light source:** Top-center, warm-toned. Simulated via CSS gradients and subtle box-shadows that place highlights on upper edges and shadows on lower edges.

**Shadow philosophy:** Soft layered shadows suggesting depth carved into stone. Three shadow levels:

| Level | CSS `box-shadow` | Usage |
|-------|-----------------|-------|
| Inset (carved) | `inset 0 2px 4px rgba(0,0,0,0.4)` | Board squares, input fields |
| Elevated | `0 4px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)` | Panels, cards, modals |
| Floating | `0 8px 24px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)` | Overlays, dropdowns, tooltips |

**Depth layering approach:** The board itself feels carved into the surface (inset shadow). Pieces sit on top of the board (no shadow, they are part of the board plane). UI panels float above the board (elevated shadow). Modals and overlays float above everything (floating shadow).

**Glow effects:** Team-colored glows use `box-shadow` with team glow colors at `0.3-0.6` opacity. Example for selected Green piece:

```css
box-shadow: 0 0 12px rgba(74, 222, 128, 0.5), 0 0 24px rgba(74, 222, 128, 0.2);
```

### 1.6 Motion Language

**Principles:**
1. **Purposeful:** Every animation communicates state change. No decorative-only animation.
2. **Snappy for interactions, fluid for game events.** Button clicks are fast (150ms). Piece movements are visible and trackable (300ms). Dramatic events (SPLUT!) are emphatic (600ms+).
3. **Physics-informed:** Pieces have slight overshoot on placement (spring). Rocks feel heavy (slower ease-out). Sorcerer magic floats (gentle sine wave).

**Timing specifications:**

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Button press | `120ms` | `cubic-bezier(0.2, 0, 0.4, 1)` | All button click feedback |
| Hover highlight | `150ms` | `ease-out` | Square hover, button hover |
| Piece select glow | `200ms` | `ease-out` | Selection ring appears |
| Piece move | `300ms` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring settle on destination |
| Push chain slide | `250ms` per piece, `80ms` stagger | `cubic-bezier(0.25, 1, 0.5, 1)` | Sequential domino push |
| Rock throw arc | `400ms` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Fast launch, sudden stop |
| SPLUT! impact | `600ms` total | `ease-out` for flash, `ease-in` for fade | Flash + text + fade |
| Levitation float | `infinite` | `ease-in-out` | Gentle 2px vertical bob |
| Magic connection line | `infinite` | `linear` | Dash animation, 1s loop |
| Turn banner slide | `350ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Banner enters from top |
| Modal entrance | `250ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Scale from 95% + fade |
| Modal exit | `150ms` | `cubic-bezier(0.4, 0, 1, 1)` | Scale to 98% + fade |
| AI thinking pulse | `1500ms` | `ease-in-out`, infinite | Opacity 0.5 to 1.0 loop |
| Game over entrance | `800ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Dramatic scale from 0 |

**What does NOT animate:**
- Board square positions (static grid)
- Coordinate labels
- Action log text appearance (instant append, no stagger)
- Eliminated player status change (instant dim, no transition)

---

## 2. Layout and Grid System

### 2.1 Base Unit and Spacing Scale

**Base unit:** `4px`. All spacing, sizing, and positioning values are multiples of 4px.

**Spacing scale:**

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `4px` | Minimal gap (icon-to-text inline) |
| `space-2` | `8px` | Tight padding (badges, pips) |
| `space-3` | `12px` | Default component padding |
| `space-4` | `16px` | Standard gap between elements |
| `space-5` | `20px` | Section padding |
| `space-6` | `24px` | Panel padding |
| `space-8` | `32px` | Large section gaps |
| `space-10` | `40px` | Major section separation |
| `space-12` | `48px` | Screen-level margins |
| `space-16` | `64px` | Maximum separation |

### 2.2 Screen Layout Grid

The application uses a single-column centered layout with a maximum content width.

**Lobby screen:** Centered card layout, max-width `480px`.

**Game screen:** Full viewport, three-zone horizontal layout.

```
+----------------------------------------------------------------------+
|                         VIEWPORT (100vw x 100vh)                     |
|  +----------+  +------------------------------------+  +----------+  |
|  |          |  |                                    |  |          |  |
|  |  LEFT    |  |          CENTER                    |  |  RIGHT   |  |
|  |  PANEL   |  |          (Game Board)              |  |  PANEL   |  |
|  |  240px   |  |          flex-1                    |  |  280px   |  |
|  |          |  |                                    |  |          |  |
|  +----------+  +------------------------------------+  +----------+  |
+----------------------------------------------------------------------+
```

- **Left Panel:** Player status strips (stacked vertically). Fixed width `240px`.
- **Center Zone:** Game board (scales to fill available space, maintaining square aspect ratio). Contains the turn banner at top.
- **Right Panel:** Action log (scrollable). Fixed width `280px`.

### 2.3 Responsive Breakpoints

| Breakpoint | Width | Layout Adaptation |
|------------|-------|-------------------|
| Desktop XL | `>= 1440px` | Full three-column layout |
| Desktop | `>= 1024px` | Full three-column layout, slightly compressed panels |
| Tablet | `>= 768px` | Two-column: board + collapsed right panel. Left panel moves to horizontal strip above board. |
| Mobile | `< 768px` | Single column: turn info top, board center (fills width), player status as horizontal scroll strip below, action log hidden (accessible via drawer). |

### 2.4 Board Grid Specifications

The game board is a 9x9 CSS grid displayed as standard axis-aligned squares (no rotation). The diamond shape of the valid play area is formed by only rendering the 41 valid squares according to the Manhattan distance rule.

**Cell size calculation:** The board container is a square whose side length equals `min(available_height, available_width) - 48px` (24px padding each side). Each cell is `container_size / 9`.

**Target cell sizes by viewport:**

| Viewport | Container Size | Cell Size | Piece Icon Size |
|----------|---------------|-----------|-----------------|
| 1440px+ | ~560px | ~62px | 42px |
| 1024px | ~480px | ~53px | 36px |
| 768px | ~400px | ~44px | 30px |
| 375px | ~320px | ~35px | 24px |

**Grid layout approach (no rotation):**

```css
.game-board {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  aspect-ratio: 1;
}
```

No rotation is applied. Cardinal directions map intuitively: N = screen up, S = screen down, E = screen right, W = screen left. This makes throw direction selection and board coordinate references clear for players.

**Coordinate labels:** Column labels (A-I) are displayed along the top of the board and row labels (1-9) along the left side. Font: JetBrains Mono 13px, color: Ash. These allow players to reference positions mentioned in the battle log.

**Invalid squares:** The 40 invalid cells in the 9x9 grid (81 total - 41 valid = 40 invalid) are not rendered. Valid squares use explicit `grid-column` and `grid-row` placement.

### 2.5 Safe Zones

- **Board margin from viewport edge:** minimum `24px` on all sides.
- **Piece tap target:** The entire cell area is the tap target (minimum 35px on smallest viewport, exceeds 44px on tablet+). On mobile, the slightly undersized cells are compensated by the fact that only valid move targets are tappable, reducing miss-tap likelihood.
- **Turn banner:** Always fully visible, never occluded by board rotation overflow.

---

## 3. Screen-by-Screen UX and Visual Specifications

### 3.1 Lobby / Setup Screen

**Purpose:** The player configures the game: number of players (2/3/4), seat assignments, Human or AI per seat, then starts the game.

**Mood:** A stone tablet floating in darkness. The SPLUT! title glows with rune-gold energy. The setup feels like preparing a ritual.

#### Layout Diagram

```
+------------------------------------------------------------------+
|                                                                    |
|                        [Decorative Rune Border]                    |
|                                                                    |
|                     S  P  L  U  T  !                               |
|                     (Display font, 48px)                           |
|                     Rune Gold glow effect                          |
|                                                                    |
|               "A Game of Trolls, Dwarves & Sorcerers"              |
|               (Body Small, Bone color, italic)                     |
|                                                                    |
|         +----------------------------------------------+           |
|         |          STONE TABLET CARD (480px)            |           |
|         |                                              |           |
|         |   How many players?                          |           |
|         |   +--------+ +--------+ +--------+           |           |
|         |   |   2    | |   3    | |   4    |           |           |
|         |   +--------+ +--------+ +--------+           |           |
|         |                                              |           |
|         |   [Seat Assignment Section]                  |           |
|         |   (appears after player count selected)      |           |
|         |                                              |           |
|         |   +--TOP (Green)--------[Human|AI]--+        |           |
|         |   |                                 |        |           |
|         |   +--BOTTOM (Red)------[Human|AI]--+         |           |
|         |   |                                 |        |           |
|         |   +--LEFT (Yellow)-----[Human|AI]--+         |           |
|         |   |                                 |        |           |
|         |   +--RIGHT (Blue)------[Human|AI]--+         |           |
|         |                                              |           |
|         |   Who goes first?                            |           |
|         |   [Dropdown: select seat]                    |           |
|         |                                              |           |
|         |   +--------------------------------------+   |           |
|         |   |          BEGIN THE GAME               |  |           |
|         |   +--------------------------------------+   |           |
|         |                                              |           |
|         +----------------------------------------------+           |
|                                                                    |
|              [Ambient particle effect: floating dust motes]        |
|                                                                    |
+------------------------------------------------------------------+
```

#### Visual Treatment

- **Background:** `Obsidian (#0D0D12)` solid fill with a subtle radial gradient from center (`Slate Stone #1A1A2E` at 0%) to `Obsidian` at 60%. This creates a soft spotlight effect.
- **Ambient particles:** 15-20 tiny dots (`Rune Gold` at 10-20% opacity, `2-3px` diameter) drift slowly upward across the screen. CSS animation, `20s` loop, randomized start positions.
- **SPLUT! title:** Cinzel Display 48px, `Rune Gold Bright (#F0D078)` fill. Text-shadow glow: `0 0 20px rgba(212, 168, 83, 0.6), 0 0 40px rgba(212, 168, 83, 0.2)`. Subtle pulse animation on the glow (opacity 0.4 to 0.7, 3s ease-in-out infinite).
- **Stone tablet card:** `Slate Stone (#1A1A2E)` background with a `1px` border of `Rune Gold` at 30% opacity. Corner radius `12px`. Elevated shadow. Interior has a very subtle noise texture overlay (CSS background-image with a tiny repeating SVG pattern at 3% opacity) to suggest stone grain.
- **Decorative rune border:** A thin horizontal line above and below the title area, composed of repeating small diamond shapes in `Rune Gold` at 40% opacity. Pure CSS (border-image or repeating linear-gradient).

#### UI Components on This Screen

**Player Count Selector (3 buttons in a row):**
- Each button: `80px` wide, `48px` tall, `8px` corner radius
- Default: `Carved Stone (#2A2A3E)` fill, `Bone` text, `1px` border `Ash` at 30%
- Hover: `Worn Stone (#3A3A52)` fill, border brightens to `Rune Gold` 50%
- Selected: `Rune Gold` fill at 20% opacity, `Rune Gold Bright` border `2px`, `Parchment` text
- Transition: `150ms ease-out` for all states

**Seat Assignment Rows:**
- Appear with a `250ms` slide-down + fade-in animation, staggered by `80ms` per row
- Each row: full width of card, `48px` height, `Carved Stone` background, `8px` corner radius
- Left side: Team color dot (`12px` circle, team primary color) + seat name + team color name in parentheses
- Right side: Human/AI toggle (see Component Library section 4)
- For 2-player mode: only 2 rows visible (valid opposite pairs selectable)
- For 3-player mode: 4 rows visible, 3 must be toggled on
- For 4-player mode: all 4 rows visible and locked on
- Inactive/unavailable seats: `0.4` opacity, not clickable

**First Player Dropdown:**
- Styled select matching the stone tablet aesthetic
- `Carved Stone` background, `Parchment` text, `Rune Gold` 30% border
- Options list: `Slate Stone` background, `Worn Stone` hover

**Start Button ("BEGIN THE GAME"):**
- Full card width minus `24px` padding each side
- `52px` height, `8px` corner radius
- Default: Gradient from `Rune Gold` to `#B8922E` (slightly darker gold), `Obsidian` text, `700` weight
- Hover: Brighter gradient, glow shadow `0 0 16px rgba(212, 168, 83, 0.4)`
- Pressed: Scale `0.98`, shadow reduces
- Disabled: `Ash` background, `Carved Stone` text, no glow

#### Transitions

- **Entry:** The entire lobby fades in over `400ms` with the title scaling from `0.9` to `1.0`.
- **Exit (to game):** The stone tablet scales down to `0.95` and fades out over `300ms` while the background transitions to the game screen.

#### Validation States

- **2-player invalid seat pair:** The two invalid seats display a red-tinted underline and a small error message: "2-player games require opposite seats (Top/Bottom or Left/Right)" in `SPLUT Red` at Body Small size.
- **No first player selected:** Start button remains disabled. Tooltip on hover: "Select who goes first."

---

### 3.2 Game Screen

**Purpose:** The main gameplay experience. Display the diamond board, all pieces, turn information, player status, and handle all game interactions.

**Mood:** A stone game board lit by magical energy. The board is the central artifact. The surrounding UI fades into darkness, keeping focus on the action.

#### Layout Diagram (Desktop 1440px+)

```
+------------------------------------------------------------------------+
| [TURN BANNER - full width, 56px height]                                |
| "Green's Turn  ***  (move 1 of 3)"                                    |
+--------+---------------------------------------------------+----------+
|        |                                                   |          |
| PLAYER |                                                   | ACTION   |
| STATUS |              GAME BOARD                           | LOG      |
| PANEL  |              (diamond shape)                      | PANEL    |
| 240px  |                                                   | 280px    |
|        |                                                   |          |
| +----+ |           E9                                      | 10:42    |
| |GRN | |         D8  F8                                    | Green    |
| |ACT | |       C7  E7  G7                                  | Troll    |
| +----+ |     B6  D6  F6  H6                                | E5->E6   |
| +----+ |   A5  C5  E5  G5  I5                              |          |
| |RED | |     B4  D4  F4  H4                                | 10:42    |
| |ACT | |       C3  E3  G3                                  | Red      |
| +----+ |         D2  F2                                    | Dwarf    |
| +----+ |           E1                                      | D4->D5   |
| |YEL | |                                                   |          |
| |AI  | |                                                   |          |
| +----+ |                                                   |          |
| +----+ |                                                   |          |
| |BLU | |                                                   |          |
| |ACT | |                                                   |          |
| +----+ |                                                   |          |
|        |                                                   |          |
+--------+---------------------------------------------------+----------+
```

#### Visual Treatment

- **Background:** `Obsidian (#0D0D12)` with a very subtle radial gradient centered on the board position. Gradient: `Slate Stone` at center, `Obsidian` at 70% radius.
- **Board container:** The board sits within an invisible square container. The container has a faint circular decorative border -- a thin ring of `Rune Gold` at 10% opacity with runic tick marks at the cardinal and ordinal points. This suggests an arcane summoning circle containing the game.
- **Board squares (valid, default):** `Carved Stone (#2A2A3E)` fill with `inset 0 1px 2px rgba(0,0,0,0.3)` shadow. `1px` gap between squares (the gap shows the darker background through). Corner radius `2px` (subtle rounding, mostly square).
- **Board squares (valid, hovered):** `Worn Stone (#3A3A52)` fill, border transitions to `Rune Gold` at 20% opacity.
- **Board edge decoration:** The outermost valid squares on each edge have a subtle `1px` outer border in `Rune Gold` at 15% opacity, defining the diamond silhouette.

#### Board Square States

| State | Background | Border | Additional |
|-------|-----------|--------|------------|
| Default | `#2A2A3E` | none | Inset shadow |
| Hovered (empty, own turn) | `#3A3A52` | `1px Rune Gold 20%` | Cursor pointer |
| Hovered (has own piece) | `#3A3A52` | `1px [team glow color] 40%` | Cursor pointer |
| Selected (has clicked piece) | `#2A2A3E` | `2px [team glow color] 80%` | Glow shadow in team color |
| Valid move target | `#2A2A3E` | `2px Valid Move (#22D3EE) 60%` | Pulsing cyan dot in center (8px, 0.7 opacity) |
| Throw path (animating) | `#2A2A3E` | none | Orange flash fill sweeping through |
| SPLUT! square | `#2A2A3E` | `2px SPLUT Red` | Red flash overlay, fading |
| Levitation eligible rock | `#2A2A3E` | `2px Magic Purple 60%` | Purple glow ring |
| Disabled (not your turn) | `#2A2A3E` | none | No hover effects, cursor default |

#### Piece Rendering on the Board

Pieces are rendered as SVG elements centered within their board square. They float above the square surface visually (no shadow -- they are part of the board plane) but are clearly distinct from the square.

**Piece sizing:** 65% of cell width for the SVG viewBox. This leaves comfortable padding within the cell for the selection ring.

**Piece visual construction:**

- **Fill:** Team primary color at full opacity
- **Stroke:** `1.5px` in a darker variant of the team color (primary color at 70% brightness)
- **Interior detail lines:** `0.75px` in the same stroke color at 50% opacity

**Piece states:**

| State | Visual Treatment |
|-------|-----------------|
| Default (own piece, your turn) | Full opacity. Subtle warm highlight on top edge (lighter variant). |
| Default (opponent piece) | Full opacity. No highlight. |
| Hovered (own piece, your turn) | Scale `1.08` (150ms ease-out). Glow shadow in team glow color. |
| Selected | Scale `1.05` static. Strong glow shadow. Gentle pulse on glow (opacity 0.5-0.8, 1.5s). |
| Moving (animating) | Translate from source to destination. Scale peaks at `1.1` mid-animation, settles to `1.0`. |
| Eliminated team piece | Not rendered (pieces removed from board). |

**Rock rendering:**
- Rocks are neutral -- `Rock Granite (#78716C)` fill with a slightly lighter edge highlight
- Interior: 2-3 short crack lines in `#5C5652` at 60% opacity
- When a Rock is eligible for levitation, a `Magic Purple` ring pulses around it
- When a Rock is being levitated, it gains a `2px` upward offset and a purple underglow shadow

**Troll on same square as Rock (after throw where Rock does not move):**
- The Troll icon is rendered at 70% scale, shifted slightly up-left within the cell
- The Rock icon is rendered at 60% scale, shifted slightly down-right
- Both are visible simultaneously

#### Turn Banner

**Position:** Top of the center zone, full width of the board area, `56px` height.

**Layout:**

```
+------------------------------------------------------------------------+
|  [Team Color Dot 12px]  Green's Turn    ***    Move 1 of 3             |
+------------------------------------------------------------------------+
   (team dot)              (H2, Parchment)  (pips)  (Label Small, Ash)
```

- Background: `Slate Stone (#1A1A2E)` with a bottom border of the current team's primary color (`2px`).
- The team color dot is a filled circle in the team's primary color.
- Move pips (`***` in the diagram) are three small circles (`8px`): filled circles for moves used (team primary), hollow circles for moves remaining (team primary at 30%), no circle for moves not allowed.
- **Entry animation:** Slides down from `-56px` to `0` over `350ms` with team-colored border fading in.
- **Turn change:** Banner content cross-fades (`200ms`) as it slides slightly (`8px` upward then back down).
- **AI turn:** Text changes to "[Team] (AI) is thinking..." with the AI thinking pulse animation on the text. The three move pips animate sequentially (fill, unfill, fill) to suggest processing.

#### Player Status Panel (Left)

**Position:** Left column, `240px` wide, vertically centered in available space.

Four stacked player status cards, `56px` height each, `8px` gap between them.

**Player Status Card layout:**

```
+------------------------------------+
| [Color Bar 4px] [Icon] GREEN       |
|                  Troll Dwarf Sorc   |
|                  [AI badge]         |
+------------------------------------+
```

- Left edge: `4px` wide vertical bar in team primary color (full height of card)
- Team icon area: Shows miniature versions of the team's alive pieces as tiny icons (`16px`)
- Team name: H3 style, team primary color text
- AI badge: If AI-controlled, a small pill badge reading "AI" in `Label Small`, `Magic Purple` background, `Pure Light` text
- Background: `Slate Stone (#1A1A2E)`, `8px` corner radius, `1px` border `Carved Stone`

**States:**
- Active: Full opacity, team color bar glows subtly when it is that team's turn
- Eliminated: `0.35` opacity, team color bar switches to `Ash`, a diagonal line (single strike-through) appears over the card. Text appends "(eliminated)" in `Ash`.
- Current turn: The card's border changes to team primary color at 50% opacity. A subtle left-to-right shimmer animation plays on the color bar (`3s` linear infinite).

#### Action Log Panel (Right)

**Position:** Right column, `280px` wide, fills available height within the viewport. The game page uses `h-screen overflow-hidden` to prevent the log from growing the page and pushing the board down.

**Header:** "Battle Log" in H3 Cinzel, `Rune Gold` color. Below the header, a `1px` horizontal line in `Rune Gold` at 20%.

**Log entries:** Contained in a fixed-height scrollable area (`flex-1 min-h-0 overflow-y-auto`). Newest at the bottom, auto-scrolls to bottom on new entry. The log must never cause the overall page to scroll or the board to shift vertically.

Each log entry:

```
+-------------------------------------+
| 10:42  Green Troll  E5 -> E6        |
+-------------------------------------+
```

- Timestamp: `Mono` font, `Ash` color
- Player + piece: `Label Small` font, team primary color for player name, `Bone` for piece type
- Move notation: `Mono` font, `Bone` color
- Special events highlighted: "SPLUT!" in `SPLUT Red`, "Throw N" in `Throw Orange`, "Levitate" in `Magic Purple`
- Entry background: transparent by default. Alternating entries have `Carved Stone` at 30% opacity for readability.
- New entry animation: Slides in from right over `200ms`, `0.6` to `1.0` opacity fade.

---

### 3.3 Throw Direction Picker Overlay

**Purpose:** After a Troll lands on a Rock, the player must choose a throw direction (N/S/E/W).

**Mood:** Urgent, focused. A moment of power where the player aims their throw.

#### Layout Diagram

```
                      [N arrow]
                         ^
                         |
            [W arrow] <--+---> [E arrow]
                         |
                         v
                      [S arrow]

         (Centered on the Troll's square)
         (Semi-transparent dark overlay behind)
```

**This is rendered as an overlay on the board, not a modal.** The four directional arrows are positioned cardinally around the Troll's current square.

#### Visual Treatment

- **Backdrop:** The entire board dims to `40%` opacity (a dark overlay at `rgba(13, 13, 18, 0.6)` covers the board).
- **The Troll's square:** Remains at full brightness, glowing with `Throw Orange` border.
- **Direction arrows:** `48px` diameter circular buttons positioned `60px` from the center of the Troll's square (accounting for the 45-degree rotation of the board).
  - Available direction: `Throw Orange (#F97316)` fill, `Obsidian` arrow icon, elevated shadow. Hover: scale `1.1`, brighter glow.
  - Blocked direction: `Carved Stone (#2A2A3E)` fill, `Ash` arrow icon at 30% opacity, no shadow. Not clickable. Cursor `not-allowed`.
- **Entry animation:** Arrows scale from `0` to `1` with a `200ms` spring animation, staggered by `50ms` (N first, then E, S, W clockwise).
- **Selection animation:** Clicked arrow scales to `1.2` then fades as the throw animation begins. Other arrows scale to `0` and fade simultaneously.

**Direction layout (standard compass):** Since the board is not rotated, directions map naturally to screen positions: N = top, E = right, S = bottom, W = left. Direction arrows are positioned at standard compass points around the Troll's square. The arrows show letter labels (N, E, S, W) inside them for clarity.

---

### 3.4 Troll Pull-Back Confirmation

**Purpose:** When a Troll moves and there is an eligible Rock directly behind it (relative to the movement direction), the player is prompted to pull the Rock into the Troll's vacated square.

#### Interaction Flow

1. Player selects Troll and clicks a valid move target.
2. If a Rock exists directly behind the Troll (opposite to the movement direction), a confirmation overlay appears.
3. The overlay presents two buttons: "Pull Rock" (primary, Throw Orange) and "Move Only" (secondary, Carved Stone).
4. If the player chooses "Pull Rock", the Troll moves and the Rock follows into the vacated square.
5. If the player chooses "Move Only", the Troll moves without pulling.
6. If no Rock is eligible, the Troll moves immediately with no prompt.

#### Visual Treatment

- **Overlay backdrop:** Board dims to 60% (`bg-obsidian/60`).
- **Prompt card:** `bg-slate-stone`, `border-rune-gold/40`, rounded corners, centered over the board. Shows which Rock can be pulled and where it will land.
- **Pull Rock button:** `bg-throw-orange`, `text-obsidian`, auto-focused for keyboard access.
- **Move Only button:** `bg-carved-stone`, `text-bone`.
- **Note:** When the Troll lands on a Rock (triggering a throw), no pull-back prompt appears -- the throw direction picker is shown instead.

---

### 3.5 Sorcerer Levitation State

**Purpose:** When a Sorcerer is selected and eligible Rocks exist, the player can optionally choose a Rock to levitate alongside the Sorcerer's movement.

#### Interaction Flow

1. Player selects a Sorcerer. All eligible rocks (not on cooldown, not interrupted) are highlighted with `levitate-eligible` style.
2. Player clicks an eligible rock to select it for levitation. The valid move targets update to only show directions where both the Sorcerer AND the Rock can move.
3. Player clicks the selected rock again to deselect it, restoring all original valid move targets.
4. Player clicks a valid move target. The Sorcerer and Rock move simultaneously in that direction.
5. If levitation was interrupted (another piece moved mid-turn), no rocks are shown as eligible.

#### Visual Treatment

- **Eligible Rocks:** Highlighted with a `Magic Purple (#A855F7)` border (`2px solid rgba(168, 85, 247, 0.6)`) and subtle glow (`0 0 12px rgba(168, 85, 247, 0.3)`). Rocks are clickable and focusable.
- **Selected Rock (chosen for levitation):** The ring becomes solid `Magic Purple` `2px` border. A **dashed line** connects the Sorcerer to the Rock. The line is `Magic Purple Glow (#C084FC)` with a `2px` stroke, `6px` dash / `4px` gap pattern, animated to flow from Sorcerer to Rock (`1s` linear infinite, `stroke-dashoffset` animation).
- **During movement:** Both the Sorcerer and the Rock animate simultaneously. The Rock has a subtle upward float effect (`translateY(-2px)` with a gentle `0.8s` ease-in-out bob) and a purple underglow (`0 4px 12px rgba(168, 85, 247, 0.3)`).
- **Levitation indicator on Rock:** While being levitated, the Rock gains a small rotating rune circle around it -- four tiny diamond shapes orbiting at `12px` radius, `3s` rotation, `Magic Purple` at 40% opacity.

---

### 3.5 AI Thinking State

**Purpose:** Indicate to the human player that an AI-controlled team is currently executing its turn. Human interaction is blocked.

#### Visual Treatment

- **Turn banner:** Shows "[Team Name] (AI) is thinking..." in the team's color. Text pulses with `AI thinking pulse` animation (`1500ms` ease-in-out, opacity `0.5` to `1.0`).
- **Board interaction:** All board squares have `pointer-events: none`. Cursor changes to `default` over the board area. A very subtle dark veil (`rgba(13, 13, 18, 0.15)`) overlays the board to visually indicate non-interactivity.
- **AI piece movements:** AI pieces move with the same animations as human-controlled pieces, but with a `500ms` delay between moves (configurable via `aiConfig.moveDelayMs`). This allows the human player to follow the AI's strategy.
- **AI move indicator:** Before each AI move executes, the moving piece briefly flashes its team glow color (`200ms`) to draw attention.

---

### 3.6 SPLUT! Kill Moment

**Purpose:** The most dramatic moment in the game -- a Dwarf is crushed between a thrown Rock and an immovable obstacle. This must feel impactful, surprising, and satisfying.

**This is the signature visual moment of the entire game.**

#### Animation Sequence (600ms total)

1. **Frame 0-100ms (Rock arrives):** The Rock completes its throw trajectory animation and stops abruptly on the Dwarf's square. A subtle camera shake effect (CSS transform `translate` jitter, +/-2px, 3 oscillations).
2. **Frame 100-200ms (Impact flash):** The Dwarf's square flashes `SPLUT Red (#FF2D55)` at full opacity. A radial burst of 8-12 small particle dots (team color of the killed Dwarf, `4px` each) explode outward from the square center, traveling `40px` over `300ms` before fading.
3. **Frame 200-500ms (SPLUT! text):** The text "SPLUT!" appears centered on the square in Cinzel Bold, `28px`, `Pure Light (#F5F0E8)` with a heavy `SPLUT Red` text-shadow (`0 0 8px, 0 0 16px, 0 0 32px`). The text scales from `0.5` to `1.1` (overshoot) then settles to `1.0`. Slight rotation from `-5deg` to `0deg` for dynamism.
4. **Frame 500-600ms (Fade):** The SPLUT! text and red flash fade out. The Dwarf piece fades and scales down to `0` (disappears). The Rock settles into its final position.

#### Post-SPLUT! State

- The square returns to default appearance.
- The killed Dwarf is removed from the board.
- The action log receives a highlighted "SPLUT!" entry in `SPLUT Red`.
- If this kills a Sorcerer's team (the Sorcerer was already dead or this triggers an elimination chain), the elimination sequence follows.

---

### 3.7 Game Over Overlay

**Purpose:** Announce the winner with ceremony and provide a path back to the lobby.

#### Layout Diagram

```
+------------------------------------------------------------------+
|                                                                    |
|  [Dark overlay: rgba(13, 13, 18, 0.85)]                          |
|                                                                    |
|         +--------------------------------------+                   |
|         |                                      |                   |
|         |          VICTORY                      |                  |
|         |    (H1, Cinzel, Rune Gold Bright)     |                  |
|         |                                      |                   |
|         |    [Winner team icon, 64px, colored]  |                  |
|         |                                      |                   |
|         |    Green Team Wins!                   |                  |
|         |    (H2, Cinzel, team primary color)   |                  |
|         |                                      |                   |
|         |    "The last Sorcerer standing."      |                  |
|         |    (Body, Bone, italic)               |                  |
|         |                                      |                   |
|         |    +----------------------------+     |                  |
|         |    |      PLAY AGAIN            |     |                  |
|         |    +----------------------------+     |                  |
|         |                                      |                   |
|         |    [Return to Lobby]                  |                  |
|         |    (text link, Ash, underline)        |                  |
|         |                                      |                   |
|         +--------------------------------------+                   |
|                                                                    |
+------------------------------------------------------------------+
```

#### Visual Treatment

- **Backdrop:** Full-screen dark overlay at `85%` opacity, fading in over `400ms`.
- **Victory card:** `Slate Stone` background, `Rune Gold` `1px` border, `16px` corner radius, floating shadow. Max-width `400px`, centered.
- **Entry animation (800ms total):**
  - Card scales from `0` to `1.05` (overshoot) then settles to `1.0` with `cubic-bezier(0.16, 1, 0.3, 1)`.
  - "VICTORY" text fades in at `200ms` delay.
  - Winner team name and icon fade in at `400ms` delay.
  - Buttons fade in at `600ms` delay.
- **Winner team icon:** The Sorcerer silhouette of the winning team, rendered at `64px` in team primary color with a strong glow effect. Gentle float animation (bob `4px` up and down, `2s` ease-in-out infinite).
- **Particle celebration:** 20-30 small diamond-shaped particles in the winning team's color drift upward from behind the card, `4-8px` size, random horizontal drift, `3-5s` lifespan each, continuously spawning for as long as the overlay is visible.

**Play Again button:** Same style as lobby start button (Rune Gold gradient). Returns to lobby.

**Return to Lobby link:** Text-only link below the button, `Ash` color, underline on hover.

---

### 3.8 Empty States and Edge Cases

**Board with no valid moves for current player:**
- Turn banner shows "[Team] has no valid moves -- turn passes" in `Ash` color for `2s`, then auto-advances.
- The player status card for that team briefly flashes its border in `Ash`.

**3-player game with one eliminated:**
- The eliminated team's pieces are removed. Their player status card dims to `0.35` opacity with strike-through.
- The empty seats on the diamond where that team started show no special treatment (squares remain normal).

**All-AI game (spectator mode):**
- The turn banner shows "Spectating -- [Team] (AI) is playing..." with the AI pulse animation.
- The board is fully non-interactive (no hover effects on squares).
- The action log continues to populate, providing commentary.

**Very long action log (100+ entries):**
- The log panel has `overflow-y: auto` with a custom scrollbar (thin, `4px` wide, `Worn Stone` thumb, `Slate Stone` track).
- A small fade gradient at the top of the log area (`16px` tall, `Slate Stone` to transparent) indicates scrollable content above.

---

## 4. Component Library Specifications

### 4.1 Buttons

#### Primary Button (e.g., "BEGIN THE GAME", "PLAY AGAIN")

| Property | Value |
|----------|-------|
| Height | `52px` |
| Padding | `0 24px` |
| Corner radius | `8px` |
| Font | `Label (Inter 600 14px)`, letter-spacing `0.04em`, uppercase |
| Background (default) | Linear gradient `135deg, #D4A853, #B8922E` |
| Text color | `#0D0D12` (Obsidian) |
| Border | `1px solid rgba(240, 208, 120, 0.3)` |
| Shadow | `0 2px 8px rgba(0, 0, 0, 0.3)` |
| Background (hover) | Linear gradient `135deg, #F0D078, #D4A853` |
| Shadow (hover) | `0 4px 16px rgba(212, 168, 83, 0.3)` |
| Background (pressed) | Linear gradient `135deg, #B8922E, #9A7A24` |
| Transform (pressed) | `scale(0.98)` |
| Shadow (pressed) | `0 1px 4px rgba(0, 0, 0, 0.3)` |
| Background (disabled) | `#6B6B8A` (Ash) |
| Text (disabled) | `#3A3A52` (Carved Stone) |
| Transition | `150ms all ease-out` |

#### Secondary Button (e.g., player count selection)

| Property | Value |
|----------|-------|
| Height | `48px` |
| Padding | `0 20px` |
| Corner radius | `8px` |
| Font | `Label (Inter 600 14px)` |
| Background (default) | `#2A2A3E` (Carved Stone) |
| Text color | `#C8C8D4` (Bone) |
| Border | `1px solid rgba(107, 107, 138, 0.3)` |
| Background (hover) | `#3A3A52` (Worn Stone) |
| Border (hover) | `1px solid rgba(212, 168, 83, 0.4)` |
| Background (selected) | `rgba(212, 168, 83, 0.15)` |
| Border (selected) | `2px solid #F0D078` |
| Text (selected) | `#E8E4DC` (Parchment) |

#### Ghost Button (e.g., "Return to Lobby")

| Property | Value |
|----------|-------|
| Height | `40px` |
| Padding | `0 16px` |
| Corner radius | `6px` |
| Background | `transparent` |
| Text color | `#6B6B8A` (Ash) |
| Border | none |
| Text decoration | Underline on hover |
| Text color (hover) | `#C8C8D4` (Bone) |

#### Direction Arrow Button (Throw Picker)

| Property | Value |
|----------|-------|
| Size | `48px x 48px` (circle) |
| Corner radius | `50%` (full circle) |
| Background (available) | `#F97316` (Throw Orange) |
| Icon color (available) | `#0D0D12` (Obsidian) |
| Shadow (available) | `0 2px 8px rgba(249, 115, 22, 0.3)` |
| Background (hover) | `#FB923C` (Throw Orange Bright) |
| Transform (hover) | `scale(1.1)` |
| Shadow (hover) | `0 4px 16px rgba(249, 115, 22, 0.4)` |
| Background (blocked) | `#2A2A3E` (Carved Stone) |
| Icon color (blocked) | `rgba(107, 107, 138, 0.3)` |
| Cursor (blocked) | `not-allowed` |

### 4.2 Toggle (Human/AI)

A pill-shaped toggle switch.

| Property | Value |
|----------|-------|
| Track size | `56px x 28px` |
| Track radius | `14px` (full pill) |
| Thumb size | `24px x 24px` |
| Thumb radius | `12px` |
| Track (Human state) | `#2A2A3E` (Carved Stone) |
| Track (AI state) | `rgba(168, 85, 247, 0.25)` (Magic Purple 25%) |
| Track border | `1px solid rgba(107, 107, 138, 0.3)` |
| Thumb (Human) | `#C8C8D4` (Bone) with person icon |
| Thumb (AI) | `#A855F7` (Magic Purple) with circuit-brain icon |
| Thumb shadow | `0 1px 3px rgba(0, 0, 0, 0.3)` |
| Transition | `200ms cubic-bezier(0.34, 1.56, 0.64, 1)` (spring) |
| Labels | "Human" / "AI" text flanking the toggle, `Caption` style, currently-active label in `Parchment`, inactive in `Ash` |

### 4.3 Move Counter Pips

| Property | Value |
|----------|-------|
| Pip size | `8px` diameter circle |
| Gap between pips | `6px` |
| Filled (move used) | Team primary color, full opacity |
| Empty (move available) | Team primary color at `0.3` opacity, `1.5px` stroke |
| Not applicable (move not granted) | Not rendered |
| Container padding | `4px` vertical, `8px` horizontal |
| Fill animation | `200ms` scale from `0.5` to `1.0` with color fill |

### 4.4 Player Status Card

| Property | Value |
|----------|-------|
| Width | `100%` of panel (240px) |
| Height | `56px` |
| Corner radius | `8px` |
| Background | `#1A1A2E` (Slate Stone) |
| Border | `1px solid #2A2A3E` |
| Left color bar | `4px` wide, team primary color, full height, left edge |
| Padding | `0` left (color bar), `12px` top/right/bottom |
| Team name font | `H3 (Cinzel 600 18px)`, team primary color |
| Piece mini-icons | `16px` each, team primary color, `4px` gap |
| Dead piece mini-icon | `0.25` opacity, strikethrough line over it |
| AI badge | Pill shape `36px x 18px`, `Magic Purple` bg, `Pure Light` text, `Label Small` |
| Active turn border | `1px solid [team primary] at 50%` |
| Eliminated opacity | `0.35` |
| Eliminated color bar | `#6B6B8A` (Ash) |

### 4.5 Action Log Entry

| Property | Value |
|----------|-------|
| Height | Auto (min `32px`) |
| Padding | `6px 12px` |
| Background (odd) | `transparent` |
| Background (even) | `rgba(42, 42, 62, 0.3)` |
| Timestamp font | `Mono (JetBrains Mono 400 13px)`, `Ash` color |
| Player name font | `Label Small (Inter 600 12px)`, team primary color |
| Piece type font | `Body Small (Inter 400 14px)`, `Bone` color |
| Move notation font | `Mono (JetBrains Mono 400 13px)`, `Bone` color |
| Special: "SPLUT!" | `Cinzel 700 14px`, `SPLUT Red (#FF2D55)` |
| Special: "Throw [dir]" | `Label Small`, `Throw Orange (#F97316)` |
| Special: "Levitate" | `Label Small`, `Magic Purple (#A855F7)` |
| Special: "[Team] eliminated" | `Label Small`, team dim color, italic |
| Entry animation | `translateX(8px)` to `translateX(0)`, opacity `0.6` to `1.0`, `200ms` ease-out |

### 4.6 Tooltip

| Property | Value |
|----------|-------|
| Background | `#1A1A2E` (Slate Stone) |
| Border | `1px solid rgba(212, 168, 83, 0.2)` |
| Corner radius | `6px` |
| Padding | `6px 10px` |
| Font | `Caption (Inter 400 12px)`, `Bone` color |
| Shadow | Floating level |
| Max width | `200px` |
| Arrow | `6px` CSS triangle, same background color |
| Entry | `100ms` fade-in, `8px` translate from source direction |
| Delay before show | `400ms` |

### 4.7 Modal / Overlay Container

Used as the base for `GameOverOverlay` and potentially future dialogs.

| Property | Value |
|----------|-------|
| Backdrop | `rgba(13, 13, 18, 0.85)`, `400ms` fade-in |
| Card background | `#1A1A2E` (Slate Stone) |
| Card border | `1px solid rgba(212, 168, 83, 0.25)` |
| Card corner radius | `16px` |
| Card padding | `32px` |
| Card max-width | `400px` |
| Card shadow | Floating level |
| Entry animation | Scale `0.95` to `1.0`, opacity `0` to `1`, `250ms` spring |
| Exit animation | Scale `1.0` to `0.98`, opacity `1` to `0`, `150ms` ease-in |

### 4.8 Custom Scrollbar (Action Log)

| Property | Value |
|----------|-------|
| Width | `4px` |
| Track | `#1A1A2E` (Slate Stone) |
| Thumb | `#3A3A52` (Worn Stone) |
| Thumb radius | `2px` |
| Thumb hover | `#6B6B8A` (Ash) |

### 4.9 AI Thinking Indicator

| Property | Value |
|----------|-------|
| Layout | Inline with turn banner text |
| Animation | Three dots (` . . . `) with sequential fade, `1.5s` loop |
| Dot size | `4px` diameter |
| Dot color | Current team primary color |
| Dot spacing | `6px` |
| Dot animation | Each dot fades from `0.3` to `1.0` opacity with `500ms` stagger |

### 4.10 Coordinate Labels (Board Edge)

| Property | Value |
|----------|-------|
| Font | `Mono (JetBrains Mono 400 13px)` |
| Color | `Ash (#6B6B8A)` |
| Position | Outside the board grid, aligned to column/row edges |
| Column labels (A-I) | Along the top of the board, centered above each column |
| Row labels (9-1) | Along the left side of the board, centered beside each row (9 at top, 1 at bottom) |

No counter-rotation is needed since the board is not rotated.

---

## 5. Feedback and Delight Systems

### 5.1 Action Feedback Matrix

| User Action | Visual Feedback | Timing |
|-------------|----------------|--------|
| Hover over own piece | Piece scales to `1.08`, faint team glow | `150ms` ease-out |
| Click own piece (select) | Selection ring + valid targets illuminate | `200ms` ease-out |
| Click valid target (move) | Piece translates to target with spring settle | `300ms` spring |
| Dwarf pushes chain | Sequential domino slide, each piece `250ms`, `80ms` stagger | Total varies |
| Troll lands on Rock | Board dims, direction arrows spring in | `200ms` staggered |
| Choose throw direction | Arrow pops, rock launches along trajectory | `400ms` fast-ease |
| Rock hits obstacle (no SPLUT) | Rock stops with subtle bounce-back `2px` | `100ms` ease-out |
| SPLUT! (Dwarf crushed) | Full SPLUT! sequence (see 3.6) | `600ms` total |
| Sorcerer killed by Rock | Sorcerer fades with purple dissolve particles | `400ms` |
| Team eliminated | All team pieces fade simultaneously, status card dims | `500ms` |
| Game won | Board freezes, overlay entrance, celebration particles | `800ms` |
| Turn change | Banner cross-fade with subtle slide | `350ms` |
| Invalid action (click wrong piece) | Square flashes `SPLUT Red` at 20% for `200ms` | `200ms` |
| No valid moves available | Brief pulse of `Ash` color on banner, auto-advance | `2000ms` display |

### 5.2 Particle Systems

**Ambient lobby particles (dust motes):**
- Count: 15-20
- Size: `2-3px` circles
- Color: `Rune Gold` at `10-20%` opacity
- Movement: Drift upward at `0.5-1px/s`, slight horizontal sine wave
- Lifespan: `15-25s`, fade in/out at edges
- Implementation: CSS `@keyframes` with randomized animation-delay and animation-duration per particle

**SPLUT! impact particles:**
- Count: 8-12
- Size: `3-5px` circles
- Color: Killed Dwarf's team primary color
- Movement: Radial burst from impact point, `40px` travel, slight gravity curve downward
- Lifespan: `300ms`, fade out in last `100ms`
- Implementation: CSS `@keyframes` with `transform: translate()` and `opacity`. Each particle has a unique angle set via CSS custom properties.

**Game Over celebration particles:**
- Count: 20-30
- Size: `4-8px` diamond shapes (rotated squares)
- Color: Winner's team primary color, some in `Rune Gold`
- Movement: Rise from bottom of overlay, slight horizontal drift, gentle deceleration
- Lifespan: `3-5s`, continuous spawn while overlay visible
- Implementation: CSS `@keyframes`. Spawn loop via a repeating set of `animation-delay` values on pre-rendered particle elements.

### 5.3 Screen Shake (SPLUT! Only)

Applied to the board container during the SPLUT! impact.

```css
@keyframes screen-shake {
  0%   { transform: rotate(45deg) translate(0, 0); }
  15%  { transform: rotate(45deg) translate(-2px, 1px); }
  30%  { transform: rotate(45deg) translate(2px, -1px); }
  45%  { transform: rotate(45deg) translate(-1px, 2px); }
  60%  { transform: rotate(45deg) translate(1px, -1px); }
  75%  { transform: rotate(45deg) translate(-1px, 0px); }
  100% { transform: rotate(45deg) translate(0, 0); }
}
```

Duration: `300ms`. Applied only to the `.game-board` element. The `rotate(45deg)` is included because the board is already rotated and the shake must compound with it.

### 5.4 Sound Design Direction

While sound implementation is deferred, the following sonic aesthetic should guide future work:

- **Piece select:** Short, muted stone-tap. Like a chess piece being lifted from a stone board.
- **Piece place:** A slightly heavier stone-tap with a brief resonance.
- **Dwarf push chain:** A sliding-stone scrape, pitch rising slightly with each pushed piece.
- **Rock throw:** A deep, whooshing sound with increasing pitch as it travels.
- **SPLUT! impact:** A sharp, percussive CRACK -- like stone breaking -- followed by a brief, deep rumble.
- **Sorcerer kill:** A crystalline shattering sound with a magical shimmer decay.
- **Levitation start:** A low, ascending hum with ethereal overtones.
- **Turn change:** A soft chime, pitch matching the incoming team's "personality."
- **Victory:** A rising orchestral brass swell with a triumphant final chord.
- **UI click:** A subtle, warm click. No aggressive clacking.

### 5.5 Moments of Delight

1. **First launch title animation:** On the lobby screen, the letters of "SPLUT!" assemble from scattered positions, each letter arriving with a tiny stone-dust burst. Only plays once per session.
2. **Rock throw trajectory trail:** As the Rock travels, it leaves a brief orange afterimage trail (fading copies at `0.3` opacity) that dissipates over `200ms`. The trail makes the throw path visible and dramatic.
3. **Near-miss vibration:** When a thrown Rock passes over a Dwarf (flies over without SPLUT), the Dwarf piece jitters slightly (`1px` random offset, `100ms`), suggesting it felt the wind of the passing Rock.
4. **Last Sorcerer standing glow:** When only two Sorcerers remain on the board, both gain a permanent subtle glow effect in their team color, heightening the tension.
5. **Troll's stomp:** When a Troll moves, its arrival on the destination square causes a tiny `1px` downward bounce on adjacent pieces (if any), suggesting the ground shook.

---

## 6. Accessibility and Usability Standards

### 6.1 Color Contrast Compliance

All text-on-background combinations meet **WCAG AA** minimum (4.5:1 for normal text, 3:1 for large text):

| Foreground | Background | Ratio | Pass |
|-----------|-----------|-------|------|
| Parchment `#E8E4DC` on Obsidian `#0D0D12` | | 14.2:1 | AA/AAA |
| Parchment `#E8E4DC` on Slate Stone `#1A1A2E` | | 10.1:1 | AA/AAA |
| Bone `#C8C8D4` on Obsidian `#0D0D12` | | 10.8:1 | AA/AAA |
| Bone `#C8C8D4` on Slate Stone `#1A1A2E` | | 7.7:1 | AA/AAA |
| Bone `#C8C8D4` on Carved Stone `#2A2A3E` | | 5.3:1 | AA |
| Ash `#6B6B8A` on Obsidian `#0D0D12` | | 4.6:1 | AA |
| Rune Gold `#D4A853` on Obsidian `#0D0D12` | | 7.4:1 | AA/AAA |
| Green `#22C55E` on Carved Stone `#2A2A3E` | | 5.8:1 | AA |
| Red `#EF4444` on Carved Stone `#2A2A3E` | | 4.5:1 | AA |
| Yellow `#EAB308` on Carved Stone `#2A2A3E` | | 7.6:1 | AA/AAA |
| Blue `#3B82F6` on Carved Stone `#2A2A3E` | | 4.6:1 | AA |

**Note:** Team colors are used primarily as fills on pieces (large areas) and as labels (large text context), where the 3:1 ratio for large text applies. When used as small text, they appear on `Obsidian` or `Slate Stone` backgrounds where all pass at 4.5:1.

### 6.2 Colorblind Considerations

The four team colors were chosen to be distinguishable under the three most common forms of color vision deficiency:

- **Protanopia (red-blind):** Green and Red are the most problematic pair. The piece silhouettes (Troll, Dwarf, Sorcerer are unique shapes) provide a secondary channel. The player status panel also uses positional encoding (Top/Bottom/Left/Right labels).
- **Deuteranopia (green-blind):** Similar to protanopia. Shape differentiation and spatial position are the backup channels.
- **Tritanopia (blue-yellow-blind):** Blue and Yellow may appear similar. Again, spatial position (Left vs Right) and player name labels disambiguate.

**Additional safeguards:**
- Each team's pieces have a **unique pattern fill** as an optional accessibility mode (future enhancement): Green = solid, Red = diagonal lines, Yellow = dots, Blue = crosshatch. This is flagged for Phase 5 implementation.
- All highlights use both color AND shape: valid move targets use color (cyan) AND a centered dot. SPLUT uses color AND text. Levitation uses color AND animated dashed lines.

### 6.3 Focus Indicators

All interactive elements have visible focus indicators for keyboard navigation:

| Element | Focus Style |
|---------|-------------|
| Board square | `outline: 2px solid #F0D078; outline-offset: -2px;` (Rune Gold Bright, inset) |
| Button | `outline: 2px solid #F0D078; outline-offset: 2px;` |
| Toggle | `outline: 2px solid #F0D078; outline-offset: 2px;` |
| Dropdown | `outline: 2px solid #F0D078; outline-offset: 2px;` |
| Direction arrow | `outline: 2px solid #F0D078; outline-offset: 2px;` |

Focus outlines use `Rune Gold Bright` which has high contrast against all backgrounds.

### 6.4 Keyboard Navigation

| Context | Key | Action |
|---------|-----|--------|
| Board (no selection) | `Tab` | Cycle through own pieces (in DOM order) |
| Board (no selection) | `Enter` | Select focused piece |
| Board (piece selected) | `Arrow keys` | Move focus between valid target squares |
| Board (piece selected) | `Enter` | Confirm move to focused target |
| Board (piece selected) | `Escape` | Deselect piece |
| Throw picker | `Arrow keys` | Move between direction arrows (N/E/S/W) |
| Throw picker | `Enter` | Confirm throw direction |
| Game over overlay | `Enter` | "Play Again" |
| Game over overlay | `Escape` | "Return to Lobby" |

### 6.5 Touch Targets

- **Board squares on mobile (375px viewport):** ~35px. This is below the 44px recommendation. Mitigation: only valid move targets and own pieces are tappable, reducing the density of active targets. Users will not need to tap tiny adjacent squares in rapid succession.
- **All buttons:** Minimum `48px` height (exceeds 44px).
- **Toggle:** `56px x 28px` track, thumb is `24px` but the entire track is the tap target.
- **Direction arrows:** `48px` diameter (exceeds 44px).

### 6.6 Screen Reader Support

- **Board squares:** `aria-label="Square E5, contains Green Troll"` or `aria-label="Square E5, empty"`.
- **Pieces:** `role="button"` with `aria-label="Green Troll on E5. Click to select."`.
- **Turn banner:** `role="status"` with `aria-live="polite"`.
- **Action log:** `role="log"` with `aria-live="polite"` and `aria-atomic="false"`.
- **Game over overlay:** `role="alertdialog"` with `aria-labelledby` pointing to the "VICTORY" heading.
- **SPLUT! moment:** An `aria-live="assertive"` announcement: "SPLUT! [Team] Dwarf on [square] has been crushed."

### 6.7 Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- All animations are replaced with instant state changes (0ms duration).
- Particle effects are disabled.
- Screen shake is disabled.
- The SPLUT! text still appears but without scale/rotation animation.
- Piece movements are instant (no translate animation).
- Glow pulses are replaced with static glows.

---

## 7. Implementation Notes for Developers

### 7.1 Technically Complex Effects

| Effect | Approach | Complexity |
|--------|----------|------------|
| Board 45-degree rotation | CSS `transform: rotate(45deg)` on grid container, `rotate(-45deg)` on cell content | Low |
| Piece movement animation | CSS `transition` on `grid-column`/`grid-row` or absolute `top`/`left` within cell | Medium |
| Push chain staggered animation | CSS `transition-delay` computed per piece in chain | Medium |
| Throw trajectory trail | Multiple absolutely-positioned fading copies using CSS `@keyframes` | Medium |
| SPLUT! particle burst | 8-12 pre-positioned `<div>` elements with CSS `@keyframes` radial burst | Medium |
| Screen shake | CSS `@keyframes` on board container with compound transform (rotation + translate) | Low |
| Levitation dashed line | SVG `<line>` with `stroke-dasharray` and animated `stroke-dashoffset` | Low |
| Ambient lobby particles | Absolutely-positioned `<div>` elements with CSS `@keyframes` drift | Low |
| Game Over celebration particles | Similar to ambient particles, more of them, team-colored | Low |
| Magic Purple orbiting runes (levitation) | CSS `@keyframes` with `rotate()` transform on parent, counter-rotate on children | Medium |

**No WebGL or Canvas required.** All effects are achievable with CSS animations and SVG. This keeps the bundle light and avoids canvas rendering complexity.

### 7.2 Asset Requirements

| Asset | Format | Purpose |
|-------|--------|---------|
| Troll piece SVG | `.svg` (inline) | Board piece, inline for color manipulation |
| Dwarf piece SVG | `.svg` (inline) | Board piece |
| Sorcerer piece SVG | `.svg` (inline) | Board piece |
| Rock piece SVG | `.svg` (inline) | Board piece |
| Direction arrow SVG | `.svg` (inline) | Throw picker |
| Human icon SVG | `.svg` (inline) | Toggle |
| AI/brain icon SVG | `.svg` (inline) | Toggle |
| Stone noise texture | `.svg` (inline, tiled) | Card backgrounds, very small (~200 bytes) |
| Rune border pattern | CSS only | Decorative borders, `repeating-linear-gradient` |

**All piece SVGs should be designed as single-path or minimal-path illustrations** that accept `fill` and `stroke` as CSS properties. This enables team coloring via CSS classes rather than multiple asset variants.

**No raster images (PNG/JPG/WebP) are required.** The entire visual identity is achieved with SVG, CSS gradients, and CSS effects. This results in:
- Perfect rendering at all DPIs (retina, 4K, etc.)
- Minimal asset download (~5KB total for all SVGs)
- Full runtime color control

### 7.3 Font Loading Strategy

Load fonts via Google Fonts with `display=swap` to prevent invisible text during load:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

**Fallback behavior:** The fallback font stacks (Section 1.3) ensure readable text before web fonts load. The layout shift is minimal because Inter's metrics are close to system sans-serif, and Cinzel is used only for headings (less text to reflow).

### 7.4 Tailwind CSS Configuration

Extend `tailwind.config.ts` with the design system tokens:

```typescript
// tailwind.config.ts (relevant theme extensions)
{
  theme: {
    extend: {
      colors: {
        obsidian: '#0D0D12',
        'slate-stone': '#1A1A2E',
        'carved-stone': '#2A2A3E',
        'worn-stone': '#3A3A52',
        ash: '#6B6B8A',
        bone: '#C8C8D4',
        parchment: '#E8E4DC',
        'pure-light': '#F5F0E8',
        'rune-gold': '#D4A853',
        'rune-gold-bright': '#F0D078',
        'magic-purple': '#A855F7',
        'magic-purple-glow': '#C084FC',
        'throw-orange': '#F97316',
        'throw-orange-bright': '#FB923C',
        'splut-red': '#FF2D55',
        'rock-granite': '#78716C',
        'rock-granite-light': '#A8A29E',
        'valid-move': '#22D3EE',
        'valid-move-dim': '#0E7490',
        team: {
          green: { DEFAULT: '#22C55E', glow: '#4ADE80', dim: '#166534' },
          red: { DEFAULT: '#EF4444', glow: '#F87171', dim: '#991B1B' },
          yellow: { DEFAULT: '#EAB308', glow: '#FACC15', dim: '#854D0E' },
          blue: { DEFAULT: '#3B82F6', glow: '#60A5FA', dim: '#1E3A8A' },
        },
      },
      fontFamily: {
        display: ['"Cinzel"', '"Palatino Linotype"', '"Book Antiqua"', 'Palatino', 'serif'],
        body: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Mono"', 'Consolas', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 1.5s ease-in-out infinite',
        'ai-thinking': 'ai-thinking 1.5s ease-in-out infinite',
        'float-bob': 'float-bob 2s ease-in-out infinite',
        'splut-shake': 'splut-shake 300ms ease-out',
        'particle-rise': 'particle-rise 20s linear infinite',
        'dash-flow': 'dash-flow 1s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.9' },
        },
        'ai-thinking': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'float-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'splut-shake': {
          '0%': { transform: 'rotate(45deg) translate(0, 0)' },
          '15%': { transform: 'rotate(45deg) translate(-2px, 1px)' },
          '30%': { transform: 'rotate(45deg) translate(2px, -1px)' },
          '45%': { transform: 'rotate(45deg) translate(-1px, 2px)' },
          '60%': { transform: 'rotate(45deg) translate(1px, -1px)' },
          '75%': { transform: 'rotate(45deg) translate(-1px, 0px)' },
          '100%': { transform: 'rotate(45deg) translate(0, 0)' },
        },
        'particle-rise': {
          '0%': { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.15' },
          '90%': { opacity: '0.15' },
          '100%': { transform: 'translateY(-20px) translateX(20px)', opacity: '0' },
        },
        'dash-flow': {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
}
```

### 7.5 Z-Index Architecture

| Layer | Z-Index | Contents |
|-------|---------|----------|
| Background | `0` | Page background, ambient particles |
| Board container | `10` | The rotated game grid |
| Board squares | `11` | Individual cells |
| Pieces | `12` | Piece SVGs within cells |
| Moving piece | `15` | Piece currently animating (elevated during move) |
| Board highlights | `13` | Valid move dots, selection rings, levitation lines |
| Board overlay (AI dim) | `18` | Semi-transparent veil during AI turns |
| Throw direction picker | `20` | Directional arrows and their backdrop |
| SPLUT! effect layer | `25` | SPLUT! text, particles, flash |
| UI panels (left/right) | `30` | Player status, action log (above board) |
| Turn banner | `35` | Always above panels |
| Tooltip | `40` | Floats above everything except modals |
| Modal backdrop | `50` | Dark overlay |
| Modal content | `51` | Game over card, future dialogs |

### 7.6 Performance Considerations

1. **Particle count:** Keep ambient particles under 25 and SPLUT particles under 15. CSS animations are GPU-accelerated when using `transform` and `opacity` only.
2. **Board re-renders:** Use React.memo on `BoardSquare` components, keyed by `squareKey`. Only squares whose state changes (occupant, highlight) should re-render.
3. **SVG piece rendering:** Inline SVGs (not `<img>` tags) for pieces. This allows CSS color control and avoids additional HTTP requests.
4. **Animation cleanup:** Use `will-change: transform` on elements that animate frequently (pieces, particles). Remove `will-change` after animation completes to free compositor layers.
5. **Font subsetting:** Cinzel is only used for headings and display text. Consider subsetting to Latin characters only (~30KB savings).

### 7.7 CSS Variables for Runtime Theming

Define CSS custom properties on `:root` for values that change at runtime (current team color):

```css
:root {
  --current-team-primary: #22C55E;   /* Updated by JS when turn changes */
  --current-team-glow: #4ADE80;
  --board-cell-size: 62px;           /* Updated by JS on resize */
}
```

This allows Tailwind utilities to reference dynamic values via `var()` in custom classes, and keeps team-colored animations (turn banner border, move pips) reactive without JavaScript style manipulation.

### 7.8 Data Attributes for Testing

Every interactive element must have a `data-testid` attribute per the implementation plan:

| Element | `data-testid` Pattern |
|---------|----------------------|
| Board square | `square-{SquareKey}` (e.g., `square-E5`) |
| Piece on board | `piece-{pieceId}` (e.g., `piece-Green_Troll`) |
| Rock on board | `rock-{rockId}` (e.g., `rock-Rock_E9`) |
| Throw direction button | `throw-{direction}` (e.g., `throw-N`) |
| Player count button | `player-count-{n}` (e.g., `player-count-2`) |
| Seat row | `seat-{seat}` (e.g., `seat-Top`) |
| Human/AI toggle | `player-type-{seat}` (e.g., `player-type-Top`) |
| Start game button | `start-game` |
| Turn banner | `turn-banner` |
| Move counter | `move-counter` |
| Player status card | `player-status-{seat}` |
| Action log | `action-log` |
| Game over overlay | `game-over-overlay` |
| Play again button | `play-again` |

### 7.9 Platform-Specific Notes

- **Safari:** CSS `backdrop-filter` for glass/blur effects is supported but can cause performance issues on older iOS devices. The design avoids `backdrop-filter` entirely -- all overlays use solid semi-transparent colors.
- **Firefox:** CSS `scrollbar-width: thin` and `scrollbar-color` are supported. Chrome requires `::-webkit-scrollbar` pseudo-elements. Both should be styled.
- **Mobile Safari (iOS):** The 45-degree board rotation combined with `overflow: hidden` on the container must be tested carefully. iOS Safari can exhibit rendering artifacts with large transformed elements. Fallback: reduce board container size to ensure the rotated grid fits within the viewport without clipping.
- **High DPI displays:** All SVG icons render crisply at any scale. No `@2x` raster assets needed.

---

## Appendix A: Board Starting Positions Reference

```
             E9 [Rock]
           D8  E8  F8
         C7  D7  E7  F7  G7
       B6  C6  D6  E6  F6  G6  H6
     A5 [Rock]  C5  D5  E5  F5  G5  H5  I5 [Rock]
       B4  C4  D4  E4  F4  G4  H4
         C3  D3  E3  F3  G3
           D2  E2  F2
             E1 [Rock]

Green (Top):    Sorcerer=E8, Troll=D8, Dwarf=F8
Red (Bottom):   Sorcerer=E2, Troll=F2, Dwarf=D2
Yellow (Left):  Sorcerer=B5, Troll=B6, Dwarf=B4
Blue (Right):   Sorcerer=H5, Troll=H4, Dwarf=H6
Rocks:          E9, E1, A5, I5
```

## Appendix B: Visual Hierarchy Summary

From most visually prominent to least:

1. **SPLUT! impact** -- Full screen attention, red flash, particles, text
2. **Game Over overlay** -- Covers board, celebration particles
3. **Throw direction picker** -- Board dims, orange arrows command attention
4. **Current player's selected piece** -- Glowing team color, pulsing ring
5. **Valid move targets** -- Cyan pulsing dots
6. **Turn banner** -- Team-colored bottom border, clear text
7. **Pieces on board** -- Team-colored filled SVGs
8. **Rocks on board** -- Neutral granite, visually quieter than team pieces
9. **Board squares** -- Dark stone, subtle inset shadow
10. **UI panels** -- Dark backgrounds, recede into periphery
11. **Background** -- Near-black, invisible

---

*This document is the authoritative visual specification for SPLUT!. All implementation of UI components, styling, animations, and visual effects must conform to these specifications. Deviations require explicit approval and an update to this document.*
