"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { useKeyboard } from "@/hooks/useKeyboard";

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, commands, executeCommand } = useKeyboard();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.shortcut.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [paletteOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    },
    [filtered, selectedIndex, executeCommand, setPaletteOpen]
  );

  const categories = [...new Set(filtered.map((c) => c.category))];

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
          onClick={() => setPaletteOpen(false)}
        >
          <div className="fixed inset-0 bg-nexus-800/40 dark:bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border rounded-sm shadow-nexus-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-light-border dark:border-cosmic-border">
              <Search className="w-4 h-4 text-nexus-400 dark:text-cosmic-muted" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm text-nexus-800 dark:text-white placeholder:text-nexus-400/50 dark:placeholder:text-cosmic-muted/50 font-body outline-none"
              />
              <kbd className="hidden sm:inline-flex text-[0.6rem] font-mono text-nexus-400 dark:text-cosmic-muted bg-light-base dark:bg-cosmic-elevated px-2 py-0.5 border border-light-border dark:border-cosmic-border rounded-sm">
                ESC
              </kbd>
            </div>

            <div data-lenis-prevent className="max-h-[320px] overflow-y-auto p-2">
              {categories.map((cat) => (
                <div key={cat}>
                  <div className="px-3 py-2 text-[0.55rem] font-mono text-nexus-400 dark:text-cosmic-muted tracking-widest uppercase">
                    {cat}
                  </div>
                  {filtered
                    .filter((c) => c.category === cat)
                    .map((cmd, i) => {
                      const globalIndex = filtered.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-sm transition-colors ${
                            globalIndex === selectedIndex
                              ? "bg-nexus-400/10 text-nexus-800 dark:text-white"
                              : "text-nexus-400 dark:text-cosmic-muted hover:bg-light-base dark:hover:bg-cosmic-elevated"
                          }`}
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-aurum-500 flex-shrink-0" />
                          <span className="flex-1 text-sm font-body">{cmd.label}</span>
                          <kbd className="text-[0.55rem] font-mono text-nexus-400 dark:text-cosmic-muted bg-light-base dark:bg-cosmic-elevated px-1.5 py-0.5 border border-light-border dark:border-cosmic-border rounded-sm">
                            {cmd.shortcut}
                          </kbd>
                        </button>
                      );
                    })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <Sparkles className="w-8 h-8 text-light-border/40 dark:text-cosmic-border/40 mx-auto mb-3" />
                  <p className="text-sm text-nexus-400 dark:text-cosmic-muted font-body">No commands found</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
