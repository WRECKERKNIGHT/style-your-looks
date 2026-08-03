"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = Array.from("ZERVEY");

const TAGLINES = [
  "MEASURED LIKE A TAILOR.",
  "COMPUTED LIKE AN ATELIER.",
  "ZERO SERVERS. ALL ON-DEVICE.",
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [tagline, setTagline] = useState(0);

  useEffect(() => {
    let frame: number;
    let done: ReturnType<typeof setTimeout>;
    const start = performance.now();
    const duration = 2200;

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      setTagline(Math.min(TAGLINES.length - 1, Math.floor(t * TAGLINES.length)));

      if (t < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        done = setTimeout(() => setIsLoading(false), 500);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(done);
    };
  }, []);

  const letters = useMemo(() => LETTERS, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-light-base dark:bg-cosmic-base overflow-hidden"
        >
          {/* ambience */}
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <motion.div
            aria-hidden
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-aurum-400/10 blur-[120px]"
          />

          <div className="relative text-center px-8">
            {/* monogram */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="flex items-center justify-center mb-7"
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1.08, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-14 h-14 bg-gradient-to-br from-aurum-500 via-aurum-400 to-aurum-300 flex items-center justify-center rounded-sm shadow-aurum-lg"
              >
                <svg
                  className="w-7 h-7 text-cosmic-base"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-sm"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
                    backgroundSize: "250% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>

            {/* wordmark */}
            <div className="flex items-baseline justify-center gap-[0.04em] mb-6 overflow-hidden">
              {letters.map((letter, i) => (
                <motion.span
                  key={`${letter}-${i}`}
                  initial={{ y: "120%", opacity: 0, rotate: 4 }}
                  animate={{ y: "0%", opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.25 + i * 0.07, ease: EASE }}
                  className="text-5xl md:text-7xl font-body font-bold tracking-tight text-gradient-aurum"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* progress */}
            <div className="relative mx-auto w-64 md:w-80 mb-5">
              <div className="h-px bg-light-border/40 dark:bg-cosmic-border/40 overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-aurum-500 via-aurum-300 to-aurum-500 origin-left rounded-full"
                  style={{ scaleX: progress, transformOrigin: "left center" }}
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="type-mono text-[0.55rem] text-nexus-400/50 dark:text-cosmic-muted/50 tracking-[0.3em] uppercase mt-3"
              >
                LOADING EXPERIENCE &middot; {Math.round(progress * 100)}%
              </motion.p>
            </div>

            {/* tagline */}
            <AnimatePresence mode="wait">
              <motion.p
                key={tagline}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="type-mono text-[0.6rem] text-[var(--accent-mocha)] tracking-[0.25em] uppercase"
              >
                {TAGLINES[tagline]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* credit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[0.5rem] font-mono text-nexus-400/40 dark:text-cosmic-muted/40 tracking-[0.3em] uppercase">
              Made by Harshit Mishra
            </span>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-aurum-500/30"
                  animate={{ opacity: [0.25, 0.9, 0.25], scale: [1, 1.4, 1] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* corner brackets */}
          <div className="absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 border-aurum-500/30" />
          <div className="absolute top-6 right-6 w-6 h-6 border-r-2 border-t-2 border-aurum-500/30" />
          <div className="absolute bottom-6 left-6 w-6 h-6 border-l-2 border-b-2 border-aurum-500/30" />
          <div className="absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 border-aurum-500/30" />

          {/* exit curtain */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-light-base/60 dark:to-cosmic-base/60"
            initial={{ opacity: 0 }}
            exit={{ opacity: 1, transition: { duration: 0.4 } }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
