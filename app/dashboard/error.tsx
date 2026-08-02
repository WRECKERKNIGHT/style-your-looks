"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-burgundy/10 dark:bg-burgundy/20 border border-burgundy/20 flex items-center justify-center rounded-full mx-auto mb-6">
          <AlertTriangle className="w-7 h-7 text-burgundy" />
        </div>
        <h2 className="text-2xl font-display font-bold text-espresso dark:text-dark-text tracking-tight mb-3 uppercase tracking-wider">Something Went Wrong</h2>
        <p className="text-coffee dark:text-dark-muted font-body text-lg mb-8">
          An unexpected error occurred in this section.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="btn-gold inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            TRY AGAIN
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-cream dark:bg-dark-surface text-espresso dark:text-dark-text font-body text-sm tracking-wider uppercase border border-tan dark:border-dark-border hover:bg-tan/10 transition-colors rounded-sm">
            <LayoutDashboard className="w-4 h-4" />
            DASHBOARD
          </Link>
        </div>
      </div>
    </div>
  );
}
