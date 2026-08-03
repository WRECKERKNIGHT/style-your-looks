"use client";

import dynamic from "next/dynamic";
import { Nav } from "./Nav";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { HorizontalPipeline } from "./HorizontalPipeline";
import { StorySection } from "./StorySection";
import { MannequinSection } from "./MannequinSection";
import { CommunitySection } from "./CommunitySection";
import { TestimonialsSection } from "./TestimonialsSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { Footer } from "./Footer";

const ParticleField = dynamic(
  () => import("@/components/shared/ParticleField").then((m) => m.ParticleField),
  { ssr: false }
);

export function Hero() {
  return (
    <div className="min-h-screen bg-cosmic-base">
      <ParticleField />
      <Nav />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <HorizontalPipeline />
      <StorySection />
      <MannequinSection />
      <CommunitySection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
