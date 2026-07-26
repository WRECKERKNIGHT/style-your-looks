"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-burgundy/10 border border-burgundy/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-burgundy">!</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-espresso mb-2">Something went wrong</h1>
        <p className="text-coffee font-body mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-gold"
          >
            TRY AGAIN
          </button>
          <Link
            href="/"
            className="btn-elegant text-center"
          >
            GO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
