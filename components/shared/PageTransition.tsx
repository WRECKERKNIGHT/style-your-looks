"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition() {
  const pathname = usePathname();
  const [showTransition, setShowTransition] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPathname) {
      setShowTransition(true);
      setPrevPathname(pathname);
      const timer = setTimeout(() => setShowTransition(false), 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname]);

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[90] bg-amber origin-top pointer-events-none"
          style={{ transformOrigin: "top" }}
        />
      )}
    </AnimatePresence>
  );
}
