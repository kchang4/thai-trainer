# Thai Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a spaced-repetition Thai flashcard PWA that quizzes meaning, production, spelling, and listening, and grows from romanized + English toward Thai script and longer phrases.

**Architecture:** A React + TypeScript single-page PWA with no backend. Pure, framework-free core modules (SRS scheduler, stage rules, grading, session builder) hold all logic and are unit-tested in isolation. A thin IndexedDB data layer (via `idb`) persists cards, review state, and progress on-device, with JSON export/import as a manual cross-device bridge. React components render the study loop and consume the core through a single hook.

**Tech Stack:** React 18, TypeScript, Vite, Vitest + @testing-library/react + jsdom, `idb`, `fake-indexeddb` (tests), `vite-plugin-pwa`, browser Web Speech API for TTS.

## Global Constraints

- **No backend / no network calls for app data.** All persistence is local (IndexedDB). TTS uses the in-browser Web Speech API only.
- **Node.js 20+ and npm required** to build/run. (Not currently installed on the dev machine — install before Task 1.)
- **Core modules under `src/core/` must not import React, the DOM, or `idb`.** They are pure TypeScript: inputs in, values out. This keeps them unit-testable and portable to a future mobile wrapper.
- **All time is passed in explicitly** as `now: number` (epoch ms) to scheduling/session functions — never call `Date.now()` inside core modules, so tests are deterministic.
- **Tunable constants live in `src/core/config.ts`** and are imported where needed — no magic numbers scattered in logic.
- **TypeScript strict mode on.** No `any` in committed code.
- Commit after every task with the message shown in its final step.

---

## File Structure

```
thai-trainer/
  package.json, tsconfig.json, vite.config.ts, index.html
  src/
    main.tsx                     # React entry, mounts <App/>
    App.tsx                      # top-level screen routing (study / add / progress)
    core/                        # PURE TS — no React, no DOM, no idb
      types.ts                   # Card, ReviewState, UserProgress, enums
      config.ts                  # tunable constants
      srs.ts                     # SM-2 scheduler
      grading.ts                 # typed-answer normalization + grading
      stages.ts                  # mastery, stage advancement, per-stage exercise config
      session.ts                 # due-card selection + exercise picking
    data/
      starterDeck.ts             # curated built-in cards
      db.ts                      # idb wrapper: CRUD for cards/states/progress
      exportImport.ts            # serialize/deserialize all data to/from JSON
    tts/
      speak.ts                   # Web Speech API wrapper
    ui/
      useStudySession.ts         # hook: wires core + db into a session
      StudySession.tsx           # renders current exercise, handles grading
      exercises/
        MeaningRecall.tsx        # exercise A
        Production.tsx           # exercise B
        Spelling.tsx             # exercise C
        Listening.tsx            # exercise D
      AddCardForm.tsx            # add a user card
      ProgressView.tsx           # stage/progress + export/import buttons
  docs/superpowers/...           # spec + this plan
```

---

## Task 1: Project scaffold + test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/setupTests.ts`, `src/core/sanity.test.ts`

**Interfaces:**
- Produces: a runnable Vite dev server and a green Vitest run that other tasks build on.

- [ ] **Step 1: Initialize package.json**

Create `package.json`:

```json
{
  "name": "thai-trainer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "idb": "^8.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "fake-indexeddb": "^6.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vite-plugin-pwa": "^0.20.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Add tsconfig.json**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Add vite.config.ts and index.html**

Create `vite.config.ts` (PWA plugin added in Task 16; minimal for now):

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
```

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thai Trainer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Add React entry and placeholder App**

Create `src/setupTests.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return <h1>Thai Trainer</h1>;
}
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Write a sanity test**

Create `src/core/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Install and run tests**

Run: `npm install && npm test`
Expected: Vitest reports 1 passing test.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS + Vitest project"
```

---

## Task 2: Core domain types

**Files:**
- Create: `src/core/types.ts`, `src/core/config.ts`
- Test: `src/core/config.test.ts`

**Interfaces:**
- Produces:
  - `type Stage = 1 | 2 | 3 | 4`
  - `type Grade = "again" | "hard" | "good" | "easy"`
  - `type ExerciseType = "meaning" | "production" | "spelling" | "listening"`
  - `type CardSource = "builtin" | "user"`
  - `interface Card { id: string; thai: string; romanization: string; english: string; category: string; tier: Stage; source: CardSource; example?: string; notes?: string; }`
  - `interface ReviewState { cardId: string; dueDate: number; interval: number; ease: number; repetitions: number; lapses: number; lastReviewed: number | null; }`
  - `interface UserProgress { currentStage: Stage; unlockedStages: Stage[]; enabledExercises: ExerciseType[]; }`
  - `config` constants: `INITIAL_EASE=2.5`, `MIN_EASE=1.3`, `MASTERY_MIN_REPS=2`, `MASTERY_MIN_INTERVAL_DAYS=7`, `STAGE_ADVANCE_THRESHOLD=8`, `DAY_MS=86_400_000`.

- [ ] **Step 1: Write the failing test**

Create `src/core/config.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { config } from "./config";

