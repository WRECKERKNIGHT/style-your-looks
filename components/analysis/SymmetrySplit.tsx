"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows } from "lucide-react";

interface SymmetrySplitProps {
  image: string;
  centerX: number;
  symmetryScore?: number;
}

export function SymmetrySplit({ image, centerX, symmetryScore }: SymmetrySplitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState<number | null>(null);
  const [mirrorLeft, setMirrorLeft] = useState(true);
  const draggingRef = useRef(false);

  const handlePointer = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setSplit(frac);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      draggingRef.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      handlePointer(e.clientX);
    },
    [handlePointer]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      handlePointer(e.clientX);
    },
    [handlePointer]
  );

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const frac = split ?? centerX;
  const realLayer = mirrorLeft ? "left" : "right";
  const mirroredX = frac * 100;

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-base)] touch-none select-none cursor-ew-resize"
        style={{ aspectRatio: "4/5", maxHeight: "520px", margin: "0 auto" }}
      >
        {/* Real layer */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Symmetry split — real side"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            clipPath:
              realLayer === "left"
                ? `inset(0 ${100 - frac * 100}% 0 0)`
                : `inset(0 0 0 ${frac * 100}%)`,
          }}
        />

        {/* Mirrored layer — mirrored around the face centerline */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Symmetry split — mirrored side"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: "scaleX(-1)",
            transformOrigin: `${centerX * 100}% 50%`,
            clipPath:
              realLayer === "left"
                ? `inset(0 0 0 ${frac * 100}%)`
                : `inset(0 ${100 - frac * 100}% 0 0)`,
          }}
        />

        {/* Divider */}
        <div className="absolute top-0 bottom-0 z-10" style={{ left: `${frac * 100}%` }}>
          <div className="absolute inset-y-0 -translate-x-1/2 w-px bg-[var(--accent-aurum)] shadow-[0_0_12px_rgba(200,150,62,0.8)]" />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[var(--bg-primary)]/90 border border-[var(--accent-aurum)] flex items-center justify-center shadow-lg">
            <GitCompareArrows className="w-4 h-4 text-[var(--accent-aurum)]" />
          </div>
        </div>

        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/50 backdrop-blur-sm border border-[var(--border-primary)]">
          <span className="type-mono text-[0.5rem] text-[#E8C88A] tracking-widest">DRAG TO COMPARE MIRRORED HALVES</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMirrorLeft(true)}
            className={`px-3 py-1.5 border text-xs font-body uppercase tracking-wider transition-colors ${
              mirrorLeft
                ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]"
                : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/40"
            }`}
          >
            Double Left
          </button>
          <button
            onClick={() => setMirrorLeft(false)}
            className={`px-3 py-1.5 border text-xs font-body uppercase tracking-wider transition-colors ${
              !mirrorLeft
                ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]"
                : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/40"
            }`}
          >
            Double Right
          </button>
        </div>

        {typeof symmetryScore === "number" && (
          <div className="flex items-center gap-2">
            <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">SYMMETRY</span>
            <span
              className={`font-display font-bold text-lg ${
                symmetryScore >= 7 ? "text-[var(--accent-aurum)]" : symmetryScore >= 5 ? "text-[var(--accent-nexus)]" : "text-red-400"
              }`}
            >
              {symmetryScore.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-[var(--text-muted)] font-body text-center leading-relaxed max-w-xl mx-auto"
      >
        The divider mirrors one half of your face onto the other. Perfect symmetry would look seamless;
        natural asymmetry is normal and often reads as character. Use it to spot which side to angle toward
        the camera.
      </motion.p>
    </div>
  );
}
