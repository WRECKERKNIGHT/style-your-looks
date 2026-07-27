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
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-burgundy/10 flex items-center justify-center rounded-full mx-auto mb-6">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-espresso tracking-tight mb-3">SOMETHING WENT WRONG</h2>
        <p className="text-coffee font-body text-lg mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-gold inline-flex"
          >
            TRY AGAIN
          </button>
          <Link
            href="/dashboard"
            className="btn-elegant inline-flex"
          >
            BACK TO DASHBOARD
          </Link>
        </div>
      </div>
    </div>
  );
}
