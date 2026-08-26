"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function RecommendationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Recommendations Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="glass-card max-w-lg w-full p-8 text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <div>
          <h2 className="type-heading text-[var(--text-primary)] mb-2">
            Recommendations Error
          </h2>
          <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">
            {error?.message || "An unexpected error occurred loading recommendations."}
          </p>
          {error?.digest && (
            <p className="text-[0.6rem] font-mono text-[var(--text-muted)] mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="btn-nexus inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}
