# Design

## Theme
Dark, warm, tactile. A dim café at night: deep espresso surfaces, a single brass-gold
accent that behaves like reflected light on metal, cream ink. Identity is preserved
from the original brief (committed brand colors below) — refined, not replaced.

Color strategy: **Restrained** (product floor) — tinted-neutral espresso surfaces +
one gold accent reserved for primary actions, current selection, and state.

## Color (OKLCH)
Committed brand anchors kept from the original build:
- `--espresso` body  `#140C05`  → oklch(0.18 0.018 60)
- surface / raised   `#1C130A` / `#241809` (a second, warmer panel layer)
- hairline borders   cream @ 8–14% — never a solid colored side-stripe
- `--gold` accent    `#C8963A`  → oklch(0.72 0.11 75); hover `#E0B968`, press `#A2762A`
- `--cream` ink      `#F0E4CC`  (primary text, ≥9:1 on espresso)
- `--cream-dim` `#CDBEA1` for secondary text (≥4.5:1) — replaces the old too-faint mutes
- semantic: success = gold, danger = `#E0654F`, focus ring = gold @ 55%

Contrast was the #1 readability bug before: secondary text is now `cream-dim`
(AA) instead of `cream-mute` for anything users must read.

## Typography
Product rule: one workhorse family. **Inter** carries UI, labels, data, body at a
fixed rem scale (no fluid clamp in-app). **Fraunces** (serif) is reserved for the
wordmark and large page titles only — a touch of journal character, never on labels,
buttons, or data. Scale ratio ~1.2. Tabular numbers for scales, doses, timers.

## Components
- **Full-screen form routes** instead of modals (`/beans/new`, `/recipes/:id/edit`, …).
  Sectioned, scrollable, sticky save bar — easy one-thumb entry mid-brew.
- Lists over card-grids; rows with clear leading identity (no side-stripe).
- Buttons: solid gold primary, hairline-ghost secondary, quiet subtle. Every control
  has default / hover / focus-visible / active / disabled / loading.
- Sliders for 1–5 tasting scores; radar for profiles.
- Skeleton loaders, teaching empty states, inline errors.

## Layout
Mobile-first single column, max-width ~32rem, generous vertical rhythm. Bottom tab
bar (Home · Beans · Recipes · Brews) with safe-area insets. Sticky top bar carries
the wordmark, language toggle, and account.

## Motion
150–250ms, ease-out. Conveys state only: press feedback, sheet/route transitions,
list item stagger on first paint, toast. Full `prefers-reduced-motion` fallback.

## Internationalization
Thai (default) + English, toggled in the top bar, persisted. All copy flows through a
`t()` dictionary; no string is hard-coded in components.
