import { useState } from "react";
import type { Card as CardType, Grade } from "../../core/types";
import { gradeTypedAnswer } from "../../core/grading";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { Feedback } from "../components/Feedback";

export function Production({
  card,
  requireScript,
  onGrade,
}: {
  card: CardType;
  requireScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const expected = requireScript ? card.thai : card.romanization;

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
    <Card className="flex flex-col gap-4">
      <p className="text-2xl font-display font-bold text-center">{card.english}</p>
      <TextField
        label="Your answer"
        aria-label="answer"
        thai={requireScript}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={result !== null}
      />
      {result === null ? (
        <Button onClick={check}>Check</Button>
      ) : result === "correct" ? (
        <Feedback kind="correct" message="Correct!" onContinue={() => {}} />
      ) : (
        <Feedback kind="wrong" message={`Answer: ${expected}`} onContinue={() => {}} />
      )}
    </Card>
  );
}
