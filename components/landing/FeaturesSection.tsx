"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ScanFace,
  Shirt,
  Scissors,
  Users,
  Droplets,
  Sparkles,
  Layers,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ScanFace,
    number: "01",
    title: "Face Analysis",
    description:
      "478-point facial landmark detection. Symmetry, proportions, jawline, skin clarity — scored objectively with golden ratio adherence.",
    accent: "amber" as const,
  },
  {
    icon: Droplets,
    number: "02",
    title: "Skin Tone",
    description:
      "ITA color science with CIELAB conversion. Monk Scale, Fitzpatrick, undertone mapping. Seasonal color classification.",
    accent: "burgundy" as const,
  },
  {
    icon: Layers,
    number: "03",
    title: "Body Type",
    description:
      "Pose landmark detection. Shoulder, waist, hip measurements. 8 body type classifications with proportion scoring.",
    accent: "olive" as const,
  },
  {
    icon: Shirt,
    number: "04",
    title: "Virtual Try-On",
    description:
      "AI body detection overlays clothing on your photo. Preview before you commit to a look.",
    accent: "amber" as const,
  },
  {
    icon: Scissors,
    number: "05",
    title: "Grooming Studio",
    description:
      "15 beard styles, 9 mustache types. Canvas overlays using facial landmarks. See what works before you commit.",
    accent: "burgundy" as const,
  },
  {
    icon: Sparkles,
    number: "06",
    title: "Outfit Picks",
    description:
      "AI-curated recommendations. 40+ outfits, 8 occasions, filtered by your unique profile and seasonal palette.",
    accent: "olive" as const,
  },
  {
    icon: Users,
    number: "07",
    title: "Community",
    description:
      "Share looks, get honest feedback, rate others. Build your style reputation with real people.",
    accent: "amber" as const,
  },
];

const accentMap = {
  amber: {
    border: "border-amber/20",
    text: "text-amber",
    bg: "bg-amber/[0.06]",
    dot: "#B8860B",
  },
  burgundy: {
    border: "border-burgundy/20",
    text: "text-burgundy",
    bg: "bg-burgundy/[0.06]",
    dot: "#722F37",
  },
  olive: {
    border: "border-olive/20",
    text: "text-olive",
    bg: "bg-olive/[0.06]",
    dot: "#556B2F",
  },
};

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!section || !inner || cards.length === 0) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // Header fades out slightly as cards begin
      const header = inner.querySelector(".features-header");
      if (header) {
        tl.to(
          header,
          { opacity: 0.4, y: -20, ease: "power2.inOut", duration: 0.1 },
          0
        );
      }

      // Each card enters sequentially
      cards.forEach((card, i) => {
        const position = i / cards.length;

        // Card enters
        tl.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power3.out",
            duration: 1 / cards.length,
          },
          position
        );

        // Earlier cards compress slightly as new ones arrive
        if (i < cards.length - 1) {
          const nextPosition = (i + 1) / cards.length;
          tl.to(
            card,
            {
              scale: 0.98,
              y: -4,
              ease: "power2.inOut",
              duration: 0.5 / cards.length,
            },
            nextPosition
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-section-warm"
      id="features"
    >
      {/* No CSS sticky — GSAP pin handles this */}
      <div
        ref={innerRef}
        className="h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto w-full">
          {/* Header */}
          <div className="features-header mb-10 md:mb-14">
            <span className="type-label text-amber/80">03 // Arsenal</span>
            <h2 className="mt-3 type-display text-espresso">
              WHAT WE{" "}
              <span className="text-gradient-gold italic">BUILD.</span>
            </h2>
          </div>

          {/* Card stack container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            {features.map((feature, index) => {
              const colors = accentMap[feature.accent];
              const colSpans = [
                "md:col-span-7 md:col-start-1",
                "md:col-span-4 md:col-start-9",
                "md:col-span-4 md:col-start-1",
                "md:col-span-5 md:col-start-5",
                "md:col-span-5 md:col-start-10",
                "md:col-span-4 md:col-start-1",
                "md:col-span-7 md:col-start-5",
              ];

              return (
                <div
                  key={feature.number}
                  ref={(el: HTMLDivElement | null) => {
                    cardRefs.current[index] = el;
                  }}
                  className={`${colSpans[index]}`}
                >
                  <div
                    className={`relative bg-cream/80 backdrop-blur-sm border ${colors.border} p-7 md:p-9 flex flex-col justify-between group cursor-default transition-shadow duration-500 hover:shadow-elegant-lg min-h-[260px] md:min-h-[300px]`}
                  >
                    {/* Background number */}
                    <div className="absolute top-3 right-5 font-display text-[4rem] font-bold text-espresso/[0.03] leading-none select-none group-hover:text-espresso/[0.06] transition-colors duration-700">
                      {feature.number}
                    </div>

                    {/* Top */}
                    <div className="relative z-10">
                      <div
                        className={`w-11 h-11 flex items-center justify-center border ${colors.border} ${colors.bg} mb-5`}
                      >
                        <feature.icon
                          className={`w-4.5 h-4.5 ${colors.text}`}
                        />
                      </div>
                      <h3 className="type-heading text-espresso mb-2.5 text-xl md:text-2xl">
                        {feature.title}
                      </h3>
                    </div>

                    {/* Bottom */}
                    <div className="relative z-10">
                      <p className="text-sm text-coffee leading-relaxed font-body mb-5">
                        {feature.description}
                      </p>
                      <div className="h-px w-full bg-tan/20" />
                      <div className="mt-3 flex items-center gap-2.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: colors.dot }}
                        />
                        <span className="type-mono text-[0.55rem] text-coffee/50 tracking-widest group-hover:text-coffee/80 transition-colors duration-500">
                          EXPLORE &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="mt-10 md:mt-14">
            <div className="h-px w-full bg-tan/20" />
            <div className="mt-3 flex justify-between">
              <span className="type-mono text-[0.5rem] text-coffee/40 tracking-widest">
                {features.length} FEATURES
              </span>
              <span className="type-mono text-[0.5rem] text-coffee/40 tracking-widest">
                SCROLL &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
