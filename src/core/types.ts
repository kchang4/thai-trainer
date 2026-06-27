export type Stage = 1 | 2 | 3 | 4;
export type Grade = "again" | "hard" | "good" | "easy";
export type ExerciseType = "meaning" | "production" | "spelling" | "listening";
export type CardSource = "builtin" | "user";

export interface Card {
  id: string;
  thai: string;
  romanization: string;
  english: string;
  category: string;
  tier: Stage;
  source: CardSource;
  example?: string;
  notes?: string;
}

export interface ReviewState {
  cardId: string;
  dueDate: number; // epoch ms
  interval: number; // days
  ease: number;
  repetitions: number;
  lapses: number;
  lastReviewed: number | null; // epoch ms
}

export interface UserProgress {
  currentStage: Stage;
  unlockedStages: Stage[];
  enabledExercises: ExerciseType[];
}
