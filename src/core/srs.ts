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
