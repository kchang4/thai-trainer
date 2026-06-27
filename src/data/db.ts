import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Card, ReviewState, UserProgress } from "../core/types";
import { starterDeck } from "./starterDeck";

const PROGRESS_KEY = "singleton";
const DEFAULT_PROGRESS: UserProgress = {
  currentStage: 1,
  unlockedStages: [1],
  enabledExercises: ["meaning", "production", "spelling", "listening"],
};

interface StoredProgress extends UserProgress {
  key: string;
}

interface ThaiSchema extends DBSchema {
  cards: { key: string; value: Card };
  reviewStates: { key: string; value: ReviewState };
  progress: { key: string; value: StoredProgress };
}

let dbPromise: Promise<IDBPDatabase<ThaiSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<ThaiSchema>> {
  // Not cached across tests because each test swaps globalThis.indexedDB.
  if (dbPromise) return dbPromise;
  dbPromise = openDB<ThaiSchema>("thai-trainer", 1, {
    upgrade(db) {
      db.createObjectStore("cards", { keyPath: "id" });
      db.createObjectStore("reviewStates", { keyPath: "cardId" });
      db.createObjectStore("progress", { keyPath: "key" });
    },
  });
  return dbPromise;
}

// Allows tests to reset the cached connection when they swap indexedDB.
export function _resetDbForTests(): void {
  dbPromise = null;
}

export async function seedIfEmpty(): Promise<void> {
  const db = await getDb();
  const count = await db.count("cards");
  if (count === 0) {
    const tx = db.transaction("cards", "readwrite");
    for (const c of starterDeck) await tx.store.put(c);
    await tx.done;
  }
  const existing = await db.get("progress", PROGRESS_KEY);
  if (!existing) {
    await db.put("progress", { key: PROGRESS_KEY, ...DEFAULT_PROGRESS });
  }
}

export async function getAllCards(): Promise<Card[]> {
  return (await getDb()).getAll("cards");
}

export async function putCard(card: Card): Promise<void> {
  await (await getDb()).put("cards", card);
}

export async function getAllReviewStates(): Promise<ReviewState[]> {
  return (await getDb()).getAll("reviewStates");
}

export async function putReviewState(state: ReviewState): Promise<void> {
  await (await getDb()).put("reviewStates", state);
}

export async function getProgress(): Promise<UserProgress> {
  const stored = await (await getDb()).get("progress", PROGRESS_KEY);
  if (!stored) return { ...DEFAULT_PROGRESS };
  const { key: _key, ...progress } = stored;
  return progress;
}

export async function putProgress(p: UserProgress): Promise<void> {
  await (await getDb()).put("progress", { key: PROGRESS_KEY, ...p });
}
