# RungtaStudentXchange — Design System

This is the design language every future page/component is built from.
No page layout, navigation, or branding lives here — just tokens and
reusable low-level UI classes.

## Files

| File | Purpose |
|---|---|
| `tailwind.config.js` | Token definitions: colors, type scale, spacing, radius, shadows, z-index, motion, breakpoints |
| `src/styles/tokens.css` | CSS custom properties for light/dark themes, consumed by `tailwind.config.js` |
| `src/styles/index.css` | Base layer (resets, accessibility, scrollbar) + reusable component classes (`.btn-*`, `.input`, `.card`, ...) |
| `src/store/themeStore.js` | Zustand store for theme preference (`light` / `dark` / `system`), persisted to localStorage |
| `src/components/theme/ThemeProvider.jsx` | Applies the resolved theme to `<html>`, listens for OS changes |

## Color palette

Colors are defined as CSS variables (`rgb r g b` triples) in `tokens.css`,
one set for `:root` (light) and one for `.dark`, then wired into Tailwind
via `rgb(var(--x) / <alpha-value>)`. This means:

- Every `bg-*`/`text-*`/`border-*` utility automatically follows the
  active theme — no `dark:` prefix needed on every element.
- Opacity modifiers still work (`bg-primary/10`, `text-danger/60`).
- Switching themes is a single class toggle on `<html>`; nothing re-renders.

| Role | Light | Dark | Notes |
|---|---|---|---|
| `background` | `#F8FAFC` (slate-50) | `#0B101E` | Soft, not stark white / not pure black |
| `surface` | `#FFFFFF` | `#141B2E` | Cards, one step lighter than bg in both themes |
| `primary` | indigo-600 `#4F46E5` | indigo-400 `#818CF8` | Deep Indigo brand color; lighter in dark mode to hold contrast |
| `accent` | emerald-600 `#059669` | emerald-400 `#34D399` | Emerald, used sparingly for secondary CTAs/highlights |
| `success` | green-600 `#16A34A` | green-400 | Deliberately a truer green than `accent`'s teal-emerald, so state and brand never look interchangeable |
| `warning` | amber-600 `#D97706` | amber-400 | |
| `danger` | red-600 `#DC2626` | red-400 | |
| `gray` scale | slate 50–950 | — | Neutral, slightly cool/blue-leaning for a professional feel |

Full 50–900 scales for `primary` and `accent` are available (e.g. `bg-primary-100`)
for tints/badges beyond the semantic `DEFAULT`/`hover`/`subtle` tokens.

## Typography

- **Display** (`font-display` → Plus Jakarta Sans): headings only. Slightly
  rounder/friendlier geometry than the body face — reads as approachable
  ("student-friendly") without giving up structure.
- **Sans** (`font-sans` → Inter, default): body copy, forms, all dense UI
  text. Chosen for legibility at small sizes across long listing pages.
- **Mono** (`font-mono` → JetBrains Mono): prices, order IDs, timestamps —
  anywhere tabular figures matter.

Semantic size aliases (use these instead of raw `text-2xl` etc. when the
text is playing one of these roles):

`text-display-1`, `text-display-2`, `text-h1`…`text-h6`, `text-body-lg`,
`text-body`, `text-body-sm`, `text-caption`, `text-overline`.

Each alias bundles its own line-height / letter-spacing / weight, so e.g.
`text-h3` is always the same weight and tracking everywhere it's used.

## Spacing

Tailwind's default 4px-based scale, extended with a few values that come
up often in dense card/list layouts: `4.5` (18px), `13`, `15`, `18`, `88`,
`128`.

## Radius

`none → xs(4px) → sm(6px) → DEFAULT(8px) → md(10px) → lg(12px) → xl(16px)
→ 2xl(20px) → 3xl(24px) → full`.

Convention: buttons/inputs use `lg` (12px), cards use `xl` (16px), modals
use `2xl` (20px) — cards and modals read as a level "softer" than the
tighter, clickable controls inside them.

