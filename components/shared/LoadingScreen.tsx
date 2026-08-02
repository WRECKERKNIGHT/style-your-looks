"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1800;

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);

      if (t < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => setIsLoading(false), 400);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: "-100%",
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-light-base dark:bg-cosmic-base"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="flex items-baseline gap-3 mb-6">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-aurum-500 to-aurum-300 flex items-center justify-center rounded-sm shadow-lg shadow-aurum-500/25"
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-5 h-5 text-cosmic-base" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </motion.div>
              <span className="text-5xl md:text-7xl font-body font-bold text-white tracking-tight text-gradient-aurum">
                AURAYA
              </span>
            </div>

            <div className="w-48 h-px bg-light-border/20 dark:bg-cosmic-border/20 mx-auto mb-6 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-aurum-500 to-nexus-400 origin-left rounded-full"
                style={{ scaleX: progress }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="type-mono text-[0.55rem] text-nexus-400/40 dark:text-cosmic-muted/40 tracking-[0.3em] uppercase"
            >
              {Math.round(progress * 100)}%
            </motion.p>
          </motion.div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-aurum-500/20"
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                  backgroundColor: ["rgba(200,150,62,0.2)", "rgba(138,95,61,0.6)", "rgba(200,150,62,0.2)"],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 25% 50%, #B98B56 0%, transparent 50%), radial-gradient(circle at 75% 50%, #C8963E 0%, transparent 50%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
