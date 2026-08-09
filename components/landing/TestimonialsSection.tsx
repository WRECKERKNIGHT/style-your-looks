"use client";

import { Star, Quote } from "lucide-react";
import { KineticHeadline } from "./KineticHeadline";
import { Reveal } from "@/components/shared/Reveal";
import { ScrollParallax, ScrollBlur } from "@/components/shared/ScrollEffects";

const testimonials = [
  {
    name: "ARJUN K.",
    role: "MENSWEAR DESIGNER",
    quote:
      "The symmetry breakdown reads like a tailor's fitting sheet. I redesign my whole line around these ratios now.",
  },
  {
    name: "NIDHI S.",
    role: "CONTENT CREATOR",
    quote:
      "Finally a color palette that doesn't tell me to wear beige. The seasonal mapping is scarily accurate.",
  },
  {
    name: "DANIEL B.",
    role: "PRODUCT MANAGER",
    quote:
      "Virtual try-on sold me before the grooming studio did. Everything runs in the browser — zero uploads.",
  },
  {
    name: "MAYA F.",
    role: "STYLIST",
    quote:
      "I test every client's palette here before photoshoots. It replaced three different paid tools for me.",
  },
  {
    name: "RIYA T.",
    role: "STUDENT",
    quote:
      "The beard simulator saved me from a genuinely bad decision. I owe this app my face.",
  },
  {
    name: "JAMES L.",
    role: "ENGINEER",
    quote:
      "Open the network tab while it analyzes — there's nothing there. That's the privacy story done right.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3 h-3 text-aurum-400" fill="#C8963E" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="relative py-32 md:py-44 overflow-hidden bg-cosmic-elevated" id="testimonials">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <ScrollParallax speed={0.3} distance={90} className="absolute top-1/3 left-1/4">
        <div className="w-[700px] h-[500px] rounded-full bg-aurum-400/10 blur-[200px] pointer-events-none" />
      </ScrollParallax>

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        <Reveal x={-30} className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="section-divider" />
            <span className="section-number">05 // Voices</span>
          </div>
          <KineticHeadline text="PEOPLE LIKE YOU." className="type-display text-[var(--text-primary)]" weightFrom={300} weightTo={800} />
          <p className="mt-5 text-[var(--text-secondary)] max-w-md font-body text-base leading-relaxed">
            Designers, creators, and everyone in between — already measuring,
            dressing, and showing up better.
          </p>
          <p className="mt-3 text-xs text-[var(--text-muted)] font-body max-w-md">
            Illustrative voices for now — we&apos;ll publish verified community
            stories as they arrive.
          </p>
        </Reveal>

        <ScrollBlur blur={7} minOpacity={1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <Reveal
              key={t.name}
              y={40}
              delay={(index % 3) * 0.1}
              className="glass-card rounded-2xl p-8 relative overflow-hidden group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-aurum-400/10" />
              <Stars count={5} />
              <p className="mt-6 text-sm text-[var(--text-secondary)] font-body leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-8 pt-5 border-t border-[var(--border-primary)] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-aurum flex items-center justify-center">
                  <span className="text-[0.6rem] font-mono font-bold text-white">
                    {t.name[0]}
                  </span>
                </div>
                <div>
                  <div className="type-mono text-[0.65rem] text-[var(--text-primary)] tracking-widest">
                    {t.name}
                  </div>
                  <div className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">
                    {t.role}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </ScrollBlur>
      </div>
    </section>
  );
}
