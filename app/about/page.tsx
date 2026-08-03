import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/LegalPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "ZERVEY builds AI-powered style intelligence that runs entirely in your browser. Learn about our mission, values, and the people behind the project.",
};

const values = [
  {
    title: "MEASURED",
    body: "Style can be studied like a craft. We quantify what tailors and stylists have always seen by hand — symmetry, proportion, color — and turn it into guidance you can act on.",
  },
  {
    title: "PRIVATE",
    body: "Your photos are processed on your own device. No servers, no uploads, no training on your face. Privacy is not a feature — it is the architecture.",
  },
  {
    title: "HUMAN",
    body: "Algorithms inform; humans decide. Our tools are built to sharpen your judgment, not replace it. The mirror is still the final authority.",
  },
  {
    title: "FREE",
    body: "Understanding your look should not be a subscription. ZERVEY is free forever — the analysis belongs to you, not to a paywall.",
  },
];

export default function AboutPage() {
  return (
    <LegalPage
      eyebrow="ZERVEY // ABOUT"
      title={
        <>
          STYLE IS NOT A TREND.{" "}
          <span className="text-gradient-aurum">IT IS A SIGNAL.</span>
        </>
      }
      subtitle="ZERVEY exists to give everyone access to the kind of objective, data-backed style insight that used to require a personal stylist."
    >
      <section className="space-y-4">
        <h2 className="type-label text-[var(--text-primary)]">THE MISSION</h2>
        <p className="text-[var(--text-muted)] font-body leading-relaxed text-[15px]">
          Most people have never been told, with any precision, how their face,
          body, and coloring work together. ZERVEY closes that gap. Using
          computer vision and classical styling frameworks, it reads the
          geometry of your face and silhouette and translates it into clear,
          practical recommendations — color seasons, fits, hairstyles,
          grooming, and accessories.
        </p>
        <p className="text-[var(--text-muted)] font-body leading-relaxed text-[15px]">
          Everything runs in your browser with MediaPipe, so nothing is ever
          uploaded. The app is deliberately designed as a free, on-device
          tool: the analysis is yours, computed locally, and gone when you say
          it is.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="type-label text-[var(--text-primary)]">WHAT WE BELIEVE</h2>
        <div className="space-y-4">
          {values.map((value) => (
            <div key={value.title} className="glass-card p-6">
              <h3 className="type-mono text-[0.7rem] text-[var(--accent-mocha)] tracking-widest mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">
                {value.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="type-label text-[var(--text-primary)]">THE CRAFT</h2>
        <p className="text-[var(--text-muted)] font-body leading-relaxed text-[15px]">
          ZERVEY merges classical color theory (seasonal palettes), the
          golden-ratio geometry used in classic face analysis, and modern body
          typing. The result is a single dashboard that treats style as a
          system — from face IQ and symmetry scoring to tone studio palettes
          and virtual try-ons.
        </p>
        <p className="text-[var(--text-muted)] font-body leading-relaxed text-[15px]">
          Built by Harshit Mishra, and released open source so the analysis
          logic stays auditable and honest.
        </p>
      </section>
    </LegalPage>
  );
}
