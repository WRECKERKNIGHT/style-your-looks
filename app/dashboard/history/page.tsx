"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ChevronRight, Trash2, BarChart3, Eye, RotateCcw, ArrowRight } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

interface HistoryEntry {
  id: string;
  type: "face" | "body" | "color" | "pillar" | "skin" | "style-dna" | "virtual-tryon" | "grooming" | "accessories" | "hair";
  label: string;
  date: string;
  score?: number;
  result?: string;
}

const MOCK_HISTORY: HistoryEntry[] = [
  { id: "h1", type: "pillar", label: "Pillar Analysis", date: "2026-07-30 14:32", score: 87, result: "Harmonious Classic" },
  { id: "h2", type: "face", label: "Face Shape Analysis", date: "2026-07-30 14:25", score: 92, result: "Oval" },
  { id: "h3", type: "body", label: "Body Type Analysis", date: "2026-07-30 14:18", score: 88, result: "Hourglass" },
  { id: "h4", type: "color", label: "Color Analysis", date: "2026-07-30 14:10", score: 85, result: "Deep Autumn" },
  { id: "h5", type: "skin", label: "Skin Health", date: "2026-07-29 11:00", score: 76, result: "Needs Improvement" },
  { id: "h6", type: "style-dna", label: "Style DNA", date: "2026-07-29 10:45", result: "Classic Minimalist" },
  { id: "h7", type: "virtual-tryon", label: "Virtual Try-On", date: "2026-07-28 16:20" },
  { id: "h8", type: "grooming", label: "Grooming Guide", date: "2026-07-28 15:00", score: 81 },
  { id: "h9", type: "accessories", label: "Glasses Try-On", date: "2026-07-27 13:30" },
  { id: "h10", type: "hair", label: "Hair Preview", date: "2026-07-27 13:15" },
  { id: "h11", type: "pillar", label: "Pillar Analysis", date: "2026-07-20 09:00", score: 72, result: "Evolving" },
  { id: "h12", type: "face", label: "Face Shape Analysis", date: "2026-07-20 08:55", score: 90, result: "Oval" },
];

const TYPE_ICONS: Record<string, string> = {
  face: "👤", body: "🧍", color: "🎨", pillar: "🏛️", skin: "✨", "style-dna": "🧬", "virtual-tryon": "👗", grooming: "💇", accessories: "👓", hair: "💁",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function HistoryPage() {
  const { addToast } = useToast();
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [filter, setFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filtered = history
    .filter(h => filter === "all" || h.type === filter)
    .sort((a, b) => sortOrder === "newest"
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime());

  const clearHistory = () => {
    setHistory([]);
    addToast("History cleared", "success");
  };

  const types = Array.from(new Set(history.map(h => h.type)));

  return (
    <div className="space-y-8">
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

        <button onClick={clearHistory} disabled={history.length === 0}
          className="px-3 py-2 border border-[var(--border-primary)] text-red-400 text-xs type-mono hover:border-red-400/40 ml-auto flex items-center gap-1 disabled:opacity-30">
          <Trash2 className="w-3 h-3" /> CLEAR
        </button>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-8 text-center space-y-4">
          <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
          <p className="text-[var(--text-muted)] type-body">No history entries yet.</p>
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
                <span className="text-lg">{TYPE_ICONS[entry.type] || "📄"}</span>
                <div className="min-w-0">
                  <p className="type-body text-[var(--text-primary)] truncate">{entry.label}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>{entry.date}</span>
                    {entry.score && (
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
                <Link href={`/dashboard/${entry.type}`}
                  className="p-2 border border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]">
                  <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </Link>
                <button onClick={() => {
                  setHistory(prev => prev.filter(e => e.id !== entry.id));
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

      {history.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6">
          <h3 className="type-label text-[var(--text-primary)] mb-4">PROGRESS</h3>
          <div className="space-y-3">
            {Object.entries(
              history.reduce((acc, h) => {
                if (h.score) {
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
                  <span className="type-mono text-[var(--text-muted)] capitalize">{type.replace("-", " ")}</span>
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
    </div>
  );
}
