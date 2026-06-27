import { useCallback, useEffect, useState } from "react";
import type { Card, ExerciseType, Grade, ReviewState, Stage, UserProgress } from "../core/types";
import {
  getAllCards,
  getAllReviewStates,
  getProgress,
  putProgress,
  putReviewState,
  seedIfEmpty,
} from "../data/db";
import { getDueCards, pickExercise } from "../core/session";
import { createInitialReviewState, scheduleReview } from "../core/srs";
import { canAdvanceStage } from "../core/stages";

interface Current {
  card: Card;
  exercise: ExerciseType;
}

export function useStudySession() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [states, setStates] = useState<Map<string, ReviewState>>(new Map());
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [queue, setQueue] = useState<Card[]>([]);
  const [current, setCurrent] = useState<Current | null>(null);

  const buildCurrent = useCallback(
    (head: Card | undefined, stage: Stage, enabled: ExerciseType[]) => {
      if (!head) {
        setCurrent(null);
        return;
      }
      setCurrent({ card: head, exercise: pickExercise(head, stage, enabled, Math.random) });
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    await seedIfEmpty();
    const [allCards, allStates, prog] = await Promise.all([
      getAllCards(),
      getAllReviewStates(),
      getProgress(),
    ]);
    const stateMap = new Map(allStates.map((s) => [s.cardId, s]));
    const due = getDueCards(allCards, stateMap, prog.currentStage, Date.now());
    setCards(allCards);
    setStates(stateMap);
    setProgress(prog);
    setQueue(due);
    buildCurrent(due[0], prog.currentStage, prog.enabledExercises);
    setLoading(false);
  }, [buildCurrent]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitGrade = useCallback(
    async (grade: Grade) => {
      if (!current || !progress) return;
      const now = Date.now();
      const prev = states.get(current.card.id) ?? createInitialReviewState(current.card.id, now);
      const nextState = scheduleReview(prev, grade, now);
      await putReviewState(nextState);

      const nextStates = new Map(states);
      nextStates.set(nextState.cardId, nextState);

      let nextProgress = progress;
      if (canAdvanceStage(cards, nextStates, progress.currentStage)) {
        const newStage = (progress.currentStage + 1) as Stage;
        nextProgress = {
          ...progress,
          currentStage: newStage,
          unlockedStages: [...progress.unlockedStages, newStage],
        };
        await putProgress(nextProgress);
      }

      // Rebuild the due queue against the latest state/stage.
      const due = getDueCards(cards, nextStates, nextProgress.currentStage, now);
      setStates(nextStates);
      setProgress(nextProgress);
      setQueue(due);
      buildCurrent(due[0], nextProgress.currentStage, nextProgress.enabledExercises);
    },
    [current, progress, states, cards, buildCurrent],
  );

  return {
    loading,
    current,
    stage: progress?.currentStage ?? 1,
    queueLength: queue.length,
    submitGrade,
    refresh,
  };
}
