"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
    href: "/dashboard/body-analysis",
    label: "BODY + TONE",
    description: "Pose landmarks, body type, skin undertone detection.",
    icon: Layers,
    accent: "burgundy",
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
    href: "/dashboard/mannequin",
    label: "COLOR LAB",
    description: "Outfit palettes on SVG mannequins. Skin-tone matched.",
    icon: Palette,
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
  amber: { bg: "bg-amber/10", text: "text-amber", border: "border-amber" },
  burgundy: { bg: "bg-burgundy/10", text: "text-burgundy", border: "border-burgundy" },
  olive: { bg: "bg-olive/10", text: "text-olive", border: "border-olive" },
};

export default function DashboardHome() {
  return (
    <div className="space-y-10">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="section-number">EST. MMXXIV // DASHBOARD</span>
        <h1 className="mt-3 text-5xl md:text-6xl font-display font-bold text-espresso tracking-tight leading-tight">
          WELCOME <span className="text-gradient-gold">BACK.</span>
        </h1>
        <p className="text-coffee mt-3 font-body text-lg max-w-xl leading-relaxed">
          Pick a tool. All analysis runs on your device. Zero server calls.
        </p>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, i) => {
          const colors = accentColors[action.accent];
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={action.href}
                className="group block bg-cream border border-tan p-8 hover:border-amber/40 transition-all duration-300 h-full card-hover vintage-border rounded-sm"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 ${colors.bg} border ${colors.border} flex items-center justify-center rounded-sm`}>
                    <action.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-tan group-hover:text-amber group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-2">
                  {action.label}
                </h3>
                <p className="text-sm text-coffee font-body leading-relaxed">
                  {action.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Getting Started */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-cream border border-tan p-10 vintage-border rounded-sm"
      >
        <div className="flex items-center gap-3 mb-8">
          <Camera className="w-5 h-5 text-amber" />
          <h2 className="text-lg font-display font-bold text-espresso tracking-wider">QUICK START</h2>
        </div>
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
            <div key={item.step} className="flex gap-5">
              <span className="text-4xl font-display font-bold text-amber/30 leading-none mt-1">{item.step}</span>
              <div>
                <h4 className="text-sm font-display font-bold text-espresso tracking-wider mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-coffee font-body leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
