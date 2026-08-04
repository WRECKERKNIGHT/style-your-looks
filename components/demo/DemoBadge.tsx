"use client";

import { Sparkles } from "lucide-react";

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 type-mono text-[0.55rem] tracking-[0.25em] uppercase px-3 py-1.5 border border-[color-mix(in_srgb,var(--accent-honey)_50%,transparent)] text-[var(--accent-honey)] bg-[color-mix(in_srgb,var(--accent-honey)_8%,transparent)]">
      <Sparkles className="w-3 h-3" />
      DEMO SAMPLE
    </span>
  );
}
