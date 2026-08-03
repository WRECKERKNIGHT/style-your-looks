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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    <div aria-hidden className="pointer-events-none fixed top-0 left-0 z-[5]">
      <motion.div
        className="w-[500px] h-[500px] rounded-full"
        style={{
          x: glowX,
          y: glowY,
          marginLeft: -250,
          marginTop: -250,
          background:
            "radial-gradient(circle, rgba(185,139,86,0.16) 0%, rgba(200,150,62,0.08) 35%, transparent 70%)",
        }}
      />
    </div>
  );
}
