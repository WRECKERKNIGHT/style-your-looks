"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, CloudOff } from "lucide-react";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-[10000] bg-burgundy dark:bg-burgundy/90 text-cream py-2.5 px-4 flex items-center justify-center gap-2.5 text-xs font-body tracking-wider shadow-lg"
        >
          <CloudOff className="w-3.5 h-3.5 shrink-0" />
          <span>You are offline. Analysis and cached data are still available.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
