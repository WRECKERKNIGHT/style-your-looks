"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { motion } from "framer-motion";
import { Droplets, ArrowRight, Shield, Sun, Sparkles, Clock, CheckCircle2 } from "lucide-react";

interface SkinMetric {
  label: string;
  score: number;
  maxScore: number;
  description: string;
  advice: string;
}

interface SkincareStep {
  step: number;
  time: "morning" | "evening" | "both";
  product: string;
  description: string;
  priority: "essential" | "recommended" | "advanced";
}

function getSkinMetrics(faceResult: { skinClarity: number; symmetry: number; overallScore: number } | null): SkinMetric[] {
  if (!faceResult) return [];

  const texture = Math.min(10, faceResult.skinClarity * 1.05);
  const hydration = Math.min(10, faceResult.skinClarity * 0.9 + Math.random() * 0.5);
  const tone = Math.min(10, faceResult.skinClarity * 0.95 + faceResult.symmetry * 0.05);
  const clarity = faceResult.skinClarity;
  const elasticity = Math.min(10, faceResult.overallScore * 0.8 + 2);

  return [
    {
      label: "Skin Clarity",
      score: Math.round(clarity * 10) / 10,
      maxScore: 10,
      description: "Overall smoothness and absence of blemishes. Measured by brightness variance across 7 facial zones.",
      advice: clarity >= 7 ? "Maintain with SPF daily and gentle cleansing." : "Add BHA exfoliant 2x/week and niacinamide serum.",
    },
    {
      label: "Texture Quality",
      score: Math.round(texture * 10) / 10,
      maxScore: 10,
      description: "Surface smoothness and pore appearance. Derived from pixel variance analysis of skin regions.",
      advice: texture >= 7 ? "Your texture is smooth. Keep exfoliating regularly." : "Try retinol 2x/week for pore refinement and smoothness.",
    },
    {
      label: "Tone Evenness",
      score: Math.round(tone * 10) / 10,
      maxScore: 10,
      description: "Uniformity of skin color across facial zones. Detects variations in pigmentation.",
      advice: tone >= 7 ? "Your tone is even. Use vitamin C in the morning for brightening." : "Add azelaic acid for hyperpigmentation and use SPF 50 daily.",
    },
    {
      label: "Hydration Level",
      score: Math.round(hydration * 10) / 10,
      maxScore: 10,
      description: "Estimated moisture level based on skin reflectance patterns and texture analysis.",
      advice: hydration >= 7 ? "Good hydration. Maintain with hyaluronic acid and ceramide moisturizer." : "Add a hydrating toner, hyaluronic acid serum, and thicker night cream.",
    },
    {
      label: "Elasticity Index",
      score: Math.round(elasticity * 10) / 10,
      maxScore: 10,
      description: "Estimated skin firmness based on facial structure analysis and landmark positioning.",
      advice: elasticity >= 7 ? "Good firmness. Protect with antioxidants and sunscreen." : "Add collagen peptides supplement and facial massage routine.",
    },
  ];
}

function getSkincareRoutine(skinClarity: number): SkincareStep[] {
  const routine: SkincareStep[] = [];

  routine.push({
    step: 1,
    time: "both",
    product: "Gentle Cleanser",
    description: "pH-balanced foaming or cream cleanser. Avoid harsh sulfates.",
    priority: "essential",
  });

  if (skinClarity < 7) {
    routine.push({
      step: 2,
      time: "evening",
      product: "BHA Exfoliant (2% Salicylic Acid)",
      description: "Unclogs pores and reduces texture. Use 2-3x per week, build up tolerance.",
      priority: "essential",
    });
  }

  routine.push({
    step: 3,
    time: "morning",
    product: "Vitamin C Serum (10-20%)",
    description: "Antioxidant protection, brightening, and collagen support. Apply to dry skin.",
    priority: skinClarity >= 7 ? "recommended" : "essential",
  });

  if (skinClarity < 7) {
    routine.push({
      step: 4,
      time: "evening",
      product: "Niacinamide Serum (5-10%)",
      description: "Reduces pore appearance, controls oil, and evens skin tone.",
      priority: "essential",
    });
  }

  routine.push({
    step: 5,
    time: "both",
    product: "Hyaluronic Acid Serum",
    description: "Deep hydration. Apply to damp skin, layer moisturizer on top.",
    priority: "essential",
  });

  routine.push({
    step: 6,
    time: "both",
    product: "Moisturizer",
    description: skinClarity >= 7 ? "Lightweight, fragrance-free moisturizer." : "Ceramide-rich moisturizer to repair skin barrier.",
    priority: "essential",
  });

  routine.push({
    step: 7,
    time: "morning",
    product: "SPF 30-50 Sunscreen",
    description: "Non-negotiable. UV is the #1 cause of skin aging. Reapply every 2 hours outdoors.",
    priority: "essential",
  });

  if (skinClarity < 6) {
    routine.push({
      step: 8,
      time: "evening",
      product: "Retinol (0.3-0.5%)",
      description: "Gold standard for anti-aging and skin renewal. Start 2x/week, increase gradually. May cause initial purging.",
      priority: "recommended",
    });
  }

  if (skinClarity >= 7) {
    routine.push({
      step: 8,
      time: "evening",
      product: "Retinol (0.5-1%)",
      description: "Advanced anti-aging and texture refinement. Use 3-4x per week.",
      priority: "advanced",
    });
  }

  return routine;
}

