"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface ScrollParallaxProps {
  children: ReactNode;
  className?: string;
  /** 0–1 multiplier controlling how much slower/faster than scroll the element travels. */
  speed?: number;
  /** Max pixel shift in either direction across the viewport pass. */
  distance?: number;
}

/**
 * Tracks an element's scroll position through the viewport (start↔end pass)
 * and maps it to a vertical offset — the classic parallax wrapper.
 */
export function ScrollParallax({
  children,
  className = "",
  speed = 0.3,
  distance = 120,
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [distance * speed, -distance * speed]
  );

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ y, willChange: "transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScrollBlurProps {
  children: ReactNode;
  className?: string;
  /** Max blur in px applied while the element is out of the viewport pass. */
  blur?: number;
  /** Range (0–1) over which the element sharpens as it enters. */
  sharpAt?: number;
  /** Min opacity while out of view (use >0 for a soft fade instead of a reveal). */
  minOpacity?: number;
}

/**
 * Maps an element's scroll progress through the viewport to a CSS blur filter
 * (plus optional opacity) — scroll position drives the visual state.
 */
export function ScrollBlur({
  children,
  className = "",
  blur = 8,
  sharpAt = 0.25,
  minOpacity = 0.3,
}: ScrollBlurProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const filter = useTransform(
    scrollYProgress,
    [0, sharpAt, 1 - sharpAt, 1],
    [`blur(${blur}px)`, "blur(0px)", "blur(0px)", `blur(${blur}px)`]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, sharpAt, 1 - sharpAt, 1],
    [minOpacity, 1, 1, minOpacity]
  );

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ filter, opacity, willChange: "filter, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
