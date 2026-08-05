"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

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

interface ScrollTrackerProps {
  children: ReactNode;
  className?: string;
  /** Track bar placement on the tracked wrapper. */
  trackSide?: "right" | "left";
  trackClassName?: string;
}

/**
 * Tracks an element's scroll position through the viewport and renders a
 * vertical fill bar alongside it — a live "how far through the viewport is
 * this block" indicator driven by useScroll + useTransform.
 */
export function ScrollTracker({
  children,
  className = "",
  trackSide = "right",
  trackClassName = "",
}: ScrollTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
      {!reduce && (
        <motion.div
          aria-hidden
          style={{ scaleY }}
          className={cn(
            "absolute top-0 bottom-0 w-px origin-top bg-gradient-to-b from-nexus-500 via-aurum-400 to-aurum-300",
            trackSide === "right" ? "right-0" : "left-0",
            trackClassName
          )}
        />
      )}
    </div>
  );
}

interface SectionScrollProgressProps {
  className?: string;
  /** Show only after the section enters the viewport. */
  ariaLabel?: string;
}

/**
 * Live per-section horizontal progress line driven by the section's own
 * scroll position (start↔end pass) — a bounded scroll progress bar.
 */
export function SectionScrollProgress({
  className = "",
  ariaLabel = "Section scroll progress",
}: SectionScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-[color-mix(in_srgb,var(--text-muted)_18%,transparent)]" />
      <motion.div
        aria-hidden
        role="progressbar"
        aria-label={ariaLabel}
        className="absolute top-0 left-0 right-0 h-px origin-left bg-gradient-to-r from-nexus-500 via-aurum-400 to-aurum-300"
        style={{ scaleX }}
      />
    </div>
  );
}
