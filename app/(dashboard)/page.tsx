"use client";

import Link from "next/link";
import { ScrollReveal, ScrollRevealItem, ScrollProgress } from "@/components/shared/ScrollReveal";
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
  User,
} from "lucide-react";

const quickActions = [
  {
    href: "/dashboard/face-analysis",
    label: "FACE IQ",
    description: "478-point analysis. Score your symmetry, jawline, skin.",
    icon: ScanFace,
    accent: "amber",
  },
  {
    href: "/dashboard/pillar-analysis",
    label: "4 PILLARS",
    description: "Harmony, Angularity, Dimorphism, Health. Improvement roadmap.",
    icon: Target,
    accent: "burgundy",
  },
  {
    href: "/dashboard/skin-health",
    label: "SKIN HEALTH",
    description: "5 skin metrics. Personalized AM/PM skincare routine.",
    icon: Droplets,
    accent: "olive",
  },
  {
    href: "/dashboard/body-analysis",
    label: "BODY + TONE",
    description: "Pose landmarks, body type, skin undertone detection.",
    icon: Layers,
    accent: "burgundy",
  },
  {
    href: "/dashboard/style-dna",
    label: "STYLE DNA",
    description: "Your complete profile. Face, body, color unified.",
    icon: Dna,
    accent: "amber",
  },
  {
    href: "/dashboard/color-analysis",
    label: "COLOR ANALYSIS",
    description: "Seasonal type. Best palettes. Harmony tester.",
    icon: Palette,
    accent: "olive",
  },
  {
    href: "/dashboard/virtual-tryon",
    label: "TRY-ON",
    description: "Overlay outfits on your photo. Preview before you commit.",
    icon: Shirt,
    accent: "olive",
  },
  {
    href: "/dashboard/grooming",
    label: "GROOMING",
    description: "15 beard styles, 9 mustache types. Virtual try-on.",
    icon: Scissors,
    accent: "amber",
  },
  {
    href: "/dashboard/face-comparison",
    label: "COMPARE",
    description: "Side-by-side metric breakdown. Track changes over time.",
    icon: GitCompareArrows,
    accent: "burgundy",
  },
  {
    href: "/dashboard/community",
    label: "COMMUNITY",
    description: "Rate looks. Get feedback. Build your style rep.",
    icon: Users,
    accent: "olive",
  },
];

const accentColors: Record<string, { bg: string; text: string; border: string }> = {
  amber: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/30" },
  burgundy: { bg: "bg-burgundy/10", text: "text-burgundy", border: "border-burgundy/30" },
  olive: { bg: "bg-olive/10", text: "text-olive", border: "border-olive/30" },
};

export default function DashboardHome() {
  return (
    <div className="space-y-16">
      {/* Welcome */}
      <ScrollReveal>
        <span className="section-number">EST. MMXXIV // DASHBOARD</span>
        <h1 className="mt-3 text-5xl md:text-6xl font-display font-bold text-espresso dark:text-dark-text tracking-tight leading-tight">
          WELCOME <span className="text-gradient-gold">BACK.</span>
        </h1>
        <p className="text-coffee dark:text-dark-muted mt-3 font-body text-lg max-w-xl leading-relaxed">
          Pick a tool. All analysis runs on your device. Zero server calls.
        </p>
      </ScrollReveal>

      <ScrollProgress />

      {/* Quick Actions Grid */}
      <ScrollReveal stagger staggerChildren={0.06}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action) => {
            const colors = accentColors[action.accent];
            return (
              <ScrollRevealItem key={action.href}>
                <Link
                  href={action.href}
                  className="group block bg-cream dark:bg-dark-surface border border-tan dark:border-dark-border p-7 hover:border-amber/40 transition-all duration-300 h-full card-hover vintage-border rounded-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 ${colors.bg} border ${colors.border} flex items-center justify-center rounded-sm`}>
                      <action.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-tan dark:text-dark-border group-hover:text-amber group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-base font-display font-bold text-espresso dark:text-dark-text tracking-wider mb-1.5">
                    {action.label}
                  </h3>
                  <p className="text-xs text-coffee dark:text-dark-muted font-body leading-relaxed">
                    {action.description}
                  </p>
                </Link>
              </ScrollRevealItem>
            );
          })}
        </div>
      </ScrollReveal>

      <ScrollProgress />

      {/* Getting Started */}
      <ScrollReveal>
        <div className="bg-cream dark:bg-dark-surface border border-tan dark:border-dark-border p-10 vintage-border rounded-sm">
          <div className="flex items-center gap-3 mb-8">
            <Camera className="w-5 h-5 text-amber" />
            <h2 className="text-lg font-display font-bold text-espresso dark:text-dark-text tracking-wider">QUICK START</h2>
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
                    <span className="text-4xl font-display font-bold text-amber/30 leading-none mt-1">{item.step}</span>
                    <div>
                      <h4 className="text-sm font-display font-bold text-espresso dark:text-dark-text tracking-wider mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-coffee dark:text-dark-muted font-body leading-relaxed">
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
