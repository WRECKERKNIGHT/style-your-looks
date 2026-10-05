"use client";

import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme, hydrated } = useTheme();

  // Before hydration the real theme is unknowable, and the server rendered
  // "light". Emitting a stable label until the stored preference is read keeps
  // the first client render byte-identical to the server HTML.
  const label = !hydrated
    ? "Toggle colour theme"
    : theme === "dark"
    ? "Switch to light mode"
    : "Switch to dark mode";

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 flex items-center justify-center rounded-[var(--radius-xs)] border border-light-border dark:border-cosmic-border hover:border-aurum-500/40 bg-light-surface dark:bg-cosmic-surface dark:hover:border-aurum-500/40 transition-all duration-300 group"
      aria-label={label}
      title={label}
    >
      <Sun className="w-4 h-4 text-aurum-500 dark:hidden block transition-transform duration-300 group-hover:rotate-90" />
      <Moon className="w-4 h-4 text-aurum-500 hidden dark:block transition-transform duration-300 group-hover:-rotate-12" />
    </button>
  );
}
