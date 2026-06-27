import { useEffect, useState } from "react";
import type { Card, Grade } from "../../core/types";
import { speakThai } from "../../tts/speak";

export function Listening({
  card,
  showScript,
  onGrade,
}: {
  card: Card;
  showScript: boolean;
  onGrade: (g: Grade) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    speakThai(card.thai);
  }, [card.thai]);

  return (
    <div>
      <button onClick={() => speakThai(card.thai)}>🔊 Play again</button>
      {!revealed ? (
        <button onClick={() => setRevealed(true)}>Show answer</button>
      ) : (
        <div>
          {showScript && <p style={{ fontSize: "2rem" }}>{card.thai}</p>}
          <p>{card.romanization}</p>
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
