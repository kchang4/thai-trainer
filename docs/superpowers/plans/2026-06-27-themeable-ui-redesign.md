# Themeable UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the Thai Trainer `src/ui/` layer into a playful, Duolingo-style, fully themeable UI (first theme: Thai Temple — gold & deep red) without changing any app behavior.

**Architecture:** All visual values come from semantic CSS custom properties (`--app-*` tokens). Tailwind v4's `@theme inline` maps those tokens to utility classes, so components reference roles (`bg-primary`, `text-on-surface`) and never hardcode colors. Each theme is a `[data-theme="<id>"]` block overriding the token values; a `useTheme` hook sets `data-theme` on `<html>` and persists the choice to `localStorage`. Existing screens are rebuilt on a small set of shared presentational primitives.

**Tech Stack:** Bun · React 19 · TypeScript · Vite 8 · Tailwind CSS v4 (`@tailwindcss/vite`) · Vitest 4 + Testing Library + fake-indexeddb · `@fontsource` self-hosted fonts.

## Global Constraints

- **No behavior changes.** Do not modify `src/core/`, `src/data/`, or `src/tts/`. Only `src/ui/`, `src/styles/`, `src/main.tsx`, `index.html`, `vite.config.ts`, and `package.json` may change.
- **Token discipline.** UI components must use semantic token utilities (`bg-primary`, `text-on-surface-muted`, `rounded-lg`, `shadow-button`, etc.). Never hardcode hex values or raw palette utilities like `bg-red-500`.
- **Tailwind v4 only** (latest). No `tailwind.config.js` — v4 is CSS-configured.
- **Preserve test contracts.** These accessible names / texts must keep working: grade buttons named `Again`/`Hard`/`Good`/`Easy`; "Show answer", "Check", "Play again" buttons; AddCardForm labels `Thai`/`Romanization`/`English`/`Category`/`Tier`, its `Add card` button, and the exact validation string `Fill in Thai, romanization, and English.`; ProgressView text `Current stage`, an Export button, and an `Import backup` label; wrong typed answers must reveal the expected answer text.
- **Package manager is Bun.** Use `bun add`, `bun run test`, `bun run build`. Never `bun test`.
- **Accessibility:** keep semantic elements/ARIA, AA-contrast token pairs, visible focus rings, and gate all animation behind `prefers-reduced-motion`.
- **Commit** after each task with the message shown in its final step.

---

## File Structure

**New files**
- `src/styles/base.css` — Tailwind import, `@theme inline` token→utility mapping, `:root` default tokens, motion/reduced-motion.
- `src/styles/themes/temple.css` — `[data-theme="temple"]` token values.
- `src/ui/theme/tokens.ts` — `REQUIRED_TOKENS` canonical token-name list.
- `src/ui/theme/tokens.test.ts` — token-contract test (every theme defines every token).
- `src/ui/theme/themes.ts` — theme registry + `DEFAULT_THEME_ID`.
- `src/ui/theme/useTheme.ts` — apply/persist active theme.
- `src/ui/theme/useTheme.test.ts` — switch + persistence tests.
- `src/ui/theme/ThemeSwitcher.tsx` + `.test.tsx`.
- `src/ui/components/Button.tsx`, `Card.tsx`, `Pill.tsx`, `ProgressBar.tsx`, `Feedback.tsx`, `TextField.tsx`, `IconButton.tsx`, `BottomNav.tsx` (+ tests for `Button`, `Feedback`, `TextField`, `BottomNav`).
- `src/ui/App.test.tsx`.

**Modified files**
- `vite.config.ts` — add Tailwind plugin.
- `src/main.tsx` — import `base.css` + fonts.
- `index.html` — default `data-theme="temple"` on `<html>`.
- `src/App.tsx`, `src/ui/StudySession.tsx`, `src/ui/AddCardForm.tsx`, `src/ui/ProgressView.tsx`, `src/ui/exercises/*.tsx` — re-skin onto primitives.

---

## Task 1: Tailwind v4 + token system + Temple theme

**Files:**
- Modify: `package.json` (deps), `vite.config.ts`, `src/main.tsx`, `index.html`
- Create: `src/ui/theme/tokens.ts`, `src/styles/base.css`, `src/styles/themes/temple.css`
- Test: `src/ui/theme/tokens.test.ts`

**Interfaces:**
- Produces: `REQUIRED_TOKENS: readonly string[]` from `src/ui/theme/tokens.ts` — the canonical list of `--app-*` token names every theme must define. Token utilities available to all later tasks: colors `primary`, `on-primary`, `secondary`, `on-secondary`, `bg`, `surface`, `surface-raised`, `on-surface`, `on-surface-muted`, `success`, `on-success`, `error`, `on-error`, `accent-teal`, `border`, `focus-ring`; radii `sm`/`md`/`lg`/`full`; shadows `sm`/`md`/`button`; fonts `display`/`body`/`thai`.

- [ ] **Step 1: Install dependencies**

```bash
bun add -D tailwindcss @tailwindcss/vite
bun add @fontsource/baloo-2 @fontsource/nunito @fontsource/noto-sans-thai
```

- [ ] **Step 2: Write the failing token-contract test**

