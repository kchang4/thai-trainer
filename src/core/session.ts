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
