"use client";

import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 flex items-center justify-center rounded-sm border border-tan hover:border-amber/40 bg-cream dark:bg-dark-surface dark:border-dark-border dark:hover:border-amber/40 transition-all duration-300 group"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className="w-4 h-4 text-amber dark:hidden block transition-transform duration-300 group-hover:rotate-90" />
      <Moon className="w-4 h-4 text-amber hidden dark:block transition-transform duration-300 group-hover:-rotate-12" />
    </button>
  );
}
