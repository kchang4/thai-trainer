import { useState, type FormEvent } from "react";
import type { Card, Stage } from "../core/types";
import { putCard } from "../data/db";

export function AddCardForm({ onAdded }: { onAdded?: () => void }) {
  const [thai, setThai] = useState("");
  const [romanization, setRomanization] = useState("");
  const [english, setEnglish] = useState("");
  const [category, setCategory] = useState("custom");
  const [tier, setTier] = useState<Stage>(1);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!thai.trim() || !romanization.trim() || !english.trim()) {
      setError("Fill in Thai, romanization, and English.");
      return;
    }
    setError("");
    const card: Card = {
      id: `user-${crypto.randomUUID()}`,
      thai: thai.trim(),
      romanization: romanization.trim(),
      english: english.trim(),
      category: category.trim() || "custom",
      tier,
      source: "user",
    };
    await putCard(card);
    setThai("");
    setRomanization("");
    setEnglish("");
    onAdded?.();
  }

  return (
    <form onSubmit={submit}>
      <label>Thai<input value={thai} onChange={(e) => setThai(e.target.value)} /></label>
      <label>Romanization<input value={romanization} onChange={(e) => setRomanization(e.target.value)} /></label>
      <label>English<input value={english} onChange={(e) => setEnglish(e.target.value)} /></label>
      <label>Category<input value={category} onChange={(e) => setCategory(e.target.value)} /></label>
      <label>
        Tier
        <select value={tier} onChange={(e) => setTier(Number(e.target.value) as Stage)}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Add card</button>
    </form>
  );
}
