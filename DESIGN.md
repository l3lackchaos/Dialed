# Design

## Theme
Light, bright, tactile. A Nordic-minimal specialty bar at 9am: clean cool-paper
surfaces, near-black ink, and one deep **olive "origin" green** accent. Deliberately
*not* the espresso-dark-and-gold coffee reflex, and *not* a beige/parchment near-white
(the AI default) — warmth is carried by the accent and the Fraunces serif, never by a
tinted body bg.

Color strategy: **Restrained** (product floor) — cool-neutral paper surfaces + one
olive accent reserved for primary actions, current selection, and state.

> Token names in code are historical (`espresso` / `cream` / `gold`); they now map to
> light surfaces / ink / olive accent so the palette swap stays centralized.

## Color
- body `#F2F1EC` · cards `#FFFFFF` · fields/insets `#ECEBE4` (cool-neutral, near chroma 0)
- ink `#23241D` (~14:1 on white) · secondary `#55564C` (AA ~7:1) · tertiary `#888577`
- accent olive `#47632F` (~5.3:1 on white); hover `#5C7C43`, press `#37501F`
- hairline borders: ink @ 10% — never a solid colored side-stripe
- danger `#BC3B2C`; focus ring olive @ 70%
- Multi-bean radar hues: olive, rust, teal, ochre, plum — all AA on white.

Light mode chosen deliberately (scene: brewing by a sunlit window), not "to be safe".
Was previously a dark espresso/gold theme; swapped wholesale on request.

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
