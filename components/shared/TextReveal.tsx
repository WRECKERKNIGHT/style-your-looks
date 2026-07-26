"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
  delay?: number;
  once?: boolean;
}

export function TextReveal({
  text,
  className = "",
  as: Tag = "h2",
  delay = 0,
  once = true,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px" });
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <span ref={ref} className="inline-flex flex-wrap">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", rotateX: -40 }}
              animate={isInView ? { y: 0, rotateX: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: delay + i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
