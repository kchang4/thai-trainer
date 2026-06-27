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
  _resetDbForTests,
} from "./db";
import type { Card } from "../core/types";

beforeEach(() => {
  // fresh database per test
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
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
