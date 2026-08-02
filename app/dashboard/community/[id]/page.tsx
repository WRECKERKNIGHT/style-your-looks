"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Camera, MessageSquare, Send } from "lucide-react";
import { useState } from "react";

const SAMPLE_POST = {
  id: "1",
  imageUrl: "",
  category: "outfit",
  title: "Date Night Look",
  description: "Navy blazer with cream shirt. First time trying this combo. Went for a classic look that works for most occasions. The fit is slim but not too tight.",
  avgRating: 8.2,
  ratingCount: 24,
  comments: [
    { id: "c1", user: "StylePro", text: "Great colour combo! The blazer fits perfectly.", rating: 9, createdAt: "2h ago" },
    { id: "c2", user: "FashionFan", text: "Try rolling the sleeves for a more relaxed vibe.", rating: 7, createdAt: "1h ago" },
    { id: "c3", user: "GentStyle", text: "This is a solid look. Maybe add a pocket square?", rating: 8, createdAt: "30m ago" },
  ],
  createdAt: "2h ago",
  user: { name: "Alex M." },
};

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const [myRating, setMyRating] = useState(5);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(SAMPLE_POST.comments);

  const submitComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: "You",
        text: comment.trim(),
        rating: myRating,
        createdAt: "just now",
      },
    ]);
    setComment("");
    setMyRating(5);
  };

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
        {/* Image */}
        {SAMPLE_POST.imageUrl ? (
          <img src={SAMPLE_POST.imageUrl} alt={SAMPLE_POST.title} className="w-full h-96 object-cover" />
        ) : (
          <div className="w-full h-96 bg-parchment flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-14 h-14 text-amber/30 mx-auto mb-3" />
              <p className="text-coffee font-body">{SAMPLE_POST.title}</p>
            </div>
          </div>
        )}

        <div className="p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber/15 flex items-center justify-center rounded-full border border-amber/25">
              <span className="text-base font-display font-bold text-amber">{SAMPLE_POST.user.name.charAt(0)}</span>
            </div>
            <div>
              <span className="text-base font-body font-bold text-espresso">{SAMPLE_POST.user.name}</span>
              <span className="text-sm text-coffee ml-2 font-body">{SAMPLE_POST.createdAt}</span>
            </div>
            <span className="text-xs font-body bg-parchment text-coffee px-3 py-1.5 uppercase tracking-wider border border-tan rounded-sm ml-auto">
              {SAMPLE_POST.category}
            </span>
          </div>

          <h1 className="text-3xl font-display font-bold text-espresso tracking-tight">{SAMPLE_POST.title}</h1>
          <p className="text-base text-coffee font-body leading-relaxed">{SAMPLE_POST.description}</p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Star className="w-6 h-6 text-amber fill-amber" />
              <span className="font-display font-bold text-espresso text-2xl">{SAMPLE_POST.avgRating}</span>
              <span className="text-sm text-coffee font-body">({SAMPLE_POST.ratingCount} ratings)</span>
            </div>
            <div className="flex items-center gap-1.5 text-coffee">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-body">{comments.length} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate & Comment */}
      <div className="bg-cream border border-tan p-6 rounded-sm vintage-border space-y-5">
        <h3 className="text-sm font-body text-coffee tracking-widest uppercase font-semibold">RATE & COMMENT</h3>
        <div className="bg-parchment p-4 border border-tan rounded-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-coffee font-body font-semibold">YOUR RATING</span>
            <span className="text-lg font-display font-bold text-amber">{myRating}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={myRating}
            onChange={(e) => setMyRating(parseInt(e.target.value))}
            className="w-full h-2.5 bg-[#E8E0D8] appearance-none cursor-pointer rounded-full accent-amber"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
            className="flex-1 px-4 py-3 bg-parchment border border-tan text-sm text-espresso placeholder:text-coffee font-body focus:outline-none focus:border-amber rounded-sm"
          />
          <button
            onClick={submitComment}
            disabled={!comment.trim()}
            className="px-5 py-3 bg-amber text-cream rounded-sm hover:bg-amber-light transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* All Comments */}
      <div className="space-y-4">
        <h3 className="text-sm font-body text-coffee tracking-widest uppercase font-semibold">COMMENTS</h3>
        {comments.map((c) => (
          <div key={c.id} className="bg-cream p-5 border border-tan rounded-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-body font-bold text-espresso">{c.user}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber fill-amber" />
                <span className="text-sm text-coffee font-body">{c.rating}</span>
              </div>
              <span className="text-xs text-coffee/50 font-body ml-auto">{c.createdAt}</span>
            </div>
            <p className="text-sm text-coffee font-body">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
