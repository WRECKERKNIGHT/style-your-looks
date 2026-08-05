"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Trash2, Eye, ArrowRight } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import {
  getHistory,
  deleteFromHistory,
  clearHistory,
  isDemoEntry,
  type AnalysisEntry,
} from "@/lib/history";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";

interface HistoryRow {
  id: string;
  type: "face" | "body" | "color" | "analysis";
  route: string;
  label: string;
  date: string;
  score?: number;
  result?: string;
  thumbnail?: string | null;
  demo?: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  face: "👤", body: "🧍", color: "🎨", analysis: "📄",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function toRow(entry: AnalysisEntry): HistoryRow {
  if (entry.faceResult) {
    return {
      id: entry.id,
      type: "face",
      route: "/dashboard/face-analysis",
      label: entry.label,
      date: entry.date,
      score: entry.faceResult.overallScore,
      result: entry.faceResult.facialShape,
      thumbnail: entry.thumbnailUrl,
    };
  }
  if (entry.bodyResult) {
    return {
      id: entry.id,
      type: "body",
      route: "/dashboard/body-analysis",
      label: entry.label,
      date: entry.date,
      score: entry.bodyResult.bodyProportionScore ?? undefined,
      result: entry.bodyResult.bodyType,
      thumbnail: entry.thumbnailUrl,
    };
  }
  if (entry.colorAnalysis) {
    return {
      id: entry.id,
      type: "color",
      route: "/dashboard/color-analysis",
      label: entry.label,
      date: entry.date,
      result: entry.colorAnalysis.seasonalType,
      thumbnail: entry.thumbnailUrl,
    };
  }
  return {
    id: entry.id,
    type: "analysis",
    route: "/dashboard/face-analysis",
    label: entry.label,
    date: entry.date,
    thumbnail: entry.thumbnailUrl,
  };
}

function HistoryThumb({ entry }: { entry: HistoryRow }) {
  const [failed, setFailed] = useState(false);
  if (!entry.thumbnail || failed) {
    return (
      <span className="w-12 h-12 flex items-center justify-center text-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
        {TYPE_ICONS[entry.type] || "📄"}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={entry.thumbnail}
      alt=""
      onError={() => setFailed(true)}
      className="w-12 h-12 object-cover border border-[var(--border-primary)]"
    />
  );
}

export default function HistoryPage() {
  const { addToast } = useToast();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const reload = useCallback(() => {
    setRows(getHistory().map((e) => ({ ...toRow(e), demo: isDemoEntry(e) })));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = rows
    .filter((h) => !h.demo)
    .filter((h) => filter === "all" || h.type === filter)
    .sort((a, b) => sortOrder === "newest"
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime());

  const clearHistoryAll = () => {
    clearHistory();
    setRows([]);
    addToast("History cleared", "success");
  };

  const types = Array.from(new Set(rows.map((h) => h.type)));

  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <ScrollParallax speed={0.12} distance={30}>
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // HISTORY</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Clock className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            ANALYSIS <span className="text-gradient-aurum">HISTORY.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Track your style evolution over time.
        </p>
      </motion.div>
      </ScrollParallax>

      <ScrollBlur blur={4} minOpacity={0.95}>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-wrap gap-2 items-center">
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs type-mono">
          <option value="all">ALL TYPES</option>
          {types.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>

        <button onClick={() => setSortOrder(s => s === "newest" ? "oldest" : "newest")}
          className="px-3 py-2 border border-[var(--border-primary)] text-[var(--text-muted)] text-xs type-mono hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] card-nexus">
          {sortOrder === "newest" ? "NEWEST" : "OLDEST"}
        </button>

        <button onClick={clearHistoryAll} disabled={rows.length === 0}
          className="px-3 py-2 border border-[var(--border-primary)] text-red-400 text-xs type-mono hover:border-red-400/40 ml-auto flex items-center gap-1 disabled:opacity-30">
          <Trash2 className="w-3 h-3" /> CLEAR
        </button>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-8 text-center space-y-4">
          <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
          <p className="text-[var(--text-muted)] type-body">
            {rows.length === 0
              ? "No history yet. Run your first analysis to start your style timeline."
              : "Nothing matches this filter yet."}
          </p>
          <Link href="/dashboard/face-analysis" className="btn-nexus inline-flex items-center gap-2">
            START ANALYSIS <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-2">
          {filtered.map(entry => (
            <div key={entry.id}
              className="glass-card p-4 flex items-center justify-between group hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <HistoryThumb entry={entry} />
                <div className="min-w-0">
                  <p className="type-body text-[var(--text-primary)] truncate">{entry.label}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>{entry.date}</span>
                    {entry.score !== undefined && (
                      <>
                        <span>·</span>
                        <span className="text-[var(--accent-aurum)]">{entry.score}</span>
                      </>
                    )}
                    {entry.result && (
                      <>
                        <span>·</span>
                        <span className="text-[var(--text-muted)]">{entry.result}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={entry.route}
                  className="p-2 border border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]">
                  <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </Link>
                <button onClick={() => {
                  deleteFromHistory(entry.id);
                  reload();
                  addToast("Entry removed", "success");
                }}
                  className="p-2 border border-[var(--border-primary)] hover:border-red-400/40">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {rows.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6">
          <h3 className="type-label text-[var(--text-primary)] mb-4">PROGRESS</h3>
          <div className="space-y-3">
            {Object.entries(
              rows.reduce((acc, h) => {
                if (h.score !== undefined) {
                  acc[h.type] = acc[h.type] || [];
                  acc[h.type].push(h.score);
                }
                return acc;
              }, {} as Record<string, number[]>)
            ).map(([type, scores]) => {
              const latest = scores[0];
              const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
              const trend = scores.length > 1 ? scores[0] - scores[scores.length - 1] : 0;
              return (
                <div key={type} className="flex items-center justify-between text-xs">
                  <span className="type-mono text-[var(--text-muted)] capitalize">{type}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-primary)]">Latest: {latest}</span>
                    <span className="text-[var(--text-muted)]">Avg: {avg}</span>
                    <span className={trend >= 0 ? "text-green-400" : "text-red-400"}>
                      {trend >= 0 ? "+" : ""}{trend}
                    </span>
                    <div className="w-16 h-1 bg-[var(--bg-tertiary)] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)]" style={{ width: `${latest}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
      </ScrollBlur>
    </div>
  );
}
