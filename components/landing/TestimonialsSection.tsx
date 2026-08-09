"use client";

import { Quote, ShieldCheck, Ruler, PenLine } from "lucide-react";
import { KineticHeadline } from "./KineticHeadline";
import { Reveal } from "@/components/shared/Reveal";
import { ScrollParallax, ScrollBlur } from "@/components/shared/ScrollEffects";

const promises = [
  {
    title: "NO FABRICATED PRAISE",
    body:
      "We won't invent glowing quotes from people who don't exist. When real, verified users are willing to be quoted, their stories will appear here — with their consent.",
  },
  {
    title: "MEASURED, NOT INVENTED",
    body:
      "Every score in the app is computed from real landmark geometry on your device. Nothing is hardcoded, and nothing claims to be a population ranking.",
  },
  {
    title: "YOUR VOICE COMES FIRST",
    body:
      "The most honest review we can show is the one you write after your first analysis. Share it with us — verified stories land on this page.",
  },
];

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
          <KineticHeadline text="NO FABRICATED VOICES." className="type-display text-[var(--text-primary)]" weightFrom={300} weightTo={800} />
          <p className="mt-5 text-[var(--text-secondary)] max-w-md font-body text-base leading-relaxed">
            We are not going to fake it. No invented users, no paid-sounding
            quotes from people who never opened the app.
          </p>
        </Reveal>

        <ScrollBlur blur={7} minOpacity={1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promises.map((p, index) => (
            <Reveal
              key={p.title}
              y={40}
              delay={(index % 3) * 0.1}
              className="glass-card rounded-2xl p-8 relative overflow-hidden group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-aurum-400/10" />
              <div className="w-10 h-10 rounded-full bg-gradient-aurum flex items-center justify-center mb-5">
                {index === 0 ? (
                  <ShieldCheck className="w-5 h-5 text-white" />
                ) : index === 1 ? (
                  <Ruler className="w-5 h-5 text-white" />
                ) : (
                  <PenLine className="w-5 h-5 text-white" />
                )}
              </div>
              <h3 className="type-mono text-[0.65rem] text-[var(--text-primary)] tracking-widest mb-3">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)] font-body leading-relaxed">
                {p.body}
              </p>
            </Reveal>
          ))}
        </ScrollBlur>
      </div>
    </section>
  );
}
