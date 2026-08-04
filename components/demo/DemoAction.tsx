"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ImageIcon } from "lucide-react";

interface DemoActionProps {
  photo: string;
  label: string;
  detail: string;
  onUse: () => Promise<void>;
}

export function DemoAction({ photo, label, detail, onUse }: DemoActionProps) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onUse();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 border border-dashed border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent-aurum)_4%,transparent)] p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-16 h-16 shrink-0 overflow-hidden border border-[var(--border-primary)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Sample photo" className="w-full h-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <ImageIcon className="absolute bottom-1 left-1 w-3 h-3 text-white/80" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="type-mono text-[0.5rem] text-[var(--accent-aurum)] tracking-[0.25em] uppercase">
            DEMO &middot; NO UPLOAD NEEDED
          </span>
          <p className="text-sm font-body text-[var(--text-primary)] mt-0.5">{label}</p>
          <p className="text-xs text-[var(--text-muted)] font-body mt-0.5 leading-relaxed">{detail}</p>
        </div>

        <motion.button
          whileHover={busy ? undefined : { scale: 1.03 }}
          whileTap={busy ? undefined : { scale: 0.97 }}
          onClick={handle}
          disabled={busy}
          className="btn-outline !py-2.5 !px-4 text-xs whitespace-nowrap"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              RUNNING...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              TRY SAMPLE PHOTO
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
