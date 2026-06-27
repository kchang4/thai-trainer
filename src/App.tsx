import { useState } from "react";
import { StudySession } from "./ui/StudySession";
import { AddCardForm } from "./ui/AddCardForm";
import { ProgressView } from "./ui/ProgressView";

type Tab = "study" | "add" | "progress";

export default function App() {
  const [tab, setTab] = useState<Tab>("study");
  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Thai Trainer</h1>
      <nav style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab("study")}>Study</button>
        <button onClick={() => setTab("add")}>Add card</button>
        <button onClick={() => setTab("progress")}>Progress</button>
      </nav>
      {tab === "study" && <StudySession />}
      {tab === "add" && <AddCardForm />}
      {tab === "progress" && <ProgressView />}
    </main>
  );
}
