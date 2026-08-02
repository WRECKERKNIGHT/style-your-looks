"use client";

import { useAnalysisStore } from "@/store/analysis-store";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Wand2 } from "lucide-react";

const PLAIN: Record<string, string> = {
  "Facial Symmetry": "Symmetrical face — balance reads as confidence",
  "Golden Ratio Adherence": "Proportions close to the classical ideal",
  "Jawline Definition": "Defined jawline — a structural anchor",
  "Proportional Harmony": "Facial thirds are evenly stacked",
  "Horizontal Fifths": "Eye bands sit in even rhythm across the face",
  "Eye Spacing": "Well-spaced, balanced eyes",
  "Skin Clarity": "Smooth, even-toned skin",
  "Cheekbone Definition": "Lifted, defined cheekbones",
  "FWHR (Facial Width-to-Height)": "Strong face width-to-height ratio",
  "Canthal Tilt": "Eyes have a naturally lifted, alert tilt",
  "Eye–Nose Ratio": "Eyes and nose are in strong proportion",
  "Nose–Chin Balance": "Nose sits in balance with the lower face",
  "Midface Harmony": "Midface and lower face are evenly matched",
  "Lip Proportion": "Balanced, well-proportioned lips",
  "Nose Profile": "Nose blends cohesively with the face",
  "Forehead Balance": "Forehead height is well balanced",
};

const WORK_ON: Record<string, string> = {
  "Facial Symmetry": "Even out asymmetry with brow grooming and a centered hairstyle",
  "Golden Ratio Adherence": "Optically rebalance thirds with volume where it's lacking",
  "Jawline Definition": "Define the jawline with a sharp jaw-shaping style or targeted grooming",
  "Proportional Harmony": "Add volume to the least-full third to level out proportions",
  "Horizontal Fifths": "Use brow shaping to visually widen or narrow eye bands",
  "Eye Spacing": "Choose wider frames or brow styles to rebalance spacing",
  "Skin Clarity": "Cleanse, exfoliate, hydrate, and wear SPF daily",
  "Cheekbone Definition": "Add subtle definition with lighting and contour techniques",
  "FWHR (Facial Width-to-Height)": "Hairstyle volume and beard width subtly affect the look",
  "Canthal Tilt": "Hydrate the eye area and groom brows to keep the eyes lifted",
  "Eye–Nose Ratio": "Small deviations read as character — style around them",
  "Nose–Chin Balance": "Structural; contour can refine perceived length",
  "Midface Harmony": "Lower-face fullness via beard or style shifts perceived balance",
  "Lip Proportion": "Balanced lip care and hydration refine fullness",
  "Nose Profile": "Style the surrounding features to draw the eye to your strengths",
  "Forehead Balance": "A fringe or hairline style balances forehead height",
};

function cardTitle(score: number): string {
  if (score >= 8) return "Editorial-level";
  if (score >= 7) return "Standout";
  if (score >= 6) return "Solid";
  return "Foundation";
}

export function CategoryCards() {
  const { faceResult } = useAnalysisStore();
  if (!faceResult) return null;

  const sorted = [...faceResult.breakdown].sort((a, b) => b.score - a.score);
  const best = sorted.slice(0, 3);
  const weakest = [...sorted].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-light-surface dark:bg-cosmic-surface border border-aurum-500/25 rounded-sm card-nexus p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-aurum-500" />
          <h3 className="text-sm font-body font-bold text-[var(--text-primary)] tracking-wider uppercase">
            Your best features
          </h3>
        </div>
        <div className="space-y-3">
          {best.map((m, i) => (
            <div key={m.label} className="flex items-start gap-3">
              <span className="shrink-0 text-[0.6rem] font-mono font-bold text-aurum-500 w-4 pt-0.5">
                {["A", "B", "C"][i]}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] font-body leading-snug">
                  {PLAIN[m.label] ?? m.label}
                </p>
                <p className="text-[0.65rem] font-mono text-[var(--text-muted)] mt-0.5">
                  {cardTitle(m.score)} · {m.score.toFixed(1)}/10
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="bg-light-surface dark:bg-cosmic-surface border border-[var(--border-primary)] rounded-sm card-nexus p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-nexus-400" />
          <h3 className="text-sm font-body font-bold text-[var(--text-primary)] tracking-wider uppercase">
            What to work on
          </h3>
        </div>
        <div className="space-y-3">
          {weakest.map((m, i) => (
            <div key={m.label} className="flex items-start gap-3">
              <span className="shrink-0 text-[0.6rem] font-mono font-bold text-nexus-400 w-4 pt-0.5">
                {`0${i + 1}`}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] font-body leading-snug">
                  {m.label}
                </p>
                <p className="text-xs text-[var(--text-secondary)] font-body leading-snug mt-0.5">
                  {WORK_ON[m.label] ?? m.tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="bg-gradient-to-br from-aurum-500/[0.08] to-transparent border border-aurum-500/30 rounded-sm card-nexus p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-aurum-500" />
          <h3 className="text-sm font-body font-bold text-[var(--text-primary)] tracking-wider uppercase">
            Your style verdict
          </h3>
        </div>
        <p className="text-sm text-[var(--text-primary)] font-body leading-relaxed">
          A <span className="font-bold">{faceResult.facialShape}</span> face with a{" "}
          <span className="font-bold text-aurum-500">{faceResult.styleProfile}</span> look —{" "}
          {faceResult.faceShapeDetails.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {faceResult.faceShapeDetails.idealHairstyles.slice(0, 2).map((h) => (
            <span
              key={h}
              className="px-2.5 py-1 border border-aurum-500/30 bg-aurum-500/5 text-[0.65rem] font-mono tracking-wider text-[var(--text-primary)]"
            >
              {h.toUpperCase()}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
