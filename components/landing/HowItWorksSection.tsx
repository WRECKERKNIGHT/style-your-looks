"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Camera, Cpu, Shirt } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "CAPTURE",
    description:
      "Take a selfie or upload a photo. Front-facing, good lighting. That's it.",
    detail: "Webcam or file upload. JPEG, PNG, WebP. Max 10MB.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "PROCESS",
    description:
      "MediaPipe runs 478 face landmarks + 33 pose landmarks. All on your GPU.",
    detail: "Zero server calls. Zero data collection. Pure client-side ML.",
  },
  {
    number: "03",
    icon: Shirt,
    title: "STYLE",
    description:
      "Get your scores, color palette, outfit picks, grooming recs. Everything personalized.",
    detail: "FaceIQ, skin tone, body type, virtual try-on, community ratings.",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const stepsEls = stepsRef.current.filter(Boolean) as HTMLDivElement[];
    const progress = progressRef.current;
    if (!section || !track || stepsEls.length === 0) return;

    const ctx = gsap.context(() => {
      // Horizontal scroll: pin section, translate track left
      const trackWidth = track.scrollWidth - window.innerWidth + 120;

      gsap.to(track, {
        x: -trackWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${trackWidth}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // Progress line fills as you scroll
      if (progress) {
        gsap.to(progress, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${trackWidth}`,
            scrub: 0.3,
          },
        });
      }

      // Each step card fades/slides in as it enters the viewport
      stepsEls.forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power3.out",
            duration: 1,
            scrollTrigger: {
              trigger: step,
              containerAnimation: gsap.getById?.("howHorizontal"),
              start: "left 85%",
              end: "left 50%",
              scrub: 0.5,
              horizontal: true,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-section-gradient"
      id="how-it-works"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 w-full">
          {/* Header — stays fixed while steps scroll */}
          <div className="mb-12 md:mb-16">
            <span className="type-label text-amber/80">04 // Process</span>
            <h2 className="mt-3 type-display text-espresso">
              HOW IT{" "}
              <span className="text-gradient-gold italic">WORKS.</span>
            </h2>
          </div>
        </div>

        {/* Horizontal scrolling track */}
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-8 md:gap-12 pl-8 md:pl-16 lg:pl-24 pr-24"
            style={{ width: "max-content" }}
          >
            {steps.map((step, index) => (
              <div
                key={step.number}
                ref={(el: HTMLDivElement | null) => { stepsRef.current[index] = el; }}
                className="flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[42vw]"
              >
                <div className="relative bg-cream/70 backdrop-blur-sm border border-tan/20 p-10 md:p-14 h-full flex flex-col justify-between min-h-[420px] md:min-h-[480px]">
                  {/* Large background number */}
                  <div className="absolute top-6 right-8 font-display text-[7rem] md:text-[10rem] font-bold text-amber/[0.06] leading-none select-none">
                    {step.number}
                  </div>

                  {/* Step number + icon */}
                  <div className="relative z-10 mb-10">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-14 h-14 border border-amber/20 bg-parchment/80 flex items-center justify-center shrink-0">
                        <step.icon className="w-6 h-6 text-amber/70" />
                      </div>
                      <span className="type-mono text-[0.65rem] text-amber/60 tracking-[0.3em]">
                        STEP {step.number}
                      </span>
                    </div>

                    <h3 className="text-4xl md:text-6xl font-display font-bold text-espresso tracking-tight mb-5">
                      {step.title}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <p className="text-lg md:text-xl text-coffee leading-relaxed max-w-lg mb-5 font-body">
                      {step.description}
                    </p>
                    <p className="type-mono text-[0.7rem] text-coffee/40 max-w-md">
                      {step.detail}
                    </p>

                    {/* Connector arrow */}
                    <div className="mt-10 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-tan/30 to-transparent max-w-[200px]" />
                      <span className="type-mono text-[0.55rem] text-amber/50 tracking-widest">
                        {index < steps.length - 1 ? "NEXT →" : "GET STARTED →"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar — bottom of viewport */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 w-full mt-8">
          <div className="h-px w-full bg-tan/15 relative overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-amber/50 origin-left"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <div className="mt-3 flex justify-between">
            <span className="type-mono text-[0.5rem] text-coffee/40 tracking-widest">
              {steps.length} STEPS
            </span>
            <span className="type-mono text-[0.5rem] text-coffee/40 tracking-widest">
              SCROLL →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
