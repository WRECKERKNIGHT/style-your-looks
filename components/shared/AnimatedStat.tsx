"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedStatProps {
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
  color?: string;
}

export function AnimatedStat({ value, label, suffix = "", decimals = 0, color = "text-gradient-aurum" }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="bg-light-surface dark:bg-cosmic-surface p-6 border border-light-border dark:border-cosmic-border rounded-sm text-center card-nexus"
    >
      <div className={`text-3xl font-body font-bold ${color} mb-1`}>
        {display.toFixed(decimals)}{suffix}
      </div>
      <p className="text-xs font-mono text-nexus-400 dark:text-nexus-300 tracking-widest uppercase">{label}</p>
    </motion.div>
  );
}
