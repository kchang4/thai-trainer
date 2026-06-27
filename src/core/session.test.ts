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
