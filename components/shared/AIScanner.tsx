"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, CheckCircle2, Loader2 } from "lucide-react";

interface AIScannerProps {
  onComplete?: () => void;
  duration?: number;
}

export function AIScanner({ onComplete, duration = 3000 }: AIScannerProps) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "processing" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const scanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setPhase("scanning");
    }, 400);
    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    if (phase !== "scanning") return;

    const scanDuration = duration * 0.6;
    const interval = 16;
    const steps = scanDuration / interval;
    let step = 0;

    const scanInterval = setInterval(() => {
      step++;
      const p = Math.min(step / steps, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(scanInterval);
        setPhase("processing");
      }
    }, interval);

    return () => clearInterval(scanInterval);
  }, [phase, duration]);

  useEffect(() => {
    if (phase !== "processing") return;

    const processTimeout = setTimeout(() => {
      setPhase("complete");
      onComplete?.();
    }, duration * 0.3);

    return () => clearTimeout(processTimeout);
  }, [phase, duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-sm bg-[#0F0A2E]/60 dark:bg-[#0A0618]/80 border border-[#6C2BD9]/30"
    >
      <div className="p-8 flex flex-col items-center gap-6">
        {/* Scanner frame */}
        <div className="relative w-40 h-40">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-[2px] bg-[#8C59FF] shadow-[0_0_8px_#8C59FF]" />
          <div className="absolute top-0 left-0 w-[2px] h-8 bg-[#8C59FF] shadow-[0_0_8px_#8C59FF]" />
          <div className="absolute top-0 right-0 w-8 h-[2px] bg-[#8C59FF] shadow-[0_0_8px_#8C59FF]" />
          <div className="absolute top-0 right-0 w-[2px] h-8 bg-[#8C59FF] shadow-[0_0_8px_#8C59FF]" />
          <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#8C59FF] shadow-[0_0_8px_#8C59FF]" />
          <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-[#8C59FF] shadow-[0_0_8px_#8C59FF]" />
          <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-[#8C59FF] shadow-[0_0_8px_#8C59FF]" />
          <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-[#8C59FF] shadow-[0_0_8px_#8C59FF]" />

          <div className="absolute inset-4 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {phase === "idle" || phase === "scanning" ? (
                <motion.div
                  key="scan-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <Scan className="w-10 h-10 text-[#8C59FF] mx-auto mb-2" />
                </motion.div>
              ) : phase === "processing" ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <Loader2 className="w-10 h-10 text-[#FFCB20] animate-spin mx-auto mb-2" />
                </motion.div>
              ) : (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#00E676] mx-auto mb-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scan line */}
          {phase === "scanning" && (
            <motion.div
              ref={scanRef}
              className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#8C59FF] to-transparent shadow-[0_0_12px_#8C59FF]"
              style={{ top: `${4 + progress * 80}%` }}
            />
          )}

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(140,89,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(140,89,255,1) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
        </div>

        {/* Status text */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="type-mono text-[#6C2BD9]"
              >
                READY
              </motion.span>
            )}
            {phase === "scanning" && (
              <motion.span
                key="scanning"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="type-mono text-[#8C59FF] flex items-center justify-center gap-2"
              >
                <span>SCANNING</span>
                <motion.span
                  className="inline-flex gap-0.5"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <span className="w-1 h-1 rounded-full bg-[#8C59FF]" />
                  <span className="w-1 h-1 rounded-full bg-[#8C59FF]" />
                  <span className="w-1 h-1 rounded-full bg-[#8C59FF]" />
                </motion.span>
              </motion.span>
            )}
            {phase === "processing" && (
              <motion.span
                key="processing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="type-mono text-[#FFCB20]"
              >
                PROCESSING...
              </motion.span>
            )}
            {phase === "complete" && (
              <motion.span
                key="complete"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="type-mono text-[#00E676]"
              >
                ANALYSIS COMPLETE
              </motion.span>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div className="mt-3 w-48 h-[2px] bg-[#6C2BD9]/20 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6C2BD9] to-[#8C59FF]"
              style={{ width: `${phase === "complete" ? 100 : phase === "idle" ? 0 : progress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Processing dots */}
        {phase === "processing" && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#FFCB20]"
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
