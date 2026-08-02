"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  Camera,
  LogOut,
  ChevronRight,
  Award,
  BarChart3,
  Clock,
  ScanFace,
  Dna,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getHistory } from "@/lib/history";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

interface SessionUser {
  email?: string;
  name?: string;
  createdAt?: string;
}

function rankForXp(xp: number): { level: string; next: number } {
  const tiers = [
    { level: "BRONZE", min: 0, next: 1000 },
    { level: "SILVER", min: 1000, next: 2500 },
    { level: "GOLD", min: 2500, next: 5000 },
    { level: "PLATINUM", min: 5000, next: 10000 },
    { level: "DIAMOND", min: 10000, next: 20000 },
    { level: "STYLE ICON", min: 20000, next: 999999 },
  ];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (xp >= tiers[i].min) return tiers[i];
  }
  return tiers[0];
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          name: (data.user.user_metadata?.full_name as string) || data.user.email,
          createdAt: data.user.created_at,
        });
      }
    });

    const history = getHistory();
    setAnalysisCount(history.length);
    const scores = history
      .map((e) => e.faceResult?.overallScore)
      .filter((s): s is number => typeof s === "number");
    if (scores.length) setBestScore(Math.max(...scores));
  }, []);

  const xp = 500 + analysisCount * 120 + (bestScore ? Math.round(bestScore) : 0);
  const rank = rankForXp(xp);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // PROFILE</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <User className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            YOUR <span className="text-gradient-aurum">PROFILE.</span>
          </h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-nexus)] to-[var(--accent-aurum)] mx-auto mb-4 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h2 className="type-display text-[var(--text-primary)] text-lg mb-1">
              {user?.name || "Loading…"}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-1">{user?.email || ""}</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">Member since {joined}</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="btn-outline text-xs !py-1.5 text-red-400 border-red-400/40 hover:border-red-400"
              >
                <LogOut className="w-3 h-3" /> {signingOut ? "SIGNING OUT…" : "SIGN OUT"}
              </button>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="type-label text-[var(--text-primary)]">RANK</h3>
              <span className="type-mono text-[var(--accent-aurum)]">{rank.level}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>XP</span>
                <span>{xp} / {rank.next}</span>
              </div>
              <div className="h-1.5 bg-[var(--bg-tertiary)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)] transition-all duration-700"
                  style={{ width: `${Math.min(100, (xp / rank.next) * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-[0.6rem] font-mono text-[var(--text-muted)] tracking-widest mt-2">
              EARN XP BY COMPLETING ANALYSES
            </p>
          </div>

          <div className="glass-card p-4">
            <h3 className="type-label text-[var(--text-primary)] mb-3">STATS</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] card-nexus text-center">
                <ScanFace className="w-4 h-4 text-[var(--accent-nexus)] mx-auto mb-1" />
                <div className="type-display text-lg text-[var(--text-primary)]">{analysisCount}</div>
                <div className="text-[0.5rem] font-mono text-[var(--text-muted)] tracking-widest">ANALYSES</div>
              </div>
              <div className="p-3 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] card-nexus text-center">
                <Dna className="w-4 h-4 text-[var(--accent-aurum)] mx-auto mb-1" />
                <div className="type-display text-lg text-[var(--text-primary)]">
                  {bestScore ? bestScore.toFixed(0) : "—"}
                </div>
                <div className="text-[0.5rem] font-mono text-[var(--text-muted)] tracking-widest">BEST SCORE</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-2 space-y-4">
          <motion.div variants={fadeUp} className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-4">YOUR JOURNEY</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Clock, label: "History", value: `${analysisCount} entries`, href: "/dashboard/history" },
                { icon: Award, label: "Pillars", value: "4 tracked", href: "/dashboard/pillar-analysis" },
                { icon: BarChart3, label: "Trends", value: "View progress", href: "/dashboard/face-comparison" },
              ].map((item) => (
                <Link key={item.label} href={item.href}
                  className="flex items-center justify-between p-3 border border-[var(--border-primary)] card-nexus hover:border-[var(--accent-aurum)]/40 transition-all group">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-[var(--accent-aurum)]" />
                    <div>
                      <span className="type-label text-[var(--text-primary)]">{item.label}</span>
                      <p className="text-[0.6rem] text-[var(--text-muted)]">{item.value}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-aurum)]" />
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-4">PRIVACY</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center border border-[var(--accent-aurum)] text-[var(--accent-aurum)]">
                  <ScanFace className="w-4 h-4" />
                </div>
                <div>
                  <p className="type-label text-[var(--text-primary)] mb-1">100% ON-DEVICE ANALYSIS</p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Face, body, and skin analysis runs entirely in your browser via MediaPipe.
                    Your photos are never uploaded to a server.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center border border-[var(--accent-aurum)] text-[var(--accent-aurum)]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <p className="type-label text-[var(--text-primary)] mb-1">LOCAL HISTORY ONLY</p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Your analysis history lives in your browser&apos;s local storage.
                    Export or wipe it any time from History.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-4">STYLE PREFERENCES</h3>
            <div className="flex flex-wrap gap-2">
              {["Classic", "Minimalist", "Neutral Palette", "Structured Silhouettes", "Sustainable", "Quality Over Quantity"].map((pref) => (
                <span key={pref}
                  className="px-3 py-1.5 border border-[var(--border-primary)] card-nexus text-xs text-[var(--text-primary)] hover:border-[var(--accent-aurum)]/40 transition-all">{pref}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
