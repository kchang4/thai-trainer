import { useStudySession } from "./useStudySession";
import { stageConfig } from "../core/stages";
import { MeaningRecall } from "./exercises/MeaningRecall";
import { Production } from "./exercises/Production";
import { Spelling } from "./exercises/Spelling";
import { Listening } from "./exercises/Listening";

export function StudySession() {
  const { loading, current, stage, submitGrade } = useStudySession();

  if (loading) return <p>Loading…</p>;
  if (!current) return <p>All caught up — nothing due right now 🎉</p>;

  const { showScriptInPrompt, requireScriptAnswer } = stageConfig(stage);
  const { card, exercise } = current;

  return (
    <section>
      <p>Stage {stage}</p>
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
