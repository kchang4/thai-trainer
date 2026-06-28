import { useEffect, useState } from "react";
import type { Card as CardType, Grade } from "../../core/types";
import { speakThai } from "../../tts/speak";
import { Card } from "../components/Card";
import { Button, type ButtonVariant } from "../components/Button";
import { IconButton } from "../components/IconButton";

const GRADES: { grade: Grade; label: string; variant: ButtonVariant }[] = [
  { grade: "again", label: "Again", variant: "error" },
  { grade: "hard", label: "Hard", variant: "secondary" },
  { grade: "good", label: "Good", variant: "success" },
  { grade: "easy", label: "Easy", variant: "primary" },
];

export function Listening({
  card,
  showScript,
  onGrade,
}: {
  card: CardType;
  showScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    speakThai(card.thai);
  }, [card.thai]);

  return (
    <Card className="flex flex-col items-center gap-5 text-center">
      <IconButton label="Play again" onClick={() => speakThai(card.thai)}>
        🔊
      </IconButton>
      {!revealed ? (
        <Button onClick={() => setRevealed(true)}>Show answer</Button>
      ) : (
        <div className="flex w-full flex-col items-center gap-3">
          {showScript && <p className="font-thai text-4xl">{card.thai}</p>}
          <p className="text-xl font-display font-bold">{card.romanization}</p>
          <p className="text-on-surface-muted">{card.english}</p>
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
