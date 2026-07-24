"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ScanFace,
  Shirt,
  Users,
  Sparkles,
  ArrowRight,
  Star,
  Droplets,
  Scissors,
  Camera,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: ScanFace,
    title: "FaceIQ Analysis",
    description:
      "Advanced AI facial geometry mapping with 478-point analysis. Get objective scores on symmetry, proportions, jawline, and skin clarity.",
  },
  {
    icon: Droplets,
    title: "Skin Tone Detection",
    description:
      "Automatic undertone analysis (warm, cool, neutral) using ITA color science. Get personalized Monk Scale rating and color recommendations.",
  },
  {
    icon: Shirt,
    title: "Virtual Try-On",
    description:
      "Preview clothing items on your photo with AI body detection. See how outfits look before you wear them.",
  },
  {
    icon: Sparkles,
    title: "Style Recommendations",
    description:
      "AI-powered outfit suggestions based on your unique body type, skin tone, and occasion. Visualized on custom mannequins.",
  },
  {
    icon: Scissors,
    title: "Beard & Mustache Simulator",
    description:
      "Try 15+ beard styles and 9 mustache types virtually. Find the perfect grooming look for your face shape.",
  },
  {
    icon: Users,
    title: "Community Ratings",
    description:
      "Share your looks and get honest, constructive feedback. Rate others and build your style reputation.",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload or Capture",
    description: "Take a selfie or upload a photo to get started.",
  },
  {
    step: "02",
    title: "AI Analysis",
    description: "Our AI maps your features and detects your unique profile.",
  },
  {
    step: "03",
    title: "Get Recommendations",
    description: "Receive personalized style, grooming, and outfit advice.",
  },
];

export function Hero() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E8E0D8]/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3C2A21] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C89D7C]" />
            </div>
            <span className="text-lg font-bold text-[#3C2A21]">
              Aura<span className="text-[#C89D7C]">Style</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#3C2A21] hover:text-[#C89D7C] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-sm font-medium bg-[#3C2A21] text-white rounded-full hover:bg-[#2B1E16] transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#FDFBF7] border border-[#E8E0D8] rounded-full px-4 py-1.5 mb-8">
              <Star className="w-3.5 h-3.5 text-[#C89D7C]" />
              <span className="text-xs font-medium text-[#8B7D6B]">
                AI-Powered Personal Style Intelligence
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-[#3C2A21] leading-[1.1] tracking-tight">
              Discover Your
              <br />
              <span className="text-[#C89D7C]">Perfect Style</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[#8B7D6B] max-w-2xl mx-auto leading-relaxed">
              Advanced facial analysis, virtual try-on, and personalized outfit
              recommendations — all powered by AI that runs in your browser.
              Your data stays yours.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-[#3C2A21] text-white rounded-full font-medium text-lg hover:bg-[#2B1E16] transition-all flex items-center gap-2 shadow-lg shadow-[#3C2A21]/20"
              >
                Start Analyzing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-[#F4EFEA] text-[#3C2A21] rounded-full font-medium text-lg hover:bg-[#EDE5DC] transition-colors"
              >
                See Features
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3C2A21]">
              Everything You Need
            </h2>
            <p className="mt-4 text-[#8B7D6B] text-lg max-w-2xl mx-auto">
              From facial analysis to outfit recommendations, AuraStyle is your
              complete AI-powered style assistant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group bg-white rounded-2xl p-8 border border-[#E8E0D8] hover:border-[#C89D7C]/50 hover:shadow-lg hover:shadow-[#C89D7C]/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F4EFEA] group-hover:bg-[#C89D7C]/20 flex items-center justify-center mb-5 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#C89D7C]" />
                </div>
                <h3 className="text-lg font-semibold text-[#3C2A21] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#8B7D6B] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3C2A21]">
              How It Works
            </h2>
            <p className="mt-4 text-[#8B7D6B] text-lg">
              Three simple steps to your perfect style
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#3C2A21] flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold text-[#C89D7C]">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#3C2A21] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#8B7D6B]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-[#3C2A21] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3C2A21] via-[#2B1E16] to-[#3C2A21]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Style?
            </h2>
            <p className="text-[#C89D7C] text-lg mb-8 max-w-xl mx-auto">
              Join thousands using AI to discover their perfect look. Free forever.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#C89D7C] text-[#3C2A21] rounded-full font-medium text-lg hover:bg-[#D4B896] transition-colors"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#E8E0D8]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#3C2A21] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#C89D7C]" />
            </div>
            <span className="text-sm font-medium text-[#3C2A21]">AuraStyle</span>
          </div>
          <p className="text-xs text-[#8B7D6B]">
            All analysis runs in your browser. Your photos never leave your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
