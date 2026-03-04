# SPLUT! Design QA Report

**Date:** 2026-03-03
**Reviewer:** Design QA Expert
**Spec Version:** 1.0 (DESIGN_SPEC.md)
**Status:** CONDITIONAL PASS — Several major and many minor discrepancies require resolution before the implementation can be considered spec-compliant.

---

## Executive Summary

The implementation establishes a solid foundation with correct color tokens, font loading, the three-column game layout, and functional board mechanics. However, significant gaps exist in: animation completeness, the Tailwind configuration approach (v4 vs. the spec's assumed v3 configuration), several component dimension mismatches, missing particle systems, incomplete ARIA labeling, no `prefers-reduced-motion` support, and multiple missing `data-testid` attributes required by the spec.

---

## Compliant Elements

These elements match the design specification precisely or within acceptable tolerance.

### Color System
- All primary palette hex values are correctly defined as CSS custom properties in `globals.css`: Obsidian `#0D0D12`, Slate Stone `#1A1A2E`, Carved Stone `#2A2A3E`, Worn Stone `#3A3A52`, Ash `#6B6B8A`, Bone `#C8C8D4`, Parchment `#E8E4DC`, Pure Light `#F5F0E8`.
- All four team colors are correct: Green `#22C55E`, Red `#EF4444`, Yellow `#EAB308`, Blue `#3B82F6`.
- All team glow and dim variants are correctly defined.
- All accent colors are correct: Rune Gold `#D4A853`, Rune Gold Bright `#F0D078`, Magic Purple `#A855F7`, Throw Orange `#F97316`, SPLUT Red `#FF2D55`, Rock Granite `#78716C`, Valid Move `#22D3EE`.
- The `@theme inline` block correctly maps CSS variables to Tailwind color utilities, enabling classes like `bg-obsidian`, `text-bone`, `border-rune-gold`, etc.

### Typography Fonts
- All three fonts are correctly loaded via Google Fonts with `display=swap`: Cinzel (600, 700), Inter (400, 600), JetBrains Mono (400).
- Font fallback stacks in `globals.css` match the spec exactly (Cinzel, Inter, JetBrains Mono stacks).
- `font-display` maps to Cinzel, `font-body` to Inter, `font-mono` to JetBrains Mono.
- `body` element correctly defaults to `var(--obsidian)` background and `var(--parchment)` color.

### Board Rotation Implementation
- `.board-diamond` (`transform: rotate(45deg)`) and `.board-diamond-counter` (`transform: rotate(-45deg)`) are correctly defined.
- The 9x9 CSS grid with `grid-template-columns: repeat(9, 1fr)` and `grid-template-rows: repeat(9, 1fr)` matches the spec.
- 1px gap between cells is implemented.
- Corner radius `2px` on board squares is correct.
- `inset 0 1px 2px rgba(0,0,0,0.3)` default shadow on squares matches the spec's carved shadow specification.

### Board Square States (Partial)
- Default `bg-carved-stone` fill is correct.
- Hover state correctly transitions to `bg-worn-stone` with `1px solid rgba(212, 168, 83, 0.2)` border.
- Hover with own piece correctly uses team color at `${teamColor}66` (40% opacity) for the border.
- Selected state: `2px solid ${teamColor}cc` border with compound glow `box-shadow` (12px + 24px spread) — matches the spec's glow shadow specification.
- Valid move: `2px solid rgba(34, 211, 238, 0.6)` border with 8px cyan dot at 0.7 opacity — matches spec exactly.
- SPLUT state: `2px solid var(--splut-red)` with red glow `box-shadow` — correct.
- Levitate-eligible: `2px solid rgba(168, 85, 247, 0.6)` with purple glow — correct.

### Primary Button (Button.tsx)
- Height `h-[52px]` for `lg` size matches the spec's 52px.
- Gradient direction: the spec specifies `135deg, #D4A853, #B8922E`. The implementation uses `bg-gradient-to-b` which is `180deg`. This is actually a discrepancy (see Major Issues), but the gradient colors `from-rune-gold to-[#B8922E]` are correct values.
- `active:scale-[0.98]` matches spec's pressed transform.
- Disabled state `bg-ash text-carved-stone` matches spec.
- `transition-all duration-150` matches spec's 150ms transition.

### Game Screen Three-Column Layout
- Left panel: `w-60` = 240px — matches spec.
- Right panel: `w-70` = 280px — matches spec.
- Center zone is `flex-1` — matches spec.
- `bg-obsidian` base background — correct.
- Ambient radial gradient from Slate Stone to Obsidian is implemented.

### Turn Banner
- `h-14` (56px) height — matches spec.
- `bg-slate-stone` background — correct.
- Bottom border in team primary color (`2px`) — matches spec.
- Team color dot (12px circle) present — correct.
- `transition-all duration-350` on the banner — matches spec's 350ms turn banner animation value.

### Move Counter (MoveCounter.tsx)
- Pip size `w-2 h-2` (8px) — matches spec.
- `gap-1.5` (6px) between pips — matches spec.
- Filled: `backgroundColor: teamColor` — correct.
- Empty: `border: 1.5px solid` at 30% opacity (`${teamColor}4D` ≈ 30%) — matches spec.
- `transition-all duration-200` on each pip — matches spec.

### Player Status Card
- Height `h-14` (56px) — matches spec.
- `bg-slate-stone` background — correct.
- `border-carved-stone` default border — correct.
- Left color bar `w-1` (4px) — matches spec.
- Eliminated opacity `opacity-35` (0.35) — matches spec exactly.
- Eliminated color bar uses `var(--ash)` — matches spec.
- AI badge: `bg-magic-purple/30 text-pure-light` — matches spec (Magic Purple background, Pure Light text).
- Elimination strike-through `h-px bg-ash/50` horizontal line — matches spec.

### Rock Piece Icon
- Uses `var(--rock-granite)` fill and `#5C5652` stroke — matches spec.
- `strokeWidth="2"` — matches spec's 2px stroke.
- 2-3 crack lines with correct opacity values — matches spec.
- Light edge highlight on top-left path — matches spec.

### Piece Color Application
- `adjustBrightness(color, 0.7)` for stroke (70% brightness of primary color) — matches spec's "darker variant at 70% brightness."
- Interior detail lines at `strokeWidth="0.75"` and `opacity="0.5"` — matches spec.
- Troll, Dwarf, Sorcerer each use team primary color as fill — correct.

### Modal (Modal.tsx)
- `bg-obsidian/85` backdrop — matches spec's `rgba(13, 13, 18, 0.85)`.
- `bg-slate-stone` card background — correct.
- `border-rune-gold/30` border — matches spec's `rgba(212, 168, 83, 0.25)` (close; 30% vs 25% — minor).
- `rounded-2xl` (16px) corner radius — matches spec.
- Floating shadow `shadow-[0_8px_24px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)]` — matches spec.
- ESC key handler closes modal — matches spec's keyboard nav requirement.

### Throw Direction Picker
- Four buttons for N/E/S/W — correct.
- `bg-obsidian/60` dark backdrop — matches spec's `rgba(13, 13, 18, 0.6)`.
- `bg-throw-orange` button background — correct.
- `text-obsidian` icon color — correct.
- `w-12 h-12` (48px diameter) circles — matches spec exactly.
- `rounded-full` — correct.
- Hover `scale-110` — matches spec.
- Letter labels (N/E/S/W) inside buttons — matches spec.
- Direction offsets (N=top-left, E=top-right, S=bottom-right, W=bottom-left) correctly account for 45-degree board rotation — matches spec.

### Action Log
- "Battle Log" header in Cinzel (`font-display`) with Rune Gold color — matches spec.
- `h-px bg-rune-gold/20` divider — matches spec.
- Timestamp in `font-mono text-ash` — matches spec.
- SPLUT entries in `font-display font-bold text-splut-red` — matches spec's Cinzel 700 in SPLUT Red.
- Alternating row background `bg-carved-stone/30` — matches spec (`rgba(42, 42, 62, 0.3)` ≈ Carved Stone at 30%).
- Auto-scroll to bottom — implemented correctly.

### Game Over Overlay
- `max-w-[400px]` — matches spec.
- `p-8` (32px padding) — matches spec.
- `bg-slate-stone border border-rune-gold/30 rounded-2xl` — matches spec (minor: border opacity 30% vs spec's 25%).
- "VICTORY" in `font-display text-3xl font-bold text-rune-gold-bright` — matches spec (H1 Cinzel 700, Rune Gold Bright).
- Winner Sorcerer icon at 64px — matches spec.
- Winner team name in team primary color — correct.
- Play Again as primary Button — correct.
- "Return to Lobby" as text link with `underline hover:text-bone` — matches spec's ghost link style.

### Lobby Screen Layout
- `max-w-[480px]` card — matches spec exactly.
- `bg-obsidian` base with radial gradient — correct.
- `bg-slate-stone border border-rune-gold/30 rounded-xl` card — correct (corner radius: `rounded-xl` = 12px, spec says 12px).
- Elevated shadow on card — correct.
- Rune decorative lines above and below title (horizontal line + diamond shape) — implemented, functionally matching spec.
- SPLUT! title: Cinzel Display, `text-rune-gold-bright`, correct text-shadow glow values (`0 0 20px rgba(212, 168, 83, 0.6), 0 0 40px rgba(212, 168, 83, 0.2)`) — matches spec.
- Subtitle "A Game of Trolls, Dwarves & Sorcerers" in `text-sm text-bone italic` — matches spec.

### Sorcerer Levitation Rock State
- `isLevitating` triggers `-translate-y-0.5` (2px upward) — matches spec.
- Purple underglow `drop-shadow(0 4px 12px rgba(168, 85, 247, 0.3))` — matches spec.
- `border: 2px solid rgba(168, 85, 247, 0.6)` on levitate-eligible squares — matches spec.

---

## Minor Discrepancies

These are close to spec but not pixel-perfect. Each should be corrected before final release.

### MINOR-01: Button Gradient Direction

**Location:** `src/components/ui/Button.tsx` — primary variant
**Expected:** `background: linear-gradient(135deg, #D4A853, #B8922E)` (spec section 4.1)
**Actual:** `bg-gradient-to-b` which is `180deg` (straight down, not diagonal)
**Fix:** Replace `bg-gradient-to-b from-rune-gold to-[#B8922E]` with an explicit inline style:
```tsx
style={{ background: 'linear-gradient(135deg, var(--rune-gold), #B8922E)' }}
```
Or add a custom Tailwind class using `bg-gradient-to-br` (135deg approximation) in globals.css.

The hover state should use `linear-gradient(135deg, #F0D078, #D4A853)` and pressed state `linear-gradient(135deg, #B8922E, #9A7A24)`. Neither hover nor pressed gradient variants are currently implemented — the hover only adds a glow shadow but does not change the gradient.

### MINOR-02: Button Default Shadow Missing

**Location:** `src/components/ui/Button.tsx` — primary variant
**Expected:** `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)` in default state (spec section 4.1)
**Actual:** No default shadow defined; shadow only appears on hover (`hover:shadow-[0_0_16px_rgba(212,168,83,0.4)]`).
**Fix:** Add `shadow-[0_2px_8px_rgba(0,0,0,0.3)]` to the primary variant's default class.

### MINOR-03: Button Hover Shadow Specification

**Location:** `src/components/ui/Button.tsx` — primary variant hover
**Expected:** `box-shadow: 0 4px 16px rgba(212, 168, 83, 0.3)` (spec section 4.1)
**Actual:** `hover:shadow-[0_0_16px_rgba(212,168,83,0.4)]` — incorrect offset (0,0 vs 0,4) and opacity (0.4 vs 0.3)
**Fix:** Change to `hover:shadow-[0_4px_16px_rgba(212,168,83,0.3)]`

### MINOR-04: Button Pressed Shadow Missing

**Location:** `src/components/ui/Button.tsx` — primary variant
**Expected:** `box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3)` on pressed (spec section 4.1)
**Actual:** No pressed shadow defined.
**Fix:** Add `active:shadow-[0_1px_4px_rgba(0,0,0,0.3)]` to the primary variant.

### MINOR-05: Secondary Button Height

**Location:** `src/components/lobby/PlayerCountSelector.tsx`
**Expected:** `height: 48px` (spec section 3.1 and 4.1 secondary button)
**Actual:** `h-12` = 48px — this is correct. However, the button uses `text-lg` (18px) while the spec specifies Label font (Inter 600 14px) for secondary buttons.
**Fix:** Change `text-lg font-semibold` to `text-sm font-semibold` (Inter 600 14px).

### MINOR-06: Secondary Button Width

**Location:** `src/components/lobby/PlayerCountSelector.tsx`
**Expected:** `width: 80px` (spec section 3.1)
**Actual:** `w-20` = 80px — correct.
**Expected padding:** `0 20px` (spec section 4.1 secondary button)
**Actual:** No explicit padding set; button relies on `w-20` fixed width with centered content.
**Fix:** Add `px-5` to match the `0 20px` spec padding.

### MINOR-07: Player Count Button — Selected State Letter-Spacing

**Location:** `src/components/lobby/PlayerCountSelector.tsx`
**Expected:** The secondary button font spec is Label (Inter 600 14px, letter-spacing 0.02em)
**Actual:** No `tracking` class on the button text.
**Fix:** Add `tracking-[0.02em]` to the button's className.

### MINOR-08: Seat Row Animation Missing

**Location:** `src/components/lobby/SeatSelector.tsx`
**Expected:** Rows appear with `250ms` slide-down + fade-in animation, staggered `80ms` per row (spec section 3.1)
**Actual:** `animationDelay` is set in the inline style but no animation keyframe or class is applied. The rows appear instantly.
**Fix:** Define a `slide-down-in` keyframe in `globals.css` and apply it:
```css
@keyframes slide-down-in {
  0% { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-slide-down {
  animation: slide-down-in 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```
Then add `className="... animate-slide-down"` to the seat row `<div>` and the existing `animationDelay` style attribute will correctly stagger them.

### MINOR-09: PlayerTypeToggle Dimensions

**Location:** `src/components/lobby/PlayerTypeToggle.tsx`
**Expected:** Track size `56px x 28px`, thumb `24px x 24px` (spec section 4.2)
**Actual:** Track is `w-[88px] h-8` (88px x 32px), thumb is `w-6 h-6` (24px x 24px).

The track is 32px wide oversize and 4px taller than spec. The implementation renders the "AI" and "Human" text labels inside the track simultaneously, which is non-standard and differs from the spec's flanking label placement ("labels flanking the toggle").

**Fix:**
1. Resize track to `w-14 h-7` (56px x 28px).
2. Move AI/Human text labels outside the toggle track, to either side, using `Caption` style (Inter 400 12px). Active label in Parchment, inactive in Ash.
3. Thumb position should shift from `left-1` to `calc(56px - 24px - 4px)` for the AI state.

The current implementation also lacks the spring easing on thumb transition. The spec requires `200ms cubic-bezier(0.34, 1.56, 0.64, 1)` (spring), but `duration-200` with default Tailwind easing is applied.
**Fix for easing:** Add inline `transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'` to the thumb div's style.

### MINOR-10: PlayerTypeToggle Track Border

**Location:** `src/components/lobby/PlayerTypeToggle.tsx`
**Expected:** Track border: `1px solid rgba(107, 107, 138, 0.3)` (spec section 4.2)
**Actual:** `border-magic-purple/50` for AI state, `border-ash/30` for Human state. The Human state `border-ash/30` approximates the spec (Ash at 30%). The AI state should use `border-magic-purple/50` per the AI track color spec, which the implementation correctly does.
**Status:** Human state is compliant. AI state border color not specified in spec for the border (only track background is specified as Magic Purple 25%). Consider whether the current `border-magic-purple/50` is intentional or should match the spec's default `rgba(107, 107, 138, 0.3)`.

### MINOR-11: Turn Banner Font Size

**Location:** `src/components/game/TurnBanner.tsx`
**Expected:** Player name in H2 style (Cinzel 600 24px, spec section 4.1 turn banner / 1.3 typography)
**Actual:** `text-lg` = 18px (H3 size), `font-display` — the size is H3, not H2.
**Fix:** Change `text-lg` to `text-2xl` (24px) and add `font-semibold` (weight 600). Current H2 spec: Cinzel 600 24px, line-height 1.3, letter-spacing 0.02em. Add `tracking-[0.02em]` and ensure `leading-[1.3]`.

### MINOR-12: Turn Banner "Move N of N" Text Style

**Location:** `src/components/game/TurnBanner.tsx`
**Expected:** "Move N of N" counter label in Label Small (Inter 600 12px, letter-spacing 0.04em, Ash color) per spec section 3.2
**Actual:** `text-xs text-ash tracking-wide` — `text-xs` is 12px (correct), `tracking-wide` is 0.025em (spec requires 0.04em for Label Small).
**Fix:** Change `tracking-wide` to `tracking-[0.04em]` and add `font-semibold` (currently missing — Label requires weight 600).

### MINOR-13: Action Log "Battle Log" Header Font Size

**Location:** `src/components/game/ActionLog.tsx`
**Expected:** "Battle Log" in H3 (Cinzel 600 18px) per spec section 3.2
**Actual:** `text-sm` (14px) instead of `text-lg` (18px). The `font-display` and `font-semibold` are correct but the size is wrong.
**Fix:** Change `text-sm` to `text-lg` (18px).

### MINOR-14: Action Log Timestamp Font Size

**Location:** `src/components/game/ActionLog.tsx`
**Expected:** Timestamp in Mono 13px (spec section 4.5)
**Actual:** `text-xs` (12px) is used for the entire entry row, not 13px mono specifically.
**Fix:** Apply `style={{ fontSize: '13px' }}` and `font-mono` to the timestamp `<span>`. (Note: JetBrains Mono 13px does not map to a standard Tailwind text size; use inline style.)

### MINOR-15: Action Log Entry Animation Missing

**Location:** `src/components/game/ActionLog.tsx`
**Expected:** New entries animate with `translateX(8px)` to `translateX(0)`, opacity `0.6` to `1.0`, `200ms ease-out` (spec section 4.5)
**Actual:** Entries appear instantly with no animation.
**Fix:** Define a `slide-in-right` keyframe and apply it to each new entry.

### MINOR-16: Action Log Player Name Font Style

**Location:** `src/components/game/ActionLog.tsx`
**Expected:** Player name in Label Small (Inter 600 12px) in team color (spec section 4.5)
**Actual:** `font-semibold` without explicit `text-xs` size — relies on parent `text-xs`. This is functionally 12px but should be explicit.
**Fix:** Add `text-xs` explicitly to the player name `<span>`.

### MINOR-17: Game Over Overlay — Missing Entry Animation

**Location:** `src/components/game/GameOverOverlay.tsx`
**Expected:** Card scales from `0` to `1.05` (overshoot) then settles, `800ms` with staggered element fade-ins at 200ms, 400ms, 600ms delays (spec section 3.7)
**Actual:** No entrance animation. Card appears instantly.
**Fix:** Add CSS animation classes to the card and stagger the inner elements. Define `game-over-entrance` keyframe: scale from 0 to 1.05 to 1.0 with `cubic-bezier(0.16, 1, 0.3, 1)`.

### MINOR-18: Game Over Overlay — Missing Backdrop Fade-In

**Location:** `src/components/game/GameOverOverlay.tsx`
**Expected:** Backdrop fades in over `400ms` (spec section 3.7)
**Actual:** `bg-obsidian/85` backdrop appears instantly (no `animate-in` or opacity transition).
**Fix:** Add `animate-in fade-in duration-400` to the backdrop div (same approach as `Modal.tsx`).

### MINOR-19: Game Over Overlay — Missing Winner Sorcerer Float Animation

**Location:** `src/components/game/GameOverOverlay.tsx`
**Expected:** Winner Sorcerer icon has gentle float animation (4px up/down, 2s ease-in-out infinite) plus a strong glow effect (spec section 3.7)
**Actual:** Static icon, no float, no glow.
**Fix:** Add `animate-float-bob` class and team-colored `filter: drop-shadow()` to the SorcererIcon wrapper. `float-bob` should be defined as `translateY` 0 to -4px at 2s ease-in-out infinite.

### MINOR-20: Game Over Overlay — Border Opacity

**Location:** `src/components/game/GameOverOverlay.tsx`
**Expected:** Card border `1px solid rgba(212, 168, 83, 0.25)` (spec section 4.7)
**Actual:** `border-rune-gold/30` = 30% opacity vs. spec's 25%.
**Fix:** Change to `border-rune-gold/25` or use inline style `rgba(212, 168, 83, 0.25)`.

### MINOR-21: Modal Border Opacity

**Location:** `src/components/ui/Modal.tsx`
**Expected:** `1px solid rgba(212, 168, 83, 0.25)` (spec section 4.7)
**Actual:** `border-rune-gold/30` (30% vs 25%).
**Fix:** Change to `border-rune-gold/25`.

### MINOR-22: Modal Entry Animation Easing

**Location:** `src/components/ui/Modal.tsx`
**Expected:** Scale 0.95 to 1.0, opacity 0 to 1, `250ms cubic-bezier(0.16, 1, 0.3, 1)` (spec section 4.7)
**Actual:** Uses `animate-in fade-in duration-400` — this is a Tailwind `animate-in` utility. The duration is 400ms (matching backdrop spec) but the modal card itself should be 250ms. Scale animation is absent.
**Fix:** Apply separate animation to the card div: `animate-in fade-in zoom-in-95 duration-250` using the spring easing (`ease: cubic-bezier(0.16, 1, 0.3, 1)`).

### MINOR-23: Piece Scale — Troll

**Location:** `src/components/game/PieceIcons.tsx`, `Piece.tsx`
**Expected:** Troll renders at `32x32px` (spec section 1.4)
**Actual:** `TrollIcon` defaults to `size=32` but `Piece.tsx` calls `TrollIcon` with `size={28}` — 4px short.
**Fix:** Change `<TrollIcon color={hexColor} size={28} />` to `<TrollIcon color={hexColor} size={32} />` in `Piece.tsx`.

### MINOR-24: Piece Scale — Sorcerer

**Location:** `src/components/game/Piece.tsx`
**Expected:** Sorcerer at `32x32px` (spec section 1.4)
**Actual:** `SorcererIcon` is called with `size={28}` — 4px short.
**Fix:** Change `<SorcererIcon color={hexColor} size={28} />` to `<SorcererIcon color={hexColor} size={32} />`.

### MINOR-25: Piece Sizing vs. Cell Width (65% Rule)

**Location:** `src/components/game/Piece.tsx`, `GameBoard.tsx`
**Expected:** Piece SVG = 65% of cell width (spec section 3.2)
**Actual:** The board is `min(70vh, 70vw, 560px)`. At 560px, each cell is 560/9 ≈ 62px. 65% of 62px = ~40px. Troll and Sorcerer at 32px = 52% of cell width. Dwarf and Rock at 24px = 39% of cell width.
**Fix:** Size piece icons dynamically to 65% of the computed cell width. Since cell size varies, use a CSS approach: set the containing `<div>` to `w-full h-full` and use `style={{ width: '65%', height: '65%' }}` on the SVG, or compute sizes based on board dimensions. Alternatively, set fixed sizes of ~40px for Troll/Sorcerer and ~36px for Dwarf/Rock at the 560px board size.

### MINOR-26: Piece Hover Scale

**Location:** `src/components/game/Piece.tsx`
**Expected:** Hovered own piece scales to `1.08` (spec section 3.2)
**Actual:** `scale-108` class is used, but `scale-108` does not exist in Tailwind's default scale utilities (scale goes `100`, `105`, `110`). This class silently does nothing.
**Fix:** Remove `scale-108` and use an inline style: `style={{ transform: 'scale(1.08)' }}` in the hover branch, or add `scale-[1.08]` using Tailwind's arbitrary value syntax.

### MINOR-27: Piece Hover Transition Easing

**Location:** `src/components/game/Piece.tsx`
**Expected:** Hover scale with `150ms ease-out` (spec section 1.6 / 5.1)
**Actual:** `transition-transform duration-150` — default easing is `ease` (ease-in-out cubic), not `ease-out`.
**Fix:** Add `ease-out` to the transition class: `transition-transform duration-150 ease-out`.

### MINOR-28: AI Thinking Indicator — Wrong Animation

**Location:** `src/components/game/AIThinkingIndicator.tsx`
**Expected:** Three dots with sequential fade from 0.3 to 1.0 opacity, `1.5s` loop, `500ms` stagger (spec section 4.9)
**Actual:** `animate-bounce` is used — a vertical bounce animation, not an opacity fade.
**Fix:** Replace `animate-bounce` with the `animate-pulse-glow` class (already defined in globals.css, 0.5 to 1.0 opacity, 1.5s ease-in-out infinite) or define a new `ai-thinking-dot` animation with sequential opacity fade and stagger.

### MINOR-29: AI Thinking Indicator — Dot Size

**Location:** `src/components/game/AIThinkingIndicator.tsx`
**Expected:** Dots `4px` diameter (spec section 4.9)
**Actual:** `w-1.5 h-1.5` = 6px.
**Fix:** Change to `w-1 h-1` (4px).

### MINOR-30: AI Thinking Indicator — Dot Gap

**Location:** `src/components/game/AIThinkingIndicator.tsx`
**Expected:** `6px` dot spacing (spec section 4.9)
**Actual:** `gap-1` = 4px.
**Fix:** Change to `gap-1.5` (6px).

### MINOR-31: AI Thinking Indicator — Placement

**Location:** `src/app/game/page.tsx`
**Expected:** AI thinking animation is inline with the turn banner text (spec section 3.2 and 4.9: "Inline with turn banner text")
**Actual:** The `AIThinkingIndicator` is a separate floating badge positioned `absolute top-6 right-6` in the board area. There is also an inline `(AI) is thinking...` span in `TurnBanner.tsx` that uses `animate-pulse-glow` on the text.
**Finding:** The spec calls for a single inline indicator in the turn banner, not a separate floating badge. The current approach doubles up the AI indicator.
**Fix:** Remove the `AIThinkingIndicator` component from `game/page.tsx`. The in-banner "(AI) is thinking..." text with pulse animation in `TurnBanner.tsx` is closer to spec, though it should be enhanced to show the three-dot sequence as the primary indicator.

### MINOR-32: Player Status Card — Piece Mini-Icons Missing

**Location:** `src/components/game/PlayerStatus.tsx`
**Expected:** Team icon area shows miniature 16px icons of each alive piece (spec section 3.2 / 4.4)
**Actual:** No piece mini-icons are rendered. The card only shows the team name and AI badge.
**Fix:** Import `TrollIcon`, `DwarfIcon`, `SorcererIcon` from `PieceIcons.tsx`. Derive the alive pieces for each player from `useGameStore`. Render them at `size={16}` with `4px` gap between them. Dead piece mini-icons should appear at 0.25 opacity with a strike-through line.

### MINOR-33: Player Status Card — Active Turn Shimmer

**Location:** `src/components/game/PlayerStatus.tsx`
**Expected:** Active turn: left color bar has a subtle left-to-right shimmer animation (`3s` linear infinite) (spec section 4.4)
**Actual:** `animate-pulse-glow` is used on the color bar, which is an opacity pulse (0.5 to 1.0). This is incorrect per spec — the spec calls for a shimmer (moving highlight), not an opacity pulse.
**Fix:** Define a `shimmer` keyframe with a moving `linear-gradient` (background-position animation). Replace `animate-pulse-glow` on the color bar with `animate-shimmer`.

### MINOR-34: First Player Select Height

**Location:** `src/app/page.tsx`
**Expected:** The spec describes the dropdown as a styled select matching stone tablet aesthetic with Carved Stone background, Parchment text, Rune Gold 30% border (spec section 3.1). Height is not explicitly specified but the surrounding buttons are 48px.
**Actual:** `h-10` = 40px. The `focus:outline-none focus:border-rune-gold/60` focus style replaces the spec's standard `outline: 2px solid #F0D078; outline-offset: 2px` focus indicator.
**Fix:** Change `h-10` to `h-12` (48px) for consistency with other interactive elements. Restore the standard focus ring: `focus:outline-none focus:ring-2 focus:ring-rune-gold-bright focus:ring-offset-0`.

### MINOR-35: Throw Direction Arrow Shadow

**Location:** `src/components/game/ThrowDirectionPicker.tsx`
**Expected:** Available direction shadow: `0 2px 8px rgba(249, 115, 22, 0.3)` (spec section 4.1 direction arrow button)
**Actual:** `shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.3)]` — uses black shadow, not the specified orange-tinted shadow.
**Fix:** Change to `shadow-[0_2px_8px_rgba(249,115,22,0.3)]`.

### MINOR-36: Board Size Calculation

**Location:** `src/components/game/GameBoard.tsx`
**Expected:** Board container = `min(available_height, available_width) - 48px` (24px padding each side) per spec section 2.4
**Actual:** `width: 'min(70vh, 70vw, 560px)'` — uses `70vh`/`70vw` instead of deriving from the center zone's actual available dimensions minus 48px padding. This can result in a board smaller than the spec intends.
**Fix:** Use `calc(min(100vh, 100vw) - 48px)` or derive from the flex container. Consider using CSS container queries or a ResizeObserver to compute the true available dimensions.

### MINOR-37: Board Container — Missing Decorative Arcane Ring

**Location:** `src/components/game/GameBoard.tsx`
**Expected:** The board container has a faint circular decorative border — a thin ring of Rune Gold at 10% opacity with runic tick marks at cardinal and ordinal points (spec section 3.2)
**Actual:** No decorative ring around the board.
**Fix:** Add an absolutely-positioned SVG `<circle>` element as a sibling to the board grid container, centered on the board, with `stroke="rgba(212,168,83,0.1)"` and `stroke-width="1"`. Eight small diamond tick marks can be positioned at 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°.

### MINOR-38: Throw Direction Arrow — Blocked State Missing

**Location:** `src/components/game/ThrowDirectionPicker.tsx`
**Expected:** Blocked direction arrows use `Carved Stone (#2A2A3E)` fill, `Ash` icon at 30% opacity, `not-allowed` cursor, and are not clickable (spec section 3.3 / 4.1)
**Actual:** All four direction arrows are always rendered with `bg-throw-orange` and are always clickable. There is no mechanism to determine or display blocked directions.
**Fix:** The `ThrowDirectionPicker` needs to receive a `blockedDirections: Direction[]` prop, derived from game state (checking whether the throw path in that direction is immediately blocked by the board edge or an immovable piece). Blocked directions render as `bg-carved-stone text-ash/30 cursor-not-allowed pointer-events-none`.

### MINOR-39: SPLUT! Flash Animation Sequence

**Location:** `src/app/globals.css`
**Expected:** SPLUT! is a multi-stage sequence: 0-100ms (Rock arrives), 100-200ms (square flashes red), 200-500ms (SPLUT! text appears, scales from 0.5 to 1.1 to 1.0), 500-600ms (fade out). Total 600ms (spec section 3.6).
**Actual:** `splut-flash` keyframe only handles the background-color flash (`var(--splut-red)` to `transparent`) and `scale(1.2)` to `scale(1)` over 600ms. There is no SPLUT! text overlay element, no camera shake on the board, and no particle burst.
**Fix (multi-part):**
1. Define a `screen-shake` keyframe (spec provides exact values in section 5.3) and apply it to the board container.
2. Create a `SplutEffect` component that renders the "SPLUT!" text overlay (Cinzel Bold 28px, Pure Light, SPLUT Red text-shadow) on the impacted square, with scale animation from 0.5 to 1.1 to 1.0 and rotation from -5deg to 0deg.
3. Add 8-12 particle `<div>` elements (team color of killed Dwarf, 4px, radial burst 40px over 300ms, then fade).

---

## Major Discrepancies

These elements are significantly different from the spec or are entirely absent, causing meaningful divergence from the intended design.

### MAJOR-01: No Tailwind Config File — Missing Design Tokens in Tailwind

**Location:** Project root — no `tailwind.config.ts` exists
**Expected:** The design spec (section 7.4) defines a comprehensive `tailwind.config.ts` extending the theme with all design system tokens, including team color variants (`team.green.DEFAULT`, `team.green.glow`, `team.green.dim`), animation names (`glow-pulse`, `ai-thinking`, `float-bob`, `splut-shake`, `particle-rise`, `dash-flow`), and keyframes.
**Actual:** The project uses Tailwind v4's CSS-based `@theme inline` block in `globals.css`. This approach registers custom CSS variables but does NOT register the named animation utilities (`animate-glow-pulse`, `animate-ai-thinking`, `animate-float-bob`, `animate-splut-shake`, etc.) or team color variants (`team-green-glow`, `team-green-dim`, etc.) that the spec's animation system relies on.

Currently present in `@theme inline`:
- `--color-team-green: var(--team-green)` → enables `text-team-green`, `bg-team-green` but NOT glow/dim variants.
- Animations: only `pulse-glow` and `piece-settle` and `splut-flash` keyframes are defined; the five spec-required animations are missing.

**Fix:** In Tailwind v4, add all missing animations and keyframes directly in `globals.css` using `@keyframes` declarations and add the corresponding `--animate-*` or `animation` class definitions. Also register team color glow/dim variants:
```css
@theme inline {
  --color-team-green-glow: var(--team-green-glow);
  --color-team-green-dim: var(--team-green-dim);
  /* ... repeat for all teams */
  --animate-float-bob: float-bob 2s ease-in-out infinite;
  --animate-splut-shake: splut-shake 300ms ease-out;
  --animate-dash-flow: dash-flow 1s linear infinite;
  /* etc. */
}
```

### MAJOR-02: No Ambient Lobby Particle System

**Location:** `src/app/page.tsx`
**Expected:** 15-20 tiny dust mote particles (Rune Gold at 10-20% opacity, 2-3px diameter) drifting upward, 20s loop, randomized positions (spec section 3.1 / 5.2)
**Actual:** Completely absent. Only the radial gradient background is present.
**Fix:** Add a `LobbyParticles` component or render 18 absolutely-positioned `<div>` elements within the lobby's `overflow-hidden` container. Each particle uses `w-[2px] h-[2px] rounded-full bg-rune-gold/15` with `animate-particle-rise` and unique `animation-delay` values (0s to 20s), randomized `left` positions (0-100vw).

### MAJOR-03: No Game Over Celebration Particle System

**Location:** `src/components/game/GameOverOverlay.tsx`
**Expected:** 20-30 diamond-shaped particles in winner's team color rising from behind the card, continuously spawning while overlay is visible (spec section 3.7 / 5.2)
**Actual:** Absent.
**Fix:** Add 25 rotated `<div>` elements (squares rotated 45deg) in team primary and Rune Gold colors, absolutely positioned at the overlay edges, with `animate-particle-rise` and varied delays. They must be behind the card (lower z-index than card's `relative z-10`).

### MAJOR-04: No SPLUT! Title Assembly Animation (First Launch)

**Location:** `src/app/page.tsx`
**Expected:** On first launch, letters of "SPLUT!" assemble from scattered positions with stone-dust burst effect. Only plays once per session (spec section 5.5)
**Actual:** Static title text.
**Fix (deferred acceptable):** This is the lowest-priority major item as it is an enhancement. Store a `sessionStorage` flag. On first load, render each letter individually with a staggered entrance animation (translate from random offset + scale from 0). Subsequent visits skip the animation.

### MAJOR-05: No SPLUT! Title Pulse Animation

**Location:** `src/app/page.tsx`
**Expected:** Subtle glow pulse on the SPLUT! title (opacity 0.4 to 0.7, 3s ease-in-out infinite) on the text-shadow only (spec section 3.1)
**Actual:** Static text-shadow. The `animate-pulse-glow` animation is defined in globals.css but is NOT applied to the title element.
**Fix:** Wrap the title in a container or define a `splut-title-glow` keyframe that animates `text-shadow` opacity. Note: CSS cannot directly animate `text-shadow` opacity. Instead, animate the text element's `opacity` from 0.85 to 1.0 at 3s ease-in-out infinite, or use a pseudo-element blur layer behind the text.

### MAJOR-06: No Prefers-Reduced-Motion Support

**Location:** `src/app/globals.css` (and all component files)
**Expected:** When `prefers-reduced-motion: reduce` is active, all animations are replaced with instant state changes (0ms), particles disabled, screen shake disabled, SPLUT! text still appears without animation, pieces move instantly (spec section 6.7)
**Actual:** No `@media (prefers-reduced-motion: reduce)` rule exists anywhere in the codebase.
**Fix:** Add to `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Additionally, suppress particle rendering with a CSS class conditionally applied when the media query is matched (detectable via `window.matchMedia` in a React hook).

### MAJOR-07: Missing ARIA Labels — Board Squares

**Location:** `src/components/game/BoardSquare.tsx`
**Expected:** `aria-label="Square E5, contains Green Troll"` or `aria-label="Square E5, empty"` on each square (spec section 6.6)
**Actual:** Only `data-square={square}` is present. No `aria-label`, no `role` attribute.
**Fix:** Add `role="button"` (for interactive squares) or `role="gridcell"` and compute the aria-label from the square key and occupant:
```tsx
aria-label={`Square ${square}${occupantDescription ? `, contains ${occupantDescription}` : ', empty'}`}
```

### MAJOR-08: Missing ARIA Labels — Pieces

**Location:** `src/components/game/Piece.tsx`
**Expected:** Pieces have `role="button"` with `aria-label="Green Troll on E5. Click to select."` (spec section 6.6)
**Actual:** The piece wrapper `<div>` has no ARIA role or label.
**Fix:** Add `role="button"` and `aria-label={`${colorName} ${pieceType} on ${square}. Click to select.`}` to the piece container. The `Piece` component will need to receive the `square` as a prop.

### MAJOR-09: Missing ARIA — Turn Banner Live Region

**Location:** `src/components/game/TurnBanner.tsx`
**Expected:** `role="status"` with `aria-live="polite"` (spec section 6.6)
**Actual:** A plain `<div>`. No `role`, no `aria-live`.
**Fix:** Add `role="status" aria-live="polite"` to the turn banner's root element.

### MAJOR-10: Missing ARIA — Action Log Live Region

**Location:** `src/components/game/ActionLog.tsx`
**Expected:** `role="log"` with `aria-live="polite"` and `aria-atomic="false"` (spec section 6.6)
**Actual:** No ARIA attributes on the log panel.
**Fix:** Add `role="log" aria-live="polite" aria-atomic="false"` to the scrollable log container.

### MAJOR-11: Missing ARIA — Game Over Overlay

**Location:** `src/components/game/GameOverOverlay.tsx`
**Expected:** `role="alertdialog"` with `aria-labelledby` pointing to the "VICTORY" heading (spec section 6.6)
**Actual:** No ARIA attributes on the overlay.
**Fix:** Add `id="victory-heading"` to the h1 element. Add `role="alertdialog" aria-labelledby="victory-heading" aria-modal="true"` to the overlay container.

### MAJOR-12: No ARIA — SPLUT! Assertive Announcement

**Location:** Expected in `src/components/game/BoardSquare.tsx` or a global announcer
**Expected:** When a SPLUT! occurs, an `aria-live="assertive"` region announces "SPLUT! [Team] Dwarf on [square] has been crushed." (spec section 6.6)
**Actual:** No assertive live region exists.
**Fix:** Add a visually-hidden `<div id="splut-announcer" role="alert" aria-live="assertive" aria-atomic="true">` to the game page. When a SPLUT event is detected in the store, update its text content.

### MAJOR-13: No Keyboard Navigation for Board

**Location:** `src/components/game/BoardSquare.tsx`, `GameBoard.tsx`
**Expected:** Tab cycles through own pieces, Enter selects, Arrow keys move focus between valid targets, Escape deselects, Throw picker uses Arrow keys, Enter confirms (spec section 6.4)
**Actual:** Board squares are `<div>` elements with `onClick` handlers but no `tabIndex`, `onKeyDown`, or keyboard interaction. The board is completely inaccessible via keyboard.
**Fix (complex):** Implement keyboard navigation:
1. Add `tabIndex={0}` to each selectable piece's square.
2. Add `onKeyDown` handlers for `Enter` (select/move) and `Escape` (deselect).
3. On piece selection, add `tabIndex={0}` to valid move target squares and use `Arrow key` handlers to cycle focus.
4. In `ThrowDirectionPicker`, add `tabIndex={0}` and `onKeyDown` to direction buttons.

### MAJOR-14: Missing Focus Indicators

**Location:** All interactive elements
**Expected:** `outline: 2px solid #F0D078; outline-offset: 2px` (buttons, toggles, dropdowns, direction arrows), `outline: 2px solid #F0D078; outline-offset: -2px` (board squares) (spec section 6.3)
**Actual:** The `Button.tsx` component uses `rounded-lg` but has no explicit `focus:outline-*` classes. Most interactive elements rely on browser defaults.
**Fix:** Add to `Button.tsx`: `focus-visible:outline-2 focus-visible:outline-rune-gold-bright focus-visible:outline-offset-2`
Add to `globals.css` a global focus-visible rule for board squares and other elements.

### MAJOR-15: Missing `data-testid` Attributes

**Location:** Multiple components
**Expected:** All interactive elements have `data-testid` per the spec's testing convention (spec section 7.8), including `square-{key}`, `piece-{id}`, `throw-{dir}`, `player-count-{n}`, `seat-{seat}`, `player-type-{seat}`, `start-game`, `turn-banner`, `move-counter`, `player-status-{seat}`, `action-log`, `game-over-overlay`, `play-again`.
**Actual:** Only `data-square` is present on `BoardSquare`. All other `data-testid` attributes are missing.
**Fix:** Add `data-testid` attributes systematically:
- `BoardSquare`: add `data-testid={\`square-${square}\`}`
- `Button` (start): add `data-testid="start-game"`
- `PlayerCountSelector` buttons: add `data-testid={\`player-count-${count}\`}`
- `SeatSelector` rows: add `data-testid={\`seat-${config.seat}\`}`
- `PlayerTypeToggle`: add `data-testid={\`player-type-${seat}\`}`
- `TurnBanner`: add `data-testid="turn-banner"`
- `MoveCounter`: add `data-testid="move-counter"`
- `PlayerStatusCard`: add `data-testid={\`player-status-${seat}\`}`
- `ActionLog`: add `data-testid="action-log"`
- `GameOverOverlay`: add `data-testid="game-over-overlay"`
- Play Again button: add `data-testid="play-again"`

### MAJOR-16: Responsive Design — Tablet and Mobile Breakpoints Incomplete

**Location:** `src/app/game/page.tsx`
**Expected:** Four responsive breakpoints: Desktop XL (1440px+) full three-column, Desktop (1024px+) three-column, Tablet (768px+) two-column with horizontal status strip above board, Mobile (<768px) single column with action log hidden behind drawer (spec section 2.3)
**Actual:** Two breakpoints implemented: `hidden lg:flex` for left panel (1024px), `hidden xl:flex` for right panel (1280px). Tablet layout (768-1024px) shows only the board with mobile horizontal status strip below. Action log is completely hidden on non-XL screens with no drawer access.
**Fix:**
1. At tablet (768px): Show board + collapsed action log drawer (button to open).
2. Left panel should convert to horizontal strip above board at tablet, not disappear entirely.
3. At mobile (<768px): Status strip should scroll horizontally per spec — currently implemented but the strip shows `PlayerStatusPanel` which renders `flex-col` cards, not horizontal-optimized cards.

### MAJOR-17: No Custom Scrollbar Styling for Action Log

**Location:** `src/components/game/ActionLog.tsx`
**Expected:** Action log has a custom scrollbar: 4px width, Worn Stone (`#3A3A52`) thumb, Slate Stone (`#1A1A2E`) track, 2px thumb radius, Ash thumb on hover (spec section 4.8)
**Actual:** Uses browser default scrollbar.
**Fix:** Add to `globals.css`:
```css
.action-log-scroll::-webkit-scrollbar { width: 4px; }
.action-log-scroll::-webkit-scrollbar-track { background: var(--slate-stone); }
.action-log-scroll::-webkit-scrollbar-thumb { background: var(--worn-stone); border-radius: 2px; }
.action-log-scroll::-webkit-scrollbar-thumb:hover { background: var(--ash); }
/* Firefox: */
.action-log-scroll { scrollbar-width: thin; scrollbar-color: var(--worn-stone) var(--slate-stone); }
```
Add `action-log-scroll` class to the scrollable div in `ActionLog.tsx`.

### MAJOR-18: No Fade Gradient at Top of Action Log

**Location:** `src/components/game/ActionLog.tsx`
**Expected:** A 16px fade gradient at the top of the log area (Slate Stone to transparent) indicating scrollable content above (spec section 3.8)
**Actual:** Absent.
**Fix:** Add a pseudo-element or a `<div>` positioned absolutely at the top of the scroll container with `h-4 bg-gradient-to-b from-slate-stone to-transparent pointer-events-none`.

### MAJOR-19: Action Log Does Not Log Regular Moves

**Location:** `src/components/game/ActionLog.tsx`
**Expected:** The action log records all game moves: timestamp, player name, piece type, move notation (e.g., "E5 -> E6"), and special events (SPLUT, Throw, Levitate) (spec section 3.2)
**Actual:** The action log only detects and logs SPLUT events (by watching `highlightedSquares` for the `'splut'` value). Regular piece moves, throws, pushes, and levitations produce no log entries.
**Fix (significant):** The game store needs to emit structured action log events. Add a `lastAction` field to `GameState` or a separate `actionLog: ActionLogEntry[]` array to the store. Populate it in `movePiece`, `chooseThrowDirection`. The `ActionLog` component should subscribe to these events and render them.

### MAJOR-20: Throw Direction Picker — Arrow Positioning Is Board-Independent

**Location:** `src/components/game/ThrowDirectionPicker.tsx`
**Expected:** The direction arrows are positioned 60px from the center of the Troll's square (spec section 3.3). The picker should be centered on the Troll's specific square.
**Actual:** The picker is centered on the entire board area (`flex items-center justify-center` on `absolute inset-0`). While the spec says "centered on the Troll's square," the current approach centers the four arrows on the board's visual center. For a board that has the Troll near an edge, the arrows will appear misaligned with the Troll.
**Fix:** Compute the Troll square's pixel position within the board container (using `gridCol`/`gridRow` and cell size), then absolutely position the four arrow buttons relative to that computed center point.

---

## Advisory Notes

These items are not spec violations but represent considerations for quality and future-proofing.

### ADVISORY-01: Tailwind v4 vs. Spec's v3 Configuration

The spec references a `tailwind.config.ts` with `theme.extend` which is the v3 API. The implementation correctly uses Tailwind v4's CSS-first `@theme inline` approach. This is an acceptable modern equivalent, but the spec's named animation utilities and team glow/dim color variants must be explicitly registered in `globals.css` to be available.

### ADVISORY-02: Player Status Panel in Mobile Strip

The `PlayerStatusPanel` component is reused in both the desktop left column and the mobile bottom strip with identical layout (`flex-col gap-2 w-60`). On mobile, this means the horizontal strip actually renders a vertical column of full-width cards, which overflows. The mobile strip should use a `flex-row` layout with compressed card designs.

### ADVISORY-03: Game Screen Missing Background Board Gradient

The game screen correctly applies a radial gradient (`Slate Stone to Obsidian`), but the spec specifies the gradient center should be at the board's position (`50% 45%`). The current implementation uses `50% 45%` which is close — this is acceptable.

### ADVISORY-04: Piece Stroke Uses Brightness Adjustment, Not Pre-defined Dim Color

`adjustBrightness(color, 0.7)` is used for piece stroke, which mathematically approximates the "70% brightness" spec. This produces slightly different results than using the team dim colors (e.g., Green dim `#166534` vs. `adjustBrightness('#22C55E', 0.7)` = `#178f41`). The spec says "darker variant at 70% brightness" rather than specifying the exact dim tokens for this use. The current approach is reasonable.

### ADVISORY-05: Rock Icon Receives No `color` Prop

`RockIcon` has a different interface (no `color` prop, only `size`). It uses `var(--rock-granite)` via CSS variable. This is spec-compliant since Rock is a neutral piece, but the interface inconsistency with other icons (which take `color`) may cause future confusion.

### ADVISORY-06: `PlayAgain` and `resetGame` Both Navigate to Lobby

`GameOverOverlay.tsx` wires both the "PLAY AGAIN" button and "Return to Lobby" link to `resetGame`, which returns to the lobby. The spec envisions "Play Again" as returning to lobby to configure another game, and "Return to Lobby" as a separate action. Functionally identical is acceptable if the lobby allows reconfiguration, which it does.

### ADVISORY-07: No Lobby Entry/Exit Transitions

**Expected:** Lobby fades in over 400ms with title scaling from 0.9 to 1.0 on entry. Exit scales down to 0.95 and fades over 300ms (spec section 3.1).
**Actual:** No page-level transitions.
**Fix (low priority):** Implement using CSS animation on mount/unmount of the lobby container.

### ADVISORY-08: Seat Color Dot Size

The seat color dot in `SeatSelector.tsx` is `w-3 h-3` (12px). The spec says 12px circle — this is correct.

---

## Prioritized Correction Checklist

Work in this order for maximum impact per effort:

### Priority 1 — Accessibility (Required for Any Public Release)

1. Add `role="status" aria-live="polite"` to TurnBanner
2. Add `role="log" aria-live="polite" aria-atomic="false"` to ActionLog container
3. Add `role="alertdialog" aria-labelledby="victory-heading" aria-modal="true"` to GameOverOverlay
4. Add `aria-label` to all board squares (MAJOR-07)
5. Add `role="button" aria-label="..."` to Piece components (MAJOR-08)
6. Add assertive SPLUT! announcer (MAJOR-12)
7. Add `focus-visible:outline` to Button, Toggle, Select, Direction arrows (MAJOR-14)
8. Add `@media (prefers-reduced-motion: reduce)` block (MAJOR-06)

### Priority 2 — Functional Completeness

9. Fix `scale-108` → `scale-[1.08]` for piece hover (MINOR-26) — currently silently broken
10. Fix `text-lg` for Troll/Sorcerer sizes to `size={32}` (MINOR-23, MINOR-24)
11. Fix Action Log to record all move types, not just SPLUT! (MAJOR-19) — log is nearly empty during normal play
12. Add blocked direction detection to ThrowDirectionPicker (MINOR-38)
13. Add piece mini-icons to PlayerStatusCard (MINOR-32)
14. Add all missing `data-testid` attributes (MAJOR-15)

### Priority 3 — Visual Polish (High Visibility)

15. Add lobby particle system (MAJOR-02)
16. Fix AI Thinking dot animation — replace `animate-bounce` with opacity fade (MINOR-28)
17. Fix AI Thinking dot size (MINOR-29) and gap (MINOR-30)
18. Fix AI Thinking indicator placement — remove floating badge, use inline in banner (MINOR-31)
19. Fix seat row appearance animation (MINOR-08)
20. Fix SPLUT! title pulse animation (MAJOR-05)
21. Add action log entry slide-in animation (MINOR-15)
22. Add game over overlay entrance animation (MINOR-17)
23. Add game over winner float animation (MINOR-19)
24. Add custom action log scrollbar (MAJOR-17)
25. Add action log top fade gradient (MAJOR-18)

### Priority 4 — Spec Precision

26. Fix button gradient direction 135deg (MINOR-01)
27. Add button default and pressed shadows (MINOR-02, MINOR-04)
28. Fix button hover shadow values (MINOR-03)
29. Fix PlayerTypeToggle dimensions to 56x28px with flanking labels (MINOR-09)
30. Fix PlayerTypeToggle spring easing (MINOR-09)
31. Fix TurnBanner player name font size H2 (MINOR-11)
32. Fix throw arrow shadow color (MINOR-35)
33. Fix player status card shimmer vs. pulse animation (MINOR-33)
34. Add board decorative arcane ring (MINOR-37)
35. Fix board size calculation per spec formula (MINOR-36)
36. Register all missing Tailwind animation utilities in globals.css (MAJOR-01)
37. Add game over celebration particles (MAJOR-03)

### Priority 5 — Responsive and Tablet Layout

38. Implement tablet (768-1024px) two-column layout with action log drawer (MAJOR-16)
39. Implement mobile-optimized horizontal player status strip (MAJOR-16)

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Compliant elements | 22 areas |
| Minor Discrepancies | 39 items |
| Major Discrepancies | 20 items |
| Advisory Notes | 8 items |
| **Total Issues** | **59** |

The implementation is approximately **55-60% spec-compliant** at a visual level and approximately **40% complete** when accessibility and animation requirements are included. The color system, layout skeleton, and basic interactive states are solid. The primary gaps are in: animation completeness, accessibility, the action log's functional scope, and particle/delight systems.

---

## Re-Review After Fixes

**Date:** 2026-03-03
**Reviewer:** Design QA Expert
**Spec Version:** 1.0 (DESIGN_SPEC.md)
**Status:** CONDITIONAL PASS — Significant improvement across all categories. All 20 original major items addressed; 7 new residual issues found. Accessibility, animation, and core delight systems are now substantially in place.

---

### Verification of Previously Reported Majors

The following items from the original MAJOR list were reported as fixed. Each has been verified against the current source files.

---

**MAJOR-01 (Tailwind animation utilities) — RESOLVED**
All five originally missing animations are now registered in `globals.css` `@theme inline` block:
`--animate-float-bob`, `--animate-splut-shake`, `--animate-ai-thinking`, `--animate-particle-rise`, `--animate-dash-flow`, plus `--animate-shimmer`, `--animate-title-pulse`, `--animate-celebration-rise`, `--animate-slide-down`, `--animate-slide-in-right`, `--animate-game-over-entrance`. All corresponding `@keyframes` are defined. Team glow and dim color variants are also now registered (e.g. `--color-team-green-glow`). Full resolution confirmed.

---

**MAJOR-02 (Lobby particle system) — RESOLVED**
`LobbyParticles` component is implemented inline in `src/app/page.tsx`. 18 particles (within the spec's 15-20 range), `2-3px` size range with `Math.random()`, `bg-rune-gold/15` (spec: 10-20% opacity), `animate-particle-rise` with `animationDelay` up to 20s. Renders `absolute inset-0 overflow-hidden pointer-events-none`. Full resolution confirmed.

One residual note: particles are memoized via `useMemo` which means position values are fixed on first render — this is correct and matches the spec's "randomized start positions" intent.

---

**MAJOR-03 (Game over celebration particles) — RESOLVED**
`CelebrationParticles` component is implemented in `src/components/game/GameOverOverlay.tsx`. 25 particles (within spec's 20-30 range). Sizes `4-8px` (spec: 4-8px) via `4 + Math.random() * 4`. Colors alternate between `var(--rune-gold)` and `teamColor` (spec: winning team color and Rune Gold). Diamond shape via `transform: 'rotate(45deg)'`. Duration varies `2-4s` (spec: 3-5s — slight shortfall; see RES-01 below). Z-index `z-[5]` below card's `z-10`. Full resolution confirmed with one minor note.

---

**MAJOR-04 (Title assembly animation) — RESOLVED**
`sessionStorage` flag `splut-title-seen` is implemented. On first visit, each letter of "SPLUT!" is wrapped in `<span className="inline-block">` with `animation: title-assemble 400ms cubic-bezier(0.16, 1, 0.3, 1) both` and `animationDelay: ${i * 100}ms` stagger. The `title-assemble` keyframe is defined in `globals.css` (translateY -20px + scale 0.5 entry). After session flag is set, no animation runs. Full resolution confirmed.

---

**MAJOR-05 (Title pulse animation) — RESOLVED**
`animate-title-pulse` class is applied to the `<h1>` in `src/app/page.tsx`. The `title-pulse` keyframe correctly animates text-shadow opacity between `rgba(212,168,83,0.4)` and `rgba(212,168,83,0.7)` on a 3s ease-in-out infinite loop. This matches spec section 3.1 exactly. Full resolution confirmed.

---

**MAJOR-06 (prefers-reduced-motion) — RESOLVED**
`@media (prefers-reduced-motion: reduce)` block is present in `globals.css` and correctly sets `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important`, and `transition-duration: 0.01ms !important` on `*, *::before, *::after`. Full resolution confirmed.

---

**MAJOR-07 (aria-label on board squares) — RESOLVED**
`BoardSquare.tsx` now computes `ariaLabel` from `occupantLabel` prop and applies it as `aria-label` on the root `<div>`. Format matches spec: `"Square ${square}, contains ${occupantLabel}"` or `"Square ${square}, empty"`. `role="gridcell"` is also applied. Full resolution confirmed.

---

**MAJOR-08 (aria-label on pieces) — RESOLVED**
`Piece.tsx` applies `role="button"` with `aria-label={`${colorName} ${playerPiece.type} on ${square}. Click to select.`}` on player pieces. Rock pieces use `role="img"` with `aria-label={`Rock on ${square}`}`. Full resolution confirmed.

---

**MAJOR-09 (TurnBanner role=status) — RESOLVED**
`TurnBanner.tsx` root `<div>` carries `role="status"` and `aria-live="polite"`. `data-testid="turn-banner"` is also present. Full resolution confirmed.

---

**MAJOR-10 (ActionLog role=log) — RESOLVED**
`ActionLog.tsx` root `<div>` carries `role="log"`, `aria-live="polite"`, and `aria-atomic="false"`. `data-testid="action-log"` is also present. Full resolution confirmed.

---

**MAJOR-11 (GameOverOverlay role=alertdialog) — RESOLVED**
`GameOverOverlay.tsx` root `<div>` carries `role="alertdialog"`, `aria-labelledby="victory-heading"`, `aria-modal="true"`. The h1 element has `id="victory-heading"`. `data-testid="game-over-overlay"` is present. Full resolution confirmed.

---

**MAJOR-12 (SPLUT! assertive announcer) — RESOLVED**
An assertive announcer `<div id="splut-announcer" role="alert" aria-live="assertive" aria-atomic="true">` is present in `GameBoard.tsx`. It watches `game.lastSplutSquare` and populates the message `"SPLUT! A Dwarf on ${lastSplutSquare} has been crushed."` with a 3000ms auto-clear. `className="sr-only"` keeps it visually hidden. Full resolution confirmed.

Note: the spec's exact wording requires `[Team] Dwarf` (including team name). The current message omits the team name. This is a minor gap — see RES-02.

---

**MAJOR-13 (Keyboard navigation) — RESOLVED**
`GameBoard.tsx` implements a `handleSquareKeyDown` callback with `Enter`/`Space` (select/move), `Escape` (clear selection), and arrow key navigation via `stepInDirection`. `tabIndex` is computed per square (`0` for own pieces and valid targets, `-1` otherwise). `boardRef` is used to focus adjacent squares. `ThrowDirectionPicker.tsx` direction buttons include `onKeyDown` for `Enter`/`Space`. Full resolution confirmed.

---

**MAJOR-14 (Focus indicators) — RESOLVED**
`globals.css` defines `.focus-ring:focus-visible` with `outline: 2px solid var(--rune-gold-bright); outline-offset: 2px` and `.focus-ring-inset:focus-visible` with `outline-offset: -2px`. The `focus-ring` class is applied to `Button.tsx`, `ThrowDirectionPicker.tsx` direction buttons, the mobile log toggle button, the back-to-lobby button, the "Return to Lobby" link, and the first-player select. `BoardSquare.tsx` uses `focus-ring-inset`. Full resolution confirmed.

---

**MAJOR-15 (data-testid attributes) — RESOLVED**
Verified across all components: `data-testid="start-game"` on lobby Button, `data-testid="player-count-{n}"` on `PlayerCountSelector` buttons, `data-testid="seat-{seat}"` on `SeatSelector` rows, `data-testid="player-type-toggle"` on `PlayerTypeToggle`, `data-testid="turn-banner"` on `TurnBanner`, `data-testid="move-counter"` on `MoveCounter`, `data-testid="player-status-{seat}"` on each `PlayerStatusCard`, `data-testid="action-log"` on `ActionLog`, `data-testid="game-over-overlay"` on `GameOverOverlay`, `data-testid="play-again"` on Play Again button, `data-testid="throw-{dir}"` on throw picker buttons, `data-testid="piece-{id}"` on `Piece`, `data-testid="square-{square}"` on `BoardSquare`. Full resolution confirmed.

Note: `data-testid` on `PlayerTypeToggle` uses the static value `"player-type-toggle"` rather than `"player-type-{seat}"` as originally specified. Minor gap — see RES-03.

---

**MAJOR-16 (Responsive breakpoints) — RESOLVED**
The game page now implements all four breakpoints:
- Desktop XL (xl, 1280px+): three-column with right panel visible.
- Desktop (lg, 1024px+): left panel visible; right panel hidden.
- Tablet (md-lg, 768-1024px): horizontal player strip via `hidden md:flex lg:hidden`, action log drawer via fixed `xl:hidden` toggle button at bottom-right.
- Mobile (<768px): `md:hidden` horizontal strip below board.
Full resolution confirmed.

---

**MAJOR-17 (Custom scrollbar) — RESOLVED**
`.action-log-scroll` CSS class is defined in `globals.css` with the full webkit scrollbar customization (4px width, Worn Stone thumb, Slate Stone track, 2px border-radius, Ash on hover) and Firefox `scrollbar-width: thin`. The class is applied to the scrollable div in `ActionLog.tsx`. Full resolution confirmed.

---

**MAJOR-18 (Action log top fade gradient) — RESOLVED**
An `absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-stone to-transparent pointer-events-none z-10` div is implemented at the top of the scroll area in `ActionLog.tsx`. This matches the spec's `16px` fade height. Full resolution confirmed.

---

**MAJOR-19 (Action log logs all moves) — RESOLVED**
`ActionLog.tsx` now subscribes to `useGameStore((s) => s.actionLog)`. The `LogEntryRow` component handles `kind` values: `move`, `push`, `throw`, `splut`, `eliminate`, and `win`. SPLUT entries render in Cinzel Bold SPLUT Red. Eliminate and win entries are color-coded. Slide-in animation (`animate-slide-in-right`) is applied to each entry. Full resolution confirmed.

---

**MAJOR-20 (Throw direction picker positioning) — RESOLVED**
`ThrowDirectionPicker` now receives `gridCol`, `gridRow`, `totalCols`, and `totalRows` props. The center position is computed as `((gridCol - 0.5) / totalCols) * 100`% and `((gridRow - 0.5) / totalRows) * 100`%. This correctly places the arrow cluster over the Troll's specific grid square. `GameBoard.tsx` correctly derives `throwPieceGridPos` by iterating `game.pieces` to find the Troll that has a Rock on its square. Full resolution confirmed.

---

### Also-Fixed Minor Items — Verification

**Button gradient 135deg — RESOLVED.** `Button.tsx` uses `style={{ background: 'linear-gradient(135deg, var(--rune-gold), #B8922E)' }}` for the primary enabled state. Confirmed.

**Button shadows (default, hover, pressed) — PARTIALLY RESOLVED.**
- Default shadow `shadow-[0_2px_8px_rgba(0,0,0,0.3)]` is present in the primary non-disabled class string. Confirmed.
- Hover shadow `hover:shadow-[0_4px_16px_rgba(212,168,83,0.3)]` is present. Confirmed.
- Pressed shadow `active:shadow-[0_1px_4px_rgba(0,0,0,0.3)]` is present. Confirmed.
- Hover gradient change (spec: `linear-gradient(135deg, #F0D078, #D4A853)`) is still absent — hover only changes the box-shadow, not the gradient background. See RES-04.

**Piece sizes Troll=32px, Sorcerer=32px — RESOLVED.** `Piece.tsx` now calls `<TrollIcon color={hexColor} size={32} />` and `<SorcererIcon color={hexColor} size={32} />`. Confirmed.

**Piece hover scale(1.08) via inline style — RESOLVED.** `Piece.tsx` uses `style={{ transform: isSelected ? 'scale(1.05)' : isHovered ? 'scale(1.08)' : 'scale(1)' }}`. The broken `scale-108` Tailwind class has been removed. Confirmed.

**AI thinking indicator 3 dots with ai-thinking animation — RESOLVED in TurnBanner.** `TurnBanner.tsx` renders three `<span>` dots with `animate-ai-thinking` and staggered delays of 0ms, 500ms, 1000ms in the team color. Confirmed.

**AI thinking dot size 4px — RESOLVED in TurnBanner.** Dots are `w-1 h-1` (4px). Confirmed.

**AI thinking dot gap 6px — RESOLVED in TurnBanner.** `gap-1.5` (6px) between dots. Confirmed.

**AI thinking inline in TurnBanner — RESOLVED.** The thinking indicator is now rendered inline within `TurnBanner.tsx` as a sibling span to the player name. The original floating badge approach has been removed. Confirmed.

**TurnBanner player name text-2xl — RESOLVED.** The player name span uses `font-display text-2xl font-semibold tracking-[0.02em] leading-[1.3]`. This matches the H2 spec (Cinzel 600 24px, letter-spacing 0.02em, line-height 1.3). Confirmed.

**Move counter tracking-[0.04em] — RESOLVED.** The "Move N of N" span uses `text-xs text-ash tracking-[0.04em] font-semibold`. Confirmed.

**Action log "Battle Log" header text-lg — RESOLVED.** Header uses `font-display text-lg font-semibold tracking-wide text-rune-gold`. Confirmed.

**Action log entry slide-in-right animation — RESOLVED.** Each `LogEntryRow` div carries `animate-slide-in-right`. The keyframe animates from `opacity: 0.6; transform: translateX(8px)` to `opacity: 1; transform: translateX(0)`. Confirmed.

**Action log timestamp 13px mono — RESOLVED.** Timestamp span uses `font-mono text-ash` with `style={{ fontSize: '13px' }}`. Confirmed.

**Game over entrance animation — RESOLVED.** Card div has `animate-game-over-entrance`. The keyframe scales from 0 to 1.05 to 1.0 with overshoot. Confirmed.

**Game over winner float-bob — RESOLVED.** The SorcererIcon wrapper has `animate-float-bob` and `filter: drop-shadow(0 0 12px ${teamColor})`. Confirmed.

**Game over border-rune-gold/25 — RESOLVED.** Card uses `border border-rune-gold/25`. Confirmed.

**PlayerStatus piece mini-icons — RESOLVED.** `PlayerStatus.tsx` renders `TrollIcon`, `DwarfIcon`, and `SorcererIcon` at `size={16}` per alive piece. Dead pieces render at `opacity-25` with a horizontal strike line. Confirmed.

**PlayerStatus shimmer on active color bar — RESOLVED.** Color bar uses `animate-shimmer` on active turn with `backgroundImage: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)` and `backgroundSize: '200% 100%'`. This implements the moving shimmer, not the opacity pulse. Confirmed.

**Seat rows animate-slide-down — RESOLVED.** Each seat row div in `SeatSelector.tsx` carries `animate-slide-down` class with `animationDelay: ${index * 80}ms`. The keyframe `slide-down-in` is registered in globals.css. Confirmed.

**Focus-ring and focus-ring-inset CSS classes — RESOLVED.** Both defined in `globals.css` and applied throughout. Confirmed.

---

### Remaining Issues After Fixes

The following issues were not resolved in this pass, or new issues were introduced during the fix cycle.

---

**RES-01: Celebration Particle Duration Shortfall**
Location: `src/components/game/GameOverOverlay.tsx` — `CelebrationParticles`
Expected: `3-5s` lifespan per particle (spec section 5.2)
Actual: Duration range is `2 + Math.random() * 2` seconds = 2.0-4.0s. The minimum is 1 second below spec.
Fix: Change to `3 + Math.random() * 2` to achieve the specified 3-5s range.
Severity: Minor

---

**RES-02: SPLUT! Announcer Missing Team Name**
Location: `src/components/game/GameBoard.tsx` — `splatAnnouncement`
Expected: `"SPLUT! [Team] Dwarf on [square] has been crushed."` (spec section 6.6)
Actual: `"SPLUT! A Dwarf on ${lastSplutSquare} has been crushed."` — omits the team name.
Fix: The announcer needs to know which team's Dwarf was crushed. This requires the game store to include the eliminated team in `lastSplutSquare` metadata, or store a `lastSplutTeam` field alongside `lastSplutSquare`.
Severity: Minor (accessibility precision)

---

**RES-03: PlayerTypeToggle data-testid Missing Seat Identifier**
Location: `src/components/lobby/PlayerTypeToggle.tsx`
Expected: `data-testid="player-type-{seat}"` (original MAJOR-15 spec)
Actual: `data-testid="player-type-toggle"` (static value, same for all four seats — cannot distinguish between seats in automated tests)
Fix: Thread the `seat` prop into `PlayerTypeToggle` and set `data-testid={`player-type-${seat}`}`. The `SeatSelector` already has the `config.seat` value available to pass down.
Severity: Minor (testability)

---

**RES-04: Button Hover Gradient Absent**
Location: `src/components/ui/Button.tsx` — primary variant hover
Expected: Hover background changes to `linear-gradient(135deg, #F0D078, #D4A853)` (spec section 4.1)
Actual: Hover only adds a box-shadow (`hover:shadow-[0_4px_16px_rgba(212,168,83,0.3)]`); the gradient background does not change on hover. The button lightens slightly via the same gradient, but the spec requires a distinct brighter gradient.
Fix: Add a hover CSS class using `@layer` in globals.css or a CSS custom property swap approach, since Tailwind cannot conditionally apply an arbitrary `linear-gradient` inline style on hover. Example:
```css
.btn-primary:hover {
  background: linear-gradient(135deg, var(--rune-gold-bright), var(--rune-gold)) !important;
}
```
Or use a CSS variable: set `--btn-gradient` in default and override it on hover. Apply the background from the variable.
Severity: Minor (visual polish, perceptible on hover)

---

**RES-05: AIThinkingIndicator Component Is Now Stale/Orphaned**
Location: `src/components/game/AIThinkingIndicator.tsx`
Expected: Not used (the original floating badge pattern was replaced by inline TurnBanner logic per MAJOR-31/MINOR-31 fix)
Actual: The file still exists and still uses `animate-bounce` (the wrong animation) with 6px dots (the wrong size). Although it appears to no longer be imported or rendered anywhere in the active code, the file's continued presence is a maintenance hazard — its incorrect implementation could be accidentally re-introduced.
Fix: Delete `src/components/game/AIThinkingIndicator.tsx` or, if the file must remain, update it to match the spec's sequential opacity-fade pattern (`animate-ai-thinking`, 4px dots, 6px gap) so it is consistent if ever re-activated.
Severity: Advisory (dead code risk)

---

**RES-06: Board Size Formula Still Deviates From Spec**
Location: `src/components/game/GameBoard.tsx`
Expected: Board container = `min(available_height, available_width) - 48px` computed from the center zone's actual dimensions (spec section 2.4)
Actual: `width: 'min(70vh, 70vw, 560px)'` — this was not changed from the original implementation. At a 1440px wide viewport with a 240px left panel and 280px right panel, the center zone is 920px wide. The spec formula would yield a board of `min(~900px, 100vh - banner_height) - 48px`, capped naturally by the cell size target (~560px at 1440px). The `70vw` value at 1440px is 1008px — effectively unconstrained, so the 560px hard cap takes over. At narrower viewports the `70vw` and `70vh` clamps can produce a board that ignores the center zone's actual pixel-available width.
Fix: Use a CSS approach: `width: min(calc(100% - 0px), calc(100vh - 56px - 48px))` on the board container within the flex center zone, relying on the flex container's natural width constraint rather than viewport-based `vw`. The `56px` accounts for the turn banner height.
Severity: Major (layout correctness at non-standard viewports — the original MINOR-36 issue remains open)

---

**RES-07: Dwarf Piece Size Remains 24px (Spec Requires 28px)**
Location: `src/components/game/Piece.tsx`
Expected: Dwarf at `28px` (spec section 1.4)
Actual: `<DwarfIcon color={hexColor} size={24} />` — 4px below spec. This was reported as MINOR-23/24 for Troll and Sorcerer in the original report; those are now fixed. The Dwarf fix was not included in this pass.
Fix: Change `<DwarfIcon color={hexColor} size={24} />` to `<DwarfIcon color={hexColor} size={28} />` in `Piece.tsx`.
Severity: Minor (4px undersize, consistently applied to all Dwarves)

---

### Updated Compliance Assessment

| Category | Original Report | Post-Fix Re-Review | Change |
|----------|---------------|-------------------|--------|
| Major issues | 20 | 1 remaining (RES-06, board size) | -19 resolved |
| Minor issues | 39 | 7 remaining (RES-01 through RES-07) | -32 resolved |
| Advisory notes | 8 | 1 (RES-05 dead file) | -7 resolved |
| data-testid coverage | ~10% | ~95% | significant improvement |
| Accessibility (ARIA) | 0/6 items | 6/6 items | fully addressed |
| Animation system | ~30% complete | ~85% complete | significant improvement |
| Particle systems | 0/2 | 2/2 | fully addressed |
| Responsive breakpoints | partial | all 4 implemented | fully addressed |

**Updated compliance estimate: approximately 90-92% spec-compliant**, up from 55-60% in the initial review.

The remaining 8-10% gap consists of:
- 1 open major item: board size formula (RES-06)
- 7 minor items: particle duration (RES-01), SPLUT announcer copy (RES-02), testid precision (RES-03), button hover gradient (RES-04), dead AIThinkingIndicator file (RES-05), Dwarf size (RES-07)
- Deeper delight features still unimplemented per original spec that were not in scope for this fix pass: the arcane board decoration ring (MINOR-37), SPLUT! text overlay component and particle burst (MINOR-39), levitation orbiting rune circles (spec section 3.4), lobby entry/exit transitions (ADVISORY-07), board coordinate labels (section 4.10), and invalid-move feedback flash (spec section 5.1)

### Prioritized Correction Checklist (Post-Fix Pass)

1. Fix Dwarf piece size: `size={28}` in `Piece.tsx` — 5 minutes (RES-07)
2. Fix celebration particle duration: `3 + Math.random() * 2` in `GameOverOverlay.tsx` — 2 minutes (RES-01)
3. Add seat identifier to `PlayerTypeToggle` data-testid — 10 minutes (RES-03)
4. Add team name to SPLUT! announcer — requires store change, ~30 minutes (RES-02)
5. Add button hover gradient via CSS class — 15 minutes (RES-04)
6. Fix board size formula using CSS `min()` with container-relative units — 20 minutes (RES-06)
7. Delete or correct `AIThinkingIndicator.tsx` dead file — 5 minutes (RES-05)
