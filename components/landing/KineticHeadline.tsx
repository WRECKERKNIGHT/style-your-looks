"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface KineticWordProps {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  fillClassName: string;
  dimClassName: string;
  fontWeight?: MotionValue<number>;
}

function KineticWord({
  word,
  index,
  total,
  scrollYProgress,
  fillClassName,
  dimClassName,
  fontWeight,
}: KineticWordProps) {
  const start = index / total;
  const end = (index + 1) / total;

  const fill = useTransform(
    scrollYProgress,
    [start, start + (end - start) * 0.8],
    [0, 1]
  );
  const width = useTransform(fill, (v) => `${v * 100}%`);

  return (
    <span className="relative inline-block whitespace-nowrap">
      <motion.span className={dimClassName} style={fontWeight ? { fontWeight } : undefined}>
        {word}
      </motion.span>
      <motion.span
        className={`absolute top-0 left-0 overflow-hidden ${fillClassName}`}
        style={{ width, ...(fontWeight ? { fontWeight } : {}) }}
        aria-hidden
      >
        <span className="whitespace-nowrap">{word}</span>
      </motion.span>
    </span>
  );
}

interface KineticHeadlineProps {
  text: string;
  className?: string;
  fillClassName?: string;
  dimClassName?: string;
  as?: "h1" | "h2" | "h3" | "p";
  /**
   * When set, the headline font-weight ramps from `weightFrom` to `weightTo`
   * as the user scrolls through the section (requires a variable font).
   */
  weightFrom?: number;
  weightTo?: number;
}

export function KineticHeadline({
  text,
  className = "",
  fillClassName = "text-gradient-aurum",
  dimClassName = "text-[color-mix(in_srgb,var(--text-primary)_15%,transparent)]",
  as = "h2",
  weightFrom,
  weightTo,
}: KineticHeadlineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.35"],
  });

  const fontWeight = useTransform(
    scrollYProgress,
    [0, 1],
    [
      weightFrom != null ? weightFrom : 400,
      weightTo != null ? weightTo : 400,
    ]
  );
  const activeWeight =
    weightFrom != null && weightTo != null ? fontWeight : undefined;

  const words = text.split(" ");
  const Tag = motion[as];

  return (
    <motion.div ref={ref} className={className}>
      <Tag aria-label={text}>
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <KineticWord
              word={word}
              index={i}
              total={words.length}
              scrollYProgress={scrollYProgress}
              fillClassName={fillClassName}
              dimClassName={dimClassName}
              fontWeight={activeWeight}
            />
            {i < words.length - 1 && <span> </span>}
          </span>
        ))}
      </Tag>
    </motion.div>
  );
}
