import { useId } from "react";
import { useTheme } from "./useTheme";

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const id = useId();
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-on-surface-muted">
      <span className="sr-only">Theme</span>
      <select
        id={id}
        aria-label="Theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="rounded-md border border-border bg-surface px-2 py-1 text-on-surface focus:outline-none focus:ring-2 focus:ring-focus-ring"
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
