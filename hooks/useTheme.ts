"use client";

import { create } from "zustand";
import { useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  /** False until the stored/system preference has been read on the client. */
  hydrated: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hydrate: () => void;
}

const STORAGE_KEY = "zervey_theme";

/** localStorage throws in Safari private mode and when storage is blocked. */
function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Non-fatal: the theme still applies for this session, it just won't persist.
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // Must stay a constant rather than reading storage here. This store is
  // created during the first client render too, so consulting localStorage at
  // module scope made the first client render disagree with the server HTML and
  // threw a hydration mismatch on anything rendering the theme.
  theme: "light",
  hydrated: false,
  setTheme: (theme) => {
    writeStoredTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    writeStoredTheme(next);
    set({ theme: next });
  },
  // Called after mount, once the real preference is readable.
  hydrate: () => {
    if (typeof window === "undefined") return;
    if (get().hydrated) return;
    set({ theme: readStoredTheme() ?? systemTheme(), hydrated: true });
  },
}));

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const hydrated = useThemeStore((s) => s.hydrated);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      // Only follow the OS while the user has not made an explicit choice.
      if (!readStoredTheme()) setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setTheme]);

  return { theme, toggleTheme, setTheme, isDark: theme === "dark", hydrated };
}
