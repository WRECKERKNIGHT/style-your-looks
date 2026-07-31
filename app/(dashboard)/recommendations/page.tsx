"use client";

import { useState } from "react";
import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { motion } from "framer-motion";
import { Lightbulb, ChevronRight, Sparkles, Shirt, Palette, Star, ArrowRight } from "lucide-react";

interface RecCategory {
  id: string;
  title: string;
  icon: typeof Shirt;
  items: { title: string; desc: string; match: number }[];
}

const RECOMMENDATIONS: RecCategory[] = [
  {
    id: "colors",
    title: "COLOR PALETTE",
    icon: Palette,
    items: [
      { title: "Deep Navy Blazer", desc: "Core investment piece for your palette", match: 98 },
      { title: "Burgundy Turtleneck", desc: "Complements your undertone perfectly", match: 95 },
      { title: "Cream Silk Blouse", desc: "Adds softness while staying in range", match: 92 },
      { title: "Forest Green Trousers", desc: "Strong accent piece for your profile", match: 90 },
      { title: "Charcoal Wool Coat", desc: "Neutral layer with high versatility", match: 88 },
    ],
  },
  {
    id: "silhouettes",
    title: "SILHOUETTES",
    icon: Shirt,
    items: [
      { title: "Structured Shoulder Coat", desc: "Balances your proportions", match: 96 },
      { title: "High-Waisted Wide Leg", desc: "Creates a lengthening effect", match: 93 },
      { title: "Wrap Dress", desc: "Defines waist elegantly", match: 91 },
      { title: "A-Line Midi Skirt", desc: "Flowing yet structured shape", match: 89 },
      { title: "Cropped Blazer", desc: "Modern proportion for your frame", match: 86 },
    ],
  },
  {
    id: "essentials",
    title: "WARDROBE ESSENTIALS",
    icon: Star,
    items: [
      { title: "Italian Leather Belt", desc: "Defines waist; choose dark brown", match: 97 },
      { title: "Silk Scarf", desc: "Adds face-framing color near features", match: 94 },
      { title: "Minimalist Watch", desc: "Gold-tone case, neutral strap", match: 91 },
      { title: "Structured Tote", desc: "Neutral investment carried daily", match: 88 },
      { title: "Block-Heel Pumps", desc: "Nude tone to elongate legs", match: 85 },
    ],
  },
  {
    id: "grooming",
    title: "GROOMING",
    icon: Sparkles,
    items: [
      { title: "Hydrating Serum", desc: "For your skin type & climate", match: 99 },
      { title: "Volumizing Texture Spray", desc: "Matches your hair density analysis", match: 93 },
      { title: "SPF 50 Mineral Sunscreen", desc: "Essential for your skin health score", match: 92 },
      { title: "Lightweight Moisturizer", desc: "Non-comedogenic for your skin type", match: 90 },
      { title: "Tinted Lip Balm", desc: "Enhances natural lip color subtly", match: 88 },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {}, show: { transition: { staggerChildren: 0.06 } },
};

export default function RecommendationsPage() {
  const { pillarResult } = useAnalysisStore();
  const [activeCategory, setActiveCategory] = useState("colors");

  const activeRecs = RECOMMENDATIONS.find(r => r.id === activeCategory);

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // RECOMMENDATIONS</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Lightbulb className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            CURATED <span className="text-gradient-aurum">RECOMMENDATIONS.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Data-driven suggestions based on your full analysis profile.
        </p>
      </motion.div>

      {!pillarResult ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-8 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-[var(--accent-aurum)] mx-auto" />
          <p className="text-[var(--text-muted)] type-body">Complete your pillar analysis first to unlock personalized recommendations.</p>
          <Link href="/dashboard/pillar-analysis" className="btn-nexus inline-flex items-center gap-2">
            TAKE PILLAR ANALYSIS <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex gap-2 overflow-x-auto pb-2">
            {RECOMMENDATIONS.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 border whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "border-[var(--accent-aurum)] bg-[var(--accent-aurum)]/10 text-[var(--accent-aurum)]"
                      : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/40 card-nexus"
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span className="type-label">{cat.title}</span>
                </button>
              );
            })}
          </motion.div>

          {activeRecs && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="glass-card p-6">
              <h3 className="type-label text-[var(--text-primary)] mb-5">{activeRecs.title}</h3>
              <div className="space-y-3">
                {activeRecs.items.map((item, i) => (
                  <motion.div key={i} variants={fadeUp}
                    className="flex items-center justify-between p-4 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] card-nexus group hover:border-[var(--accent-aurum)]/40 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="type-mono text-[var(--accent-aurum)] text-xs">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <p className="type-body text-[var(--text-primary)]">{item.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-[var(--bg-tertiary)] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)]" style={{ width: `${item.match}%` }} />
                      </div>
                      <span className="type-mono text-[var(--accent-aurum)] text-xs">{item.match}%</span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-aurum)] transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-3">ANALYSIS SUMMARY</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "FACE", value: pillarResult.face || "N/A" },
                { label: "BODY", value: pillarResult.body || "N/A" },
                { label: "COLOR", value: pillarResult.color || "N/A" },
                { label: "OVERALL", value: pillarResult.overall || "N/A" },
              ].map(p => (
                <div key={p.label} className="text-center p-3 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] card-nexus">
                  <p className="type-mono text-[var(--text-muted)]">{p.label}</p>
                  <p className="type-display text-[var(--accent-aurum)] text-lg">{p.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex gap-4">
            <Link href="/dashboard/mannequin" className="btn-nexus flex-1 justify-center">
              <Shirt className="w-4 h-4" /> TRY ON MANNEQUIN
            </Link>
            <Link href="/dashboard/community" className="btn-nexus flex-1 justify-center">
              COMMUNITY <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
