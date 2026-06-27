import { useState } from "react";
import type { Card, Grade } from "../../core/types";
import { gradeTypedAnswer } from "../../core/grading";

export function Spelling({
  card,
  requireScript,
  onGrade,
}: {
  card: Card;
  requireScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const expected = requireScript ? card.thai : card.romanization;
  const prompt = requireScript ? `${card.romanization} — ${card.english}` : card.english;

  function check() {
    if (gradeTypedAnswer(expected, value)) {
      setResult("correct");
      onGrade("good");
    } else {
      setResult("wrong");
      onGrade("again");
    }
  }

  return (
    <div>
      <p>Spell: {prompt}</p>
      <input aria-label="answer" value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={check} disabled={result !== null}>
        Check
      </button>
      {result === "correct" && <p>✅ Correct</p>}
      {result === "wrong" && <p>❌ Answer: {expected}</p>}
    </div>
  );
}
