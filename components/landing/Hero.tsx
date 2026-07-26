"use client";

import { Nav } from "./Nav";
import { HeroSection } from "./HeroSection";
import { MannequinSection } from "./MannequinSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { CommunitySection } from "./CommunitySection";
import { CtaSection } from "./CtaSection";
import { Footer } from "./Footer";

export function Hero() {
  return (
    <div className="min-h-screen bg-parchment">
      <Nav />
      <HeroSection />
      <MannequinSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CommunitySection />
      <CtaSection />
      <Footer />
    </div>
  );
}
