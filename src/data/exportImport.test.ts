import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { serializeBackup, parseBackup, exportAll, importAll, type BackupData } from "./exportImport";
import { seedIfEmpty, getAllCards, getProgress, _resetDbForTests } from "./db";

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
});

const sample: BackupData = {
  version: 1,
  cards: [{ id: "u-1", thai: "แมว", romanization: "maew", english: "cat", category: "animals", tier: 1, source: "user" }],
  reviewStates: [{ cardId: "u-1", dueDate: 5, interval: 1, ease: 2.5, repetitions: 1, lapses: 0, lastReviewed: 1 }],
  progress: { currentStage: 2, unlockedStages: [1, 2], enabledExercises: ["meaning"] },
};

describe("serialize/parse", () => {
  it("round-trips", () => {
    expect(parseBackup(serializeBackup(sample))).toEqual(sample);
  });
  it("rejects malformed json", () => {
    expect(() => parseBackup("{not json")).toThrow("Invalid backup file");
  });
  it("rejects unsupported version", () => {
    expect(() => parseBackup(JSON.stringify({ version: 99 }))).toThrow("Invalid backup file");
  });
});

describe("exportAll/importAll", () => {
  it("exports seeded data and re-imports a backup", async () => {
    await seedIfEmpty();
    const json = await exportAll();
    const parsed = parseBackup(json);
    expect(parsed.cards.length).toBeGreaterThanOrEqual(25);

    await importAll(serializeBackup(sample));
    expect((await getAllCards()).find((c) => c.id === "u-1")?.english).toBe("cat");
    expect((await getProgress()).currentStage).toBe(2);
  });
});
