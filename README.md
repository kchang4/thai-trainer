# Thai Trainer

A spaced-repetition flashcard app for learning Thai. It drills common words and
phrases across four exercise types — meaning recall, production, spelling, and
listening — and **grows with the learner**: you start with romanized Thai +
English and progressively unlock Thai script reading, Thai script spelling, and
longer phrases as you master cards.

It runs entirely in the browser as an installable **PWA**: no backend, no
accounts, works offline, and costs nothing to run. All progress is stored
on-device.

## Features

- **Spaced repetition** — an SM-2–style scheduler. Missed cards come back soon;
  mastered cards get progressively longer intervals.
- **Four exercise types**
  - **Meaning recall** — see the Thai/romanization, recall the English (self-graded).
  - **Production** — see the English, type the Thai/romanization (auto-graded).
  - **Spelling** — type the romanization, or the Thai script at later stages (auto-graded).
  - **Listening** — hear it spoken via the browser's Thai voice, then reveal the answer.
- **Four learning stages** that gate content and difficulty:
  1. Romanized + English.
  2. Reading Thai script.
  3. Spelling in Thai script.
  4. Longer phrases / sentences.

  You advance a stage after mastering enough cards at the current stage.
- **Curated starter deck** of ~30 common words and phrases (greetings, numbers,
  food, verbs, phrases).
- **Add your own cards** — user cards behave identically to built-in ones.
- **Export / import** — download all your progress as a JSON file and load it on
  another device. This is the manual bridge that substitutes for cloud sync.
- **Text-to-speech** via the browser Web Speech API (`th-TH`). Listening
  exercises disable gracefully if no Thai voice is installed.

## Tech stack

[Bun](https://bun.sh) · React 19 · TypeScript · [Vite](https://vite.dev) ·
[Vitest](https://vitest.dev) + Testing Library · [`idb`](https://github.com/jakearchibald/idb) ·
[`vite-plugin-pwa`](https://vite-pwa-org.netlify.app)

## Getting started

Requires [Bun](https://bun.sh) 1.3+.

```sh
bun install        # install dependencies
bun run dev        # start the dev server (prints a local URL)
bun run test       # run the test suite once
bun run test:watch # run tests in watch mode
bun run build      # type-check + production build (outputs dist/)
bun run preview    # preview the production build
```

> **Note:** use `bun run test`, not `bun test` — `bun test` invokes Bun's own
> test runner and ignores this project's Vitest config.

## Architecture

The codebase separates **pure logic** from **framework/IO**:

```
src/
  core/        # PURE TypeScript — no React, no DOM, no idb
    types.ts       # Card, ReviewState, UserProgress, enums
    config.ts      # tunable SRS / stage constants
    srs.ts         # SM-2 scheduler
    grading.ts     # typed-answer normalization + grading
    stages.ts      # mastery, stage advancement, per-stage config
    session.ts     # due-card selection + exercise picking
  data/        # IndexedDB persistence
    starterDeck.ts # curated built-in cards
    db.ts          # idb wrapper (cards / review state / progress)
    exportImport.ts# JSON backup serialize / deserialize
  tts/
    speak.ts       # Web Speech API wrapper
  ui/
    useStudySession.ts  # hook wiring core + db into a session
    StudySession.tsx    # renders the current exercise
    exercises/          # the four exercise components
    AddCardForm.tsx
    ProgressView.tsx    # progress + export/import controls
  App.tsx        # tab navigation (Study / Add card / Progress)
  main.tsx       # React entry
```

Everything in `src/core/` is framework-free and deterministic — time and
randomness are passed in explicitly — so the engine is unit-tested in isolation
and stays portable to a future mobile wrapper.

## Data & privacy

All data — built-in and user cards, review state, and progress — lives in your
browser's IndexedDB. Nothing is sent to a server. The only way data leaves the
device is when you explicitly use **Export** to download a backup file.

If IndexedDB is unavailable (e.g. some private-browsing modes), progress can't
be saved.

## Testing

```sh
bun run test
```

The pure core (SRS, stages, grading, session) and data layer (db, export/import,
TTS) are covered by unit tests; exercises and screens have component tests via
Testing Library + `fake-indexeddb`.
