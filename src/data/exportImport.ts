import type { Card, ReviewState, UserProgress } from "../core/types";
import {
  getAllCards,
  getAllReviewStates,
  getProgress,
  putCard,
  putReviewState,
  putProgress,
} from "./db";

export interface BackupData {
  version: 1;
  cards: Card[];
  reviewStates: ReviewState[];
  progress: UserProgress;
}

export function serializeBackup(data: BackupData): string {
  return JSON.stringify(data, null, 2);
}

export function parseBackup(json: string): BackupData {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error("Invalid backup file");
  }
  const d = raw as Partial<BackupData>;
  if (
    !d ||
    d.version !== 1 ||
    !Array.isArray(d.cards) ||
    !Array.isArray(d.reviewStates) ||
    typeof d.progress !== "object" ||
    d.progress === null
  ) {
    throw new Error("Invalid backup file");
  }
  return d as BackupData;
}

export async function exportAll(): Promise<string> {
  const [cards, reviewStates, progress] = await Promise.all([
    getAllCards(),
    getAllReviewStates(),
    getProgress(),
  ]);
  return serializeBackup({ version: 1, cards, reviewStates, progress });
}

export async function importAll(json: string): Promise<void> {
  const data = parseBackup(json);
  for (const c of data.cards) await putCard(c);
  for (const s of data.reviewStates) await putReviewState(s);
  await putProgress(data.progress);
}
