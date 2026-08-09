"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollWeightTextProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Starting font-weight (default Light). */
  from?: number;
  /** Ending font-weight (default Extra Bold). */
  to?: number;
}

/**
 * Renders a heading whose font-weight ramps from `from` (Light) to `to`
 * (Extra Bold) as the user scrolls through the section it lives in.
 * Requires a variable font (Fraunces/Inter) to interpolate smoothly.
 */
export function ScrollWeightText({
  children,
  className = "",
  as = "h2",
  from = 300,
  to = 800,
}: ScrollWeightTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.4"],
  });

  const fontWeight = useTransform(scrollYProgress, [0, 1], [from, to]);
  const Tag = motion[as];

  return (
    <motion.div ref={ref} className={className}>
      <Tag style={{ fontWeight }}>{children}</Tag>
    </motion.div>
  );
}