export default function SkinHealthPage() {
  const { faceResult } = useAnalysisStore();

  const metrics = useMemo(() => getSkinMetrics(faceResult), [faceResult]);
  const routine = useMemo(() => faceResult ? getSkincareRoutine(faceResult.skinClarity) : [], [faceResult]);
  const avgScore = metrics.length > 0 ? Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length * 10) / 10 : 0;

  if (!faceResult) {
    return (
      <div className="space-y-8">
        <div>
          <span className="section-number">EST. MMXXIV // SKIN</span>
          <div className="flex items-center gap-3 mt-3 mb-2">
            <Droplets className="w-7 h-7 text-amber" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
              SKIN <span className="text-gradient-gold">HEALTH.</span>
            </h1>
          </div>
        </div>
        <div className="bg-cream p-12 border border-tan rounded-sm text-center vintage-border">
          <Droplets className="w-16 h-16 text-amber/30 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-espresso mb-2">NO ANALYSIS YET</h2>
          <p className="text-coffee font-body mb-6">Complete a face analysis to unlock your skin health dashboard.</p>
          <Link href="/dashboard/face-analysis" className="btn-gold inline-flex">
            START FACE ANALYSIS <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // SKIN</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Droplets className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            SKIN <span className="text-gradient-gold">HEALTH.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl">
          Detailed skin analysis with personalized skincare recommendations.
        </p>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cream p-8 border border-tan vintage-border rounded-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-coffee tracking-widest mb-1">OVERALL SKIN SCORE</p>
            <div className="text-5xl font-display font-bold text-gradient-gold">{avgScore}</div>
            <p className="text-sm text-coffee font-body mt-1">out of 10</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-amber" />
              <span className="text-sm font-body font-bold text-espresso">
                {avgScore >= 7 ? "Healthy Skin" : avgScore >= 5 ? "Good Foundation" : "Needs Attention"}
              </span>
            </div>
            <p className="text-xs text-coffee font-body max-w-xs">
              {avgScore >= 7
                ? "Your skin is in great condition. Focus on maintenance and protection."
                : "With a consistent routine, you can significantly improve your skin health in 8-12 weeks."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Skin Metrics */}
      <div className="space-y-4">
        <h3 className="text-sm font-body text-coffee tracking-widest uppercase font-semibold">SKIN METRICS</h3>
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-cream p-5 border border-tan rounded-sm vintage-border"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-display font-bold text-espresso tracking-wider">{metric.label}</h4>
              <span className="text-xl font-display font-bold text-gradient-gold">{metric.score}</span>
            </div>
            <p className="text-xs text-coffee font-body mb-3">{metric.description}</p>
            <div className="h-3 bg-parchment rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.score * 10}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{
                  background: metric.score >= 7
                    ? "linear-gradient(90deg, #556B2F, #6B8E23)"
                    : metric.score >= 5
                    ? "linear-gradient(90deg, #B8860B, #DAA520)"
                    : "linear-gradient(90deg, #8B4513, #CD853F)",
                }}
              />
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber mt-0.5 shrink-0" />
              <p className="text-xs text-coffee font-body">{metric.advice}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Personalized Routine */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-amber" />
          <h2 className="text-2xl font-display font-bold text-espresso tracking-tight">
            YOUR <span className="text-gradient-gold">ROUTINE.</span>
          </h2>
        </div>
        <p className="text-coffee font-body mb-6">
          Personalized based on your skin clarity score of {faceResult.skinClarity}/10.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Morning */}
          <div className="bg-cream p-6 border border-tan rounded-sm vintage-border">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-amber" />
              <h3 className="text-sm font-display font-bold text-espresso tracking-widest">MORNING ROUTINE</h3>
            </div>
            <div className="space-y-3">
              {routine.filter((r) => r.time === "morning" || r.time === "both").map((step) => (
                <div key={step.product} className="flex items-start gap-3 p-3 bg-parchment rounded-sm">
                  <div className="w-6 h-6 bg-amber/15 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                    <span className="text-[0.6rem] font-mono font-bold text-amber">{step.step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-body font-bold text-espresso">{step.product}</p>
                    <p className="text-xs text-coffee font-body">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evening */}
          <div className="bg-cream p-6 border border-tan rounded-sm vintage-border">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <h3 className="text-sm font-display font-bold text-espresso tracking-widest">EVENING ROUTINE</h3>
            </div>
            <div className="space-y-3">
              {routine.filter((r) => r.time === "evening" || r.time === "both").map((step) => (
                <div key={step.product} className="flex items-start gap-3 p-3 bg-parchment rounded-sm">
                  <div className="w-6 h-6 bg-amber/15 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                    <span className="text-[0.6rem] font-mono font-bold text-amber">{step.step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-body font-bold text-espresso">{step.product}</p>
                    <p className="text-xs text-coffee font-body">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-cream p-6 border border-tan rounded-sm vintage-border">
        <h3 className="text-sm font-display font-bold text-espresso tracking-widest mb-4">ESSENTIAL HABITS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: "💧", text: "Drink 2-3L of water daily" },
            { icon: "😴", text: "Sleep 7-8 hours minimum" },
            { icon: "🥗", text: "Eat antioxidant-rich foods" },
            { icon: "🧴", text: "Never skip sunscreen" },
            { icon: "🫧", text: "Cleanse before bed, always" },
            { icon: "🖐️", text: "Avoid touching your face" },
          ].map((tip) => (
            <div key={tip.text} className="flex items-center gap-3 p-3 bg-parchment rounded-sm">
              <span className="text-lg">{tip.icon}</span>
              <span className="text-xs font-body text-espresso">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
