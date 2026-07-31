"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Settings, Camera, LogOut, ChevronRight, Award, BarChart3, Clock, ArrowRight } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  joinDate: string;
  level: string;
  xp: number;
  xpNext: number;
  badges: { name: string; icon: string }[];
}

const PROFILE: ProfileData = {
  name: "Alex Morgan",
  email: "alex@example.com",
  joinDate: "2026-03-15",
  level: "GOLD",
  xp: 2840,
  xpNext: 3500,
  badges: [
    { name: "Complete Analyst", icon: "🏛️" },
    { name: "Style Icon", icon: "👑" },
    { name: "Early Adopter", icon: "🚀" },
    { name: "Consistent", icon: "🔥" },
  ],
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {}, show: { transition: { staggerChildren: 0.06 } },
};

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(PROFILE.name);

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
            {editing ? (
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full text-center bg-[var(--bg-tertiary)] border border-[var(--accent-aurum)] text-[var(--text-primary)] type-body px-2 py-1 mb-2" />
            ) : (
              <h2 className="type-display text-[var(--text-primary)] text-lg mb-1">{name}</h2>
            )}
            <p className="text-xs text-[var(--text-muted)] mb-1">{PROFILE.email}</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">Member since {PROFILE.joinDate}</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setEditing(!editing)}
                className="btn-outline text-xs !py-1.5">
                <Settings className="w-3 h-3" /> {editing ? "SAVE" : "EDIT"}
              </button>
              <button className="btn-outline text-xs !py-1.5 text-red-400 border-red-400/40 hover:border-red-400">
                <LogOut className="w-3 h-3" /> SIGN OUT
              </button>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="type-label text-[var(--text-primary)]">RANK</h3>
              <span className="type-mono text-[var(--accent-aurum)]">{PROFILE.level}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>XP</span>
                <span>{PROFILE.xp} / {PROFILE.xpNext}</span>
              </div>
              <div className="h-1.5 bg-[var(--bg-tertiary)] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)] transition-all duration-700"
                  style={{ width: `${(PROFILE.xp / PROFILE.xpNext) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="type-label text-[var(--text-primary)] mb-3">BADGES</h3>
            <div className="grid grid-cols-2 gap-2">
              {PROFILE.badges.map(b => (
                <div key={b.name} className="flex items-center gap-2 p-2 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] card-nexus">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-xs text-[var(--text-primary)]">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-2 space-y-4">
          <motion.div variants={fadeUp} className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-4">PERSONAL DETAILS</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Height", value: "5'8\" (173 cm)" },
                { label: "Build", value: "Hourglass" },
                { label: "Skin Tone", value: "Medium Warm" },
                { label: "Color Season", value: "Deep Autumn" },
                { label: "Face Shape", value: "Oval" },
                { label: "Hair Type", value: "2B (Wavy)" },
              ].map(detail => (
                <div key={detail.label} className="flex justify-between py-2 border-b border-[var(--border-primary)] last:border-0">
                  <span className="text-[var(--text-muted)]">{detail.label}</span>
                  <span className="text-[var(--text-primary)] type-body">{detail.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-4">STYLE PREFERENCES</h3>
            <div className="flex flex-wrap gap-2">
              {["Classic", "Minimalist", "Neutral Palette", "Structured Silhouettes", "Sustainable", "Quality Over Quantity"].map(pref => (
                <span key={pref}
                  className="px-3 py-1.5 border border-[var(--border-primary)] card-nexus text-xs text-[var(--text-primary)] hover:border-[var(--accent-aurum)]/40 transition-all">{pref}</span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-4">QUICK LINKS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { href: "/dashboard/history", label: "ANALYSIS HISTORY", icon: Clock },
                { href: "/dashboard/pillar-analysis", label: "PILLAR ANALYSIS", icon: Award },
                { href: "/dashboard/statistics", label: "STATISTICS", icon: BarChart3 },
                { href: "/dashboard/settings", label: "SETTINGS", icon: Settings },
              ].map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}
                    className="flex items-center justify-between p-3 border border-[var(--border-primary)] card-nexus hover:border-[var(--accent-aurum)]/40 transition-all group">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[var(--accent-aurum)]" />
                      <span className="type-label text-[var(--text-primary)]">{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-aurum)]" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
