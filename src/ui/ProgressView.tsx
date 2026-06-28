import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { getProgress } from "../data/db";
import { exportAll, importAll } from "../data/exportImport";
import type { UserProgress } from "../core/types";
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { Pill } from "./components/Pill";

export function ProgressView() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const importId = useId();

  useEffect(() => {
    void getProgress().then(setProgress);
  }, []);

  async function handleExport() {
    const json = await exportAll();
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "thai-trainer-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importAll(await file.text());
      setStatus("Import complete");
      setProgress(await getProgress());
    } catch {
      setStatus("Import failed — invalid backup file");
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold">Your progress</h2>
        {progress && (
          <div className="flex flex-col gap-2">
            <p className="text-on-surface-muted">Current stage</p>
            <p className="font-display text-4xl font-bold text-primary">{progress.currentStage}</p>
            <div className="flex flex-wrap gap-2">
              {progress.unlockedStages.map((s) => (
                <Pill key={s}>Stage {s}</Pill>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold">Backup</h2>
        <Button variant="secondary" onClick={handleExport}>Export backup</Button>
        <div className="flex flex-col gap-1">
          <label htmlFor={importId} className="text-sm font-semibold text-on-surface-muted">
            Import backup
          </label>
          <input
            id={importId}
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="text-sm text-on-surface-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:font-display file:font-bold file:text-on-primary"
          />
        </div>
        {status && <p role="status" className="text-on-surface-muted">{status}</p>}
      </Card>
    </section>
  );
}
