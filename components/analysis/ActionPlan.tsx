"use client";

import { useState } from "react";
import { useAnalysisStore } from "@/store/analysis-store";
import { motion } from "framer-motion";
import { Scissors, Droplets, Moon, Save, Check, RotateCcw } from "lucide-react";

const STORAGE_KEY = "zervey_action_plan";

interface PlanItem {
  id: string;
  text: string;
}

function buildPlan(faceResult: ReturnType<typeof useAnalysisStore.getState>["faceResult"]): {
  barber: PlanItem[];
  skincare: PlanItem[];
  lifestyle: PlanItem[];
} {
  const shape = faceResult?.facialShape ?? "Oval";
  const style = faceResult?.styleProfile ?? "Classic";
  const jaw = faceResult?.jawline ?? 7;
  const skin = faceResult?.skinClarity ?? 7;
  const feminine = faceResult?.genderProfile === "feminine";
  const idealHair = faceResult?.faceShapeDetails.idealHairstyles ?? [];

  const barber: PlanItem[] = [];
  if (idealHair.length >= 2) {
    barber.push({
      id: "hair",
      text: `Book a ${idealHair[0].toLowerCase()} or ${idealHair[1].toLowerCase()} cut — built for your ${shape.toLowerCase()} face.`,
    });
  }
  if (jaw < 6.5) {
    barber.push({
      id: "jaw",
      text: feminine
        ? "Ask your stylist for soft layers that frame the jawline."
        : "Ask your barber for a sharp, jaw-hugging shape to define the jawline.",
    });
  } else {
    barber.push({
      id: "jaw",
      text: "Your jawline is an asset — keep it clean and let it lead the look.",
    });
  }
  barber.push({
    id: "style",
    text: `Lean into the ${style} profile in how your barber shapes the edges and length.`,
  });

  const skincare: PlanItem[] = [];
  if (skin < 6) {
    skincare.push({ id: "cleanse", text: "Daily cleanser + SPF 30 moisturizer, every morning." });
    skincare.push({ id: "exfoliate", text: "Exfoliate twice a week to even out texture." });
    skincare.push({ id: "actives", text: "Add niacinamide (pores) and vitamin C (brightening)." });
  } else if (skin < 7.5) {
    skincare.push({ id: "spf", text: "Non-negotiable daily SPF 30 — the #1 clarity move." });
    skincare.push({ id: "retinol", text: "Introduce retinol twice a week for texture refinement." });
    skincare.push({ id: "hydrate", text: "Night-time hydrating layer to keep skin plump." });
  } else {
    skincare.push({ id: "spf", text: "Keep the SPF 30 habit — it protects your clarity lead." });
    skincare.push({ id: "routine", text: "Maintain a simple cleanse + moisturize morning routine." });
    skincare.push({ id: "treat", text: "Occasional hydration mask keeps glow consistent." });
  }

  const lifestyle: PlanItem[] = [
    { id: "water", text: "2–3L of water daily — skin reads differently when hydrated." },
    { id: "sleep", text: "7+ hours of sleep; one great night visibly lifts the face." },
    { id: "posture", text: "Neck posture and daily chin-tucks sharpen the jawline over weeks." },
  ];

  return { barber, skincare, lifestyle };
}

export function ActionPlan() {
  const { faceResult } = useAnalysisStore();
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [savedAt, setSavedAt] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    return Number(localStorage.getItem(`${STORAGE_KEY}_saved`) || 0) || null;
  });

  if (!faceResult) return null;

  const { barber, skincare, lifestyle } = buildPlan(faceResult);
  const all = [...barber, ...skincare, ...lifestyle];
  const completed = all.filter((i) => done[i.id]).length;

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  const save = () => {
    setSavedAt(Date.now());
    try {
      localStorage.setItem(`${STORAGE_KEY}_saved`, String(Date.now()));
    } catch {
      /* storage unavailable */
    }
  };

  const reset = () => {
    setDone({});
    setSavedAt(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_saved`);
    } catch {
      /* storage unavailable */
    }
  };

  const columns = [
    { title: "BARBER / HAIR", icon: Scissors, items: barber },
    { title: "SKINCARE", icon: Droplets, items: skincare },
    { title: "LIFESTYLE", icon: Moon, items: lifestyle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-light-surface dark:bg-cosmic-surface border border-aurum-500/25 rounded-sm card-nexus p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="type-subhead text-sm text-[var(--text-primary)] tracking-wider">
            YOUR ACTION PLAN
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-body mt-1">
            {completed}/{all.length} done
            {savedAt
              ? ` · saved ${new Date(savedAt).toLocaleDateString()} ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="btn-outline text-xs px-3 py-2">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button onClick={save} className="btn-nexus text-xs px-4 py-2">
            <Save className="w-3.5 h-3.5" />
            Save Plan
          </button>
        </div>
      </div>

      <div className="h-2 bg-light-border dark:bg-cosmic-border rounded-full overflow-hidden mb-6">
        <motion.div
          animate={{ width: `${(completed / Math.max(1, all.length)) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-aurum-600 via-aurum-400 to-aurum-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.title} className="bg-light-base dark:bg-cosmic-elevated border border-[var(--border-primary)] rounded-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <col.icon className="w-4 h-4 text-[var(--accent-aurum)]" />
              <span className="text-xs font-bold text-[var(--text-primary)] font-body tracking-wider uppercase">
                {col.title}
              </span>
            </div>
            <div className="space-y-3">
              {col.items.map((item, i) => {
                const checked = !!done[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className="w-full flex items-start gap-3 text-left group"
                  >
                    <span
                      className={`w-5 h-5 shrink-0 mt-0.5 border flex items-center justify-center transition-all ${
                        checked
                          ? "bg-[var(--accent-aurum)] border-[var(--accent-aurum)] text-[var(--bg-primary)]"
                          : "border-[var(--border-primary)] group-hover:border-aurum-500/60"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </span>
                    <span
                      className={`text-xs font-body leading-relaxed transition-colors ${
                        checked
                          ? "text-[var(--text-muted)] line-through"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      <span className="font-mono text-aurum-500/70 text-[0.6rem] mr-1.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
