"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  tilt?: number;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(140, 89, 255, 0.18)",
  tilt = 6,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const mouseX = useSpring(mx, { stiffness: 120, damping: 22 });
  const mouseY = useSpring(my, { stiffness: 120, damping: 22 });

  const rotateX = useTransform(mouseY, [0, 1], [tilt, -tilt]);
  const rotateY = useTransform(mouseX, [0, 1], [-tilt, tilt]);

  const spotlightX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const spotlightY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative [transform-style:preserve-3d] ${className}`}
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${spotlightX} ${spotlightY}, ${spotlightColor}, transparent 65%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
