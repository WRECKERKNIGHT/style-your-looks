"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, ArrowLeft, ScanFace, Shirt, Palette, Users } from "lucide-react";

const STORAGE_KEY = "zervey_onboarding_done";

const steps = [
  {
    title: "Welcome to ZERVEY",
    description: "Your personal fashion intelligence platform. Analyse your face, body, and style to get personalised recommendations.",
    icon: Sparkles,
    color: "text-aurum-500",
  },
  {
    title: "Face IQ Analysis",
    description: "Use your camera or upload a photo to get a detailed facial analysis with symmetry, proportions, and grooming suggestions.",
    icon: ScanFace,
    color: "text-nexus-400",
  },
  {
    title: "Virtual Try-On",
    description: "Try different outfits and styles virtually. See how colours and cuts look on you before you buy.",
    icon: Shirt,
    color: "text-aurum-500",
  },
  {
    title: "Style DNA & Colour Lab",
    description: "Discover your seasonal colour palette and personal style archetype. Build a wardrobe that works for you.",
    icon: Palette,
    color: "text-nexus-400",
  },
  {
    title: "Community & Comparison",
    description: "Compare your progress over time, see score trends, and connect with the community.",
    icon: Users,
    color: "text-aurum-500",
  },
];

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const current = steps[step];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-6"
        >
          <div className="fixed inset-0 bg-nexus-800/50 dark:bg-black/70 backdrop-blur-sm" onClick={handleDismiss} />
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border rounded-sm shadow-nexus-xl p-8"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-nexus-400/40 hover:text-nexus-400 dark:text-cosmic-muted/40 dark:hover:text-cosmic-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-light-base dark:bg-cosmic-elevated border border-light-border dark:border-cosmic-border mb-6 mx-auto">
              <current.icon className={`w-6 h-6 ${current.color}`} />
            </div>

            <h3 className="text-xl font-body font-bold text-nexus-800 dark:text-white text-center tracking-tight mb-3">
              {current.title}
            </h3>
            <p className="text-sm text-nexus-400 dark:text-cosmic-muted font-body text-center leading-relaxed mb-8">
              {current.description}
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? "bg-aurum-500 w-6" : "bg-light-border dark:bg-cosmic-border"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-2.5 bg-light-base dark:bg-cosmic-elevated text-nexus-800 dark:text-white text-sm font-body tracking-wider uppercase border border-light-border dark:border-cosmic-border rounded-sm hover:bg-light-border/10 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  BACK
                </button>
              )}
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-body tracking-wider uppercase rounded-sm transition-colors btn-nexus ml-auto`}
              >
                {step === steps.length - 1 ? "GET STARTED" : "NEXT"}
                {step < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
