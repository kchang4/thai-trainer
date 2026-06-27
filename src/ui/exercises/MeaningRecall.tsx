import { useState } from "react";
import type { Card, Grade } from "../../core/types";

export function MeaningRecall({
  card,
  showScript,
  onGrade,
}: {
  card: Card;
  showScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const prompt = showScript ? card.thai : card.romanization;

  return (
    <div>
      <p style={{ fontSize: "2rem" }}>{prompt}</p>
      {!revealed ? (
        <button onClick={() => setRevealed(true)}>Show answer</button>
      ) : (
        <div>
          <p>{card.english}</p>
          {(["again", "hard", "good", "easy"] as Grade[]).map((g) => (
            <button key={g} onClick={() => onGrade(g)}>
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
