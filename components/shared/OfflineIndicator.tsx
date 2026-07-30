"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

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
          className="fixed top-0 left-0 right-0 z-[10000] bg-burgundy dark:bg-burgundy text-cream dark:text-cream py-2 px-4 flex items-center justify-center gap-2 text-xs font-body tracking-wider"
        >
          <WifiOff className="w-3.5 h-3.5" />
          You are offline. Analysis and data are still available from cache.
        </motion.div>
      )}
      {isOnline && (
        <div className="fixed bottom-4 right-4 z-[10000]">
          <div className="w-2 h-2 rounded-full bg-olive shadow-[0_0_8px_rgba(85,107,47,0.5)]" title="Online" />
        </div>
      )}
    </AnimatePresence>
  );
}
