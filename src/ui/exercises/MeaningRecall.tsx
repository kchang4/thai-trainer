import { useState } from "react";
import type { Card as CardType, Grade } from "../../core/types";
import { Card } from "../components/Card";
import { Button, type ButtonVariant } from "../components/Button";

const GRADES: { grade: Grade; label: string; variant: ButtonVariant }[] = [
  { grade: "again", label: "Again", variant: "error" },
  { grade: "hard", label: "Hard", variant: "secondary" },
  { grade: "good", label: "Good", variant: "success" },
  { grade: "easy", label: "Easy", variant: "primary" },
];

export function MeaningRecall({
  card,
  showScript,
  onGrade,
}: {
  card: CardType;
  showScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const prompt = showScript ? card.thai : card.romanization;

  return (
    <Card className="flex flex-col items-center gap-5 text-center">
      <p className={showScript ? "font-thai text-5xl" : "text-4xl font-display font-bold"}>
        {prompt}
      </p>
      {!revealed ? (
        <Button onClick={() => setRevealed(true)}>Show answer</Button>
      ) : (
        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-2xl font-display font-bold text-on-surface">{card.english}</p>
          <div className="grid w-full grid-cols-2 gap-2">
            {GRADES.map(({ grade, label, variant }) => (
              <Button key={grade} variant={variant} onClick={() => onGrade(grade)}>
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
