"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, TrendingUp, Brain, ScanFace, ArrowRight } from "lucide-react";
import type { FaceAnalysisResult } from "@/store/analysis-store";

const typingSpeed = 24;
const pauseAfterLine = 3200;

function buildInsights(face: FaceAnalysisResult): string[] {
  const lines: string[] = [];
  const push = (text: string) => {
    if (text && text.length > 0) lines.push(text);
  };

  if (face.strengths?.[0]) {
    push(`Detected strength: ${face.strengths[0].replace(/^\+?\s*/, "")}.`);
  }
  if (face.improvements?.[0]) {
    push(`Highest-impact focus area: ${face.improvements[0].replace(/^[-•]\s*/, "")}.`);
  }
  if (face.rawFwhr) {
    push(`Facial width-to-height ratio reads ${face.rawFwhr.toFixed(2)} — ${face.rawFwhr >= 1.9 ? "a strong, structured frame" : face.rawFwhr >= 1.8 ? "within the balanced range" : "on the softer end"}.`);
  }
  if (face.rawCanthalTilt) {
    push(`Canthal tilt measures ${face.rawCanthalTilt > 0 ? "+" : ""}${face.rawCanthalTilt.toFixed(1)}° — ${face.rawCanthalTilt > 5 ? "an upward, alert eye line" : face.rawCanthalTilt > 0 ? "a gently positive eye line" : "a neutral-to-negative eye line"}.`);
  }
  if (face.faceShapeDetails?.idealHairstyles?.[0]) {
    push(`For your ${face.facialShape.toLowerCase()} face shape, a ${face.faceShapeDetails.idealHairstyles[0].toLowerCase()} cut balances your proportions best.`);
  }
  if (face.undertone) {
    push(`Your ${face.undertone.toLowerCase()} undertone makes ${face.undertone === "Cool" ? "jewel tones and silver" : face.undertone === "Warm" ? "earth tones and gold" : "both warm and cool neutrals"} the highest-confidence pick for you.`);
  }
  if (face.skinClarity) {
    push(`Skin clarity score ${face.skinClarity.toFixed(1)}/10 — ${face.skinClarity >= 7 ? "texture is reading smooth; matte finishes will keep it that way" : "texture variance is moderate; velvety-matte formulations will even it out"}.`);
  }

  return lines.length > 0 ? lines : ["Your Face IQ scan produced no unique signals. Try a clearer, front-facing photo."];
}

export function AIInsights({ faceResult }: { faceResult: FaceAnalysisResult | null }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const insights = useMemo(() => (faceResult ? buildInsights(faceResult) : []), [faceResult]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [faceResult]);

  useEffect(() => {
    if (insights.length === 0) return;
    const fullText = insights[currentIndex];
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
  }, [currentIndex, insights]);

  useEffect(() => {
    if (insights.length === 0 || isTyping) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, pauseAfterLine);

    return () => clearInterval(intervalRef.current);
  }, [insights, isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper"
    >
      <div className="absolute inset-0 scan-line pointer-events-none" />

      {!faceResult ? (
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-caramel)_25%,transparent)] to-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent-caramel)_35%,transparent)] flex items-center justify-center">
                <Brain className="w-6 h-6 text-[var(--accent-caramel)]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-caramel)]" />
                <span className="type-label text-[var(--accent-mocha)]">AI STYLE PREDICTION</span>
              </div>
              <p className="text-sm text-[var(--text-primary)] font-body leading-relaxed">
                Run your first Face IQ scan to generate real, personal predictions from your actual face geometry.
              </p>
              <Link
                href="/dashboard/face-analysis"
                className="mt-4 inline-flex items-center gap-2 btn-nexus !py-2.5 !px-5 text-xs"
              >
                <ScanFace className="w-4 h-4" />
                RUN FACE IQ
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
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
                  <span className="type-mono text-[var(--accent-mocha)]">
                    {faceResult.analysisConfidence}% confidence
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="type-mono text-[var(--accent-honey)]">
                    {faceResult.photoCount} photo{faceResult.photoCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {insights.length > 1 && (
            <div className="flex gap-1.5 mt-4">
              {insights.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    setIsTyping(true);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-6 bg-[var(--accent-caramel)]"
                      : "w-2 bg-[color-mix(in_srgb,var(--accent-caramel)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent-caramel)_50%,transparent)]"
                  }`}
                  aria-label={`Go to prediction ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