Create `src/ui/theme/tokens.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { REQUIRED_TOKENS } from "./tokens";

const themesDir = fileURLToPath(new URL("../../styles/themes/", import.meta.url));

function declaredTokens(css: string): Set<string> {
  const found = new Set<string>();
  for (const m of css.matchAll(/(--app-[\w-]+)\s*:/g)) found.add(m[1]);
  return found;
}

describe("theme token contract", () => {
  const files = readdirSync(themesDir).filter((f) => f.endsWith(".css"));

  it("ships at least one theme file", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s defines every required token", (file) => {
    const css = readFileSync(themesDir + file, "utf8");
    const declared = declaredTokens(css);
    const missing = REQUIRED_TOKENS.filter((t) => !declared.has(t));
    expect(missing).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `bun run test src/ui/theme/tokens.test.ts`
Expected: FAIL — cannot resolve `./tokens` (and themes dir does not exist yet).

- [ ] **Step 4: Create the canonical token list**

Create `src/ui/theme/tokens.ts`:

```ts
/** Canonical themeable tokens. Every theme must define all of these. */
export const REQUIRED_TOKENS = [
  "--app-primary",
  "--app-on-primary",
  "--app-secondary",
  "--app-on-secondary",
  "--app-bg",
  "--app-surface",
  "--app-surface-raised",
  "--app-on-surface",
  "--app-on-surface-muted",
  "--app-success",
  "--app-on-success",
  "--app-error",
  "--app-on-error",
  "--app-accent-teal",
  "--app-border",
  "--app-focus-ring",
  "--app-radius-sm",
  "--app-radius-md",
  "--app-radius-lg",
  "--app-shadow-sm",
  "--app-shadow-md",
  "--app-shadow-button",
  "--app-font-display",
  "--app-font-body",
  "--app-font-thai",
] as const;
```

- [ ] **Step 5: Create the Temple theme token values**

Create `src/styles/themes/temple.css`:

```css
[data-theme="temple"] {
  --app-primary: #e0a82e;
  --app-on-primary: #3b2a14;
  --app-secondary: #b23a48;
  --app-on-secondary: #ffffff;

  --app-bg: #fbf6ec;
  --app-surface: #ffffff;
  --app-surface-raised: #fffdf8;
  --app-on-surface: #2a2018;
  --app-on-surface-muted: #7a6a55;

  --app-success: #4caf50;
  --app-on-success: #ffffff;
  --app-error: #d64545;
  --app-on-error: #ffffff;
  --app-accent-teal: #2a9d8f;

  --app-border: #e7dcc8;
  --app-focus-ring: #e0a82e;

  --app-radius-sm: 0.5rem;
  --app-radius-md: 0.875rem;
  --app-radius-lg: 1.25rem;

  --app-shadow-sm: 0 1px 2px rgba(58, 42, 18, 0.08);
  --app-shadow-md: 0 6px 16px rgba(58, 42, 18, 0.12);
  --app-shadow-button: 0 4px 0 0 #a87c12;

  --app-font-display: "Baloo 2", system-ui, sans-serif;
  --app-font-body: "Nunito", system-ui, sans-serif;
  --app-font-thai: "Noto Sans Thai", "Leelawadee UI", system-ui, sans-serif;
}
```

- [ ] **Step 6: Run the contract test to verify it passes**

Run: `bun run test src/ui/theme/tokens.test.ts`
Expected: PASS — temple.css defines every required token.

- [ ] **Step 7: Create the base stylesheet (Tailwind + @theme mapping + defaults)**

Create `src/styles/base.css`:

```css
@import "tailwindcss";
@import "./themes/temple.css";

/* Map themeable tokens to Tailwind utilities. `inline` keeps the var
   reference in generated CSS so [data-theme] overrides take effect. */
@theme inline {
  --color-primary: var(--app-primary);
  --color-on-primary: var(--app-on-primary);
  --color-secondary: var(--app-secondary);
  --color-on-secondary: var(--app-on-secondary);
  --color-bg: var(--app-bg);
  --color-surface: var(--app-surface);
  --color-surface-raised: var(--app-surface-raised);
  --color-on-surface: var(--app-on-surface);
  --color-on-surface-muted: var(--app-on-surface-muted);
  --color-success: var(--app-success);
  --color-on-success: var(--app-on-success);
  --color-error: var(--app-error);
  --color-on-error: var(--app-on-error);
  --color-accent-teal: var(--app-accent-teal);
  --color-border: var(--app-border);
  --color-focus-ring: var(--app-focus-ring);

  --radius-sm: var(--app-radius-sm);
  --radius-md: var(--app-radius-md);
  --radius-lg: var(--app-radius-lg);

  --shadow-sm: var(--app-shadow-sm);
  --shadow-md: var(--app-shadow-md);
  --shadow-button: var(--app-shadow-button);

  --font-display: var(--app-font-display);
  --font-body: var(--app-font-body);
  --font-thai: var(--app-font-thai);
}

