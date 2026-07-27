"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-3 w-32 bg-tan/30 rounded mb-4" />
        <div className="h-10 w-64 bg-tan/30 rounded mb-2" />
        <div className="h-5 w-80 bg-tan/20 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-cream border border-tan rounded-sm p-8">
            <div className="h-6 w-40 bg-tan/20 rounded mb-4" />
            <div className="h-4 w-full bg-tan/15 rounded mb-2" />
            <div className="h-4 w-3/4 bg-tan/15 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
