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
