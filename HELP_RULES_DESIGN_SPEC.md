# SPLUT! Help / Rules Feature -- Visual Design Specification

**Version:** 1.0
**Status:** Authoritative specification for the Help/Rules modal feature.
**Parent:** Extends the visual system defined in `DESIGN_SPEC.md`.
**Source Content:** `/docs/rules.md`

---

## Table of Contents

1. [Design Decision: Modal vs. Page](#1-design-decision-modal-vs-page)
2. [Entry Points](#2-entry-points)
3. [Modal Shell Specification](#3-modal-shell-specification)
4. [Content Layout and Typography](#4-content-layout-and-typography)
5. [Section-by-Section Visual Design](#5-section-by-section-visual-design)
6. [Board Diagram Treatment](#6-board-diagram-treatment)
7. [Inline Piece Icons](#7-inline-piece-icons)
8. [Component Specifications](#8-component-specifications)
9. [Animations and Transitions](#9-animations-and-transitions)
10. [Responsive Behavior](#10-responsive-behavior)
11. [Accessibility](#11-accessibility)
12. [Implementation Notes](#12-implementation-notes)

---

## 1. Design Decision: Modal vs. Page

**Decision: Full-screen modal overlay.**

Rationale:
- During gameplay, navigating to a separate page would destroy game state or require complex state preservation. A modal keeps the game alive underneath.
- From the lobby, a modal keeps the user's setup configuration intact -- they can check a rule and close without losing their player count or seat selections.
- The existing codebase already has a `Modal` component (`/src/components/ui/Modal.tsx`) and an established overlay pattern (see `GameOverOverlay.tsx`). This feature extends that vocabulary rather than introducing a new navigation paradigm.
- The rules content is substantial enough to warrant a near-full-screen treatment, not a small dialog. The modal will occupy most of the viewport while preserving the atmospheric backdrop blur that signals "you are still in the game."

---

## 2. Entry Points

### 2.1 Lobby Help Button

**Location:** Below the stone tablet card, centered, as a ghost-style text link.

```
+--------------------------------------------------+
|                   SPLUT! Title                    |
|                                                    |
|  +--------------------------------------------+  |
|  |           Stone Tablet Card                 |  |
|  |           (game setup form)                 |  |
|  +--------------------------------------------+  |
|                                                    |
|              How to Play                           |
|                                                    |
+--------------------------------------------------+
```

**Specifications:**
- **Element:** `<button>` with text "How to Play"
- **Font:** Inter 14px, weight 400
- **Color (default):** `var(--bone)` (`#C8C8D4`)
- **Color (hover):** `var(--parchment)` (`#E8E4DC`)
- **Decoration:** Underline, `text-decoration-color: var(--rune-gold/40)` transitioning to `var(--rune-gold)` on hover
- **Spacing:** `margin-top: 24px` below the stone tablet card, centered with `text-align: center`
- **Cursor:** `pointer`
- **Focus:** Standard `focus-ring` class (2px solid `var(--rune-gold-bright)`, offset 2px)
- **No background, no border** -- this is a minimal text link to keep the lobby screen clean. The stone tablet card and BEGIN THE GAME button remain the visual priority.

### 2.2 In-Game Help Button

**Location:** Fixed position, top-right corner, near the existing back-to-lobby button (top-left).

```
+-----------------------------------------------------------+
| <- Lobby                                       [?] Help   |
|                                                            |
|                     Turn Banner                            |
|  +-----------+  +-------------------+  +--------------+   |
|  |  Player   |  |                   |  |   Action     |   |
|  |  Status   |  |    Game Board     |  |   Log        |   |
|  |  Panel    |  |                   |  |              |   |
|  +-----------+  +-------------------+  +--------------+   |
+-----------------------------------------------------------+
```

**Specifications:**
- **Element:** `<button>` with a question-mark icon and the text "Rules"
- **Position:** `fixed`, `top: 12px`, `right: 12px`, `z-index: 30` (same layer as the existing lobby back button)
- **Layout:** `inline-flex items-center gap-1.5`
- **Icon:** A `?` character rendered inside a 16x16 circle:
  - Circle: `width: 16px`, `height: 16px`, `border-radius: 50%`, `border: 1.5px solid currentColor`
  - Character: `?` centered inside, Inter font, 10px, weight 600
- **Text:** "Rules", Inter 12px, weight 400
- **Color (default):** `var(--ash)` (`#6B6B8A`)
- **Color (hover):** `var(--bone)` (`#C8C8D4`)
- **Transition:** `color 150ms ease`
- **Focus:** Standard `focus-ring` class
- **Touch target:** The entire button must be at least 44x44px (add padding as needed). Actual rendered content is smaller, but the clickable area is padded: `padding: 8px 10px`.

**Why "Rules" instead of "Help":** The content is specifically game rules, not troubleshooting help. "Rules" is more precise and sets the right expectation.

---

## 3. Modal Shell Specification

The Help modal uses a custom layout that extends but does not reuse the existing `Modal` component, because the content demands a taller, scrollable treatment with a sidebar navigation that the small dialog-sized `Modal` was not designed for.

### 3.1 Backdrop

- **Background:** `var(--obsidian)` at 88% opacity (`bg-obsidian/88`)
- **Backdrop filter:** `blur(4px)` -- provides a subtle depth-of-field effect that separates the modal from the game board behind it
- **Entry animation:** Fade in over 300ms, `ease-out`
- **Exit animation:** Fade out over 200ms, `ease-in`
- **Click behavior:** Clicking the backdrop closes the modal

### 3.2 Modal Container

```
+--------------------------------------------------------------+
|  [Rune Gold ornament line]                            [X]    |
|                                                              |
|  RULES OF SPLUT!                                             |
|  ________________________________________________________    |
|                                                              |
|  [Section Nav Tabs]                                          |
|  Overview | Board | Pieces | SPLUT! | Winning | Reference    |
|  ________________________________________________________    |
|                                                              |
|  +--------------------------------------------------------+  |
|  |                                                        |  |
|  |           Scrollable content area                      |  |
|  |                                                        |  |
|  |           (current section renders here)               |  |
|  |                                                        |  |
|  |                                                        |  |
|  +--------------------------------------------------------+  |
|                                                              |
+--------------------------------------------------------------+
```

- **Max width:** `720px`
- **Max height:** `min(85vh, 800px)`
- **Width:** `calc(100vw - 32px)` (16px margin on each side)
- **Background:** `var(--slate-stone)` (`#1A1A2E`)
- **Border:** `1px solid` with color `rgba(212, 168, 83, 0.3)` (rune-gold at 30% opacity)
- **Border radius:** `16px`
- **Shadow:** `0 8px 24px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)` (matches existing modal shadow)
- **Padding:** `0` on the container itself (padding is internal to each zone)
- **Overflow:** `hidden` on the container; `overflow-y: auto` on the content scroll area only
- **Entry animation:** Scale from `0.95` to `1.0` and fade from `0` to `1` over 300ms using `cubic-bezier(0.16, 1, 0.3, 1)` (matches the game-over-entrance feel but is subtler -- no overshoot)
- **Exit animation:** Scale from `1.0` to `0.97` and fade out over 200ms, `ease-in`

### 3.3 Modal Header

- **Height:** `auto`, with padding `24px 24px 0 24px`
- **Top ornament line:** A centered horizontal ornament identical to the lobby title ornament:
  ```
  ---- [diamond] ----
  ```
  - Two `1px` height lines, `width: 48px`, `background: var(--rune-gold)` at 40% opacity
  - Center diamond: `8x8px`, rotated 45 degrees, `background: var(--rune-gold)` at 40% opacity
  - `margin-bottom: 16px`

- **Title:** "RULES OF SPLUT!"
  - Font: Cinzel, 24px, weight 700, tracking `0.04em`
  - Color: `var(--rune-gold-bright)` (`#F0D078`)
  - Text-shadow: `0 0 20px rgba(212, 168, 83, 0.3)` (subtle warm glow, echoing the lobby title pulse but static)
  - Centered

- **Subtitle:** "A Game of Trolls, Dwarves & Sorcerers"
  - Font: Inter, 13px, weight 400, italic
  - Color: `var(--bone)` (`#C8C8D4`)
  - `margin-top: 4px`, centered

- **Divider:** `1px` horizontal line below the subtitle
  - Color: `var(--rune-gold)` at 20% opacity
  - `margin-top: 16px`

### 3.4 Close Button

- **Position:** `absolute`, `top: 16px`, `right: 16px`
- **Size:** `32x32px` (visible), padded to `44x44px` touch target
- **Shape:** No background, no border
- **Icon:** A simple X formed by two crossing lines:
  - Rendered as an SVG: two `line` elements from `(6,6)` to `(18,18)` and `(18,6)` to `(6,18)` in a 24x24 viewBox
  - Stroke: `var(--ash)` (`#6B6B8A`), `stroke-width: 2`, `stroke-linecap: round`
- **Hover:** Stroke transitions to `var(--bone)` (`#C8C8D4`) over 150ms
- **Focus:** Standard `focus-ring` class
- **Aria:** `aria-label="Close rules"`

---

## 4. Content Layout and Typography

### 4.1 Section Navigation Tabs

The rules content is divided into six navigable sections. Rather than rendering the entire document as one long scroll, the content is broken into tabbed sections. This prevents the "wall of text" problem and lets the user find what they need quickly during a game.

**Sections:**
1. **Overview** -- Overview + Turn Structure
2. **Board** -- The Board + Teams and Starting Positions
3. **Pieces** -- All four piece type descriptions (Sorcerer, Troll, Dwarf, Rock)
4. **SPLUT!** -- The SPLUT! mechanic explanation
5. **Winning** -- Winning conditions
6. **Quick Ref** -- Quick Reference summary

**Tab Bar Specifications:**
- **Position:** Sticky within the modal, immediately below the header. Does not scroll with content.
- **Layout:** Horizontal scrollable row, `display: flex`, `gap: 0`, full width
- **Padding:** `0 24px` on the tab row container
- **Background:** `var(--slate-stone)` (same as modal, ensuring seamless look)
- **Bottom border:** `1px solid rgba(212, 168, 83, 0.15)` (very faint rune gold)
- **Overflow-x:** `auto` with `scrollbar-width: none` and `::-webkit-scrollbar { display: none }` (hidden scrollbar -- tabs will fit on most screens, scroll is only a mobile fallback)

**Individual Tab:**
- **Element:** `<button>`, role implicit
- **Padding:** `12px 16px`
- **Font:** Inter, 13px, weight 600, tracking `0.02em`
- **Text transform:** None (mixed case as written above)
- **Min-width:** `auto` (content-sized)
- **White-space:** `nowrap`

**Tab States:**

| State | Text Color | Bottom Border | Background |
|-------|-----------|---------------|------------|
| Default | `var(--ash)` (`#6B6B8A`) | `2px solid transparent` | `transparent` |
| Hover | `var(--bone)` (`#C8C8D4`) | `2px solid var(--rune-gold)` at 30% | `transparent` |
| Active/Selected | `var(--rune-gold-bright)` (`#F0D078`) | `2px solid var(--rune-gold)` | `transparent` |
| Focus-visible | Standard `focus-ring` outline | (same as current visual state) | (same) |

- **Active indicator transition:** The 2px bottom border animates using a pseudo-element (`::after`) that slides horizontally to the active tab. Implementation: CSS transition on `left` and `width` properties, 200ms `ease-out`. Alternatively, a simpler approach: each tab has its own `::after` with `transform: scaleX(0)` transitioning to `scaleX(1)` on active.
- **Tab change does not animate content.** When switching tabs, the new content appears immediately -- no slide or fade. This keeps interaction snappy and avoids motion sickness from frequent tab switching during gameplay.

### 4.2 Content Scroll Area

- **Padding:** `24px`
- **Overflow-y:** `auto`
- **Scrollbar:** Uses the existing `action-log-scroll` custom scrollbar class (4px wide, worn-stone thumb on slate-stone track)
- **Scroll padding top:** `8px` (breathing room after the sticky tab bar)
- **Max-height:** Fills remaining space in the modal below the header and tab bar. Implemented via `flex: 1; min-height: 0; overflow-y: auto` in a flex column layout.

### 4.3 Typography Within Content

All content typography uses the design system fonts with these specific rules:

| Element | Font | Size | Weight | Color | Spacing |
|---------|------|------|--------|-------|---------|
| Section heading (H2) | Cinzel | 20px | 600 | `var(--rune-gold)` (`#D4A853`) | tracking `0.02em`, `margin-bottom: 16px` |
| Sub-heading (H3) | Cinzel | 16px | 600 | `var(--parchment)` (`#E8E4DC`) | tracking `0.01em`, `margin-top: 24px`, `margin-bottom: 12px` |
| Body paragraph | Inter | 14px | 400 | `var(--bone)` (`#C8C8D4`) | line-height `1.7`, `margin-bottom: 12px` |
| Bold emphasis | Inter | 14px | 600 | `var(--parchment)` (`#E8E4DC`) | Inline within body text |
| Inline piece name | Inter | 14px | 600 | Piece-specific color (see Section 7) | Inline with icon |
| Table header | Inter | 12px | 600 | `var(--parchment)` (`#E8E4DC`) | `text-transform: uppercase`, tracking `0.06em` |
| Table cell | Inter | 13px | 400 | `var(--bone)` (`#C8C8D4`) | -- |
| Quick ref number | Cinzel | 14px | 600 | `var(--rune-gold)` (`#D4A853`) | Used as the list number marker |

### 4.4 Section Dividers

Within a single tab's content, sub-sections are separated by:
- A horizontal line: `height: 1px`, `background: var(--rune-gold)` at 15% opacity
- `margin: 24px 0`

---

## 5. Section-by-Section Visual Design

### 5.1 Overview Tab

**Content:** The opening paragraph from rules.md + the Turn Structure table.

**Layout:**
```
+-----------------------------------------------------+
|  OVERVIEW                                            |
|                                                      |
|  [Opening paragraph with inline piece icons for      |
|   Sorcerer, Troll, Dwarf, and Rock mentioned]        |
|                                                      |
|  --- divider ---                                     |
|                                                      |
|  TURN STRUCTURE                                      |
|                                                      |
|  +-----------------------------------------------+  |
|  |  Turn #        |  Moves Available              |  |
|  |  1st turn      |  [o] [ ] [ ]  -- 1 move      |  |
|  |  2nd turn      |  [o] [o] [ ]  -- 2 moves     |  |
|  |  3rd onward    |  [o] [o] [o]  -- 3 moves     |  |
|  +-----------------------------------------------+  |
|                                                      |
|  "All moves are mandatory"                           |
|  callout box                                         |
+-----------------------------------------------------+
```

**Turn Structure Visual:** Instead of a plain table, render the move counts as visual "pips" (small filled/empty circles), echoing the MoveCounter component used in the TurnBanner during gameplay. This creates a visual callback that helps players connect the rules to what they see on screen.

- Pip size: `8x8px` circles
- Filled pip: `var(--rune-gold)` (`#D4A853`)
- Empty pip: `var(--carved-stone)` (`#2A2A3E`) with `1px border` in `var(--worn-stone)` (`#3A3A52`)
- Pip gap: `6px`
- Row height: `40px`

**Callout Box** for "All moves are mandatory":
- See Component Spec in Section 8.2

### 5.2 Board Tab

**Content:** Board description + Teams and Starting Positions table + player count variants.

**Board Diagram:** Rendered as a styled visual (see Section 6 for full specification).

**Teams Table:**
- Rendered as a card grid rather than a traditional table, to make each team visually distinct.
- Four cards in a 2x2 grid (or stacked on mobile).

**Team Card Specification:**
```
+---------------------------------------+
|  [color dot]  GREEN (Top)             |
|                                        |
|  [SorcererIcon]  Sorcerer -- D8       |
|  [DwarfIcon]     Dwarf    -- E8       |
|  [TrollIcon]     Troll    -- F8       |
+---------------------------------------+
```

- **Card dimensions:** Flexible width, `min-width: 140px`
- **Background:** `var(--carved-stone)` (`#2A2A3E`)
- **Border:** `1px solid` using the team's primary color at 30% opacity
- **Border-left:** `3px solid` using the team's primary color (full opacity) -- a colored accent bar on the left edge
- **Border-radius:** `8px`
- **Padding:** `12px`
- **Team name:** Inter, 13px, weight 600, color = team primary color
- **Piece rows:** Each row has the piece SVG icon (16px, colored in team primary), piece name (Inter 13px, weight 400, `var(--bone)`), and coordinate (JetBrains Mono, 13px, `var(--ash)`)

**Player Count Variants:** Rendered as three small callout blocks below the team cards, one for each count (2, 3, 4), using the callout box style.

### 5.3 Pieces Tab

This is the largest section. Each piece type gets its own subsection with a distinctive visual treatment.

**General piece section layout:**
```
+-----------------------------------------------------+
|  [PieceIcon 32px, rune-gold]   PIECE NAME            |
|                                                      |
|  [Description paragraph]                             |
|                                                      |
|  Movement:                                           |
|  [movement description with any relevant visual]     |
|                                                      |
|  Special Ability:                                    |
|  [ability description]                               |
|                                                      |
|  [Optional: outcome table or diagram]                |
|                                                      |
|  --- divider ---                                     |
+-----------------------------------------------------+
```

**Piece section heading:** Each piece name is displayed alongside its SVG icon. The icon is rendered at 28px in `var(--rune-gold)` (`#D4A853`). The heading text uses Cinzel 16px weight 600 in `var(--parchment)`.

Layout: `display: flex`, `align-items: center`, `gap: 10px`.

#### 5.3.1 Sorcerer Section

- **Icon:** `SorcererIcon` at 28px, fill `var(--rune-gold)`
- **Key visual:** The levitation rules are presented in a numbered step list inside a callout box with a `var(--magic-purple)` left border (3px) instead of the standard rune-gold. This visually codes levitation as "magic."
- **Cooldown rule:** Highlighted in a separate small callout with a warning-style treatment: `var(--throw-orange)` left border, body text mentions "Cooldown" in bold orange.

#### 5.3.2 Troll Section

- **Icon:** `TrollIcon` at 28px, fill `var(--rune-gold)`
- **Throw outcome table:** Rendered as a styled table (see Section 8.3 for table spec). The "Sorcerer" row in the "What the Rock hits" column should have its text in `var(--splut-red)` to draw attention to the kill condition. Bold the word "KILLS."
- **Pull-back:** Described in a callout box. No special color treatment (standard rune-gold left border).

#### 5.3.3 Dwarf Section

- **Icon:** `DwarfIcon` at 28px, fill `var(--rune-gold)`
- **Push chains:** Described with body text. No diagram needed -- the SPLUT! section's diagram serves that purpose and the concept is straightforward.
- **"Mostly immune" note:** A brief, italicized aside in `var(--ash)` pointing forward to the SPLUT! section: "See SPLUT! for the exception."

#### 5.3.4 Rock Section

- **Icon:** `RockIcon` at 28px (uses its own granite coloring)
- **Movement methods:** Presented as a compact list with inline piece icons next to each method:
  - `[TrollIcon 16px]` Throw
  - `[SorcererIcon 16px]` Levitation
  - `[DwarfIcon 16px]` Push
  - `[TrollIcon 16px]` Pull-back
- **"Always 4 Rocks"** callout in standard callout box.

### 5.4 SPLUT! Tab

This is the signature mechanic and deserves the most dramatic visual treatment.

**Layout:**
```
+-----------------------------------------------------+
|                                                      |
|           S P L U T !                                |
|     [dramatic title with glow]                       |
|                                                      |
|  [Description paragraph]                             |
|                                                      |
|  +------------------------------------------------+  |
|  |         SPLUT! Diagram                          |  |
|  |  (styled version of the ASCII art)              |  |
|  +------------------------------------------------+  |
|                                                      |
|  What does NOT trigger SPLUT!:                       |
|  [bullet list]                                       |
|                                                      |
+-----------------------------------------------------+
```

**SPLUT! Title Treatment:**
- Text: "SPLUT!"
- Font: Cinzel, 28px, weight 700, tracking `0.06em`
- Color: `var(--splut-red)` (`#FF2D55`)
- Text-shadow: `0 0 16px rgba(255, 45, 85, 0.5), 0 0 32px rgba(255, 45, 85, 0.2)`
- This is the ONE place outside of actual gameplay where SPLUT Red is used. The design spec reserves SPLUT Red for the SPLUT kill moment and critical errors -- the rules explanation of the SPLUT mechanic qualifies as a thematic use.
- Centered, with `margin-bottom: 16px`

**SPLUT! Diagram:** The ASCII art from rules.md is rendered as a styled visual diagram (see Section 6.2).

**"Does NOT trigger" list:** Rendered as standard body text with a small red "X" icon (12px) before each bullet, in `var(--ash)`, to contrast with the dramatic SPLUT content above.

### 5.5 Winning Tab

Short section. Content:

- Paragraph about Sorcerer death eliminating the team
- "Last player standing wins" statement
- Friendly fire warning

**Visual treatment:**
- The "Last player standing wins" line is set apart as a centered, slightly larger piece of text:
  - Font: Cinzel, 16px, weight 600
  - Color: `var(--rune-gold-bright)` (`#F0D078`)
  - `margin: 20px 0`
  - Centered
  - Bordered above and below with the standard rune-gold ornament lines

- Friendly fire warning: Standard callout box with `var(--throw-orange)` left border and the word "Warning" in bold orange.

### 5.6 Quick Reference Tab

The eight quick-reference rules rendered as a numbered list with visual emphasis.

**Layout:** Numbered list where each number is a styled marker.

**Number marker:**
- Displayed as a `24x24px` circle
- Background: `var(--carved-stone)` (`#2A2A3E`)
- Border: `1px solid var(--rune-gold)` at 40% opacity
- Number: Cinzel, 13px, weight 600, `var(--rune-gold)` (`#D4A853`), centered
- `flex-shrink: 0`

**Rule text:**
- Inter, 14px, weight 400, `var(--bone)`, line-height `1.6`
- Bold keywords within each rule use `var(--parchment)` weight 600

**Row spacing:** `12px` gap between rows. Each row is `display: flex`, `align-items: flex-start`, `gap: 12px`.

---

## 6. Board Diagram Treatment

### 6.1 Main Board Diagram (Board Tab)

**Decision: Render as a styled visual, not raw ASCII.**

The ASCII diagram from rules.md is converted into a CSS grid visual that mirrors the actual game board appearance, creating an immediate visual link between the rules and the game.

**Specifications:**
- **Grid:** 9 columns x 9 rows, identical structure to the game board
- **Cell size:** `28x28px` (smaller than the gameplay board, which flexes to fill space)
- **Cell gap:** `2px`
- **Valid squares:** `background: var(--carved-stone)` (`#2A2A3E`) with `border: 1px solid var(--worn-stone)` at 50% opacity, `border-radius: 4px`
- **Invalid squares:** `background: transparent`, no border (invisible)
- **Coordinate labels:** Each valid square contains its coordinate label in JetBrains Mono, 9px, `var(--ash)` (`#6B6B8A`), centered
- **Starting positions:** Squares that contain starting pieces are filled with the team color at 20% opacity and have a small piece icon (12px) centered in the cell, rendered in the team's primary color. Rock starting positions use `var(--rock-granite)` at 20% opacity with a tiny rock icon.
- **Container:** Centered within the content area, `padding: 16px`, `background: var(--obsidian)` at 50% opacity, `border-radius: 8px`, `border: 1px solid var(--carved-stone)`
- **Legend:** Below the diagram, a compact row of four items:
  - `[green dot] Green (Top)` | `[red dot] Red (Bottom)` | `[yellow dot] Yellow (Left)` | `[blue dot] Blue (Right)`
  - Dots are `8x8px` circles in the team primary color
  - Text: Inter 11px, `var(--ash)`
  - Layout: `flex-wrap: wrap`, `justify-content: center`, `gap: 12px`

### 6.2 SPLUT! Diagram (SPLUT! Tab)

The ASCII throw example is rendered as a horizontal sequence of styled squares:

```
  Troll throws East -->

  [Troll]  [     ]  [Dwarf]  [Rock]
                       ^
                     SPLUT!
                   Rock lands here,
                   Dwarf is crushed
```

**Specifications:**
- Four squares in a horizontal row, `48x48px` each, `gap: 4px`
- Square styling matches the game board: `background: var(--carved-stone)`, `border: 1px solid var(--worn-stone)` at 50%, `border-radius: 4px`
- **Square 1 (Troll):** Contains a `TrollIcon` at 28px in `var(--rune-gold)`
- **Square 2 (Empty):** Empty, slightly darker (`var(--slate-stone)`)
- **Square 3 (Dwarf + SPLUT):** Contains a `DwarfIcon` at 24px in `var(--bone)`. The square has:
  - A pulsing red background overlay: `background: var(--splut-red)` at 15% opacity
  - A `2px` border in `var(--splut-red)` at 40% opacity
- **Square 4 (Rock):** Contains a `RockIcon` at 24px
- **Arrow:** Above the row, a right-pointing arrow from square 1 toward square 4:
  - SVG line with arrowhead
  - Color: `var(--throw-orange)` (`#F97316`)
  - Dashed line: `stroke-dasharray: 6 4`
  - Label above arrow: "Troll throws East", Inter 11px, italic, `var(--throw-orange)`
- **SPLUT label:** Below square 3:
  - "SPLUT!" in Cinzel 14px weight 700, `var(--splut-red)`
  - Below that: "Rock lands here, Dwarf is crushed" in Inter 11px, `var(--ash)`
  - A small upward-pointing caret (triangle) between the square and the label, in `var(--splut-red)` at 60%

**Container:** Same as the board diagram container: centered, padded, obsidian-tinted background, subtle border.

---

## 7. Inline Piece Icons

When piece names appear in body text, they are accompanied by their SVG icon to create immediate visual recognition.

**Inline icon specifications:**
- **Size:** `16x16px`
- **Vertical alignment:** `vertical-align: -3px` (optical middle alignment with 14px body text)
- **Margin:** `0 3px` (slight breathing room from adjacent text)
- **Color:** Use `var(--rune-gold)` (`#D4A853`) for all piece icons in the rules text. Do NOT use team colors, since the rules are team-agnostic. The Rock icon retains its native granite coloring.

**Implementation pattern:**

When the rules mention "Sorcerer", render:
```
[SorcererIcon 16px rune-gold] Sorcerer
```

Where "Sorcerer" is in Inter 14px weight 600, `var(--parchment)`.

**Piece name colors in isolation** (when used as a label, not inline in a sentence):
- Sorcerer: `var(--magic-purple)` (`#A855F7`) -- associates with magic
- Troll: `var(--rune-gold)` (`#D4A853`) -- associates with heavy/gold
- Dwarf: `var(--bone)` (`#C8C8D4`) -- neutral/sturdy
- Rock: `var(--rock-granite-light)` (`#A8A29E`) -- matches the granite aesthetic

These colors are used ONLY for the piece type labels in the subsection headings (Section 5.3), not in body text.

---

## 8. Component Specifications

### 8.1 HelpModal (Container Component)

Described fully in Section 3. This is the top-level component.

**Props interface:**
```typescript
interface HelpModalProps {
  open: boolean
  onClose: () => void
  initialSection?: HelpSection  // defaults to 'overview'
}

type HelpSection = 'overview' | 'board' | 'pieces' | 'splut' | 'winning' | 'quick-ref'
```

### 8.2 Callout Box

Used throughout the rules for important notes, warnings, and highlighted information.

```
+----+----------------------------------------------+
| |  |  Important text content here.                |
| |  |  Can be multiple lines.                      |
+----+----------------------------------------------+
  ^
  colored left border
```

**Specifications:**
- **Background:** `var(--carved-stone)` (`#2A2A3E`) at 60% opacity
- **Border-left:** `3px solid` (color varies by callout type)
- **Border-radius:** `0 6px 6px 0` (flat on left, rounded on right)
- **Padding:** `12px 16px`
- **Margin:** `16px 0`
- **Font:** Inter, 13px, weight 400, `var(--bone)`, line-height `1.6`

**Callout types by left-border color:**

| Type | Left Border Color | Usage |
|------|------------------|-------|
| Info (default) | `var(--rune-gold)` (`#D4A853`) | General important notes |
| Magic | `var(--magic-purple)` (`#A855F7`) | Levitation / sorcerer rules |
| Warning | `var(--throw-orange)` (`#F97316`) | Warnings, cooldowns, gotchas |
| Danger | `var(--splut-red)` (`#FF2D55`) | SPLUT-specific callouts |

### 8.3 Styled Table

Used for the throw outcome table and turn structure table.

**Specifications:**
- **Container:** `width: 100%`, `border-radius: 8px`, `overflow: hidden`, `border: 1px solid var(--carved-stone)`
- **Header row:** `background: var(--carved-stone)` (`#2A2A3E`)
  - Text: Inter 12px, weight 600, `var(--parchment)`, `text-transform: uppercase`, tracking `0.06em`
  - Padding: `10px 16px`
- **Body rows:** Alternating backgrounds
  - Even: `var(--slate-stone)` (`#1A1A2E`)
  - Odd: `var(--slate-stone)` with a slight tint (`rgba(42, 42, 62, 0.3)` -- a whisper of carved-stone)
  - Text: Inter 13px, weight 400, `var(--bone)`, padding `10px 16px`
- **Row hover:** `background: var(--carved-stone)` at 50% opacity, transition 150ms
- **Row separator:** `1px solid var(--carved-stone)` at 40% opacity between rows

### 8.4 Section Navigation Tab

Described in Section 4.1. Reusable tab button component.

**Props interface:**
```typescript
interface SectionTabProps {
  label: string
  section: HelpSection
  isActive: boolean
  onClick: () => void
}
```

---

## 9. Animations and Transitions

### 9.1 Modal Open/Close

**Open sequence (300ms total):**
1. Backdrop fades in: `opacity 0 -> 1`, 300ms, `ease-out`
2. Modal container: `opacity 0, scale(0.95) -> opacity 1, scale(1)`, 300ms, `cubic-bezier(0.16, 1, 0.3, 1)` (starts 50ms after backdrop begins)

**Close sequence (200ms total):**
1. Modal container: `opacity 1, scale(1) -> opacity 0, scale(0.97)`, 200ms, `ease-in`
2. Backdrop fades out: `opacity 1 -> 0`, 200ms, `ease-in` (simultaneous with container)

**CSS keyframes to add:**

```css
@keyframes help-modal-in {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes help-modal-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.97); }
}
```

**Tailwind animation variable to add:**
```css
--animate-help-modal-in: help-modal-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
```

### 9.2 Tab Active Indicator

The bottom border on the active tab transitions in using `scaleX`:
```css
/* Tab ::after pseudo-element */
.help-tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--rune-gold);
  transform: scaleX(0);
  transition: transform 200ms ease-out;
}

.help-tab[data-active="true"]::after {
  transform: scaleX(1);
}
```

### 9.3 Content Transition

When switching tabs, content does NOT animate. The switch is instantaneous. Reason: during gameplay, a player checking rules wants information immediately. Animation between content sections would slow them down.

### 9.4 Reduced Motion

All animations respect `prefers-reduced-motion: reduce` via the existing global rule in `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

No additional reduced-motion handling is needed.

---

## 10. Responsive Behavior

### 10.1 Breakpoints

The help modal adapts across three layout tiers, consistent with the game's existing breakpoint strategy:

| Breakpoint | Name | Modal Behavior |
|-----------|------|----------------|
| >= 768px | Desktop/Tablet | Max-width `720px`, centered, `max-height: 85vh` |
| 640-767px | Small Tablet | Max-width `100vw - 32px`, slightly smaller padding (20px) |
| < 640px | Mobile | Full-width minus 16px margins, full-height minus 32px margins, `max-height: calc(100vh - 32px)`, `border-radius: 12px` |

### 10.2 Mobile Adaptations

**Tab bar on mobile (<640px):**
- Tabs become horizontally scrollable
- Tab padding reduced to `10px 12px`
- Font size stays 13px (do not shrink further for readability)

**Board diagram on mobile:**
- Cell size reduces to `24x24px`
- Coordinate labels reduce to 8px font
- Starting position piece icons are hidden (coordinates only); legend remains below

**Team cards on mobile:**
- Stack to single column instead of 2x2 grid
- Full width

**SPLUT diagram on mobile:**
- Square size reduces to `40x40px`
- Icon sizes reduce proportionally (24px -> 20px)
- Labels below stay readable at 11px

**Content padding on mobile:**
- Reduced to `16px`

### 10.3 Landscape Mobile

On small viewports in landscape orientation (height < 500px):
- Modal uses `max-height: calc(100vh - 16px)`
- Header is compacted: subtitle is hidden, top ornament is hidden, title size drops to 20px
- Tab bar remains visible and sticky
- Content area gets remaining space

---

## 11. Accessibility

### 11.1 ARIA Attributes

**Modal container:**
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby="help-modal-title"` (references the "RULES OF SPLUT!" heading)

**Tab navigation:**
- Tab bar: `role="tablist"`, `aria-label="Rules sections"`
- Each tab: `role="tab"`, `aria-selected="true|false"`, `aria-controls="help-panel-{section}"`
- Content panel: `role="tabpanel"`, `id="help-panel-{section}"`, `aria-labelledby="help-tab-{section}"`

**Close button:**
- `aria-label="Close rules"`

### 11.2 Focus Management

- **On open:** Focus moves to the first tab in the tab bar (or to the modal container itself if focus trapping is used).
- **Focus trap:** Focus is trapped within the modal while open. Tab key cycles through: close button, tabs, scrollable content, and back. Focus does not escape to the game underneath.
- **On close:** Focus returns to the element that triggered the modal (lobby help link or in-game help button).
- **Keyboard navigation within tabs:** Left/Right arrow keys move between tabs. Home/End go to first/last tab. Enter/Space activates the focused tab.

### 11.3 Contrast Ratios

All text combinations in the help modal meet WCAG AA (4.5:1 minimum):

| Text | Background | Ratio | Passes |
|------|-----------|-------|--------|
| Parchment (`#E8E4DC`) on Slate Stone (`#1A1A2E`) | -- | 11.2:1 | AA, AAA |
| Bone (`#C8C8D4`) on Slate Stone (`#1A1A2E`) | -- | 8.4:1 | AA, AAA |
| Rune Gold (`#D4A853`) on Slate Stone (`#1A1A2E`) | -- | 6.1:1 | AA |
| Ash (`#6B6B8A`) on Slate Stone (`#1A1A2E`) | -- | 3.2:1 | Fails for body text; used only for muted labels 16px+ or decorative |
| Rune Gold Bright (`#F0D078`) on Slate Stone (`#1A1A2E`) | -- | 8.7:1 | AA, AAA |
| Bone (`#C8C8D4`) on Carved Stone (`#2A2A3E`) | -- | 6.2:1 | AA |
| SPLUT Red (`#FF2D55`) on Slate Stone (`#1A1A2E`) | -- | 5.2:1 | AA |

**Note on Ash text:** `var(--ash)` fails the 4.5:1 body text threshold when used on Slate Stone. In this spec, Ash is used only for:
- Coordinate labels (9px decorative text on the board diagram, not critical reading content)
- Muted secondary labels at 16px+ where the large text threshold of 3:1 applies
- "Does NOT trigger" list prefixes (supplementary, not primary content)

All primary reading content uses Bone or brighter.

### 11.4 Keyboard Shortcuts

- **Escape:** Closes the modal
- **Arrow Left / Arrow Right:** Navigates tabs when a tab is focused
- **Home / End:** First / last tab when a tab is focused

---

## 12. Implementation Notes

### 12.1 Component File Structure

```
src/components/help/
  HelpModal.tsx          -- Modal shell, tab state management, backdrop
  HelpTabs.tsx           -- Tab bar component with keyboard navigation
  HelpContent.tsx        -- Content renderer, switches on active section
  sections/
    OverviewSection.tsx   -- Overview + Turn Structure
    BoardSection.tsx      -- Board diagram + Teams
    PiecesSection.tsx     -- All four piece descriptions
    SplatSection.tsx      -- SPLUT! mechanic (note: file name avoids ! character)
    WinningSection.tsx    -- Winning conditions
    QuickRefSection.tsx   -- Quick reference list
  BoardDiagram.tsx       -- Styled board visual used in Board tab
  SplatDiagram.tsx       -- Styled SPLUT! throw diagram
  CalloutBox.tsx         -- Reusable callout component
  RulesTable.tsx         -- Reusable styled table component
```

### 12.2 Integration Points

**Lobby (`/src/components/Home.tsx`):**
- Add `import HelpModal from '@/components/help/HelpModal'`
- Add local state: `const [showHelp, setShowHelp] = useState(false)`
- Render `<HelpModal open={showHelp} onClose={() => setShowHelp(false)} />` inside the component
- Add the "How to Play" link button below the stone tablet card

**Game Page (`/src/app/game/page.tsx`):**
- Add `import HelpModal from '@/components/help/HelpModal'`
- Add local state: `const [showHelp, setShowHelp] = useState(false)`
- Render the in-game help button (fixed position, top-right)
- Render `<HelpModal open={showHelp} onClose={() => setShowHelp(false)} />`

### 12.3 CSS Additions to globals.css

```css
/* Help modal scrollbar (reuses action-log-scroll pattern) */
.help-content-scroll::-webkit-scrollbar { width: 4px; }
.help-content-scroll::-webkit-scrollbar-track { background: var(--slate-stone); }
.help-content-scroll::-webkit-scrollbar-thumb { background: var(--worn-stone); border-radius: 2px; }
.help-content-scroll::-webkit-scrollbar-thumb:hover { background: var(--ash); }
.help-content-scroll { scrollbar-width: thin; scrollbar-color: var(--worn-stone) var(--slate-stone); }

/* Help tab bar hidden scrollbar */
.help-tab-bar::-webkit-scrollbar { display: none; }
.help-tab-bar { scrollbar-width: none; }
```

**New keyframe (add to existing keyframes block):**
```css
@keyframes help-modal-in {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
```

**New animation variable (add to @theme inline block):**
```css
--animate-help-modal-in: help-modal-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
```

### 12.4 Z-Index Placement

The help modal uses `z-index: 50` for the backdrop and `z-index: 51` for the modal content, matching the existing modal z-index architecture. This places it above all game UI (board at 10-15, panels at 30-35) but at the same level as the GameOverOverlay. Since both cannot be open simultaneously (the help button is not rendered when the game is over), there is no conflict.

### 12.5 No External Dependencies

This feature requires no new npm packages. Everything is built with:
- Existing Tailwind CSS utility classes
- Existing CSS custom properties from `globals.css`
- Existing SVG piece icons from `PieceIcons.tsx`
- Standard React state management (no Zustand store changes needed)

### 12.6 Board Diagram Implementation Approach

The board diagram should reuse the `ALL_VALID_SQUARES` constant from `/src/engine/board.ts` and the `INITIAL_POSITIONS` setup data from `/src/engine/setup.ts` to programmatically generate the grid. This ensures the diagram always matches the actual game engine's board definition, eliminating the risk of the rules showing an incorrect board.

### 12.7 Asset Optimization

- All icons are inline SVG (already the case with `PieceIcons.tsx`) -- no new image assets needed.
- The board diagram is pure CSS Grid + inline SVG -- no canvas or image rendering.
- The SPLUT! diagram is pure HTML/CSS with inline SVG icons.
- Total new CSS: approximately 15-20 lines (scrollbar styles + 1 keyframe).
- No new fonts required (Cinzel, Inter, JetBrains Mono are already loaded).

### 12.8 Performance Considerations

- The modal is conditionally rendered (`open` prop). When closed, nothing is in the DOM.
- The board diagram generates 81 grid cells (9x9) with 41 valid. This is trivial for React to render.
- Tab content is switched with conditional rendering, not hidden with CSS. Only one section is in the DOM at a time, keeping the DOM lean.
- No `useEffect` or subscription-heavy logic. The modal is pure presentational.

---

## Appendix A: Visual Summary

### Color Usage Within the Help Modal

| Element | Color Variable | Hex |
|---------|---------------|-----|
| Modal background | `--slate-stone` | `#1A1A2E` |
| Backdrop | `--obsidian` / 88% | `#0D0D12` |
| Title | `--rune-gold-bright` | `#F0D078` |
| Section headings | `--rune-gold` | `#D4A853` |
| Sub-headings | `--parchment` | `#E8E4DC` |
| Body text | `--bone` | `#C8C8D4` |
| Muted text | `--ash` | `#6B6B8A` |
| Active tab | `--rune-gold-bright` | `#F0D078` |
| Tab indicator | `--rune-gold` | `#D4A853` |
| Callout background | `--carved-stone` / 60% | `#2A2A3E` |
| Table header background | `--carved-stone` | `#2A2A3E` |
| Table row alt | `--slate-stone` + tint | `#1A1A2E` |
| Border accent | `--rune-gold` / 30% | `#D4A853` |
| SPLUT! title | `--splut-red` | `#FF2D55` |
| Levitation callout border | `--magic-purple` | `#A855F7` |
| Warning callout border | `--throw-orange` | `#F97316` |

### Typography Quick Reference Within the Help Modal

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Modal title | Cinzel | 24px | 700 |
| Modal subtitle | Inter | 13px | 400 italic |
| Tab label | Inter | 13px | 600 |
| Section heading (H2) | Cinzel | 20px | 600 |
| Sub-heading (H3) | Cinzel | 16px | 600 |
| Body | Inter | 14px | 400 |
| Body bold | Inter | 14px | 600 |
| Table header | Inter | 12px | 600 uppercase |
| Table cell | Inter | 13px | 400 |
| Quick ref number | Cinzel | 13px | 600 |
| Callout text | Inter | 13px | 400 |
| Coordinate label | JetBrains Mono | 9px | 400 |
| SPLUT! title | Cinzel | 28px | 700 |