html {
  background-color: var(--color-bg);
  color: var(--color-on-surface);
  font-family: var(--font-body);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 8: Wire Tailwind into Vite**

Modify `vite.config.ts` — add the Tailwind plugin to the `plugins` array (keep `react()` and `VitePWA(...)` exactly as-is):

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "Thai Trainer",
        short_name: "ThaiTrainer",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#e0a82e",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
```

- [ ] **Step 9: Import styles + fonts in the entry point**

Modify `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/baloo-2/400.css";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/noto-sans-thai/400.css";
import "./styles/base.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 10: Set the default theme attribute**

Modify `index.html` — change the opening html tag to `<html lang="en" data-theme="temple">`.

- [ ] **Step 11: Verify build and full test suite**

Run: `bun run build && bun run test`
Expected: type-check + Vite build succeed; all tests pass (existing suite still green, contract test passes).

- [ ] **Step 12: Commit**

```bash
git add package.json bun.lock vite.config.ts index.html src/main.tsx src/styles src/ui/theme/tokens.ts src/ui/theme/tokens.test.ts
git commit -m "feat(ui): add Tailwind v4 token system and Temple theme"
```

---

## Task 2: Theme registry + useTheme hook

**Files:**
- Create: `src/ui/theme/themes.ts`, `src/ui/theme/useTheme.ts`
- Test: `src/ui/theme/useTheme.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks at runtime.
- Produces:
  - `themes.ts`: `interface ThemeMeta { id: string; label: string }`; `export const themes: ThemeMeta[]`; `export const DEFAULT_THEME_ID = "temple"`.
  - `useTheme.ts`: `export const THEME_STORAGE_KEY = "thai-trainer-theme"`; `export function getStoredTheme(): string`; `export function applyTheme(id: string): void` (sets `data-theme` on `document.documentElement`); `export function useTheme(): { theme: string; setTheme: (id: string) => void; themes: ThemeMeta[] }`.

- [ ] **Step 1: Write the failing hook test**

Create `src/ui/theme/useTheme.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme, getStoredTheme, THEME_STORAGE_KEY } from "./useTheme";
import { DEFAULT_THEME_ID } from "./themes";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("useTheme", () => {
  it("defaults to the default theme when nothing is stored", () => {
    expect(getStoredTheme()).toBe(DEFAULT_THEME_ID);
  });

  it("applies the active theme to the document element", () => {
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute("data-theme")).toBe(DEFAULT_THEME_ID);
  });

  it("persists and applies a newly selected theme", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("temple"));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("temple");
    expect(document.documentElement.getAttribute("data-theme")).toBe("temple");
    expect(result.current.theme).toBe("temple");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/ui/theme/useTheme.test.ts`
Expected: FAIL — cannot resolve `./useTheme` / `./themes`.

- [ ] **Step 3: Create the theme registry**

Create `src/ui/theme/themes.ts`:

```ts
export interface ThemeMeta {
  id: string;
  label: string;
}

export const themes: ThemeMeta[] = [{ id: "temple", label: "Thai Temple" }];

export const DEFAULT_THEME_ID = "temple";
```

- [ ] **Step 4: Create the useTheme hook**

Create `src/ui/theme/useTheme.ts`:

```ts
import { useCallback, useEffect, useState } from "react";
import { themes, DEFAULT_THEME_ID, type ThemeMeta } from "./themes";

export const THEME_STORAGE_KEY = "thai-trainer-theme";

export function getStoredTheme(): string {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function applyTheme(id: string): void {
  document.documentElement.setAttribute("data-theme", id);
}

export function useTheme(): {
  theme: string;
  setTheme: (id: string) => void;
  themes: ThemeMeta[];
} {
  const [theme, setThemeState] = useState<string>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((id: string) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* ignore storage failures (e.g. private mode) */
    }
    setThemeState(id);
  }, []);

  return { theme, setTheme, themes };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun run test src/ui/theme/useTheme.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui/theme/themes.ts src/ui/theme/useTheme.ts src/ui/theme/useTheme.test.ts
git commit -m "feat(ui): add theme registry and useTheme hook"
```

---

## Task 3: ThemeSwitcher component

**Files:**
- Create: `src/ui/theme/ThemeSwitcher.tsx`
- Test: `src/ui/theme/ThemeSwitcher.test.tsx`

**Interfaces:**
- Consumes: `useTheme()` from Task 2.
- Produces: `export function ThemeSwitcher(): JSX.Element` — a labeled `<select>` (accessible name "Theme") listing `themes` and calling `setTheme` on change.

- [ ] **Step 1: Write the failing test**

Create `src/ui/theme/ThemeSwitcher.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { THEME_STORAGE_KEY } from "./useTheme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeSwitcher", () => {
  it("renders a theme selector with the available themes", () => {
    render(<ThemeSwitcher />);
    const select = screen.getByLabelText(/theme/i);
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /thai temple/i })).toBeInTheDocument();
  });

  it("persists the selected theme", async () => {
    render(<ThemeSwitcher />);
    await userEvent.selectOptions(screen.getByLabelText(/theme/i), "temple");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("temple");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/ui/theme/ThemeSwitcher.test.tsx`
Expected: FAIL — cannot resolve `./ThemeSwitcher`.

- [ ] **Step 3: Implement the component**

Create `src/ui/theme/ThemeSwitcher.tsx`:

```tsx
import { useId } from "react";
import { useTheme } from "./useTheme";

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const id = useId();
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-on-surface-muted">
      <span className="sr-only">Theme</span>
      <select
        id={id}
        aria-label="Theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="rounded-md border border-border bg-surface px-2 py-1 text-on-surface focus:outline-none focus:ring-2 focus:ring-focus-ring"
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test src/ui/theme/ThemeSwitcher.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/theme/ThemeSwitcher.tsx src/ui/theme/ThemeSwitcher.test.tsx
git commit -m "feat(ui): add ThemeSwitcher control"
```

---

## Task 4: Button, Card, Pill primitives

**Files:**
- Create: `src/ui/components/Button.tsx`, `src/ui/components/Card.tsx`, `src/ui/components/Pill.tsx`
- Test: `src/ui/components/Button.test.tsx`

**Interfaces:**
- Produces:
  - `Button`: `type ButtonVariant = "primary" | "secondary" | "success" | "error"`; `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant }`; `export function Button(props: ButtonProps): JSX.Element` (renders `data-variant`, default `primary`).
  - `Card`: `export function Card(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element`.
  - `Pill`: `export function Pill(props: React.HTMLAttributes<HTMLSpanElement>): JSX.Element`.

- [ ] **Step 1: Write the failing Button test**

Create `src/ui/components/Button.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("defaults to the primary variant and exposes it via data-variant", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("data-variant", "primary");
  });

  it("applies the requested variant", () => {
    render(<Button variant="error">Stop</Button>);
    expect(screen.getByRole("button", { name: "Stop" })).toHaveAttribute("data-variant", "error");
  });

  it("forwards disabled", () => {
    render(<Button disabled>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/ui/components/Button.test.tsx`
Expected: FAIL — cannot resolve `./Button`.

- [ ] **Step 3: Implement Button**

Create `src/ui/components/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "success" | "error";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary shadow-button",
  secondary: "bg-secondary text-on-secondary shadow-button",
  success: "bg-success text-on-success shadow-button",
  error: "bg-error text-on-error shadow-button",
};

export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return (
    <button
      data-variant={variant}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3",
        "font-display font-bold uppercase tracking-wide",
        "transition active:translate-y-1 active:shadow-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-y-0",
        VARIANTS[variant],
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
```

- [ ] **Step 4: Run the Button test to verify it passes**

Run: `bun run test src/ui/components/Button.test.tsx`
Expected: PASS.

- [ ] **Step 5: Implement Card**

Create `src/ui/components/Card.tsx`:

```tsx
import type { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-lg bg-surface p-6 shadow-md border border-border",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
```

- [ ] **Step 6: Implement Pill**

Create `src/ui/components/Pill.tsx`:

```tsx
import type { HTMLAttributes } from "react";

export function Pill({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-3 py-1",
        "text-sm font-semibold bg-bg text-on-surface-muted border border-border",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/ui/components/Button.tsx src/ui/components/Button.test.tsx src/ui/components/Card.tsx src/ui/components/Pill.tsx
git commit -m "feat(ui): add Button, Card, and Pill primitives"
```

---

## Task 5: ProgressBar + Feedback primitives

**Files:**
- Create: `src/ui/components/ProgressBar.tsx`, `src/ui/components/Feedback.tsx`
- Test: `src/ui/components/Feedback.test.tsx`

**Interfaces:**
- Produces:
  - `ProgressBar`: `interface ProgressBarProps { value: number; max?: number; label?: string }`; `export function ProgressBar(props): JSX.Element` (renders `role="progressbar"` with `aria-valuenow`/`aria-valuemax`).
  - `Feedback`: `type FeedbackKind = "correct" | "wrong"`; `interface FeedbackProps { kind: FeedbackKind; message: string; onContinue: () => void }`; `export function Feedback(props): JSX.Element` (a `role="status"` banner with a "Continue" Button).

- [ ] **Step 1: Write the failing Feedback test**

Create `src/ui/components/Feedback.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Feedback } from "./Feedback";

describe("Feedback", () => {
  it("shows the message and continues on click", async () => {
    const onContinue = vi.fn();
    render(<Feedback kind="wrong" message="Answer: sawatdee" onContinue={onContinue} />);
    expect(screen.getByText(/answer: sawatdee/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("exposes the kind via data-kind", () => {
    render(<Feedback kind="correct" message="Nice!" onContinue={() => {}} />);
    expect(screen.getByRole("status")).toHaveAttribute("data-kind", "correct");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/ui/components/Feedback.test.tsx`
Expected: FAIL — cannot resolve `./Feedback`.

- [ ] **Step 3: Implement ProgressBar**

Create `src/ui/components/ProgressBar.tsx`:

```tsx
export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
}

export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-4 w-full overflow-hidden rounded-full bg-bg border border-border"
    >
      <div
        className="h-full rounded-full bg-accent-teal transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Implement Feedback**

Create `src/ui/components/Feedback.tsx`:

```tsx
import { Button } from "./Button";

export type FeedbackKind = "correct" | "wrong";

export interface FeedbackProps {
  kind: FeedbackKind;
  message: string;
  onContinue: () => void;
}

export function Feedback({ kind, message, onContinue }: FeedbackProps) {
  const correct = kind === "correct";
  return (
    <div
      role="status"
      data-kind={kind}
      className={[
        "mt-4 flex flex-col gap-3 rounded-lg p-4",
        correct ? "bg-success text-on-success" : "bg-error text-on-error",
      ].join(" ")}
    >
      <p className="font-display text-lg font-bold">
        {correct ? "✅ " : "❌ "}
        {message}
      </p>
      <Button variant={correct ? "success" : "error"} onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Run the Feedback test to verify it passes**

Run: `bun run test src/ui/components/Feedback.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui/components/ProgressBar.tsx src/ui/components/Feedback.tsx src/ui/components/Feedback.test.tsx
git commit -m "feat(ui): add ProgressBar and Feedback primitives"
```

---

## Task 6: TextField + IconButton primitives

**Files:**
- Create: `src/ui/components/TextField.tsx`, `src/ui/components/IconButton.tsx`
- Test: `src/ui/components/TextField.test.tsx`

**Interfaces:**
- Produces:
  - `TextField`: `interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; thai?: boolean }`; `export function TextField(props): JSX.Element` — renders a `<label>` associated to the `<input>` (via generated id) so `getByLabelText(label)` works; `thai` applies the Thai font.
  - `IconButton`: `interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { label: string }`; `export function IconButton(props): JSX.Element` — circular button, `aria-label={label}`.

- [ ] **Step 1: Write the failing TextField test**

Create `src/ui/components/TextField.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { TextField } from "./TextField";

function Harness() {
  const [v, setV] = useState("");
  return <TextField label="Romanization" value={v} onChange={(e) => setV(e.target.value)} />;
}

describe("TextField", () => {
  it("associates the label with the input", async () => {
    render(<Harness />);
    const input = screen.getByLabelText(/romanization/i);
    await userEvent.type(input, "maew");
    expect(input).toHaveValue("maew");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/ui/components/TextField.test.tsx`
Expected: FAIL — cannot resolve `./TextField`.

- [ ] **Step 3: Implement TextField**

Create `src/ui/components/TextField.tsx`:

```tsx
import { useId, type InputHTMLAttributes } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  thai?: boolean;
}

export function TextField({ label, thai = false, className = "", id, ...rest }: TextFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-semibold text-on-surface-muted">
        {label}
      </label>
      <input
        id={inputId}
        className={[
          "rounded-md border border-border bg-surface px-3 py-2 text-on-surface",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
          thai ? "font-thai text-lg" : "",
          className,
        ].join(" ")}
        {...rest}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run the TextField test to verify it passes**

Run: `bun run test src/ui/components/TextField.test.tsx`
Expected: PASS.

- [ ] **Step 5: Implement IconButton**

Create `src/ui/components/IconButton.tsx`:

```tsx
import type { ButtonHTMLAttributes } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className = "", children, ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={[
        "inline-flex h-14 w-14 items-center justify-center rounded-full",
        "bg-primary text-on-primary text-2xl shadow-button",
        "transition active:translate-y-1 active:shadow-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/ui/components/TextField.tsx src/ui/components/TextField.test.tsx src/ui/components/IconButton.tsx
git commit -m "feat(ui): add TextField and IconButton primitives"
```

---

## Task 7: BottomNav primitive

**Files:**
- Create: `src/ui/components/BottomNav.tsx`
- Test: `src/ui/components/BottomNav.test.tsx`

**Interfaces:**
- Produces: `interface NavItem { id: string; label: string; icon: string }`; `interface BottomNavProps { items: NavItem[]; active: string; onSelect: (id: string) => void }`; `export function BottomNav(props): JSX.Element` — a `<nav>` of buttons; the active one has `aria-current="page"`.

- [ ] **Step 1: Write the failing test**

Create `src/ui/components/BottomNav.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomNav } from "./BottomNav";

const items = [
  { id: "study", label: "Study", icon: "📚" },
  { id: "add", label: "Add", icon: "➕" },
  { id: "progress", label: "Progress", icon: "📈" },
];

describe("BottomNav", () => {
  it("marks the active item and reports selections", async () => {
    const onSelect = vi.fn();
    render(<BottomNav items={items} active="study" onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: /study/i })).toHaveAttribute("aria-current", "page");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(onSelect).toHaveBeenCalledWith("add");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/ui/components/BottomNav.test.tsx`
Expected: FAIL — cannot resolve `./BottomNav`.

- [ ] **Step 3: Implement BottomNav**

Create `src/ui/components/BottomNav.tsx`:

```tsx
export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface BottomNavProps {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
}

export function BottomNav({ items, active, onSelect }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface-raised"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-2xl">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelect(item.id)}
                className={[
                  "flex w-full flex-col items-center gap-0.5 py-2",
                  "font-display text-xs font-bold",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
                  isActive ? "text-primary" : "text-on-surface-muted",
                ].join(" ")}
              >
                <span aria-hidden className="text-xl">{item.icon}</span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test src/ui/components/BottomNav.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/components/BottomNav.tsx src/ui/components/BottomNav.test.tsx
git commit -m "feat(ui): add BottomNav primitive"
```

---

## Task 8: App shell redesign

**Files:**
- Modify: `src/App.tsx`
- Test: `src/ui/App.test.tsx`

**Interfaces:**
- Consumes: `BottomNav` (Task 7), `ThemeSwitcher` (Task 3), existing `StudySession`/`AddCardForm`/`ProgressView`.

- [ ] **Step 1: Write the failing App test**

Create `src/ui/App.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { seedIfEmpty, _resetDbForTests } from "../data/db";

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
  await seedIfEmpty();
});

describe("App", () => {
  it("switches to the Add card screen via the bottom nav", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /add card/i })).toBeInTheDocument(),
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test src/ui/App.test.tsx`
Expected: FAIL — current App uses a top button row labeled "Add card", not a bottom-nav "Add"; the test asserts the new nav shape.

- [ ] **Step 3: Rebuild App.tsx**

Replace `src/App.tsx` with:

```tsx
import { useState } from "react";
import { StudySession } from "./ui/StudySession";
import { AddCardForm } from "./ui/AddCardForm";
import { ProgressView } from "./ui/ProgressView";
import { BottomNav, type NavItem } from "./ui/components/BottomNav";
import { ThemeSwitcher } from "./ui/theme/ThemeSwitcher";

type Tab = "study" | "add" | "progress";

const NAV_ITEMS: NavItem[] = [
  { id: "study", label: "Study", icon: "📚" },
  { id: "add", label: "Add", icon: "➕" },
  { id: "progress", label: "Progress", icon: "📈" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("study");
  return (
    <div className="min-h-dvh bg-bg text-on-surface">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <h1 className="font-display text-2xl font-bold text-primary">Thai Trainer</h1>
        <ThemeSwitcher />
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-24">
        {tab === "study" && <StudySession />}
        {tab === "add" && <AddCardForm />}
        {tab === "progress" && <ProgressView />}
      </main>
      <BottomNav items={NAV_ITEMS} active={tab} onSelect={(id) => setTab(id as Tab)} />
    </div>
  );
}
```

- [ ] **Step 4: Run the App test to verify it passes**

Run: `bun run test src/ui/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/ui/App.test.tsx
git commit -m "feat(ui): rebuild app shell with header and bottom nav"
```

---

## Task 9: Re-skin MeaningRecall + Listening

**Files:**
- Modify: `src/ui/exercises/MeaningRecall.tsx`, `src/ui/exercises/Listening.tsx`
- Test: existing `src/ui/exercises/MeaningRecall.test.tsx` (must stay green; no edits expected)

**Interfaces:**
- Consumes: `Card` (Task 4), `Button` (Task 4), `IconButton` (Task 6). Props unchanged from current components.
- Note: grade buttons must keep accessible names `Again`/`Hard`/`Good`/`Easy` (capitalized matches the case-insensitive `/^good$/i` test).

- [ ] **Step 1: Re-skin MeaningRecall**

Replace `src/ui/exercises/MeaningRecall.tsx` with:

```tsx
import { useState } from "react";
import type { Card as CardType, Grade } from "../../core/types";
import { Card } from "../components/Card";
import { Button, type ButtonVariant } from "../components/Button";

const GRADES: { grade: Grade; label: string; variant: ButtonVariant }[] = [
  { grade: "again", label: "Again", variant: "error" },
  { grade: "hard", label: "Hard", variant: "secondary" },
  { grade: "good", label: "Good", variant: "success" },
  { grade: "easy", label: "Easy", variant: "primary" },
];

export function MeaningRecall({
  card,
  showScript,
  onGrade,
}: {
  card: CardType;
  showScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const prompt = showScript ? card.thai : card.romanization;

  return (
    <Card className="flex flex-col items-center gap-5 text-center">
      <p className={showScript ? "font-thai text-5xl" : "text-4xl font-display font-bold"}>
        {prompt}
      </p>
      {!revealed ? (
        <Button onClick={() => setRevealed(true)}>Show answer</Button>
      ) : (
        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-2xl font-display font-bold text-on-surface">{card.english}</p>
          <div className="grid w-full grid-cols-2 gap-2">
            {GRADES.map(({ grade, label, variant }) => (
              <Button key={grade} variant={variant} onClick={() => onGrade(grade)}>
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Run the MeaningRecall test to verify it still passes**

Run: `bun run test src/ui/exercises/MeaningRecall.test.tsx`
Expected: PASS (reveals "hello", grade "Good" calls `onGrade("good")`).

- [ ] **Step 3: Re-skin Listening**

Replace `src/ui/exercises/Listening.tsx` with:

```tsx
import { useEffect, useState } from "react";
import type { Card as CardType, Grade } from "../../core/types";
import { speakThai } from "../../tts/speak";
import { Card } from "../components/Card";
import { Button, type ButtonVariant } from "../components/Button";
import { IconButton } from "../components/IconButton";

const GRADES: { grade: Grade; label: string; variant: ButtonVariant }[] = [
  { grade: "again", label: "Again", variant: "error" },
  { grade: "hard", label: "Hard", variant: "secondary" },
  { grade: "good", label: "Good", variant: "success" },
  { grade: "easy", label: "Easy", variant: "primary" },
];

export function Listening({
  card,
  showScript,
  onGrade,
}: {
  card: CardType;
  showScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    speakThai(card.thai);
  }, [card.thai]);

  return (
    <Card className="flex flex-col items-center gap-5 text-center">
      <IconButton label="Play again" onClick={() => speakThai(card.thai)}>
        🔊
      </IconButton>
      {!revealed ? (
        <Button onClick={() => setRevealed(true)}>Show answer</Button>
      ) : (
        <div className="flex w-full flex-col items-center gap-3">
          {showScript && <p className="font-thai text-4xl">{card.thai}</p>}
          <p className="text-xl font-display font-bold">{card.romanization}</p>
          <p className="text-on-surface-muted">{card.english}</p>
          <div className="grid w-full grid-cols-2 gap-2">
            {GRADES.map(({ grade, label, variant }) => (
              <Button key={grade} variant={variant} onClick={() => onGrade(grade)}>
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 4: Run the related tests to verify green**

Run: `bun run test src/ui/exercises/MeaningRecall.test.tsx src/ui/StudySession.test.tsx`
Expected: PASS (StudySession still finds "Show answer"/"Play again").

- [ ] **Step 5: Commit**

```bash
git add src/ui/exercises/MeaningRecall.tsx src/ui/exercises/Listening.tsx
git commit -m "feat(ui): re-skin MeaningRecall and Listening exercises"
```

---

## Task 10: Re-skin Production + Spelling (with Feedback)

**Files:**
- Modify: `src/ui/exercises/Production.tsx`, `src/ui/exercises/Spelling.tsx`
- Test: existing `src/ui/exercises/Spelling.test.tsx` (must stay green; no edits expected)

**Interfaces:**
- Consumes: `Card` (Task 4), `Button` (Task 4), `TextField` (Task 6), `Feedback` (Task 5). Props and grading behavior unchanged.
- Note: must keep a `Check` button, a text input (role `textbox`), call `onGrade("good")` on correct / `onGrade("again")` on wrong, and reveal the expected answer text on a wrong answer.

- [ ] **Step 1: Re-skin Production**

Replace `src/ui/exercises/Production.tsx` with:

```tsx
import { useState } from "react";
import type { Card as CardType, Grade } from "../../core/types";
import { gradeTypedAnswer } from "../../core/grading";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { Feedback } from "../components/Feedback";

export function Production({
  card,
  requireScript,
  onGrade,
}: {
  card: CardType;
  requireScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const expected = requireScript ? card.thai : card.romanization;

  function check() {
    if (gradeTypedAnswer(expected, value)) {
      setResult("correct");
      onGrade("good");
    } else {
      setResult("wrong");
      onGrade("again");
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-2xl font-display font-bold text-center">{card.english}</p>
      <TextField
        label="Your answer"
        aria-label="answer"
        thai={requireScript}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={result !== null}
      />
      {result === null ? (
        <Button onClick={check}>Check</Button>
      ) : result === "correct" ? (
        <Feedback kind="correct" message="Correct!" onContinue={() => {}} />
      ) : (
        <Feedback kind="wrong" message={`Answer: ${expected}`} onContinue={() => {}} />
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Re-skin Spelling**

Replace `src/ui/exercises/Spelling.tsx` with:

```tsx
import { useState } from "react";
import type { Card as CardType, Grade } from "../../core/types";
import { gradeTypedAnswer } from "../../core/grading";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { Feedback } from "../components/Feedback";

export function Spelling({
  card,
  requireScript,
  onGrade,
}: {
  card: CardType;
  requireScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const expected = requireScript ? card.thai : card.romanization;
  const prompt = requireScript ? `${card.romanization} — ${card.english}` : card.english;

  function check() {
    if (gradeTypedAnswer(expected, value)) {
      setResult("correct");
      onGrade("good");
    } else {
      setResult("wrong");
      onGrade("again");
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-center text-lg font-display font-bold">Spell: {prompt}</p>
      <TextField
        label="Your answer"
        aria-label="answer"
        thai={requireScript}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={result !== null}
      />
      {result === null ? (
        <Button onClick={check}>Check</Button>
      ) : result === "correct" ? (
        <Feedback kind="correct" message="Correct!" onContinue={() => {}} />
      ) : (
        <Feedback kind="wrong" message={`Answer: ${expected}`} onContinue={() => {}} />
      )}
    </Card>
  );
}
```

- [ ] **Step 3: Run the Spelling test to verify it still passes**

Run: `bun run test src/ui/exercises/Spelling.test.tsx`
Expected: PASS — correct romanization grades `good`; wrong answer grades `again` and reveals `sawatdee` (via `Answer: sawatdee`).

- [ ] **Step 4: Note on the `getByRole("textbox")` query**

The Spelling test uses `screen.getByRole("textbox")` — there must be exactly one input on screen. `TextField` renders a single `<input>`, so this holds. (`aria-label="answer"` is forwarded for parity with the old markup.)

- [ ] **Step 5: Commit**

```bash
git add src/ui/exercises/Production.tsx src/ui/exercises/Spelling.tsx
git commit -m "feat(ui): re-skin Production and Spelling with feedback layer"
```

---

## Task 11: Re-skin StudySession

**Files:**
- Modify: `src/ui/StudySession.tsx`
- Test: existing `src/ui/StudySession.test.tsx` (must stay green)

**Interfaces:**
- Consumes: `useStudySession()` (unchanged, exposes `loading`, `current`, `stage`, `queueLength`, `submitGrade`), `Card`, `Pill`, `ProgressBar`. Renders the four exercise components unchanged.

- [ ] **Step 1: Re-skin StudySession**

Replace `src/ui/StudySession.tsx` with:

```tsx
import { useStudySession } from "./useStudySession";
import { stageConfig } from "../core/stages";
import { MeaningRecall } from "./exercises/MeaningRecall";
import { Production } from "./exercises/Production";
import { Spelling } from "./exercises/Spelling";
import { Listening } from "./exercises/Listening";
import { Card } from "./components/Card";
import { Pill } from "./components/Pill";
import { ProgressBar } from "./components/ProgressBar";

export function StudySession() {
  const { loading, current, stage, queueLength, submitGrade } = useStudySession();

  if (loading) {
    return <Card className="text-center text-on-surface-muted">Loading…</Card>;
  }
  if (!current) {
    return (
      <Card className="flex flex-col items-center gap-2 text-center">
        <span className="text-4xl" aria-hidden>🎉</span>
        <p className="font-display text-lg font-bold">All caught up</p>
        <p className="text-on-surface-muted">Nothing due right now — come back later.</p>
      </Card>
    );
  }

  const { showScriptInPrompt, requireScriptAnswer } = stageConfig(stage);
  const { card, exercise } = current;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Pill>Stage {stage}</Pill>
        <Pill>{queueLength} due</Pill>
      </div>
      <ProgressBar value={Math.max(0, 1)} max={queueLength + 1} label="Cards remaining" />
      {exercise === "meaning" && (
        <MeaningRecall card={card} showScript={showScriptInPrompt} onGrade={submitGrade} />
      )}
      {exercise === "listening" && (
        <Listening card={card} showScript={showScriptInPrompt} onGrade={submitGrade} />
      )}
      {exercise === "production" && (
        <Production card={card} requireScript={requireScriptAnswer} onGrade={submitGrade} />
      )}
      {exercise === "spelling" && (
        <Spelling card={card} requireScript={requireScriptAnswer} onGrade={submitGrade} />
      )}
    </section>
  );
}
```

- [ ] **Step 2: Run the StudySession test to verify it still passes**

Run: `bun run test src/ui/StudySession.test.tsx`
Expected: PASS — after load, a Show answer / Check / Play again button appears.

- [ ] **Step 3: Commit**

```bash
git add src/ui/StudySession.tsx
git commit -m "feat(ui): re-skin study session with progress and stage pills"
```

---

## Task 12: Re-skin AddCardForm

**Files:**
- Modify: `src/ui/AddCardForm.tsx`
- Test: existing `src/ui/AddCardForm.test.tsx` (must stay green)

**Interfaces:**
- Consumes: `Card`, `Button`, `TextField`, `Pill`. Props (`onAdded?`) and validation unchanged.
- Note: keep labels `Thai`/`Romanization`/`English`/`Category` (via `TextField label`), the `Tier` `<select>` with an associated label, the `Add card` submit button, and the exact error string `Fill in Thai, romanization, and English.`

- [ ] **Step 1: Re-skin AddCardForm**

Replace `src/ui/AddCardForm.tsx` with:

```tsx
import { useId, useState, type FormEvent } from "react";
import type { Card as CardType, Stage } from "../core/types";
import { putCard } from "../data/db";
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { TextField } from "./components/TextField";
import { Pill } from "./components/Pill";

export function AddCardForm({ onAdded }: { onAdded?: () => void }) {
  const [thai, setThai] = useState("");
  const [romanization, setRomanization] = useState("");
  const [english, setEnglish] = useState("");
  const [category, setCategory] = useState("custom");
  const [tier, setTier] = useState<Stage>(1);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const tierId = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!thai.trim() || !romanization.trim() || !english.trim()) {
      setError("Fill in Thai, romanization, and English.");
      return;
    }
    setError("");
    const card: CardType = {
      id: `user-${crypto.randomUUID()}`,
      thai: thai.trim(),
      romanization: romanization.trim(),
      english: english.trim(),
      category: category.trim() || "custom",
      tier,
      source: "user",
    };
    await putCard(card);
    setThai("");
    setRomanization("");
    setEnglish("");
    setSaved(true);
    onAdded?.();
  }

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold">Add a card</h2>
        <TextField label="Thai" thai value={thai} onChange={(e) => { setThai(e.target.value); setSaved(false); }} />
        <TextField label="Romanization" value={romanization} onChange={(e) => { setRomanization(e.target.value); setSaved(false); }} />
        <TextField label="English" value={english} onChange={(e) => { setEnglish(e.target.value); setSaved(false); }} />
        <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <div className="flex flex-col gap-1">
          <label htmlFor={tierId} className="text-sm font-semibold text-on-surface-muted">Tier</label>
          <select
            id={tierId}
            value={tier}
            onChange={(e) => setTier(Number(e.target.value) as Stage)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        {error && <p role="alert" className="text-error font-semibold">{error}</p>}
        {saved && <Pill className="self-start bg-success text-on-success border-success">✅ Card added</Pill>}
        <Button type="submit">Add card</Button>
      </form>
    </Card>
  );
}
```

- [ ] **Step 2: Run the AddCardForm test to verify it still passes**

Run: `bun run test src/ui/AddCardForm.test.tsx`
Expected: PASS — validation message shows; typing into Thai/Romanization/English and clicking Add card saves a user card.

- [ ] **Step 3: Commit**

```bash
git add src/ui/AddCardForm.tsx
git commit -m "feat(ui): re-skin add card form"
```

---

## Task 13: Re-skin ProgressView

**Files:**
- Modify: `src/ui/ProgressView.tsx`
- Test: existing `src/ui/ProgressView.test.tsx` (must stay green)

**Interfaces:**
- Consumes: `getProgress` / `exportAll` / `importAll` (unchanged), `Card`, `Button`, `Pill`.
- Note: keep the text `Current stage`, an Export button, and an `Import backup` label, and the `role="status"` import-result message.

- [ ] **Step 1: Re-skin ProgressView**

Replace `src/ui/ProgressView.tsx` with:

```tsx
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { getProgress } from "../data/db";
import { exportAll, importAll } from "../data/exportImport";
import type { UserProgress } from "../core/types";
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { Pill } from "./components/Pill";

export function ProgressView() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const importId = useId();

  useEffect(() => {
    void getProgress().then(setProgress);
  }, []);

  async function handleExport() {
    const json = await exportAll();
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "thai-trainer-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importAll(await file.text());
      setStatus("Import complete");
      setProgress(await getProgress());
    } catch {
      setStatus("Import failed — invalid backup file");
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold">Your progress</h2>
        {progress && (
          <div className="flex flex-col gap-2">
            <p className="text-on-surface-muted">Current stage</p>
            <p className="font-display text-4xl font-bold text-primary">{progress.currentStage}</p>
            <div className="flex flex-wrap gap-2">
              {progress.unlockedStages.map((s) => (
                <Pill key={s}>Stage {s}</Pill>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold">Backup</h2>
        <Button variant="secondary" onClick={handleExport}>Export backup</Button>
        <div className="flex flex-col gap-1">
          <label htmlFor={importId} className="text-sm font-semibold text-on-surface-muted">
            Import backup
          </label>
          <input
            id={importId}
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="text-sm text-on-surface-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:font-display file:font-bold file:text-on-primary"
          />
        </div>
        {status && <p role="status" className="text-on-surface-muted">{status}</p>}
      </Card>
    </section>
  );
}
```

- [ ] **Step 2: Run the ProgressView test to verify it still passes**

Run: `bun run test src/ui/ProgressView.test.tsx`
Expected: PASS — shows "Current stage", an Export button, and an "Import backup" labeled input.

- [ ] **Step 3: Commit**

```bash
git add src/ui/ProgressView.tsx
git commit -m "feat(ui): re-skin progress view with stat and backup cards"
```

---

## Task 14: Final integration — full suite, type-check, build

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `bun run test`
Expected: PASS — all unit/component tests green, including the new primitive, theme, contract, and App tests.

- [ ] **Step 2: Type-check + production build**

Run: `bun run build`
Expected: `tsc --noEmit` reports no errors; Vite build (with Tailwind + PWA) completes and writes `dist/`.

- [ ] **Step 3: Manual smoke check (dev server)**

Run: `bun run dev`, open the printed URL, and verify: the gold/red Temple theme renders; bottom nav switches Study/Add/Progress; an exercise shows a hero card with a 3D primary button; the theme switcher shows "Thai Temple". Stop the server when done.

- [ ] **Step 4: Commit any final touch-ups (if needed)**

```bash
git add -A
git commit -m "chore(ui): finalize themeable UI redesign"
```

---

## Self-Review

**Spec coverage:**
- Token system → Task 1 (`tokens.ts`, `base.css`, `temple.css`, contract test). ✔
- Theming architecture (CSS vars + `@theme inline`, `data-theme`) → Task 1 + Task 2. ✔
- Theme registry + persistence + switcher → Tasks 2, 3. ✔
- Component/visual language (Button, Card, ProgressBar, Feedback, Pill, BottomNav, TextField, IconButton, empty/done/no-voice states) → Tasks 4–7, plus empty/done in Task 11 and no-voice handled by existing `speakThai` no-op + reskinned Listening in Task 9. ✔
- Per-screen redesign (App shell, Study, exercises, Add, Progress) → Tasks 8–13. ✔
- Mobile-first bottom tab bar + safe area → Task 7/8. ✔
- Tailwind v4, no JS config → Task 1. ✔
- Testing (existing green + token-contract + theme tests) → Tasks 1–14. ✔
- No behavior/data changes → enforced by Global Constraints; only `ui/`, styles, shell touched. ✔

**Placeholder scan:** No TBD/TODO; every code step has complete code and exact commands. ✔

**Type consistency:** `Grade` values (`again`/`hard`/`good`/`easy`) match `core/types`; grade button labels capitalized but satisfy the case-insensitive test. `ButtonVariant` reused across exercises. `NavItem` shape consistent between `BottomNav` and `App`. `Card` imported as `Card` and card data aliased to `CardType` in exercises/forms to avoid name collision with the `Card` component. `TextField` label association verified for `getByLabelText`. ✔

**Note for implementer:** In exercises and forms, the domain type `Card` from `core/types` is imported as `CardType` because the presentational component is also named `Card`. Keep this aliasing.
