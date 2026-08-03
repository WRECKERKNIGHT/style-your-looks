"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ScrollReveal, ScrollRevealItem, ScrollProgress } from "@/components/shared/ScrollReveal";
import { TiltCard } from "@/components/shared/TiltCard";
import {
  ScanFace,
  Layers,
  Shirt,
  Palette,
  Scissors,
  Sparkles,
  Users,
  ArrowRight,
  Camera,
  Target,
  Droplets,
  GitCompareArrows,
  Dna,
  Clock,
  TrendingUp,
  Lightbulb,
  RotateCw,
  Activity,
} from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";
import { getHistory } from "@/lib/history";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { AIInsights } from "@/components/shared/AIInsights";
import { LiveVibeCheck } from "@/components/shared/LiveVibeCheck";
import { StyleTimeline } from "@/components/shared/StyleTimeline";
import { StyleStreak } from "@/components/shared/StyleStreak";

const aiTips = [
  "Your jawline benefits from structured collars. Avoid crew necks — they shorten the neck visually.",
  "Cool undertones pop against ivory. Skip yellow-based whites — they wash you out.",
  "High-contrast faces dominate in monochrome. Try a black suit with a white shirt — no tie.",
  "Your face shape suits asymmetrical cuts. Ask your barber for a textured fringe.",
  "Deep autumns own burgundy. Swap your navy blazer for oxblood this season.",
  "Vertical lines elongate your frame. Pinstripes are your secret weapon.",
  "Your skin clarity window peaks at 9 AM. Morning light is your best filter.",
  "Matte finishes beat glossy on your skin texture. Go for velvet-matte formulations.",
  "Your eye spacing favors wider lapels. Double-breasted jackets will balance your proportions.",
  "Earth tones amplify your natural contrast. Olive and rust outperform gray and charcoal.",
];

const onboardingTips = [
  "Upload 2–3 front-facing photos of your face in good, even lighting for the most accurate Face IQ scan.",
  "All analysis runs entirely on your device via MediaPipe — no photo ever leaves your browser.",
  "Face the camera directly at eye level. Slight tilts reduce symmetry accuracy.",
  "After your first scan, every module (Style DNA, Color, Grooming, Try-On) unlocks with real data.",
  "Save analyses to history to build your Style Evolution Timeline over time.",
  "Your Style Score is generated only from your real measurements — no default placeholders.",
];

const quickActions = [
  {
    href: "/dashboard/face-analysis",
    label: "FACE IQ",
    description: "478-point analysis. Score your symmetry, jawline, skin.",
    icon: ScanFace,
    accent: "nexus",
  },
  {
    href: "/dashboard/pillar-analysis",
    label: "4 PILLARS",
    description: "Harmony, Angularity, Dimorphism, Health. Improvement roadmap.",
    icon: Target,
    accent: "aurum",
  },
  {
    href: "/dashboard/skin-health",
    label: "SKIN HEALTH",
    description: "5 skin metrics. Personalized AM/PM skincare routine.",
    icon: Droplets,
    accent: "nexus",
  },
  {
    href: "/dashboard/body-analysis",
    label: "BODY + TONE",
    description: "Pose landmarks, body type, skin undertone detection.",
    icon: Layers,
    accent: "aurum",
  },
  {
    href: "/dashboard/style-dna",
    label: "STYLE DNA",
    description: "Your complete profile. Face, body, color unified.",
    icon: Dna,
    accent: "nexus",
  },
  {
    href: "/dashboard/color-analysis",
    label: "COLOR ANALYSIS",
    description: "Seasonal type. Best palettes. Harmony tester.",
    icon: Palette,
    accent: "aurum",
  },
  {
    href: "/dashboard/virtual-tryon",
    label: "TRY-ON",
    description: "Overlay outfits on your photo. Preview before you commit.",
    icon: Shirt,
    accent: "nexus",
  },
  {
    href: "/dashboard/grooming",
    label: "GROOMING",
    description: "15 beard styles, 9 mustache types. Virtual try-on.",
    icon: Scissors,
    accent: "aurum",
  },
  {
    href: "/dashboard/face-comparison",
    label: "COMPARE",
    description: "Side-by-side metric breakdown. Track changes over time.",
    icon: GitCompareArrows,
    accent: "nexus",
  },
  {
    href: "/dashboard/community",
    label: "COMMUNITY",
    description: "Rate looks. Get feedback. Build your style rep.",
    icon: Users,
    accent: "aurum",
  },
];

