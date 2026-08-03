"use client";

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

export function Hero() {
  return (
    <div className="min-h-screen bg-cosmic-base">
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
