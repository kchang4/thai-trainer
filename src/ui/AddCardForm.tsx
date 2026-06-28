import { useId, useState, type FormEvent } from "react";
import type { Card as CardType, Stage } from "../core/types";
import { putCard } from "../data/db";
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { TextField } from "./components/TextField";
import { Pill } from "./components/Pill";

export function AddCardForm({ onAdded }: { onAdded?: () => void }) {
  const [thai, setThai] = useState("");
  const [romanization, setRomanization] = useState("");
  const [english, setEnglish] = useState("");
  const [category, setCategory] = useState("custom");
  const [tier, setTier] = useState<Stage>(1);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const tierId = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!thai.trim() || !romanization.trim() || !english.trim()) {
      setError("Fill in Thai, romanization, and English.");
      return;
    }
    setError("");
    const card: CardType = {
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
    setSaved(true);
    onAdded?.();
  }

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold">Add a card</h2>
        <TextField label="Thai" thai value={thai} onChange={(e) => { setThai(e.target.value); setSaved(false); }} />
        <TextField label="Romanization" value={romanization} onChange={(e) => { setRomanization(e.target.value); setSaved(false); }} />
        <TextField label="English" value={english} onChange={(e) => { setEnglish(e.target.value); setSaved(false); }} />
        <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <div className="flex flex-col gap-1">
          <label htmlFor={tierId} className="text-sm font-semibold text-on-surface-muted">Tier</label>
          <select
            id={tierId}
            value={tier}
            onChange={(e) => setTier(Number(e.target.value) as Stage)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        {error && <p role="alert" className="text-error font-semibold">{error}</p>}
        {saved && <Pill className="self-start bg-success text-on-success border-success">✅ Card added</Pill>}
        <Button type="submit">Add card</Button>
      </form>
    </Card>
  );
}
