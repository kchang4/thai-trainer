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
