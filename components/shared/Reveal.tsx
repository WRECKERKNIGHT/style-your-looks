"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  x?: number;
  scale?: number;
  rotate?: number;
  delay?: number;
  duration?: number;
  amount?: number;
  once?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  className,
  y = 28,
  x = 0,
  scale = 1,
  rotate = 0,
  delay = 0,
  duration = 0.8,
  amount = 0.1,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });
  const reduceMotion = useReducedMotion();

  const hidden = reduceMotion
    ? { opacity: 1 }
    : { opacity: 0, y, x, scale, rotate };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 } : hidden}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
