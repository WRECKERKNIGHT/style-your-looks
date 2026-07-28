"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition() {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setPrevPath(pathname);
        setIsTransitioning(false);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [pathname, prevPath]);

  return (
    <AnimatePresence mode="wait">
      {isTransitioning && (
        <motion.div
          key="transition"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9997] origin-top"
          style={{ backgroundColor: "#B8860B" }}
        >
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0 origin-bottom"
            style={{ backgroundColor: "#F5F0E8" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