const accentStyles: Record<string, { bg: string; text: string; border: string }> = {
  nexus: { bg: "bg-[color-mix(in_srgb,var(--accent-nexus)_10%,transparent)]", text: "text-[var(--accent-nexus)]", border: "border-[color-mix(in_srgb,var(--accent-nexus)_30%,transparent)]" },
  aurum: { bg: "bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]", text: "text-[var(--accent-aurum)]", border: "border-[color-mix(in_srgb,var(--accent-aurum)_30%,transparent)]" },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function StatCounter({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  return (
    <motion.div
      variants={itemAnim}
      className="glass-card p-6 text-center"
    >
      <Icon className="w-6 h-6 text-[var(--accent-nexus)] mx-auto mb-2" />
      <div className="text-3xl font-bold text-[var(--text-primary)] font-display">{value}</div>
      <div className="text-sm text-[var(--text-muted)] font-body mt-1">{label}</div>
    </motion.div>
  );
}

function ProgressRing({ score, label, size = 120 }: { score: number; label: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(eased * score);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, score]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(185,139,86,0.18)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={false}
            transition={{ duration: 0.1 }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CCA066" />
              <stop offset="50%" stopColor="#B98B56" />
              <stop offset="100%" stopColor="#C8963E" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-bold text-[var(--text-primary)]">
            {animatedScore.toFixed(0)}
          </span>
        </div>
      </div>
      <span className="type-mono text-[var(--text-muted)]">{label}</span>
    </motion.div>
  );
}

export default function DashboardHome() {
  const { faceResult, bodyResult } = useAnalysisStore();
  const [tipIndex, setTipIndex] = useState(0);
  const [analysesDone, setAnalysesDone] = useState(0);

  const hasAnalysis = !!faceResult;
  const overallScore = faceResult ? faceResult.overallScore : null;
  const tips = hasAnalysis ? aiTips : onboardingTips;

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tips.length]);

  useEffect(() => {
    setAnalysesDone(getHistory().length);
  }, [faceResult, bodyResult]);

  return (
    <div className="space-y-16">
      <ScrollReveal>
        <span className="section-number">EST. MMXXIV // DASHBOARD</span>
        <h1 className="mt-3 type-display text-[var(--text-primary)] tracking-tight">
          WELCOME <span className="text-gradient-aurum">BACK.</span>
        </h1>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl mt-3">
          {hasAnalysis
            ? "Pick a tool. All analysis runs on your device. Zero server calls."
            : "Run your first Face IQ scan — every module unlocks with real data from your measurements."}
        </p>
      </ScrollReveal>

      {/* Style Score Overview / Onboarding */}
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper-lg p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-caramel)_12%,transparent)] via-transparent to-[color-mix(in_srgb,var(--accent-honey)_8%,transparent)] pointer-events-none" />
          {hasAnalysis && faceResult ? (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[var(--accent-caramel)]" />
                  <span className="type-label text-[var(--accent-mocha)]">STYLE SCORE OVERVIEW</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl font-display font-bold text-gradient-aurum">
                    <AnimatedCounter target={overallScore!} decimals={1} />
                  </span>
                  <span className="text-sm text-[var(--text-muted)] font-body">/ 100</span>
                </div>
                <p className="text-sm text-[var(--text-muted)] font-body mt-2">
                  {overallScore! >= 85
                    ? "Exceptional harmony. Your style profile is in peak condition."
                    : overallScore! >= 70
                    ? "Strong foundation. Targeted improvements will elevate your score."
                    : "Room for growth. Each analysis unlocks new optimization paths."}
                </p>
                <p className="type-mono text-[0.55rem] text-[var(--accent-mocha)] mt-3 tracking-widest">
                  {faceResult.analysisConfidence}% CONFIDENCE &middot; {faceResult.photoCount} PHOTO{faceResult.photoCount === 1 ? "" : "S"} &middot; {faceResult.facialShape.toUpperCase()} SHAPE
                </p>
              </div>
              <div className="relative">
                <ProgressRing score={overallScore!} label="OVERALL" size={120} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[var(--accent-caramel)]" />
                  <span className="type-label text-[var(--accent-mocha)]">STYLE SCORE OVERVIEW</span>
                </div>
                <h2 className="type-display text-[var(--text-primary)] tracking-tight mb-2">
                  YOUR SCORE <span className="text-gradient-aurum">AWAITS.</span>
                </h2>
                <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed max-w-lg">
                  We don&apos;t show you a fake number. Run your first Face IQ scan and your Style Score
                  is generated from your real facial geometry — symmetry, jawline, proportions, skin.
                </p>
              </div>
              <Link
                href="/dashboard/face-analysis"
                className="btn-nexus shrink-0 justify-center gap-2"
              >
                <ScanFace className="w-5 h-5" />
                RUN FACE IQ SCAN
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Quick Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCounter value={analysesDone > 0 ? String(analysesDone) : "--"} label="Analyses Done" icon={Activity} />
        <StatCounter value={overallScore != null ? overallScore.toFixed(1) : "--"} label="Style Score" icon={TrendingUp} />
        <StatCounter value={hasAnalysis ? "4" : "--"} label="Pillars Scored" icon={Target} />
        <StatCounter value={hasAnalysis && faceResult?.improvements?.length ? String(faceResult.improvements.length) : "--"} label="Improvements" icon={Lightbulb} />
      </motion.div>

      <ScrollProgress />

      {/* AI Tip of the Day + Vibe Check + Streak Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-[var(--accent-honey)]" />
              <span className="type-label text-[var(--accent-mocha)]">
                {hasAnalysis ? "AI TIP OF THE DAY" : "GETTING STARTED"}
              </span>
              <button
                onClick={() => setTipIndex((prev) => (prev + 1) % tips.length)}
                className="ml-auto p-1 hover:bg-[color-mix(in_srgb,var(--accent-caramel)_15%,transparent)] rounded transition-colors"
                aria-label="Next tip"
              >
                <RotateCw className="w-3.5 h-3.5 text-[var(--accent-mocha)]" />
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="text-sm text-[var(--text-primary)] font-body leading-relaxed min-h-[3rem]"
              >
                {tips[tipIndex]}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-1 mt-4">
              {tips.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTipIndex(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === Math.min(tipIndex, 4)
                      ? "w-5 bg-[var(--accent-honey)]"
                      : "w-1.5 bg-[color-mix(in_srgb,var(--accent-caramel)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent-caramel)_50%,transparent)]"
                  }`}
                  aria-label={`Tip ${i + 1}`}
                />
              ))}
              <span className="type-mono text-[var(--accent-mocha)] ml-auto">{(tipIndex % tips.length) + 1}/{tips.length}</span>
            </div>
          </motion.div>
        </ScrollReveal>

        <LiveVibeCheck score={overallScore ?? undefined} />

        <ScrollReveal>
          <StyleStreak />
        </ScrollReveal>
      </div>

      <ScrollProgress />

      {/* AI Insights */}
      <AIInsights faceResult={faceResult} />

      <ScrollProgress />

      {/* Style Timeline */}
      <StyleTimeline />

      <ScrollProgress />

      {/* Quick Actions */}
      <ScrollReveal stagger staggerChildren={0.06}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action) => {
            const colors = accentStyles[action.accent];
            return (
              <ScrollRevealItem key={action.href}>
                <TiltCard>
                  <Link
                    href={action.href}
                    className="card-nexus group block p-7 h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                        <action.icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-aurum)] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="type-label text-[var(--text-primary)] mb-1.5">
                      {action.label}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-body leading-relaxed">
                      {action.description}
                    </p>
                  </Link>
                </TiltCard>
              </ScrollRevealItem>
            );
          })}
        </div>
      </ScrollReveal>

      <ScrollProgress />

      <ScrollReveal>
        <div className="glass-card p-10">
          <div className="flex items-center gap-3 mb-8">
            <Camera className="w-5 h-5 text-[var(--accent-aurum)]" />
            <h2 className="type-heading text-[var(--text-primary)] tracking-tight">QUICK START</h2>
          </div>
          <ScrollReveal stagger staggerChildren={0.15}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "I",
                  title: "CAPTURE",
                  desc: "Front-facing photo. Good lighting. Webcam or upload.",
                },
                {
                  step: "II",
                  title: "ANALYZE",
                  desc: "AI maps your face, body, and skin tone. All client-side.",
                },
                {
                  step: "III",
                  title: "STYLE",
                  desc: "Scores, palettes, outfits, grooming recs. All personalised.",
                },
              ].map((item) => (
                <ScrollRevealItem key={item.step}>
                  <div className="flex gap-5">
                    <span className="text-5xl font-display font-bold text-[color-mix(in_srgb,var(--accent-nexus)_20%,transparent)] leading-none mt-1">{item.step}</span>
                    <div>
                      <h4 className="type-label text-[var(--text-primary)] mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </ScrollReveal>
    </div>
  );
}