describe("config", () => {
  it("exposes tunable SRS and stage constants", () => {
    expect(config.INITIAL_EASE).toBe(2.5);
    expect(config.MIN_EASE).toBe(1.3);
    expect(config.MASTERY_MIN_REPS).toBe(2);
    expect(config.MASTERY_MIN_INTERVAL_DAYS).toBe(7);
    expect(config.STAGE_ADVANCE_THRESHOLD).toBe(8);
    expect(config.DAY_MS).toBe(86_400_000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/config.test.ts`
Expected: FAIL — cannot find module `./config`.

- [ ] **Step 3: Write types.ts and config.ts**

Create `src/core/types.ts`:

```ts
export type Stage = 1 | 2 | 3 | 4;
export type Grade = "again" | "hard" | "good" | "easy";
export type ExerciseType = "meaning" | "production" | "spelling" | "listening";
export type CardSource = "builtin" | "user";

export interface Card {
  id: string;
  thai: string;
  romanization: string;
  english: string;
  category: string;
  tier: Stage;
  source: CardSource;
  example?: string;
  notes?: string;
}

export interface ReviewState {
  cardId: string;
  dueDate: number; // epoch ms
  interval: number; // days
  ease: number;
  repetitions: number;
  lapses: number;
  lastReviewed: number | null; // epoch ms
}

export interface UserProgress {
  currentStage: Stage;
  unlockedStages: Stage[];
  enabledExercises: ExerciseType[];
}
```

Create `src/core/config.ts`:

```ts
export const config = {
  INITIAL_EASE: 2.5,
  MIN_EASE: 1.3,
  MASTERY_MIN_REPS: 2,
  MASTERY_MIN_INTERVAL_DAYS: 7,
  STAGE_ADVANCE_THRESHOLD: 8,
  DAY_MS: 86_400_000,
} as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/config.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/types.ts src/core/config.ts src/core/config.test.ts
git commit -m "feat: add core domain types and tunable config"
```

---

## Task 3: SRS scheduler

**Files:**
- Create: `src/core/srs.ts`
- Test: `src/core/srs.test.ts`

**Interfaces:**
- Consumes: `Card`, `ReviewState`, `Grade` from `types.ts`; `config`.
- Produces:
  - `createInitialReviewState(cardId: string, now: number): ReviewState`
  - `scheduleReview(state: ReviewState, grade: Grade, now: number): ReviewState`

Scheduler rules (SM-2 variant), applied to produce the **next** state:
- `again`: `repetitions=0`, `interval=0`, `lapses+1`, `ease=max(MIN_EASE, ease-0.2)`, `dueDate=now` (re-show this session).
- `hard`: `interval = repetitions===0 ? 1 : max(1, round(interval*1.2))`, `ease=max(MIN_EASE, ease-0.15)`, `repetitions+1`.
- `good`: `interval = repetitions===0 ? 1 : repetitions===1 ? 6 : round(interval*ease)`, `ease` unchanged, `repetitions+1`.
- `easy`: `interval = repetitions===0 ? 4 : round(interval*ease*1.3)`, `ease=ease+0.15`, `repetitions+1`.
- For non-`again` grades: `dueDate = now + interval*DAY_MS`. All set `lastReviewed=now`.

- [ ] **Step 1: Write the failing tests**

Create `src/core/srs.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createInitialReviewState, scheduleReview } from "./srs";
import { config } from "./config";

const NOW = 1_000_000_000_000;

describe("createInitialReviewState", () => {
  it("starts due now with default ease and zeroed counters", () => {
    const s = createInitialReviewState("c1", NOW);
    expect(s).toEqual({
      cardId: "c1",
      dueDate: NOW,
      interval: 0,
      ease: config.INITIAL_EASE,
      repetitions: 0,
      lapses: 0,
      lastReviewed: null,
    });
  });
});

describe("scheduleReview", () => {
  it("good on a new card sets interval 1 day and increments reps", () => {
    const s = scheduleReview(createInitialReviewState("c1", NOW), "good", NOW);
    expect(s.interval).toBe(1);
    expect(s.repetitions).toBe(1);
    expect(s.dueDate).toBe(NOW + 1 * config.DAY_MS);
    expect(s.lastReviewed).toBe(NOW);
  });

  it("second good sets interval to 6 days", () => {
    let s = scheduleReview(createInitialReviewState("c1", NOW), "good", NOW);
    s = scheduleReview(s, "good", NOW);
    expect(s.repetitions).toBe(2);
    expect(s.interval).toBe(6);
  });

  it("third good multiplies interval by ease", () => {
    let s = createInitialReviewState("c1", NOW);
    s = scheduleReview(s, "good", NOW); // 1
    s = scheduleReview(s, "good", NOW); // 6
    s = scheduleReview(s, "good", NOW); // round(6 * 2.5) = 15
    expect(s.interval).toBe(15);
  });

  it("again resets reps/interval, adds a lapse, lowers ease, due now", () => {
    let s = createInitialReviewState("c1", NOW);
    s = scheduleReview(s, "good", NOW);
    s = scheduleReview(s, "again", NOW);
    expect(s.repetitions).toBe(0);
    expect(s.interval).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.ease).toBeCloseTo(2.3, 5);
    expect(s.dueDate).toBe(NOW);
  });

  it("ease never drops below MIN_EASE", () => {
    let s = createInitialReviewState("c1", NOW);
    for (let i = 0; i < 20; i++) s = scheduleReview(s, "again", NOW);
    expect(s.ease).toBe(config.MIN_EASE);
  });

  it("easy on a new card sets interval 4 and raises ease", () => {
    const s = scheduleReview(createInitialReviewState("c1", NOW), "easy", NOW);
    expect(s.interval).toBe(4);
    expect(s.ease).toBeCloseTo(2.65, 5);
  });

  it("hard on a new card sets interval 1 and lowers ease", () => {
    const s = scheduleReview(createInitialReviewState("c1", NOW), "hard", NOW);
    expect(s.interval).toBe(1);
    expect(s.ease).toBeCloseTo(2.35, 5);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/core/srs.test.ts`
Expected: FAIL — cannot find module `./srs`.

- [ ] **Step 3: Implement srs.ts**

Create `src/core/srs.ts`:

```ts
import type { Grade, ReviewState } from "./types";
import { config } from "./config";

export function createInitialReviewState(cardId: string, now: number): ReviewState {
  return {
    cardId,
    dueDate: now,
    interval: 0,
    ease: config.INITIAL_EASE,
    repetitions: 0,
    lapses: 0,
    lastReviewed: null,
  };
}

export function scheduleReview(state: ReviewState, grade: Grade, now: number): ReviewState {
  const next: ReviewState = { ...state, lastReviewed: now };

  if (grade === "again") {
    next.repetitions = 0;
    next.interval = 0;
    next.lapses = state.lapses + 1;
    next.ease = Math.max(config.MIN_EASE, state.ease - 0.2);
    next.dueDate = now;
    return next;
  }

  if (grade === "hard") {
    next.ease = Math.max(config.MIN_EASE, state.ease - 0.15);
    next.interval = state.repetitions === 0 ? 1 : Math.max(1, Math.round(state.interval * 1.2));
  } else if (grade === "good") {
    if (state.repetitions === 0) next.interval = 1;
    else if (state.repetitions === 1) next.interval = 6;
    else next.interval = Math.round(state.interval * state.ease);
  } else {
    // easy
    next.ease = state.ease + 0.15;
    next.interval = state.repetitions === 0 ? 4 : Math.round(state.interval * state.ease * 1.3);
  }

  next.repetitions = state.repetitions + 1;
  next.dueDate = now + next.interval * config.DAY_MS;
  return next;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/core/srs.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/core/srs.ts src/core/srs.test.ts
git commit -m "feat: add SM-2 spaced-repetition scheduler"
```

---

## Task 4: Answer grading

**Files:**
- Create: `src/core/grading.ts`
- Test: `src/core/grading.test.ts`

**Interfaces:**
- Produces:
  - `normalizeAnswer(s: string): string` — trims, lowercases, collapses internal whitespace, strips spaces/hyphens/apostrophes (so "sa-wat dee" === "sawatdee").
  - `gradeTypedAnswer(expected: string, actual: string): boolean` — true when `normalizeAnswer(expected) === normalizeAnswer(actual)`.

- [ ] **Step 1: Write the failing tests**

Create `src/core/grading.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { normalizeAnswer, gradeTypedAnswer } from "./grading";

describe("normalizeAnswer", () => {
  it("lowercases and trims", () => {
    expect(normalizeAnswer("  Sawatdee ")).toBe("sawatdee");
  });
  it("strips spaces, hyphens, and apostrophes", () => {
    expect(normalizeAnswer("sa-wat dee")).toBe("sawatdee");
    expect(normalizeAnswer("a'roi")).toBe("aroi");
  });
});

describe("gradeTypedAnswer", () => {
  it("accepts answers that differ only by spacing/case/hyphens", () => {
    expect(gradeTypedAnswer("sawatdee", "Sa-Wat Dee")).toBe(true);
  });
  it("rejects genuinely different answers", () => {
    expect(gradeTypedAnswer("sawatdee", "khopkhun")).toBe(false);
  });
  it("compares Thai script exactly after trim", () => {
    expect(gradeTypedAnswer("สวัสดี", " สวัสดี ")).toBe(true);
    expect(gradeTypedAnswer("สวัสดี", "สวัด")).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/core/grading.test.ts`
Expected: FAIL — cannot find module `./grading`.

- [ ] **Step 3: Implement grading.ts**

Create `src/core/grading.ts`:

```ts
export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s'-]+/g, "");
}

export function gradeTypedAnswer(expected: string, actual: string): boolean {
  return normalizeAnswer(expected) === normalizeAnswer(actual);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/core/grading.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/grading.ts src/core/grading.test.ts
git commit -m "feat: add typed-answer normalization and grading"
```

---

## Task 5: Stage rules

**Files:**
- Create: `src/core/stages.ts`
- Test: `src/core/stages.test.ts`

**Interfaces:**
- Consumes: `Card`, `ReviewState`, `Stage`, `ExerciseType` from `types.ts`; `config`.
- Produces:
  - `isMastered(state: ReviewState): boolean` — `repetitions >= MASTERY_MIN_REPS && interval >= MASTERY_MIN_INTERVAL_DAYS`.
  - `isCardVisibleAtStage(card: Card, stage: Stage): boolean` — `card.tier <= stage`.
  - `countMasteredAtStage(cards: Card[], states: Map<string, ReviewState>, stage: Stage): number`
  - `canAdvanceStage(cards: Card[], states: Map<string, ReviewState>, stage: Stage): boolean` — stage < 4 and mastered count at stage >= `STAGE_ADVANCE_THRESHOLD`.
  - `stageConfig(stage: Stage): { showScriptInPrompt: boolean; requireScriptAnswer: boolean }` — `showScriptInPrompt = stage >= 2`, `requireScriptAnswer = stage >= 3`.

- [ ] **Step 1: Write the failing tests**

Create `src/core/stages.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  isMastered,
  isCardVisibleAtStage,
  countMasteredAtStage,
  canAdvanceStage,
  stageConfig,
} from "./stages";
import type { Card, ReviewState } from "./types";
import { config } from "./config";

function card(id: string, tier: 1 | 2 | 3 | 4): Card {
  return { id, thai: "x", romanization: "x", english: "x", category: "c", tier, source: "builtin" };
}
function state(cardId: string, repetitions: number, interval: number): ReviewState {
  return { cardId, dueDate: 0, interval, ease: 2.5, repetitions, lapses: 0, lastReviewed: 0 };
}

describe("isMastered", () => {
  it("requires enough reps and interval", () => {
    expect(isMastered(state("a", 2, 7))).toBe(true);
    expect(isMastered(state("a", 1, 30))).toBe(false);
    expect(isMastered(state("a", 5, 6))).toBe(false);
  });
});

describe("isCardVisibleAtStage", () => {
  it("shows cards at or below the current stage tier", () => {
    expect(isCardVisibleAtStage(card("a", 1), 1)).toBe(true);
    expect(isCardVisibleAtStage(card("a", 4), 1)).toBe(false);
    expect(isCardVisibleAtStage(card("a", 4), 4)).toBe(true);
  });
});

describe("countMasteredAtStage / canAdvanceStage", () => {
  it("counts only mastered, visible cards and gates advancement", () => {
    const cards = Array.from({ length: 10 }, (_, i) => card(`c${i}`, 1));
    const states = new Map<string, ReviewState>();
    cards.forEach((c, i) => states.set(c.id, state(c.id, 2, i < config.STAGE_ADVANCE_THRESHOLD ? 7 : 1)));
    expect(countMasteredAtStage(cards, states, 1)).toBe(config.STAGE_ADVANCE_THRESHOLD);
    expect(canAdvanceStage(cards, states, 1)).toBe(true);
  });

  it("never advances past stage 4", () => {
    const cards = Array.from({ length: 10 }, (_, i) => card(`c${i}`, 4));
    const states = new Map<string, ReviewState>();
    cards.forEach((c) => states.set(c.id, state(c.id, 2, 7)));
    expect(canAdvanceStage(cards, states, 4)).toBe(false);
  });
});

describe("stageConfig", () => {
  it("introduces script reading at stage 2 and script answers at stage 3", () => {
    expect(stageConfig(1)).toEqual({ showScriptInPrompt: false, requireScriptAnswer: false });
    expect(stageConfig(2)).toEqual({ showScriptInPrompt: true, requireScriptAnswer: false });
    expect(stageConfig(3)).toEqual({ showScriptInPrompt: true, requireScriptAnswer: true });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/core/stages.test.ts`
Expected: FAIL — cannot find module `./stages`.

- [ ] **Step 3: Implement stages.ts**

Create `src/core/stages.ts`:

```ts
import type { Card, ReviewState, Stage } from "./types";
import { config } from "./config";

export function isMastered(state: ReviewState): boolean {
  return (
    state.repetitions >= config.MASTERY_MIN_REPS &&
    state.interval >= config.MASTERY_MIN_INTERVAL_DAYS
  );
}

export function isCardVisibleAtStage(card: Card, stage: Stage): boolean {
  return card.tier <= stage;
}

export function countMasteredAtStage(
  cards: Card[],
  states: Map<string, ReviewState>,
  stage: Stage,
): number {
  let count = 0;
  for (const c of cards) {
    if (!isCardVisibleAtStage(c, stage)) continue;
    const s = states.get(c.id);
    if (s && isMastered(s)) count++;
  }
  return count;
}

export function canAdvanceStage(
  cards: Card[],
  states: Map<string, ReviewState>,
  stage: Stage,
): boolean {
  if (stage >= 4) return false;
  return countMasteredAtStage(cards, states, stage) >= config.STAGE_ADVANCE_THRESHOLD;
}

export function stageConfig(stage: Stage): {
  showScriptInPrompt: boolean;
  requireScriptAnswer: boolean;
} {
  return {
    showScriptInPrompt: stage >= 2,
    requireScriptAnswer: stage >= 3,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/core/stages.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/stages.ts src/core/stages.test.ts
git commit -m "feat: add mastery, stage advancement, and per-stage config rules"
```

---

## Task 6: Session builder

**Files:**
- Create: `src/core/session.ts`
- Test: `src/core/session.test.ts`

**Interfaces:**
- Consumes: `Card`, `ReviewState`, `Stage`, `ExerciseType` from `types.ts`; `isCardVisibleAtStage`.
- Produces:
  - `getDueCards(cards: Card[], states: Map<string, ReviewState>, stage: Stage, now: number): Card[]` — cards visible at `stage` whose state is missing (never seen) or `dueDate <= now`, sorted by `dueDate` ascending (never-seen treated as due now, i.e. dueDate 0).
  - `pickExercise(card: Card, stage: Stage, enabled: ExerciseType[], rng: () => number): ExerciseType` — choose uniformly at random from `enabled`, using injected `rng` for determinism. Falls back to `"meaning"` if `enabled` is empty.

- [ ] **Step 1: Write the failing tests**

Create `src/core/session.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getDueCards, pickExercise } from "./session";
import type { Card, ReviewState } from "./types";

const NOW = 1_000;

function card(id: string, tier: 1 | 2 | 3 | 4): Card {
  return { id, thai: "x", romanization: "x", english: "x", category: "c", tier, source: "builtin" };
}
function dueState(cardId: string, dueDate: number): ReviewState {
  return { cardId, dueDate, interval: 1, ease: 2.5, repetitions: 1, lapses: 0, lastReviewed: 0 };
}

describe("getDueCards", () => {
  it("includes never-seen and overdue cards, excludes not-yet-due", () => {
    const cards = [card("seen-due", 1), card("seen-future", 1), card("new", 1)];
    const states = new Map<string, ReviewState>([
      ["seen-due", dueState("seen-due", NOW - 10)],
      ["seen-future", dueState("seen-future", NOW + 10)],
    ]);
    const due = getDueCards(cards, states, 1, NOW).map((c) => c.id);
    expect(due).toContain("seen-due");
    expect(due).toContain("new");
    expect(due).not.toContain("seen-future");
  });

  it("excludes cards above the current stage tier", () => {
    const cards = [card("low", 1), card("high", 3)];
    const due = getDueCards(cards, new Map(), 1, NOW).map((c) => c.id);
    expect(due).toEqual(["low"]);
  });

  it("sorts by due date ascending (never-seen first)", () => {
    const cards = [card("a", 1), card("b", 1)];
    const states = new Map<string, ReviewState>([["a", dueState("a", NOW - 5)]]);
    const due = getDueCards(cards, states, 1, NOW).map((c) => c.id);
    expect(due).toEqual(["b", "a"]); // b never-seen (dueDate 0) sorts before a
  });
});

describe("pickExercise", () => {
  it("selects from enabled exercises using injected rng", () => {
    const c = card("a", 1);
    expect(pickExercise(c, 1, ["meaning", "listening", "spelling"], () => 0)).toBe("meaning");
    expect(pickExercise(c, 1, ["meaning", "listening", "spelling"], () => 0.9)).toBe("spelling");
  });

  it("falls back to meaning when nothing is enabled", () => {
    expect(pickExercise(card("a", 1), 1, [], () => 0.5)).toBe("meaning");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/core/session.test.ts`
Expected: FAIL — cannot find module `./session`.

- [ ] **Step 3: Implement session.ts**

Create `src/core/session.ts`:

```ts
import type { Card, ExerciseType, ReviewState, Stage } from "./types";
import { isCardVisibleAtStage } from "./stages";

export function getDueCards(
  cards: Card[],
  states: Map<string, ReviewState>,
  stage: Stage,
  now: number,
): Card[] {
  const dueOf = (c: Card): number => states.get(c.id)?.dueDate ?? 0;
  return cards
    .filter((c) => isCardVisibleAtStage(c, stage))
    .filter((c) => dueOf(c) <= now)
    .sort((a, b) => dueOf(a) - dueOf(b));
}

export function pickExercise(
  _card: Card,
  _stage: Stage,
  enabled: ExerciseType[],
  rng: () => number,
): ExerciseType {
  if (enabled.length === 0) return "meaning";
  const idx = Math.min(enabled.length - 1, Math.floor(rng() * enabled.length));
  return enabled[idx];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/core/session.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/session.ts src/core/session.test.ts
git commit -m "feat: add due-card selection and exercise picking"
```

---

## Task 7: Curated starter deck

**Files:**
- Create: `src/data/starterDeck.ts`
- Test: `src/data/starterDeck.test.ts`

**Interfaces:**
- Consumes: `Card` from `../core/types`.
- Produces: `export const starterDeck: Card[]` — ~30 cards, all `source: "builtin"`, unique ids, tiers spread across 1–4 (phrases at tier 4).

- [ ] **Step 1: Write the failing tests**

Create `src/data/starterDeck.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { starterDeck } from "./starterDeck";

describe("starterDeck", () => {
  it("has at least 25 cards", () => {
    expect(starterDeck.length).toBeGreaterThanOrEqual(25);
  });
  it("has unique ids", () => {
    const ids = new Set(starterDeck.map((c) => c.id));
    expect(ids.size).toBe(starterDeck.length);
  });
  it("every card is builtin and fully populated", () => {
    for (const c of starterDeck) {
      expect(c.source).toBe("builtin");
      expect(c.thai).not.toBe("");
      expect(c.romanization).not.toBe("");
      expect(c.english).not.toBe("");
      expect([1, 2, 3, 4]).toContain(c.tier);
    }
  });
  it("includes tier 1 cards and tier 4 phrase cards", () => {
    expect(starterDeck.some((c) => c.tier === 1)).toBe(true);
    expect(starterDeck.some((c) => c.tier === 4)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/data/starterDeck.test.ts`
Expected: FAIL — cannot find module `./starterDeck`.

- [ ] **Step 3: Implement starterDeck.ts**

Create `src/data/starterDeck.ts`:

```ts
import type { Card } from "../core/types";

export const starterDeck: Card[] = [
  // Tier 1 — greetings & essentials
  { id: "b-hello", thai: "สวัสดี", romanization: "sawatdee", english: "hello", category: "greetings", tier: 1, source: "builtin" },
  { id: "b-thanks", thai: "ขอบคุณ", romanization: "khopkhun", english: "thank you", category: "greetings", tier: 1, source: "builtin" },
  { id: "b-yes", thai: "ใช่", romanization: "chai", english: "yes", category: "essentials", tier: 1, source: "builtin" },
  { id: "b-no", thai: "ไม่", romanization: "mai", english: "no", category: "essentials", tier: 1, source: "builtin" },
  { id: "b-sorry", thai: "ขอโทษ", romanization: "khotot", english: "sorry / excuse me", category: "greetings", tier: 1, source: "builtin" },
  { id: "b-good", thai: "ดี", romanization: "dee", english: "good", category: "essentials", tier: 1, source: "builtin" },
  { id: "b-water", thai: "น้ำ", romanization: "nam", english: "water", category: "food", tier: 1, source: "builtin" },
  { id: "b-rice", thai: "ข้าว", romanization: "khao", english: "rice", category: "food", tier: 1, source: "builtin" },

  // Tier 2 — numbers & more nouns
  { id: "b-one", thai: "หนึ่ง", romanization: "neung", english: "one", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-two", thai: "สอง", romanization: "song", english: "two", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-three", thai: "สาม", romanization: "sam", english: "three", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-four", thai: "สี่", romanization: "see", english: "four", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-five", thai: "ห้า", romanization: "ha", english: "five", category: "numbers", tier: 2, source: "builtin" },
  { id: "b-coffee", thai: "กาแฟ", romanization: "kafae", english: "coffee", category: "food", tier: 2, source: "builtin" },
  { id: "b-egg", thai: "ไข่", romanization: "khai", english: "egg", category: "food", tier: 2, source: "builtin" },
  { id: "b-chicken", thai: "ไก่", romanization: "kai", english: "chicken", category: "food", tier: 2, source: "builtin" },

  // Tier 3 — adjectives, verbs, useful words
  { id: "b-delicious", thai: "อร่อย", romanization: "aroi", english: "delicious", category: "food", tier: 3, source: "builtin" },
  { id: "b-spicy", thai: "เผ็ด", romanization: "phet", english: "spicy", category: "food", tier: 3, source: "builtin" },
  { id: "b-hot", thai: "ร้อน", romanization: "ron", english: "hot", category: "adjectives", tier: 3, source: "builtin" },
  { id: "b-cold", thai: "เย็น", romanization: "yen", english: "cold", category: "adjectives", tier: 3, source: "builtin" },
  { id: "b-go", thai: "ไป", romanization: "pai", english: "to go", category: "verbs", tier: 3, source: "builtin" },
  { id: "b-eat", thai: "กิน", romanization: "kin", english: "to eat", category: "verbs", tier: 3, source: "builtin" },
  { id: "b-want", thai: "อยาก", romanization: "yak", english: "to want", category: "verbs", tier: 3, source: "builtin" },

  // Tier 4 — common phrases / sentences
  { id: "b-howareyou", thai: "สบายดีไหม", romanization: "sabai dee mai", english: "how are you?", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-imfine", thai: "สบายดี", romanization: "sabai dee", english: "I'm fine", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-howmuch", thai: "เท่าไหร่", romanization: "tao rai", english: "how much?", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-checkbill", thai: "เช็คบิล", romanization: "chek bin", english: "check, please", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-dontunderstand", thai: "ไม่เข้าใจ", romanization: "mai khao jai", english: "I don't understand", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-where-toilet", thai: "ห้องน้ำอยู่ไหน", romanization: "hong nam yu nai", english: "where is the toilet?", category: "phrases", tier: 4, source: "builtin" },
  { id: "b-notspicy", thai: "ไม่เผ็ด", romanization: "mai phet", english: "not spicy", category: "phrases", tier: 4, source: "builtin" },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/data/starterDeck.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/starterDeck.ts src/data/starterDeck.test.ts
git commit -m "feat: add curated starter deck"
```

---

## Task 8: IndexedDB data layer

**Files:**
- Create: `src/data/db.ts`
- Test: `src/data/db.test.ts`

**Interfaces:**
- Consumes: `Card`, `ReviewState`, `UserProgress` from `../core/types`; `starterDeck`; `idb`.
- Produces:
  - `openDb(): Promise<ThaiDb>` (typed `idb` database handle).
  - `seedIfEmpty(): Promise<void>` — on first run, inserts `starterDeck` and a default `UserProgress` (`currentStage: 1`, `unlockedStages: [1]`, `enabledExercises: ["meaning","production","spelling","listening"]`).
  - `getAllCards(): Promise<Card[]>`
  - `putCard(card: Card): Promise<void>`
  - `getAllReviewStates(): Promise<ReviewState[]>`
  - `putReviewState(state: ReviewState): Promise<void>`
  - `getProgress(): Promise<UserProgress>`
  - `putProgress(p: UserProgress): Promise<void>`
- Object stores: `cards` (keyPath `id`), `reviewStates` (keyPath `cardId`), `progress` (keyPath fixed key `"singleton"` via a wrapper field `key`).

- [ ] **Step 1: Write the failing tests**

Create `src/data/db.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import {
  seedIfEmpty,
  getAllCards,
  putCard,
  getAllReviewStates,
  putReviewState,
  getProgress,
  putProgress,
} from "./db";
import type { Card } from "../core/types";

beforeEach(() => {
  // fresh database per test
  globalThis.indexedDB = new IDBFactory();
});

describe("db", () => {
  it("seeds the starter deck and default progress on first run", async () => {
    await seedIfEmpty();
    const cards = await getAllCards();
    expect(cards.length).toBeGreaterThanOrEqual(25);
    const progress = await getProgress();
    expect(progress.currentStage).toBe(1);
    expect(progress.enabledExercises).toContain("meaning");
  });

  it("does not duplicate cards when seeded twice", async () => {
    await seedIfEmpty();
    const first = (await getAllCards()).length;
    await seedIfEmpty();
    expect((await getAllCards()).length).toBe(first);
  });

  it("stores and retrieves a user card", async () => {
    await seedIfEmpty();
    const c: Card = { id: "u-1", thai: "แมว", romanization: "maew", english: "cat", category: "animals", tier: 1, source: "user" };
    await putCard(c);
    expect((await getAllCards()).find((x) => x.id === "u-1")).toEqual(c);
  });

  it("stores and retrieves review state and progress", async () => {
    await seedIfEmpty();
    await putReviewState({ cardId: "b-hello", dueDate: 5, interval: 1, ease: 2.5, repetitions: 1, lapses: 0, lastReviewed: 1 });
    expect((await getAllReviewStates()).find((s) => s.cardId === "b-hello")?.interval).toBe(1);
    await putProgress({ currentStage: 2, unlockedStages: [1, 2], enabledExercises: ["meaning"] });
    expect((await getProgress()).currentStage).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/data/db.test.ts`
Expected: FAIL — cannot find module `./db`.

- [ ] **Step 3: Implement db.ts**

Create `src/data/db.ts`:

```ts
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Card, ReviewState, UserProgress } from "../core/types";
import { starterDeck } from "./starterDeck";

const PROGRESS_KEY = "singleton";
const DEFAULT_PROGRESS: UserProgress = {
  currentStage: 1,
  unlockedStages: [1],
  enabledExercises: ["meaning", "production", "spelling", "listening"],
};

interface StoredProgress extends UserProgress {
  key: string;
}

interface ThaiSchema extends DBSchema {
  cards: { key: string; value: Card };
  reviewStates: { key: string; value: ReviewState };
  progress: { key: string; value: StoredProgress };
}

let dbPromise: Promise<IDBPDatabase<ThaiSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<ThaiSchema>> {
  // Not cached across tests because each test swaps globalThis.indexedDB.
  if (dbPromise) return dbPromise;
  dbPromise = openDB<ThaiSchema>("thai-trainer", 1, {
    upgrade(db) {
      db.createObjectStore("cards", { keyPath: "id" });
      db.createObjectStore("reviewStates", { keyPath: "cardId" });
      db.createObjectStore("progress", { keyPath: "key" });
    },
  });
  return dbPromise;
}

// Allows tests to reset the cached connection when they swap indexedDB.
export function _resetDbForTests(): void {
  dbPromise = null;
}

export async function seedIfEmpty(): Promise<void> {
  const db = await getDb();
  const count = await db.count("cards");
  if (count === 0) {
    const tx = db.transaction("cards", "readwrite");
    for (const c of starterDeck) await tx.store.put(c);
    await tx.done;
  }
  const existing = await db.get("progress", PROGRESS_KEY);
  if (!existing) {
    await db.put("progress", { key: PROGRESS_KEY, ...DEFAULT_PROGRESS });
  }
}

export async function getAllCards(): Promise<Card[]> {
  return (await getDb()).getAll("cards");
}

export async function putCard(card: Card): Promise<void> {
  await (await getDb()).put("cards", card);
}

export async function getAllReviewStates(): Promise<ReviewState[]> {
  return (await getDb()).getAll("reviewStates");
}

export async function putReviewState(state: ReviewState): Promise<void> {
  await (await getDb()).put("reviewStates", state);
}

export async function getProgress(): Promise<UserProgress> {
  const stored = await (await getDb()).get("progress", PROGRESS_KEY);
  if (!stored) return { ...DEFAULT_PROGRESS };
  const { key: _key, ...progress } = stored;
  return progress;
}

export async function putProgress(p: UserProgress): Promise<void> {
  await (await getDb()).put("progress", { key: PROGRESS_KEY, ...p });
}
```

- [ ] **Step 4: Update the test to reset the cached connection**

Because `db.ts` caches the connection, update the `beforeEach` in `src/data/db.test.ts` to reset it. Change the import and `beforeEach`:

```ts
import { _resetDbForTests } from "./db";
// ...
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/data/db.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/db.ts src/data/db.test.ts
git commit -m "feat: add IndexedDB data layer with starter-deck seeding"
```

---

## Task 9: Export / import

**Files:**
- Create: `src/data/exportImport.ts`
- Test: `src/data/exportImport.test.ts`

**Interfaces:**
- Consumes: `Card`, `ReviewState`, `UserProgress`; db functions from `./db`.
- Produces:
  - `interface BackupData { version: 1; cards: Card[]; reviewStates: ReviewState[]; progress: UserProgress; }`
  - `serializeBackup(data: BackupData): string` — pretty JSON.
  - `parseBackup(json: string): BackupData` — throws `Error("Invalid backup file")` if shape is wrong or version unsupported.
  - `exportAll(): Promise<string>` — reads everything from db, returns JSON string.
  - `importAll(json: string): Promise<void>` — parses, then writes all cards/states/progress into db.

- [ ] **Step 1: Write the failing tests**

Create `src/data/exportImport.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { serializeBackup, parseBackup, exportAll, importAll, type BackupData } from "./exportImport";
import { seedIfEmpty, getAllCards, getProgress, _resetDbForTests } from "./db";

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
});

const sample: BackupData = {
  version: 1,
  cards: [{ id: "u-1", thai: "แมว", romanization: "maew", english: "cat", category: "animals", tier: 1, source: "user" }],
  reviewStates: [{ cardId: "u-1", dueDate: 5, interval: 1, ease: 2.5, repetitions: 1, lapses: 0, lastReviewed: 1 }],
  progress: { currentStage: 2, unlockedStages: [1, 2], enabledExercises: ["meaning"] },
};

describe("serialize/parse", () => {
  it("round-trips", () => {
    expect(parseBackup(serializeBackup(sample))).toEqual(sample);
  });
  it("rejects malformed json", () => {
    expect(() => parseBackup("{not json")).toThrow("Invalid backup file");
  });
  it("rejects unsupported version", () => {
    expect(() => parseBackup(JSON.stringify({ version: 99 }))).toThrow("Invalid backup file");
  });
});

describe("exportAll/importAll", () => {
  it("exports seeded data and re-imports a backup", async () => {
    await seedIfEmpty();
    const json = await exportAll();
    const parsed = parseBackup(json);
    expect(parsed.cards.length).toBeGreaterThanOrEqual(25);

    await importAll(serializeBackup(sample));
    expect((await getAllCards()).find((c) => c.id === "u-1")?.english).toBe("cat");
    expect((await getProgress()).currentStage).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/data/exportImport.test.ts`
Expected: FAIL — cannot find module `./exportImport`.

- [ ] **Step 3: Implement exportImport.ts**

Create `src/data/exportImport.ts`:

```ts
import type { Card, ReviewState, UserProgress } from "../core/types";
import {
  getAllCards,
  getAllReviewStates,
  getProgress,
  putCard,
  putReviewState,
  putProgress,
} from "./db";

export interface BackupData {
  version: 1;
  cards: Card[];
  reviewStates: ReviewState[];
  progress: UserProgress;
}

export function serializeBackup(data: BackupData): string {
  return JSON.stringify(data, null, 2);
}

export function parseBackup(json: string): BackupData {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error("Invalid backup file");
  }
  const d = raw as Partial<BackupData>;
  if (
    !d ||
    d.version !== 1 ||
    !Array.isArray(d.cards) ||
    !Array.isArray(d.reviewStates) ||
    typeof d.progress !== "object" ||
    d.progress === null
  ) {
    throw new Error("Invalid backup file");
  }
  return d as BackupData;
}

export async function exportAll(): Promise<string> {
  const [cards, reviewStates, progress] = await Promise.all([
    getAllCards(),
    getAllReviewStates(),
    getProgress(),
  ]);
  return serializeBackup({ version: 1, cards, reviewStates, progress });
}

export async function importAll(json: string): Promise<void> {
  const data = parseBackup(json);
  for (const c of data.cards) await putCard(c);
  for (const s of data.reviewStates) await putReviewState(s);
  await putProgress(data.progress);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/data/exportImport.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/exportImport.ts src/data/exportImport.test.ts
git commit -m "feat: add JSON export/import for cross-device backup"
```

---

## Task 10: TTS wrapper

**Files:**
- Create: `src/tts/speak.ts`
- Test: `src/tts/speak.test.ts`

**Interfaces:**
- Produces:
  - `isThaiVoiceAvailable(): boolean` — true if `speechSynthesis` exists and any voice's `lang` starts with `"th"`.
  - `speakThai(text: string): void` — no-op if speech synthesis is unavailable; otherwise creates a `SpeechSynthesisUtterance` with `lang="th-TH"`, sets a Thai voice if found, and calls `speechSynthesis.speak`.

- [ ] **Step 1: Write the failing tests**

Create `src/tts/speak.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isThaiVoiceAvailable, speakThai } from "./speak";

describe("tts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports no Thai voice when speechSynthesis is missing", () => {
    vi.stubGlobal("speechSynthesis", undefined);
    expect(isThaiVoiceAvailable()).toBe(false);
  });

  it("detects a Thai voice", () => {
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [{ lang: "en-US" }, { lang: "th-TH" }],
    });
    expect(isThaiVoiceAvailable()).toBe(true);
  });

  it("speakThai is a no-op when synthesis is unavailable (does not throw)", () => {
    vi.stubGlobal("speechSynthesis", undefined);
    expect(() => speakThai("สวัสดี")).not.toThrow();
  });

  it("speakThai calls speechSynthesis.speak when available", () => {
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { getVoices: () => [{ lang: "th-TH" }], speak });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        lang = "";
        voice: unknown = null;
        constructor(public text: string) {}
      },
    );
    speakThai("สวัสดี");
    expect(speak).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tts/speak.test.ts`
Expected: FAIL — cannot find module `./speak`.

- [ ] **Step 3: Implement speak.ts**

Create `src/tts/speak.ts`:

```ts
export function isThaiVoiceAvailable(): boolean {
  if (typeof speechSynthesis === "undefined") return false;
  return speechSynthesis.getVoices().some((v) => v.lang?.toLowerCase().startsWith("th"));
}

export function speakThai(text: string): void {
  if (typeof speechSynthesis === "undefined") return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  const thaiVoice = speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith("th"));
  if (thaiVoice) utterance.voice = thaiVoice;
  speechSynthesis.speak(utterance);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tts/speak.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/tts/speak.ts src/tts/speak.test.ts
git commit -m "feat: add Web Speech TTS wrapper for Thai"
```

---

## Task 11: Study-session hook

**Files:**
- Create: `src/ui/useStudySession.ts`
- Test: `src/ui/useStudySession.test.ts`

**Interfaces:**
- Consumes: db functions; `getDueCards`, `pickExercise`; `scheduleReview`, `createInitialReviewState`; `canAdvanceStage`; `stageConfig`; types.
- Produces a hook returning:
  - `loading: boolean`
  - `current: { card: Card; exercise: ExerciseType } | null` (null when queue empty)
  - `stage: Stage`
  - `submitGrade(grade: Grade): Promise<void>` — updates the current card's review state in db, advances stage if eligible, and moves to the next due card.
  - `refresh(): Promise<void>` — reloads cards/states/progress and rebuilds the queue.

Notes for implementer: the hook loads all cards + states once, builds the due queue with `getDueCards(..., now=Date.now())`, and for the head card picks an exercise via `pickExercise(card, stage, progress.enabledExercises, Math.random)`. After grading, it recomputes whether to advance the stage with `canAdvanceStage`; if so it bumps `currentStage` and appends it to `unlockedStages`, persists progress, and rebuilds the queue so newly visible (tier) cards appear.

- [ ] **Step 1: Write the failing test**

Create `src/ui/useStudySession.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useStudySession } from "./useStudySession";
import { seedIfEmpty, getAllReviewStates, _resetDbForTests } from "../data/db";

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
  await seedIfEmpty();
});

describe("useStudySession", () => {
  it("loads a due card and grading persists review state + advances the queue", async () => {
    const { result } = renderHook(() => useStudySession());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.current).not.toBeNull();
    const firstCardId = result.current.current!.card.id;

    await act(async () => {
      await result.current.submitGrade("good");
    });

    const states = await getAllReviewStates();
    expect(states.find((s) => s.cardId === firstCardId)?.repetitions).toBe(1);
    // queue moved on to a different card (the graded one is no longer due now)
    expect(result.current.current?.card.id).not.toBe(firstCardId);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/useStudySession.test.ts`
Expected: FAIL — cannot find module `./useStudySession`.

- [ ] **Step 3: Implement useStudySession.ts**

Create `src/ui/useStudySession.ts`:

```ts
import { useCallback, useEffect, useState } from "react";
import type { Card, ExerciseType, Grade, ReviewState, Stage, UserProgress } from "../core/types";
import {
  getAllCards,
  getAllReviewStates,
  getProgress,
  putProgress,
  putReviewState,
  seedIfEmpty,
} from "../data/db";
import { getDueCards, pickExercise } from "../core/session";
import { createInitialReviewState, scheduleReview } from "../core/srs";
import { canAdvanceStage } from "../core/stages";

interface Current {
  card: Card;
  exercise: ExerciseType;
}

export function useStudySession() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [states, setStates] = useState<Map<string, ReviewState>>(new Map());
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [queue, setQueue] = useState<Card[]>([]);
  const [current, setCurrent] = useState<Current | null>(null);

  const buildCurrent = useCallback(
    (head: Card | undefined, stage: Stage, enabled: ExerciseType[]) => {
      if (!head) {
        setCurrent(null);
        return;
      }
      setCurrent({ card: head, exercise: pickExercise(head, stage, enabled, Math.random) });
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    await seedIfEmpty();
    const [allCards, allStates, prog] = await Promise.all([
      getAllCards(),
      getAllReviewStates(),
      getProgress(),
    ]);
    const stateMap = new Map(allStates.map((s) => [s.cardId, s]));
    const due = getDueCards(allCards, stateMap, prog.currentStage, Date.now());
    setCards(allCards);
    setStates(stateMap);
    setProgress(prog);
    setQueue(due);
    buildCurrent(due[0], prog.currentStage, prog.enabledExercises);
    setLoading(false);
  }, [buildCurrent]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitGrade = useCallback(
    async (grade: Grade) => {
      if (!current || !progress) return;
      const now = Date.now();
      const prev = states.get(current.card.id) ?? createInitialReviewState(current.card.id, now);
      const nextState = scheduleReview(prev, grade, now);
      await putReviewState(nextState);

      const nextStates = new Map(states);
      nextStates.set(nextState.cardId, nextState);

      let nextProgress = progress;
      if (canAdvanceStage(cards, nextStates, progress.currentStage)) {
        const newStage = (progress.currentStage + 1) as Stage;
        nextProgress = {
          ...progress,
          currentStage: newStage,
          unlockedStages: [...progress.unlockedStages, newStage],
        };
        await putProgress(nextProgress);
      }

      // Rebuild the due queue against the latest state/stage.
      const due = getDueCards(cards, nextStates, nextProgress.currentStage, now);
      setStates(nextStates);
      setProgress(nextProgress);
      setQueue(due);
      buildCurrent(due[0], nextProgress.currentStage, nextProgress.enabledExercises);
    },
    [current, progress, states, cards, buildCurrent],
  );

  return {
    loading,
    current,
    stage: progress?.currentStage ?? 1,
    queueLength: queue.length,
    submitGrade,
    refresh,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/useStudySession.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/useStudySession.ts src/ui/useStudySession.test.ts
git commit -m "feat: add study-session hook wiring core to data layer"
```

---

## Task 12: Exercise components (A–D)

**Files:**
- Create: `src/ui/exercises/MeaningRecall.tsx`, `src/ui/exercises/Production.tsx`, `src/ui/exercises/Spelling.tsx`, `src/ui/exercises/Listening.tsx`
- Test: `src/ui/exercises/Spelling.test.tsx`, `src/ui/exercises/MeaningRecall.test.tsx`

**Interfaces:**
- Each component is a controlled "exercise" that, given a `card`, lets the user respond and then reports a `Grade` via `onGrade(grade: Grade)`.
- Shared prop type (define inline in each file, identical shape):
  - `MeaningRecall` / `Listening` props: `{ card: Card; showScript: boolean; onGrade: (g: Grade) => void }` — self-graded (reveal answer, then Again/Hard/Good/Easy buttons).
  - `Production` / `Spelling` props: `{ card: Card; requireScript: boolean; onGrade: (g: Grade) => void }` — typed answer auto-graded: correct → `onGrade("good")`, incorrect → reveal correct answer + `onGrade("again")`.
- Consumes: `gradeTypedAnswer` (Production/Spelling), `speakThai` (Listening).

- [ ] **Step 1: Write the failing tests**

Create `src/ui/exercises/Spelling.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Spelling } from "./Spelling";
import type { Card } from "../../core/types";

const card: Card = { id: "b-hello", thai: "สวัสดี", romanization: "sawatdee", english: "hello", category: "greetings", tier: 1, source: "builtin" };

describe("Spelling", () => {
  it("auto-grades a correct romanization as good", async () => {
    const onGrade = vi.fn();
    render(<Spelling card={card} requireScript={false} onGrade={onGrade} />);
    await userEvent.type(screen.getByRole("textbox"), "Sa-wat dee");
    await userEvent.click(screen.getByRole("button", { name: /check/i }));
    expect(onGrade).toHaveBeenCalledWith("good");
  });

  it("auto-grades a wrong answer as again and reveals the answer", async () => {
    const onGrade = vi.fn();
    render(<Spelling card={card} requireScript={false} onGrade={onGrade} />);
    await userEvent.type(screen.getByRole("textbox"), "nope");
    await userEvent.click(screen.getByRole("button", { name: /check/i }));
    expect(onGrade).toHaveBeenCalledWith("again");
    expect(screen.getByText(/sawatdee/i)).toBeInTheDocument();
  });
});
```

Create `src/ui/exercises/MeaningRecall.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeaningRecall } from "./MeaningRecall";
import type { Card } from "../../core/types";

const card: Card = { id: "b-hello", thai: "สวัสดี", romanization: "sawatdee", english: "hello", category: "greetings", tier: 1, source: "builtin" };

describe("MeaningRecall", () => {
  it("reveals the english meaning then reports the chosen grade", async () => {
    const onGrade = vi.fn();
    render(<MeaningRecall card={card} showScript={false} onGrade={onGrade} />);
    expect(screen.queryByText("hello")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /show answer/i }));
    expect(screen.getByText("hello")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /^good$/i }));
    expect(onGrade).toHaveBeenCalledWith("good");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/ui/exercises`
Expected: FAIL — cannot find the exercise modules.

- [ ] **Step 3: Implement the four exercise components**

Create `src/ui/exercises/MeaningRecall.tsx`:

```tsx
import { useState } from "react";
import type { Card, Grade } from "../../core/types";

export function MeaningRecall({
  card,
  showScript,
  onGrade,
}: {
  card: Card;
  showScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const prompt = showScript ? card.thai : card.romanization;

  return (
    <div>
      <p style={{ fontSize: "2rem" }}>{prompt}</p>
      {!revealed ? (
        <button onClick={() => setRevealed(true)}>Show answer</button>
      ) : (
        <div>
          <p>{card.english}</p>
          {(["again", "hard", "good", "easy"] as Grade[]).map((g) => (
            <button key={g} onClick={() => onGrade(g)}>
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Create `src/ui/exercises/Listening.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { Card, Grade } from "../../core/types";
import { speakThai } from "../../tts/speak";

export function Listening({
  card,
  showScript,
  onGrade,
}: {
  card: Card;
  showScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    speakThai(card.thai);
  }, [card.thai]);

  return (
    <div>
      <button onClick={() => speakThai(card.thai)}>🔊 Play again</button>
      {!revealed ? (
        <button onClick={() => setRevealed(true)}>Show answer</button>
      ) : (
        <div>
          {showScript && <p style={{ fontSize: "2rem" }}>{card.thai}</p>}
          <p>{card.romanization}</p>
          <p>{card.english}</p>
          {(["again", "hard", "good", "easy"] as Grade[]).map((g) => (
            <button key={g} onClick={() => onGrade(g)}>
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Create `src/ui/exercises/Production.tsx`:

```tsx
import { useState } from "react";
import type { Card, Grade } from "../../core/types";
import { gradeTypedAnswer } from "../../core/grading";

export function Production({
  card,
  requireScript,
  onGrade,
}: {
  card: Card;
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
    <div>
      <p style={{ fontSize: "1.5rem" }}>{card.english}</p>
      <input aria-label="answer" value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={check} disabled={result !== null}>
        Check
      </button>
      {result === "correct" && <p>✅ Correct</p>}
      {result === "wrong" && <p>❌ Answer: {expected}</p>}
    </div>
  );
}
```

Create `src/ui/exercises/Spelling.tsx`:

```tsx
import { useState } from "react";
import type { Card, Grade } from "../../core/types";
import { gradeTypedAnswer } from "../../core/grading";

export function Spelling({
  card,
  requireScript,
  onGrade,
}: {
  card: Card;
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
    <div>
      <p>Spell: {prompt}</p>
      <input aria-label="answer" value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={check} disabled={result !== null}>
        Check
      </button>
      {result === "correct" && <p>✅ Correct</p>}
      {result === "wrong" && <p>❌ Answer: {expected}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/ui/exercises`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/exercises
git commit -m "feat: add meaning, production, spelling, and listening exercises"
```

---

## Task 13: Study session screen

**Files:**
- Create: `src/ui/StudySession.tsx`
- Test: `src/ui/StudySession.test.tsx`

**Interfaces:**
- Consumes: `useStudySession`; `stageConfig`; the four exercise components.
- Produces: `StudySession` component (no props) that:
  - shows "Loading…" while `loading`,
  - shows an "All caught up — nothing due right now 🎉" message when `current` is null,
  - otherwise renders the exercise matching `current.exercise`, passing `showScript`/`requireScript` from `stageConfig(stage)`, and forwarding `onGrade` to `submitGrade`.

- [ ] **Step 1: Write the failing test**

Create `src/ui/StudySession.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { render, screen, waitFor } from "@testing-library/react";
import { StudySession } from "./StudySession";
import { seedIfEmpty, _resetDbForTests } from "../data/db";

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
  await seedIfEmpty();
});

describe("StudySession", () => {
  it("renders an exercise once a due card loads", async () => {
    render(<StudySession />);
    // Either a prompt or grading control becomes visible after load.
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /show answer/i }) ||
          screen.queryByRole("button", { name: /check/i }) ||
          screen.queryByRole("button", { name: /play again/i }),
      ).toBeTruthy(),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/StudySession.test.tsx`
Expected: FAIL — cannot find module `./StudySession`.

- [ ] **Step 3: Implement StudySession.tsx**

Create `src/ui/StudySession.tsx`:

```tsx
import { useStudySession } from "./useStudySession";
import { stageConfig } from "../core/stages";
import { MeaningRecall } from "./exercises/MeaningRecall";
import { Production } from "./exercises/Production";
import { Spelling } from "./exercises/Spelling";
import { Listening } from "./exercises/Listening";

export function StudySession() {
  const { loading, current, stage, submitGrade } = useStudySession();

  if (loading) return <p>Loading…</p>;
  if (!current) return <p>All caught up — nothing due right now 🎉</p>;

  const { showScriptInPrompt, requireScriptAnswer } = stageConfig(stage);
  const { card, exercise } = current;

  return (
    <section>
      <p>Stage {stage}</p>
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

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/StudySession.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/StudySession.tsx src/ui/StudySession.test.tsx
git commit -m "feat: add study session screen"
```

---

## Task 14: Add-card form

**Files:**
- Create: `src/ui/AddCardForm.tsx`
- Test: `src/ui/AddCardForm.test.tsx`

**Interfaces:**
- Consumes: `putCard` from `../data/db`; `Card`, `Stage` types.
- Produces: `AddCardForm` with prop `{ onAdded?: () => void }`. Fields: Thai, romanization, English, category, tier (select 1–4). On submit it builds a `Card` with `source: "user"` and `id` = `"user-" + crypto.randomUUID()`, calls `putCard`, clears the form, and calls `onAdded`. Submitting with any of Thai/romanization/English empty shows a validation message and does not call `putCard`.

- [ ] **Step 1: Write the failing test**

Create `src/ui/AddCardForm.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCardForm } from "./AddCardForm";
import { seedIfEmpty, getAllCards, _resetDbForTests } from "../data/db";

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
  await seedIfEmpty();
});

describe("AddCardForm", () => {
  it("validates required fields", async () => {
    render(<AddCardForm />);
    await userEvent.click(screen.getByRole("button", { name: /add card/i }));
    expect(screen.getByText(/fill in thai, romanization, and english/i)).toBeInTheDocument();
  });

  it("saves a user card", async () => {
    render(<AddCardForm />);
    await userEvent.type(screen.getByLabelText(/thai/i), "แมว");
    await userEvent.type(screen.getByLabelText(/romanization/i), "maew");
    await userEvent.type(screen.getByLabelText(/english/i), "cat");
    await userEvent.click(screen.getByRole("button", { name: /add card/i }));
    await waitFor(async () => {
      const cards = await getAllCards();
      expect(cards.some((c) => c.romanization === "maew" && c.source === "user")).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/AddCardForm.test.tsx`
Expected: FAIL — cannot find module `./AddCardForm`.

- [ ] **Step 3: Implement AddCardForm.tsx**

Create `src/ui/AddCardForm.tsx`:

```tsx
import { useState } from "react";
import type { Card, Stage } from "../core/types";
import { putCard } from "../data/db";

export function AddCardForm({ onAdded }: { onAdded?: () => void }) {
  const [thai, setThai] = useState("");
  const [romanization, setRomanization] = useState("");
  const [english, setEnglish] = useState("");
  const [category, setCategory] = useState("custom");
  const [tier, setTier] = useState<Stage>(1);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!thai.trim() || !romanization.trim() || !english.trim()) {
      setError("Fill in Thai, romanization, and English.");
      return;
    }
    setError("");
    const card: Card = {
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
    onAdded?.();
  }

  return (
    <form onSubmit={submit}>
      <label>Thai<input value={thai} onChange={(e) => setThai(e.target.value)} /></label>
      <label>Romanization<input value={romanization} onChange={(e) => setRomanization(e.target.value)} /></label>
      <label>English<input value={english} onChange={(e) => setEnglish(e.target.value)} /></label>
      <label>Category<input value={category} onChange={(e) => setCategory(e.target.value)} /></label>
      <label>
        Tier
        <select value={tier} onChange={(e) => setTier(Number(e.target.value) as Stage)}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Add card</button>
    </form>
  );
}
```

Note: the `<label>text<input/></label>` association makes `getByLabelText(/thai/i)` work in the test.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/AddCardForm.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/AddCardForm.tsx src/ui/AddCardForm.test.tsx
git commit -m "feat: add user card creation form"
```

---

## Task 15: Progress view with export/import + App wiring

**Files:**
- Create: `src/ui/ProgressView.tsx`
- Test: `src/ui/ProgressView.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `exportAll`, `importAll` from `../data/exportImport`; `getProgress`.
- Produces:
  - `ProgressView` (no props): shows current stage + unlocked stages; an **Export** button that calls `exportAll()` and triggers a file download (via a Blob + object URL anchor); an **Import** `<input type="file">` that reads the file text and calls `importAll`, then shows "Import complete".
  - `App.tsx`: simple tab UI switching between `StudySession`, `AddCardForm`, and `ProgressView`.

- [ ] **Step 1: Write the failing test**

Create `src/ui/ProgressView.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { render, screen, waitFor } from "@testing-library/react";
import { ProgressView } from "./ProgressView";
import { seedIfEmpty, _resetDbForTests } from "../data/db";

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
  await seedIfEmpty();
});

describe("ProgressView", () => {
  it("shows the current stage and export/import controls", async () => {
    render(<ProgressView />);
    await waitFor(() => expect(screen.getByText(/current stage/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/import backup/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/ProgressView.test.tsx`
Expected: FAIL — cannot find module `./ProgressView`.

- [ ] **Step 3: Implement ProgressView.tsx**

Create `src/ui/ProgressView.tsx`:

```tsx
import { useEffect, useRef, useState } from "react";
import { getProgress } from "../data/db";
import { exportAll, importAll } from "../data/exportImport";
import type { UserProgress } from "../core/types";

export function ProgressView() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
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
    <section>
      {progress && (
        <>
          <p>Current stage: {progress.currentStage}</p>
          <p>Unlocked stages: {progress.unlockedStages.join(", ")}</p>
        </>
      )}
      <button onClick={handleExport}>Export backup</button>
      <label>
        Import backup
        <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} />
      </label>
      {status && <p role="status">{status}</p>}
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/ProgressView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wire up App.tsx**

Replace `src/App.tsx` with:

```tsx
import { useState } from "react";
import { StudySession } from "./ui/StudySession";
import { AddCardForm } from "./ui/AddCardForm";
import { ProgressView } from "./ui/ProgressView";

type Tab = "study" | "add" | "progress";

export default function App() {
  const [tab, setTab] = useState<Tab>("study");
  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Thai Trainer</h1>
      <nav style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab("study")}>Study</button>
        <button onClick={() => setTab("add")}>Add card</button>
        <button onClick={() => setTab("progress")}>Progress</button>
      </nav>
      {tab === "study" && <StudySession />}
      {tab === "add" && <AddCardForm />}
      {tab === "progress" && <ProgressView />}
    </main>
  );
}
```

- [ ] **Step 6: Run the full test suite + dev smoke check**

Run: `npm test`
Expected: all tests pass.

Run: `npm run dev` and open the printed URL. Expected: app loads, "Study" shows a card, "Add card" and "Progress" tabs render. Stop the dev server when done.

- [ ] **Step 7: Commit**

```bash
git add src/ui/ProgressView.tsx src/ui/ProgressView.test.tsx src/App.tsx
git commit -m "feat: add progress view with export/import and tab navigation"
```

---

## Task 16: PWA configuration

**Files:**
- Modify: `vite.config.ts`, `index.html`
- Create: `public/icon-192.png`, `public/icon-512.png` (placeholder square PNGs)

**Interfaces:**
- Produces: an installable PWA with offline app-shell caching via `vite-plugin-pwa` (auto service-worker registration).

- [ ] **Step 1: Add placeholder icons**

Create two simple square PNG icons (192×192 and 512×512) at `public/icon-192.png` and `public/icon-512.png`. Any solid-color PNG of the correct dimensions is fine for now.

Run (from project root, requires ImageMagick OR substitute any PNGs of the right size):
```bash
mkdir -p public
# If ImageMagick is available:
magick -size 192x192 xc:#2b6cb0 public/icon-192.png
magick -size 512x512 xc:#2b6cb0 public/icon-512.png
```
If ImageMagick is unavailable, copy any two PNG files to those paths/names — the build only needs the files to exist.

- [ ] **Step 2: Configure vite-plugin-pwa**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "Thai Trainer",
        short_name: "ThaiTrainer",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2b6cb0",
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

- [ ] **Step 3: Build to verify PWA artifacts generate**

Run: `npm run build`
Expected: build succeeds and `dist/` contains `manifest.webmanifest` and a generated service worker (`sw.js`).

- [ ] **Step 4: Verify tests still pass**

Run: `npm test`
Expected: all tests pass (PWA plugin does not affect Vitest).

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts index.html public/icon-192.png public/icon-512.png
git commit -m "feat: configure installable PWA with offline app shell"
```

---

## Self-Review

**Spec coverage:**
- Romanized + English start, evolving to script reading/spelling/phrases → Tasks 5 (stage config), 7 (tiered deck), 12 (script-aware exercises). ✅
- Card data shape (Thai, romanization, English, category, tier, source) → Task 2. ✅
- SRS engine → Task 3. ✅
- Stages on top of SRS + advancement → Task 5, applied in Task 11. ✅
- Four exercise types A–D → Task 12, rendered in Task 13. ✅
- Listening via TTS + graceful absence → Task 10 (no-op when unavailable), Task 12 Listening. ✅
- "Speak & check" designed-in but deferred → exercise components share a uniform `onGrade` seam; a 5th type slots into Task 13's switch without engine changes. ✅
- Local-only IndexedDB persistence → Task 8. ✅
- Starter deck + user cards, identical to engine → Tasks 7, 8 (same store), 14. ✅
- Export/import → Task 9 (logic), Task 15 (UI). ✅
- Error handling: no Thai voice (Task 10/12), empty due-queue ("All caught up", Task 13), IndexedDB unavailable (surfaced as load failure; acceptable for v1). ✅
- PWA / future mobile → Task 16. ✅
- Testing: unit tests for core (Tasks 3–6), data (8–9), tts (10); component tests for exercises and screens (12–15). ✅

**Placeholder scan:** No "TBD"/"implement later"/vague-error steps; every code step shows complete code. The open items from the spec (thresholds, deck size, wrapper) are now concretely decided. ✅

**Type consistency:** `ReviewState`, `Card`, `UserProgress`, `Grade`, `ExerciseType`, `Stage` are defined once in Task 2 and used with the same field names throughout. `scheduleReview`/`createInitialReviewState` (Task 3), `getDueCards`/`pickExercise` (Task 6), and db function names (Task 8) match their call sites in Task 11. Exercise prop shapes in Task 12 match how Task 13 calls them (`showScript`/`requireScript`, `onGrade`). ✅

One known seam left intentionally for a future task (not v1): `enabledExercises` is seeded with all four types and not yet user-editable in the UI — the Settings toggle is deferred. The study loop already reads it, so adding toggles later needs only a small UI addition.
