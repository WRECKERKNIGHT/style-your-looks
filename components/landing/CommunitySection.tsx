"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, MessageCircle, TrendingUp, ScanFace, Ban, EyeOff } from "lucide-react";
import { SpotlightCard } from "@/components/shared/SpotlightCard";
import { ScrollParallax, ScrollBlur } from "@/components/shared/ScrollEffects";
import { KineticHeadline } from "./KineticHeadline";
import { Reveal } from "@/components/shared/Reveal";

const pillars = [
  {
    icon: ScanFace,
    tag: "REAL RESULTS",
    score: "YOU",
    label: "YOUR FACEIQ",
    quote:
      "Community posts are generated from your actual on-device analysis — never from pre-baked sample scores.",
  },
  {
    icon: Star,
    tag: "HONEST RATINGS",
    score: "1-10",
    label: "VERIFIED RATERS",
    quote:
      "Ratings come from confirmed accounts with a confirmed email. You cannot rate your own post.",
  },
  {
    icon: Ban,
    tag: "NO SELF-RATING",
    score: "0",
    label: "FAKED SCORES",
    quote:
      "No bots, no sock accounts, no inflated averages. A fake-looking score gets pulled.",
  },
  {
    icon: EyeOff,
    tag: "YOUR CALL",
    score: "100%",
    label: "PRIVATE OPTION",
    quote:
      "Share a blurred photo or keep it private entirely. Community is opt-in, never default.",
  },
];

const marqueeItems = [
  "FACE", "BODY", "STYLE", "GROOMING",
  "COLOR", "FIT", "VIBE", "LOOKS",
];

export function CommunitySection() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInView = useInView(marqueeRef, { amount: 0.3 });

  return (
    <section className="relative py-32 md:py-44 overflow-hidden bg-cosmic-surface scroll-mt-20" id="community">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-80 rounded-full bg-aurum-400/8 blur-[160px]" />
        <ScrollParallax speed={0.35} distance={90} className="absolute bottom-[12%] right-[3%]">
          <div className="w-[460px] h-[460px] rounded-full bg-nexus-500/8 blur-[150px] animate-drift" />
        </ScrollParallax>
        <ScrollParallax speed={0.25} distance={70} className="absolute top-[30%] left-[2%]">
          <div className="w-[380px] h-[380px] rounded-full bg-aurum-300/8 blur-[130px] animate-drift" style={{ animationDelay: "-12s" }} />
        </ScrollParallax>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        <Reveal x={-30} className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="section-divider" />
            <span className="section-number">04 // Community</span>
          </div>
          <KineticHeadline text="HONEST FEEDBACK." className="type-display text-[var(--text-primary)]" weightFrom={300} weightTo={800} />
          <p className="mt-5 text-[var(--text-secondary)] max-w-md font-body text-base leading-relaxed">
            No fabricated posts, no inflated scores. When you share, the
            numbers are real — and so is the feedback.
          </p>
        </Reveal>

        <ScrollBlur
          blur={6}
          minOpacity={0.6}
          className="marquee-container mb-16 md:mb-20 py-5 border-y border-[var(--border-primary)] overflow-hidden"
        >
          <div
            ref={marqueeRef}
            className="marquee-content"
            style={{
              animationPlayState: marqueeInView ? "running" : "paused",
              animationDirection: "reverse",
            }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-10 mr-10">
                {marqueeItems.map((word) => (
                  <span
                    key={word}
                    className="text-3xl md:text-5xl font-display italic text-[var(--text-primary)]/[0.05] tracking-tight whitespace-nowrap"
                  >
                    {word}
                    <span className="text-aurum-400/20 mx-5">&bull;</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </ScrollBlur>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => (
            <Reveal
              key={pillar.tag}
              y={50}
              rotate={index % 2 === 0 ? -1.5 : 1.5}
              delay={index * 0.1}
              className="glass-card rounded-2xl p-6 group cursor-default"
            >
              <SpotlightCard spotlightColor="rgba(185, 139, 86, 0.15)" className="h-full rounded-2xl">
              <div className="flex items-center justify-between mb-5">
                <span className="type-mono text-[0.55rem] text-[var(--accent-mocha)] tracking-widest bg-aurum-400/15 px-2.5 py-1 rounded">
                  {pillar.tag}
                </span>
                <span className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest">
                  #{String(index + 1).padStart(3, "0")}
                </span>
              </div>

              <div className="mb-4">
                <pillar.icon className="w-7 h-7 text-aurum-400 mb-2" />
                <div className="text-4xl font-display font-bold text-gradient-aurum leading-none">
                  {pillar.score}
                </div>
                <div className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-2">
                  {pillar.label}
                </div>
              </div>

              <p className="text-sm text-[var(--text-secondary)] font-body italic mb-5 leading-relaxed">
                &ldquo;{pillar.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-primary)]">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-aurum-400" fill="#C8963E" />
                  <span className="type-mono text-[0.65rem] text-[color-mix(in_srgb,var(--text-primary)_80%,transparent)]">
                    VERIFIED
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3 h-3 text-[var(--text-muted)]" />
                  <span className="type-mono text-[0.65rem] text-[var(--text-muted)]">
                    OPT-IN
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-success/60" />
                </div>
              </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <Reveal y={30} delay={0.6} className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 glass-card rounded-full px-8 py-4">
            <span className="type-mono text-[0.6rem] text-[var(--accent-mocha)] tracking-widest">
              NO SAMPLE POSTS. THE FEED SHOWS REAL USER SUBMISSIONS ONLY.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
