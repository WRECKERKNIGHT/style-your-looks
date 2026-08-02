"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const glowX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.6 });
  const glowY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[5] w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: glowX,
        top: glowY,
        background:
          "radial-gradient(circle, rgba(108,43,217,0.14) 0%, rgba(140,89,255,0.07) 35%, transparent 70%)",
      }}
    />
  );
}
