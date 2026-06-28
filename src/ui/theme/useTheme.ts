import { useCallback, useEffect, useState } from "react";
import { themes, DEFAULT_THEME_ID, type ThemeMeta } from "./themes";

export const THEME_STORAGE_KEY = "thai-trainer-theme";

export function getStoredTheme(): string {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored !== null && themes.some((t) => t.id === stored)) {
      return stored;
    }
    return DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function applyTheme(id: string): void {
  document.documentElement.setAttribute("data-theme", id);
}

export function useTheme(): {
  theme: string;
  setTheme: (id: string) => void;
  themes: ThemeMeta[];
} {
  const [theme, setThemeState] = useState<string>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((id: string) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* ignore storage failures (e.g. private mode) */
    }
    setThemeState(id);
  }, []);

  return { theme, setTheme, themes };
}
