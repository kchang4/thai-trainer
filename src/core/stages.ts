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
