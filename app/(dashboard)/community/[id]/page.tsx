"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, MessageCircle } from "lucide-react";

export default function CommunityPostPage() {
  const params = useParams();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/community"
        className="inline-flex items-center gap-2 text-sm text-[#8B7D6B] hover:text-[#3C2A21] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <div className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden">
        {/* Image placeholder */}
        <div className="w-full h-80 bg-[#F4EFEA] flex items-center justify-center">
          <div className="text-center">
            <Star className="w-12 h-12 text-[#C89D7C]/30 mx-auto mb-2" />
            <p className="text-[#8B7D6B]">Post photo will appear here</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h1 className="text-xl font-bold text-[#3C2A21]">Post Detail</h1>
          <p className="text-sm text-[#8B7D6B]">
            This page will display the full post with rating breakdown, all comments, and the ability to rate.
            Post ID: {params.id}
          </p>
        </div>
      </div>
    </div>
  );
}
