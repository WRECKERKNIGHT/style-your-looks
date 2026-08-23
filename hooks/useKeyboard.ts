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
  { id: "color-analysis", label: "Tone Studio", shortcut: "G C", href: "/dashboard/color-analysis", category: "Navigation" },
  { id: "color-book", label: "Japanese Color Book", shortcut: "G J", href: "/dashboard/color-book", category: "Navigation" },
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
    let chordPending = false;
    const handler = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key === "k";
      if (isCmdK) {
        e.preventDefault();
        togglePalette();
        return;
      }

      // G-chord navigation (G then D/F/B/...) — but never while the user is
      // typing in a field, otherwise every word starting with 'g' would teleport.
      const target = e.target as HTMLElement | null;
      const isTypingContext =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (isTypingContext || paletteOpen || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "g" || e.key === "G") {
        chordPending = true;
        setTimeout(() => {
          chordPending = false;
        }, 1200);
        return;
      }
      if (chordPending) {
        chordPending = false;
        const map: Record<string, string> = {
          d: "/dashboard",
          f: "/dashboard/face-analysis",
          b: "/dashboard/body-analysis",
          c: "/dashboard/color-analysis",
          j: "/dashboard/color-book",
          t: "/dashboard/virtual-tryon",
          p: "/dashboard/profile",
          h: "/dashboard/history",
          m: "/dashboard/community",
        };
        const href = map[e.key.toLowerCase()];
        if (href) {
          e.preventDefault();
          router.push(href);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePalette, router, paletteOpen]);

  return { paletteOpen, setPaletteOpen, togglePalette, commands, executeCommand };
}
