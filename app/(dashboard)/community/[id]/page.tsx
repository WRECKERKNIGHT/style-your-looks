"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

export default function CommunityPostPage() {
  const params = useParams();

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/community"
        className="inline-flex items-center gap-2 text-sm text-coffee hover:text-espresso transition-colors font-body"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <div className="bg-cream border border-tan overflow-hidden rounded-sm vintage-border">
        {/* Image placeholder */}
        <div className="w-full h-96 bg-parchment flex items-center justify-center">
          <div className="text-center">
            <Star className="w-14 h-14 text-amber/30 mx-auto mb-3" />
            <p className="text-coffee font-body">Post photo will appear here</p>
          </div>
        </div>

        <div className="p-8 space-y-5">
          <h1 className="text-2xl font-display font-bold text-espresso">Post Detail</h1>
          <p className="text-base text-coffee font-body leading-relaxed">
            This page will display the full post with rating breakdown, all comments, and the ability to rate.
            Post ID: {params.id}
          </p>
        </div>
      </div>
    </div>
  );
}
