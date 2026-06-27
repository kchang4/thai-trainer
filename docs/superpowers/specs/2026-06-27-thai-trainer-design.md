# Thai Trainer — Design

**Date:** 2026-06-27
**Status:** Approved (design phase)

## Summary

A flashcard-based game for learning Thai. It shows cards for common words and
phrases and quizzes the learner on meaning, production, spelling, and listening.
The app is built to **evolve with the learner**: it starts romanized + English
and progressively introduces Thai script (reading, then spelling) and longer
phrases as the learner advances.

The learner's stated starting point: total beginner who cannot yet read Thai
script, but wants the app to grow more complex over time.

## Goals

- Drill common Thai words and phrases with varied exercise types.
- Make vocabulary actually stick via spaced repetition.
- Grow with the learner: romanized → Thai script reading → Thai script spelling
  → longer phrases.
- Run in a desktop browser today; reach the phone with minimal extra work later.
- Cost nothing to run; work offline.

## Non-Goals (v1 — deliberately deferred)

- User accounts and cloud sync (local-only + manual export/import instead).
- Speak-and-check / pronunciation grading (the exercise system is designed to
  accept it later, but it is not built in v1).
- Auto-generated content / frequency-list import.
- Fine-grained tone or vowel-length coaching.

## Tech Stack & Architecture

- **React + TypeScript**, bundled with **Vite**, configured as an installable
  **PWA** (works offline, can be added to a phone home screen).
- **No backend.** All data persists on-device in **IndexedDB** (via a thin
  wrapper such as `idb` or `Dexie`).
- **Manual export/import**: the learner can download all progress as a JSON file
  and load it on another device — the bridge that substitutes for cloud sync.
- **TTS** via the browser **Web Speech API** (`th-TH` voice).
- **Core logic is framework-free.** The SRS scheduler, stage-progression rules,
  and answer grading are pure TypeScript modules with no React dependency, so
  they can be unit-tested and reasoned about in isolation.
- Future mobile path: wrap the same codebase with **Capacitor** for the App
  Store / Play Store. The local-only data model does not need to change for this.

## Data Model

**Card**
- `id` (string)
- `thai` (Thai script)
- `romanization` (e.g., "sawatdee")
- `english`
- `category` (e.g., greetings, food, numbers)
- `tier` (intro difficulty ordering)
- `source` (`builtin` | `user`)
- `example` / `notes` (optional)

**ReviewState** (one per card — the SRS state)
- `dueDate`
- `interval`
- `ease`
- `repetitions`
- `lapses`
- `lastReviewed`

**UserProgress**
- `currentStage`
- `unlockedStages`
- `settings` (e.g., which exercise types are enabled)

The built-in starter deck ships as a bundled JSON file. User-added cards live in
the same store and behave identically to built-in cards in the engine.

## SRS Engine + Stages

**Spaced repetition (the retention backbone).** An SM-2–style scheduler
(Anki-like). Missed cards return soon; mastered cards get progressively longer
intervals. This is what makes vocabulary stick.

**Stages (layered on top of SRS).** Stages gate *what content and which
exercises* the learner faces:

- **Stage 1** — Romanized + English. Spelling = type the romanization.
- **Stage 2** — Introduces *reading* Thai script (recognize the characters).
- **Stage 3** — *Spelling in Thai script* (assemble the actual characters).
- **Stage 4** — Longer phrases / sentences.

The learner advances a stage after mastering enough cards at the current stage.
The exact threshold is to be finalized in the implementation plan.

## Exercise Types & Session Loop

Four exercise types, all sharing the same card data:

- **A — Meaning recall:** show Thai/romanized → recall the English (recall or
  multiple choice).
- **B — Production:** show English → produce the Thai.
- **C — Spelling (typed):** Stage 1 types the romanization; later stages assemble
  Thai script.
- **D — Listening:** hear it spoken via TTS → identify the meaning or spelling.

**Session loop:** pull cards that are *due* from the SRS; for each, pick an
exercise type appropriate to the learner's current stage; present it; grade it
(typed answers auto-graded; recall exercises use an Again/Good-style self-grade);
update the card's SRS state.

A **"speak & check" exercise type** is designed into this system as a future
fifth type but is **not built in v1**.

## TTS / Pronunciation

- Listening (D) uses Web Speech TTS with the `th-TH` voice.
- If no Thai voice is installed on the device, listening exercises are gracefully
  disabled and the learner is shown a hint to install one.
- Speaking-with-feedback is deferred; the exercise interface leaves a clean seam
  for it (free browser speech recognition is the intended later approach, with
  the understanding that it offers only approximate pass/fail matching).

## Starter Deck + User Cards

- Ships with a curated starter set of common words/phrases (greetings, numbers,
  food, etc.).
- A simple "add card" form (Thai, romanization, English, category) lets the
  learner grow the deck over time.
- User and built-in cards are indistinguishable to the engine.

## Error Handling

- **No Thai TTS voice:** disable listening exercises gracefully with an
  install hint.
- **IndexedDB unavailable / private mode:** warn the learner that progress
  cannot be saved.
- **Empty due-queue:** show "nothing due right now" with optional extra
  practice rather than an error.

## Testing

- **Unit tests** for the pure core: SRS scheduler, stage progression, and answer
  grading.
- **Component tests** for the key exercise flows.

## Open Items for the Implementation Plan

- Exact stage-advancement thresholds (how many mastered cards unlock the next
  stage).
- Initial size and contents of the curated starter deck.
- Choice of IndexedDB wrapper (`idb` vs. `Dexie`).
