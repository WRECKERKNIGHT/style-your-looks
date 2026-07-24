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
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-[#3C2A21] mb-2">Something went wrong</h1>
        <p className="text-[#8B7D6B] mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#3C2A21] text-white rounded-xl font-medium hover:bg-[#2B1E16] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-[#F4EFEA] text-[#3C2A21] rounded-xl font-medium hover:bg-[#EDE5DC] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