## Elevation (shadows)

`shadow-xs/sm/md/lg/xl` plus semantic `shadow-card`, `shadow-card-hover`,
`shadow-popover`. Built from a shared `--shadow-color` variable.

**Dark mode note:** a black drop shadow is nearly invisible — and looks
muddy — on a dark background. Rather than fighting that, dark mode leans
on `--color-surface` being a step lighter than `--color-bg` plus a
hairline border to communicate elevation; shadow alpha stays very low.
This is the same approach Material dark themes use (lighter surface =
higher elevation, not a stronger shadow).

## Z-index scale

Named layers instead of ad hoc numbers, so stacking order is decided once:

```
dropdown(1000) → sticky(1100) → fixed(1200) → overlay(1300)
→ modal(1400) → popover(1500) → tooltip(1600) → toast(1700)
```

## Motion

Durations: `duration-fast`(120ms) `duration-base`(180ms) `duration-slow`(250ms) `duration-slower`(400ms)
Easings: `ease-standard`, `ease-decelerate`, `ease-accelerate`, `ease-emphasized`

`prefers-reduced-motion: reduce` collapses all animation/transition
durations to ~0 globally (see `index.css` base layer) — no component
needs to handle this itself.

## Breakpoints (mobile-first)

`xs(480px) sm(640px) md(768px) lg(1024px) xl(1280px) 2xl(1440px)`

All Tailwind breakpoints are `min-width` — design for the smallest
screen first, then layer on `sm:`/`md:`/... overrides going up.

## Reusable UI tokens (`src/styles/index.css` → `@layer components`)

Buttons: `.btn-primary` `.btn-secondary` `.btn-ghost` `.btn-accent`
`.btn-danger` `.btn-danger-ghost` (+ `.btn-sm` / `.btn-lg` size modifiers)

Forms: `.input` `.textarea` `.select` `.field-label` `.field-hint`
`.field-error` `.input-error`

Feedback: `.badge-neutral` `.badge-primary` `.badge-accent`
`.badge-success` `.badge-warning` `.badge-danger`

Surfaces: `.card` `.card-hover` `.card-padded`, `.modal-overlay`
`.modal-panel`, `.popover-panel`, `.toast` (skins react-hot-toast, wired
in `App.jsx`), `.divider`

These are CSS classes only — no React component markup yet. Actual
`<Button />`, `<Input />`, etc. components come in a later module and
will be thin wrappers around these classes, so behavior (loading states,
icons, etc.) and styling stay decoupled.

## Accessibility

- **Contrast:** every semantic color's `DEFAULT`/`hover` shade was picked
  from the 600–700 step (light) / 300–400 step (dark) specifically to
  hold AA contrast against `surface`/`background`.
- **Focus:** `:focus-visible` (not `:focus`) gets a visible ring
  (`ring-2 ring-ring ring-offset-2`) globally, on every interactive
  element — so it only shows for keyboard navigation, never mouse clicks.
- **Reduced motion:** respected globally, see Motion above.
- **Theme switching:** driven by CSS variables + a class toggle, so it
  never triggers a reload and doesn't fight prefers-reduced-motion (no
  motion is used in the switch itself).

## Theme system

- `useThemeStore` (zustand + `persist`) holds `theme: "light" | "dark" | "system"`.
- `ThemeProvider` (mounted once in `App.jsx`) resolves `"system"` against
  `prefers-color-scheme`, applies the `dark` class to `<html>`, and keeps
  listening for OS-level changes while on `"system"`.
- An inline script in `index.html` reads the same localStorage key
  before React mounts, so first paint is never the wrong theme (no
  flash).
- Nothing to toggle yet — a `ThemeToggle` UI control is intentionally
  not built in this task (that's page UI); once one exists it just needs
  to call `useThemeStore.getState().setTheme(...)`.
