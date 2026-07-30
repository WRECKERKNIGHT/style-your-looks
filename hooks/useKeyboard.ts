"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

interface Command {
  id: string;
  label: string;
  shortcut: string;
  href?: string;
  action?: () => void;
  category: string;
}

const DEFAULT_COMMANDS: Command[] = [
  { id: "dashboard", label: "Go to Dashboard", shortcut: "G D", href: "/dashboard", category: "Navigation" },
  { id: "face-analysis", label: "Face IQ Analysis", shortcut: "G F", href: "/dashboard/face-analysis", category: "Navigation" },
  { id: "body-analysis", label: "Body & Tone", shortcut: "G B", href: "/dashboard/body-analysis", category: "Navigation" },
  { id: "color-analysis", label: "Color Analysis", shortcut: "G C", href: "/dashboard/color-analysis", category: "Navigation" },
  { id: "grooming", label: "Grooming Studio", shortcut: "G G", href: "/dashboard/grooming", category: "Navigation" },
  { id: "tryon", label: "Virtual Try-On", shortcut: "G T", href: "/dashboard/virtual-tryon", category: "Navigation" },
  { id: "community", label: "Community Feed", shortcut: "G M", href: "/dashboard/community", category: "Navigation" },
  { id: "profile", label: "Profile", shortcut: "G P", href: "/dashboard/profile", category: "Navigation" },
  { id: "history", label: "History", shortcut: "G H", href: "/dashboard/history", category: "Navigation" },
  { id: "home", label: "Homepage", shortcut: "G 1", href: "/", category: "Navigation" },
];

export function useKeyboard() {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [commands] = useState<Command[]>(DEFAULT_COMMANDS);

  const togglePalette = useCallback(() => {
    setPaletteOpen((prev) => !prev);
  }, []);

  const executeCommand = useCallback(
    (cmd: Command) => {
      setPaletteOpen(false);
      if (cmd.action) cmd.action();
      else if (cmd.href) router.push(cmd.href);
    },
    [router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key === "k";
      if (isCmdK) {
        e.preventDefault();
        togglePalette();
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePalette]);

  return { paletteOpen, setPaletteOpen, togglePalette, commands, executeCommand };
}
