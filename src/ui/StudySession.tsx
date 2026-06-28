import { useStudySession } from "./useStudySession";
import { stageConfig } from "../core/stages";
import { MeaningRecall } from "./exercises/MeaningRecall";
import { Production } from "./exercises/Production";
import { Spelling } from "./exercises/Spelling";
import { Listening } from "./exercises/Listening";
import { Card } from "./components/Card";
import { Pill } from "./components/Pill";
import { ProgressBar } from "./components/ProgressBar";

export function StudySession() {
  const { loading, current, stage, queueLength, submitGrade } = useStudySession();

  if (loading) {
    return <Card className="text-center text-on-surface-muted">Loading…</Card>;
  }
  if (!current) {
    return (
      <Card className="flex flex-col items-center gap-2 text-center">
        <span className="text-4xl" aria-hidden>🎉</span>
        <p className="font-display text-lg font-bold">All caught up</p>
        <p className="text-on-surface-muted">Nothing due right now — come back later.</p>
      </Card>
    );
  }

  const { showScriptInPrompt, requireScriptAnswer } = stageConfig(stage);
  const { card, exercise } = current;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Pill>Stage {stage}</Pill>
        <Pill>{queueLength} due</Pill>
      </div>
      <ProgressBar value={Math.max(0, 1)} max={queueLength + 1} label="Cards remaining" />
      {exercise === "meaning" && (
        <MeaningRecall card={card} showScript={showScriptInPrompt} onGrade={submitGrade} />
      )}
      {exercise === "listening" && (
        <Listening card={card} showScript={showScriptInPrompt} onGrade={submitGrade} />
      )}
      {exercise === "production" && (
        <Production card={card} requireScript={requireScriptAnswer} onGrade={submitGrade} />
      )}
      {exercise === "spelling" && (
        <Spelling card={card} requireScript={requireScriptAnswer} onGrade={submitGrade} />
      )}
    </section>
  );
}
