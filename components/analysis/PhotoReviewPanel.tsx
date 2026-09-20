"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export interface RejectedPhoto {
  index: number;
  issues: string[];
}

export interface AcceptedPhoto {
  index: number;
  warnings: string[];
}

export function PhotoReviewPanel({
  photos,
  rejected,
  accepted = [],
}: {
  photos: string[];
  rejected: RejectedPhoto[];
  accepted?: AcceptedPhoto[];
}) {
  if (photos.length === 0) return null;

  const rejectedMap = new Map(rejected.map((r) => [r.index, r.issues]));
  const acceptedMap = new Map(accepted.map((a) => [a.index, a.warnings]));
  const usedCount = photos.filter((_, i) => !rejectedMap.has(i)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 border border-[var(--border-primary)]/50"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="type-subhead text-[var(--text-primary)] tracking-wider text-sm">
          PHOTO REVIEW
        </span>
        <span className="type-mono text-[0.6rem] text-[var(--text-muted)] tracking-widest">
          {usedCount} USED · {rejected.length} REJECTED
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((photo, i) => {
          const issues = rejectedMap.get(i);
          const warnings = acceptedMap.get(i) ?? [];
          const isRejected = !!issues;
          const hasWarnings = !isRejected && warnings.length > 0;
          return (
            <div
              key={i}
              className={`relative aspect-square overflow-hidden border ${
                isRejected
                  ? "border-red-500/40"
                  : hasWarnings
                    ? "border-amber-500/50"
                    : "border-emerald-500/30"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`Photo ${i + 1}`}
                className={`w-full h-full object-cover ${isRejected ? "opacity-40 grayscale" : ""}`}
              />
              <div
                className={`absolute top-0 left-0 right-0 px-2 py-1.5 flex items-center gap-1.5 text-[0.6rem] font-mono tracking-wider uppercase ${
                  isRejected
                    ? "bg-red-500/90 text-white"
                    : hasWarnings
                      ? "bg-amber-500/90 text-white"
                      : "bg-emerald-500/90 text-white"
                }`}
              >
                {isRejected ? (
                  <XCircle className="w-3 h-3 shrink-0" />
                ) : hasWarnings ? (
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                )}
                {isRejected
                  ? `Photo ${i + 1} · Rejected`
                  : hasWarnings
                    ? `Photo ${i + 1} · Used · Note`
                    : `Photo ${i + 1} · Used`}
              </div>
              {isRejected && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-2.5 py-2">
                  {issues.map((issue) => (
                    <p
                      key={issue}
                      className="flex items-start gap-1.5 text-[0.65rem] text-red-200 font-body leading-snug"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                      {issue}
                    </p>
                  ))}
                </div>
              )}
              {hasWarnings && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-2.5 py-2">
                  {warnings.map((warning) => (
                    <p
                      key={warning}
                      className="flex items-start gap-1.5 text-[0.65rem] text-amber-200 font-body leading-snug"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      {warning}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rejected.length > 0 && (
        <p className="text-xs text-[var(--text-muted)] font-body mt-4 leading-relaxed">
          Rejected photos were excluded from scoring — they would skew the geometry. Tap{" "}
          <span className="text-[var(--text-primary)] font-bold">Analyse Another Set</span> to
          swap them for better shots.
        </p>
      )}
      {rejected.length === 0 &&
        accepted.some((a) => a.warnings.length > 0) && (
          <p className="text-xs text-[var(--text-muted)] font-body mt-4 leading-relaxed">
            Amber notes are soft caveats only — the photos were still scored.
          </p>
        )}
    </motion.div>
  );
}