import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { getProgress } from "../data/db";
import { exportAll, importAll } from "../data/exportImport";
import type { UserProgress } from "../core/types";

export function ProgressView() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
    <section>
      {progress && (
        <>
          <p>Current stage: {progress.currentStage}</p>
          <p>Unlocked stages: {progress.unlockedStages.join(", ")}</p>
        </>
      )}
      <button onClick={handleExport}>Export backup</button>
      <label>
        Import backup
        <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} />
      </label>
      {status && <p role="status">{status}</p>}
    </section>
  );
}
