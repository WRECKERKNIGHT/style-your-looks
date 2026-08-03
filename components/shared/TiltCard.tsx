"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glowColor?: string;
}

export function TiltCard({
  children,
  className = "",
  intensity = 7,
  glowColor = "rgba(200, 150, 62, 0.16)",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setPose({
      rotateX: (0.5 - py) * intensity,
      rotateY: (px - 0.5) * intensity,
      glowX: px * 100,
      glowY: py * 100,
    });
  };

  const reset = () => setPose({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
      animate={{ rotateX: pose.rotateX, rotateY: pose.rotateY }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`relative ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(480px circle at ${pose.glowX}% ${pose.glowY}%, ${glowColor}, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
