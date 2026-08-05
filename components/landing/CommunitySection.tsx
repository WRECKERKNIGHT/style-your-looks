"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, MessageCircle, TrendingUp } from "lucide-react";
import { StatsCounter } from "./StatsCounter";
import { SpotlightCard } from "@/components/shared/SpotlightCard";
import { ScrollParallax, ScrollBlur } from "@/components/shared/ScrollEffects";
import { KineticHeadline } from "./KineticHeadline";
import { Reveal } from "@/components/shared/Reveal";

const posts = [
  {
    name: "ALEX_M",
    score: 8.4,
    tag: "NIGHT OUT",
    rating: 9.2,
    comments: 23,
    quote: "The jawline score was brutal but accurate.",
  },
  {
    name: "KIRA.S",
    score: 7.8,
    tag: "STREETWEAR",
    rating: 8.7,
    comments: 41,
    quote: "Finally a color palette that actually works.",
  },
  {
    name: "DANIEL_B",
    score: 9.1,
    tag: "FORMAL",
    rating: 9.5,
    comments: 18,
    quote: "The golden ratio breakdown blew my mind.",
  },
  {
    name: "MAYA.X",
    score: 8.0,
    tag: "CASUAL",
    rating: 8.9,
    comments: 56,
    quote: "Shared my grooming recs. Game changer.",
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
          <KineticHeadline text="HONEST FEEDBACK." className="type-display text-[var(--text-primary)]" />
          <p className="mt-5 text-[var(--text-secondary)] max-w-md font-body text-base leading-relaxed">
            Real people. Real ratings. No filters, no fakery. The kind of
            feedback your friends won&apos;t give you.
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
          {posts.map((post, index) => (
            <Reveal
              key={post.name}
              y={50}
              rotate={index % 2 === 0 ? -1.5 : 1.5}
              delay={index * 0.1}
              className="glass-card rounded-2xl p-6 group cursor-default"
            >
              <SpotlightCard spotlightColor="rgba(185, 139, 86, 0.15)" className="h-full rounded-2xl">
              <div className="flex items-center justify-between mb-5">
                <span className="type-mono text-[0.55rem] text-[var(--accent-mocha)] tracking-widest bg-aurum-400/15 px-2.5 py-1 rounded">
                  {post.tag}
                </span>
                <span className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest">
                  #{String(index + 1).padStart(3, "0")}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-5xl font-display font-bold text-gradient-aurum leading-none">
                  {post.score}
                </div>
                <div className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-2">
                  FACEIQ SCORE
                </div>
              </div>

              <p className="text-sm text-[var(--text-secondary)] font-body italic mb-5 leading-relaxed">
                &ldquo;{post.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-primary)]">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-aurum-400" fill="#C8963E" />
                  <span className="type-mono text-[0.65rem] text-[color-mix(in_srgb,var(--text-primary)_80%,transparent)]">
                    {post.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3 h-3 text-[var(--text-muted)]" />
                  <span className="type-mono text-[0.65rem] text-[var(--text-muted)]">
                    {post.comments}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-success/60" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center">
                  <span className="text-[0.5rem] font-mono text-[var(--accent-mocha)] font-bold">
                    {post.name[0]}
                  </span>
                </div>
                <span className="type-mono text-[0.6rem] text-[var(--text-muted)]">
                  {post.name}
                </span>
              </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <Reveal y={30} delay={0.6} className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 glass-card rounded-full px-8 py-4">
            <div className="text-2xl font-display font-bold text-gradient-aurum">
              <StatsCounter target={12400} suffix="+" />
            </div>
            <div className="h-8 w-px bg-[var(--border-primary)]" />
            <p className="type-mono text-[0.65rem] text-[var(--text-muted)] tracking-widest">
              STYLE PROFILES CREATED
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
