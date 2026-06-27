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
