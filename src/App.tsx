import { useState } from "react";
import { StudySession } from "./ui/StudySession";
import { AddCardForm } from "./ui/AddCardForm";
import { ProgressView } from "./ui/ProgressView";
import { BottomNav, type NavItem } from "./ui/components/BottomNav";
import { ThemeSwitcher } from "./ui/theme/ThemeSwitcher";

type Tab = "study" | "add" | "progress";

const NAV_ITEMS: NavItem[] = [
  { id: "study", label: "Study", icon: "📚" },
  { id: "add", label: "Add", icon: "➕" },
  { id: "progress", label: "Progress", icon: "📈" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("study");
  return (
    <div className="min-h-dvh bg-bg text-on-surface">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <h1 className="font-display text-2xl font-bold text-primary">Thai Trainer</h1>
        <ThemeSwitcher />
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-24">
        {tab === "study" && <StudySession />}
        {tab === "add" && <AddCardForm />}
        {tab === "progress" && <ProgressView />}
      </main>
      <BottomNav items={NAV_ITEMS} active={tab} onSelect={(id) => setTab(id as Tab)} />
    </div>
  );
}
