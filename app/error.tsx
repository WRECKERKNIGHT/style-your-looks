"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

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
    <div className="min-h-screen bg-parchment dark:bg-dark-base flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-burgundy/10 dark:bg-burgundy/20 border border-burgundy/30 flex items-center justify-center mx-auto mb-6 rounded-full">
          <AlertTriangle className="w-7 h-7 text-burgundy" />
        </div>
        <span className="section-number dark:text-amber">EST. MMXXIV // ERROR</span>
        <h1 className="text-3xl font-display font-bold text-espresso dark:text-dark-text mt-3 mb-3 tracking-tight">Something went wrong</h1>
        <p className="text-coffee dark:text-dark-muted font-body mb-8 leading-relaxed">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-gold inline-flex">
            <RefreshCw className="w-4 h-4" />
            TRY AGAIN
          </button>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-cream dark:bg-dark-surface text-espresso dark:text-dark-text font-body text-sm tracking-wider uppercase border border-tan dark:border-dark-border hover:bg-tan/10 transition-colors rounded-sm">
            <Home className="w-4 h-4" />
            GO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
