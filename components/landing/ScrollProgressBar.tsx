"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left pointer-events-none bg-gradient-to-r from-[#8A5F3D] via-[#B98B56] to-[#C8963E]"
      style={{ scaleX }}
    />
  );
}
