"use client";

import { Command } from "lucide-react";

export function KeyboardShortcutHint() {
  return (
    <div className="fixed bottom-4 left-4 z-50 hidden md:block">
      <div className="flex items-center gap-1.5 text-[0.55rem] font-mono text-coffee/40 dark:text-dark-muted/40 bg-cream/60 dark:bg-dark-surface/60 backdrop-blur-sm px-2.5 py-1.5 border border-tan/20 dark:border-dark-border/20 rounded-sm">
        <Command className="w-2.5 h-2.5" />
        <span>K</span>
        <span className="mx-1">·</span>
        <span>Command Palette</span>
      </div>
    </div>
  );
}
