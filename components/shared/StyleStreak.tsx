"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Check, Crown } from "lucide-react";

const STREAK_KEY = "auraya_streak";
const CHALLENGE_KEY = "auraya_challenge_done";

interface StreakState {
  lastVisit: string;
  streak: number;
  best: number;
  xp: number;
}

const challenges = [
  { title: "Style Snapshot", desc: "Complete a quick facial analysis to lock in today's baseline.", points: 100 },
  { title: "Palette Refresh", desc: "Review your color season report and save one new favorite palette.", points: 80 },
  { title: "Proportion Check", desc: "Run a body analysis and note your current waist-to-hip ratio.", points: 100 },
  { title: "Fit Journal", desc: "Rate today's outfit — one line on what worked and what didn't.", points: 60 },
  { title: "Grooming Audit", desc: "Inspect your grooming corner and log one improvement tip.", points: 60 },
  { title: "Trend Scout", desc: "Browse the community gallery and rate two looks.", points: 90 },
  { title: "Wardrobe Deep-Dive", desc: "Review your style pillars and pick one to focus on this week.", points: 80 },
];

function todayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function daysFrom(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad);
  const db = new Date(by, bm - 1, bd);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return { lastVisit: "", streak: 0, best: 0, xp: 0, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { lastVisit: "", streak: 0, best: 0, xp: 0 };
}

function saveStreak(state: StreakState) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function StyleStreak() {
  const [state, setState] = useState<StreakState>({ lastVisit: "", streak: 0, best: 0, xp: 0 });
  const [ready, setReady] = useState(false);
  const [doneToday, setDoneToday] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const challenge = challenges[dayOfYear() % challenges.length];

  useEffect(() => {
    const today = todayKey();
    const prev = loadStreak();
    let next = { ...prev };
    if (prev.lastVisit === today) {
      // already visited today
    } else if (prev.lastVisit && daysFrom(prev.lastVisit, today) === 1) {
      next.streak = prev.streak + 1;
    } else {
      next.streak = 1;
    }
    next.best = Math.max(prev.best, next.streak);
    next.lastVisit = today;
    saveStreak(next);
    setState(next);

    try {
      setDoneToday(localStorage.getItem(CHALLENGE_KEY) === today);
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const completeChallenge = useCallback(() => {
    if (doneToday) return;
    const today = todayKey();
    setState((s) => {
      const next = { ...s, xp: s.xp + challenge.points };
      saveStreak(next);
      return next;
    });
    setDoneToday(true);
    setJustCompleted(true);
    try {
      localStorage.setItem(CHALLENGE_KEY, today);
    } catch {
      // ignore
    }
    setTimeout(() => setJustCompleted(false), 2000);
  }, [doneToday, challenge.points]);

  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-honey)_8%,transparent)] via-transparent to-[color-mix(in_srgb,var(--accent-nexus)_12%,transparent)] pointer-events-none" />

      <div className="flex items-center gap-2 mb-5">
        <Flame className="w-4 h-4 text-[var(--accent-honey)]" />
        <span className="type-label text-[var(--accent-mocha)]">STYLE STREAK</span>
        {!ready && <span className="type-mono text-[0.5rem] text-[var(--text-muted)]">{"// SYNCING"}</span>}
      </div>

      <div className="flex items-end justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <motion.span
            key={state.streak}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-display font-bold text-gradient-aurum leading-none"
          >
            {state.streak}
          </motion.span>
          <span className="text-sm text-[var(--text-muted)] font-body">
            day{state.streak === 1 ? "" : "s"} running
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent-honey)]">
          <Zap className="w-3.5 h-3.5" />
          {state.xp} XP
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {weekDots.map((d) => {
          const lit =
            state.lastVisit === d || (state.lastVisit && daysFrom(d, state.lastVisit) === 0 && d <= state.lastVisit);
          const isToday = d === todayKey();
          return (
            <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.div
                animate={isToday ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                className={`w-2.5 h-2.5 rounded-full ${
                  lit ? "bg-[var(--accent-honey)] shadow-[0_0_8px_rgba(200,150,62,0.6)]" : "bg-[color-mix(in_srgb,var(--accent-nexus)_25%,transparent)]"
                }`}
              />
              <span className="type-mono text-[0.45rem] text-[var(--text-muted)]">
                {d.slice(5).replace("-", "/")}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded-sm border border-[color-mix(in_srgb,var(--accent-honey)_25%,transparent)] bg-[color-mix(in_srgb,var(--accent-honey)_6%,transparent)] p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Crown className="w-3.5 h-3.5 text-[var(--accent-honey)]" />
          <span className="type-label text-[var(--accent-mocha)]">DAILY CHALLENGE</span>
        </div>
        <p className="text-sm text-[var(--text-primary)] font-body leading-relaxed mb-3">
          {challenge.title} — {challenge.desc}
        </p>
        <AnimatePresence mode="wait">
          {doneToday ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs font-mono text-[var(--accent-honey)]"
            >
              <Check className="w-3.5 h-3.5" /> COMPLETED +{challenge.points} XP
            </motion.div>
          ) : (
            <motion.button
              key="go"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onClick={completeChallenge}
              disabled={justCompleted}
              className="btn-nexus text-xs !py-2"
            >
              {justCompleted ? "COMPLETED" : "MARK COMPLETE"} +{challenge.points} XP
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {state.best > state.streak && (
        <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-4">
          PERSONAL BEST: {state.best} DAYS
        </p>
      )}
    </motion.div>
  );
}
