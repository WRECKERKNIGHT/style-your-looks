"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Brain, Zap } from "lucide-react";

const predictions = [
  "Your jawline definition is trending +12% this month. Angularity is becoming a signature asset.",
  "Cool undertones dominate 68% of your palette. Jewel tones will outperform neutrals this season.",
  "Facial symmetry shows harmonic convergence at φ=1.62. Your proportions are approaching ideal.",
  "Skin clarity scores indicate optimal window for experimental grooming. Consider textured layers.",
  "Your body composition ratio suggests horizontal stripes will broaden silhouette advantageously.",
  "Seasonal color analysis predicts a shift toward deep autumn palettes as melanin contrast peaks.",
  "Cheekbone definition rising. Angular frames will complement emerging facial structure.",
  "Style DNA recombination detected: streetwear + formal elements are converging.",
];

const typingSpeed = 28;
const pauseAfterLine = 2800;

export function AIInsights() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fullText = predictions[currentIndex];
    let i = 0;

    setIsTyping(true);
    setDisplayedText("");

    const typeInterval = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [currentIndex]);

  useEffect(() => {
    if (isTyping) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % predictions.length);
    }, pauseAfterLine);

    return () => clearInterval(intervalRef.current);
  }, [isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper"
    >
      <div className="absolute inset-0 scan-line pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNCOThCNTYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-caramel)_25%,transparent)] to-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent-caramel)_35%,transparent)] flex items-center justify-center">
              <Brain className="w-6 h-6 text-[var(--accent-caramel)]" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="block w-full h-full rounded-full bg-[var(--accent-honey)] shadow-[0_0_8px_var(--accent-honey)]" />
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-caramel)]" />
              <span className="type-label text-[var(--accent-mocha)]">AI STYLE PREDICTION</span>
              <span className="type-mono text-[var(--accent-mocha)] ml-auto">v2.4.1</span>
            </div>

            <div className="min-h-[4.5rem]">
              <p className="text-sm text-[var(--text-primary)] font-body leading-relaxed">
                {displayedText}
                {isTyping && (
                  <motion.span
                    className="inline-block w-[2px] h-[1em] bg-[var(--accent-caramel)] ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-[var(--accent-mocha)]" />
                <span className="type-mono text-[var(--accent-mocha)]">+{Math.floor(Math.random() * 15 + 3)}% accuracy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[var(--accent-honey)]" />
                <span className="type-mono text-[var(--accent-honey)]">real-time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mt-4">
          {predictions.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setIsTyping(true); }}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-6 bg-[var(--accent-caramel)]"
                  : "w-2 bg-[color-mix(in_srgb,var(--accent-caramel)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent-caramel)_50%,transparent)]"
              }`}
              aria-label={`Go to prediction ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
