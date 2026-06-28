# Themeable UI Redesign — Design

**Date:** 2026-06-27
**Status:** Approved (pending spec review)
**Scope:** Visual/UX rebuild of the `src/ui/` layer only. No changes to `core/`, `data/`, or `tts/`. No changes to app behavior, flow, or mechanics.

## Summary

Rebuild the Thai Trainer UI with a playful, Duolingo-style aesthetic on a
distinctive **Thai Temple (gold & deep red)** brand. The app must be
**themeable from day one**: all visual values flow from semantic design tokens
so that adding a new theme later is a single-file job with no component changes.
The first and default theme is "Temple".

This is a re-skin, not a re-architecture of behavior. Every existing component
keeps its props, logic, hooks, and behavior; only markup and styling change.

## Goals

- Playful, motivating, Duolingo-style feel (bold rounded shapes, "3D" buttons,
  celebratory feedback animations, friendly empty states).
- A complete, swappable theme system; "Temple" ships first, more themes later.
- Mobile-first PWA layout with a fixed bottom tab bar; responsive up to a
  centered desktop column.
- Tailwind CSS **v4** (latest) as the styling layer.
- Preserve all existing functionality and keep the test suite meaningful.

## Non-Goals (explicitly out of scope)

- No new gamification mechanics (no streaks, XP, levels) — visual polish only.
- No changes to study flow, session framing, SRS, stages, grading, or data.
- No changes to `core/`, `data/`, or `tts/` modules.
- No backend, accounts, or network features (the app stays offline PWA).

## Decisions

| Topic | Decision |
|---|---|
| Inspiration | Duolingo-style playful |
| Gamification | Visual polish only (no new tracked data) |
| Styling | Tailwind CSS v4 (latest) |
| Brand / first theme | Thai Temple — gold + deep red, teal accent |
| Layout | Mobile-first with fixed bottom tab bar |
| Study flow | Unchanged (re-skin existing flow) |
| Themeability | Semantic CSS custom properties + Tailwind v4 `@theme` (Approach A) |
| Theme persistence | `localStorage` (pure UI preference; avoids touching IndexedDB) |

## Theming Architecture (Approach A)

All visual values are **semantic tokens** expressed as CSS custom properties —
roles, not literals. Components reference roles only (e.g. `bg-primary`,
`text-on-surface-muted`); they never hardcode hex values or palette utilities
like `bg-red-500`.

- A base `:root` declares the full token set and defaults.
- Each theme overrides the token *values* under a `[data-theme="<id>"]`
  selector on the `<html>` element.
- Tailwind v4 maps the tokens to utilities via `@theme`.
- Switching themes sets one attribute on `<html>` — instant recolor, no
  React re-render required.

**Why A:** native Tailwind v4 idiom, zero runtime cost, no extra deps beyond
Tailwind, gives a free dark-mode path later (a theme is just a token set), and
makes "add a theme" a one-file change. The cost is discipline: components must
use only semantic tokens, enforced by a token-contract test.

### Token set

**Color roles** (each color role with text on it has a paired `on-*`):

- `--color-primary` / `--color-on-primary` — main brand actions (Temple: gold / dark brown)
- `--color-secondary` / `--color-on-secondary` — accent (Temple: crimson)
- `--color-bg` — page background
- `--color-surface` / `--color-surface-raised` — cards / elevated cards
- `--color-on-surface` / `--color-on-surface-muted` — primary / secondary text
- `--color-success` / `--color-on-success` — correct feedback
- `--color-error` / `--color-on-error` — wrong feedback
- `--color-accent-teal` — highlights / progress fill (Temple teal)
- `--color-border`
- `--color-focus-ring`

**Shape / depth:**

- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`
- `--shadow-sm`, `--shadow-md`
- `--shadow-button` — solid offset bottom edge ("3D" press), compresses on active

**Type:**

- `--font-display` (rounded, friendly; e.g. Baloo 2 / Nunito) and `--font-body`
- `--font-thai` — for crisp Thai script at large sizes
- Type scale: display, title, body, caption

**Motion:**

- `--ease-bounce`, `--duration-fast`, `--duration-med`

All `on-*` pairs are chosen for WCAG-AA contrast.

## Component & Visual Language

Shared, token-driven primitives every screen is built from:

- **Button** — chunky, rounded, bold display font, `--shadow-button` "3D" press
  (translateY on active). Variants: `primary`, `secondary`, `success`,
  `error`, `disabled` (flattened/muted).
- **Card** — generous radius, soft `--shadow-md`, `--color-surface`, comfortable
  padding. The flashcard is a hero card with large Thai script (`--font-thai`).
- **ProgressBar** — fat, fully rounded, teal/gold fill with subtle gloss,
  animated fill (`--ease-bounce`). Used for stage progress and mastery.
- **Feedback** — slide-up banner/sheet in `--color-success` / `--color-error`
  with a big icon, short message, and continue button; card flashes the
  feedback color. Optional CSS-only star/confetti pop on correct, gated by
  `prefers-reduced-motion`.
- **Pill / chip** — rounded-full tinted surface for stage labels, tags, due counts.
- **BottomNav** — fixed, 3 items (Study / Add / Progress), icon + label, active
  item in `--color-primary` with a raised indicator; large tap targets;
  safe-area aware for installed PWA.
- **TextField / IconButton** — rounded inputs with clear focus ring
  (`--color-focus-ring`), generous height, friendly labels; Thai input in
  `--font-thai`.
- **Empty / done / no-voice states** — friendly emoji/simple-SVG messages
  instead of bare text, keeping the encouraging tone.

**Accessibility:** AA-contrast token pairs, visible focus rings,
`prefers-reduced-motion` honored, semantic elements and ARIA preserved from the
current components.

## Per-Screen Redesign (behavior unchanged)

- **App shell (`App.tsx`)** — header with wordmark (display font) + theme
  switcher; centered content column; fixed bottom nav replacing the top button
  row. Sets `data-theme` on `<html>`.
- **Study (`StudySession` + exercises)** — hero flashcard, big Thai script;
  stage/mastery as the fat progress bar; due count as a pill. The four exercise
  types keep identical logic, restyled:
  - *Meaning recall* — card shows Thai/romanization; "Show answer" primary
    button; self-grade buttons (Again / Good as error/success styles).
  - *Production* / *Spelling* — rounded input; auto-grade triggers the slide-up
    Feedback layer, showing the correct answer on a miss.
  - *Listening* — big circular gold play (speaker) button; reveal button;
    graceful friendly disabled state when no Thai voice is installed.
- **Add card (`AddCardForm`)** — restyled form card with labeled rounded inputs
  (Thai field in `--font-thai`), primary "Add card" button, inline success pill.
  Same fields and validation.
- **Progress (`ProgressView`)** — playful stat cards (cards learned, mastered,
  current stage) plus progress bar; Export/Import as clearly-styled secondary
  buttons with the same underlying file behavior.
- **Theme switcher** — in the header (and/or Progress screen): lists available
  themes (just Temple at launch), sets `data-theme`, persists the choice. Built
  so theme #2 appears automatically once registered.

## File Architecture

New / changed (all styling setup + `src/ui/`):

- `src/styles/base.css` — Tailwind v4 import, `@theme` role→utility mapping,
  base `:root` tokens, font setup.
- `src/styles/themes/temple.css` — `[data-theme="temple"]` token values (default).
- `src/ui/theme/themes.ts` — theme registry: `{ id, label }[]`.
- `src/ui/theme/useTheme.ts` — read/set active theme, persist to `localStorage`.
- `src/ui/theme/ThemeSwitcher.tsx` — the switcher control.
- `src/ui/components/` — shared primitives: `Button`, `Card`, `ProgressBar`,
  `Pill`, `Feedback`, `BottomNav`, `TextField`, `IconButton`.
- Existing screen/exercise components reworked to use the primitives + tokens.

**Tailwind v4 setup:** add `@tailwindcss/vite` to `vite.config.ts`; import
`base.css` in `main.tsx`. No JS config file required by Tailwind v4.

### Adding a future theme (the payoff)

1. Create `src/styles/themes/<id>.css` with the same token names, new values.
2. Add one entry to `themes.ts`.

It appears in the switcher automatically. No component changes — nothing
hardcodes color.

## Testing

- Existing logic/behavior tests stay green (behavior is unchanged).
- **Token-contract test** — verifies every registered theme defines the full
  token set, so a future theme can't ship half-defined.
- **Theme tests** — `useTheme` / `ThemeSwitcher` switching + persistence.
- Component tests asserting on text/roles keep working; any asserting old inline
  styles get updated to the new markup.

## Risks & Mitigations

- **Token discipline drift** (components sneaking in raw colors) → token-contract
  test + code review; primitives centralize styling so screens rarely touch raw
  classes.
- **Thai script rendering** at large sizes / in inputs → dedicated `--font-thai`
  with a tested webfont fallback chain.
- **Motion accessibility** → all animations gated by `prefers-reduced-motion`.
- **PWA safe areas** on installed mobile → bottom nav uses env(safe-area-inset).
