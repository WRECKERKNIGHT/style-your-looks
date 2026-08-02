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
}

function KineticWord({
  word,
  index,
  total,
  scrollYProgress,
  fillClassName,
  dimClassName,
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
      <span className={dimClassName}>{word}</span>
      <motion.span
        className={`absolute top-0 left-0 overflow-hidden ${fillClassName}`}
        style={{ width }}
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
}

export function KineticHeadline({
  text,
  className = "",
  fillClassName = "text-gradient-aurum",
  dimClassName = "text-[color-mix(in_srgb,var(--text-primary)_15%,transparent)]",
  as = "h2",
}: KineticHeadlineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.35"],
  });

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
            />
            {i < words.length - 1 && <span> </span>}
          </span>
        ))}
      </Tag>
    </motion.div>
  );
}
