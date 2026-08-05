"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Camera, MessageSquare, Send, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/shared/Toast";
import { ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";

interface Comment {
  id: string;
  user: string;
  text: string;
  rating: number;
  createdAt: string;
}

interface PostDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  avgRating: number;
  ratingCount: number;
  createdAt: string;
  userName: string;
  avatar: string;
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "recently";
  const mins = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  const loadPost = useCallback(
    async (signal?: AbortSignal) => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/community/feed?id=${encodeURIComponent(id)}`, { signal });
        if (signal?.aborted) return;
        const data = await res.json();
        if (signal?.aborted) return;
        if (!res.ok || !Array.isArray(data.posts) || data.posts.length === 0) {
          setNotFound(true);
          return;
        }
        const raw = data.posts[0];
        const user = (raw.user as { full_name?: string }) || {};
        const name = user.full_name || "Member";
        setPost({
          id: String(raw.id),
          title: String(raw.title || "Untitled post"),
          description: String(raw.description || ""),
          category: String(raw.category || "outfit"),
          imageUrl: String(raw.image_url || ""),
          avgRating: Number(raw.avg_rating ?? 0),
          ratingCount: Number(raw.rating_count ?? 0),
          createdAt: raw.created_at ? timeAgo(String(raw.created_at)) : "recently",
          userName: name,
          avatar: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
        });
      } catch {
        if (!signal?.aborted) setNotFound(true);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadPost(controller.signal);
    return () => controller.abort();
  }, [loadPost]);

  const submit = async () => {
    if (submitting || !post) return;
    const text = comment.trim();
    if (!text) {
      addToast("Write a comment first", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, score: myRating, comment: text }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        addToast("Sign in to rate and comment", "error");
        router.push("/login");
        return;
      }
      if (!res.ok) {
        addToast(data?.error || "Could not submit rating", "error");
        return;
      }
      setComments((prev) => [
        ...prev,
        { id: Date.now().toString(), user: "You", text, rating: myRating, createdAt: "just now" },
      ]);
      setPost((p) =>
        p
          ? {
              ...p,
              avgRating:
                (p.avgRating * p.ratingCount + myRating) / (p.ratingCount + 1),
              ratingCount: p.ratingCount + 1,
            }
          : p
      );
      setComment("");
      setMyRating(5);
      addToast("Rating submitted", "success");
    } catch {
      addToast("Network error. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-aurum)]" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/community" className="inline-flex items-center gap-2 text-sm text-[var(--accent-mocha)] hover:text-[var(--accent-aurum)] transition-colors font-body">
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>
        <div className="glass-card p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <h1 className="type-label text-[var(--text-primary)]">POST NOT FOUND</h1>
          <p className="text-sm text-[var(--text-muted)] font-body">
            This post may have been removed or is private.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <Link
        href="/dashboard/community"
        className="inline-flex items-center gap-2 text-sm text-[var(--accent-mocha)] hover:text-[var(--accent-aurum)] transition-colors font-body"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <ScrollBlur blur={6} minOpacity={0.9}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} className="w-full max-h-96 object-contain bg-[var(--bg-secondary)]" />
        ) : (
          <div className="w-full h-64 bg-[var(--bg-secondary)] flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-14 h-14 text-[var(--text-muted)]/30 mx-auto mb-3" />
              <p className="text-[var(--text-muted)] font-body">{post.title}</p>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[var(--accent-nexus)] to-[var(--accent-aurum)] flex items-center justify-center rounded-full">
              <span className="text-base font-display font-bold text-white">{post.avatar}</span>
            </div>
            <div>
              <span className="text-base font-body font-bold text-[var(--text-primary)]">{post.userName}</span>
              <span className="text-sm text-[var(--text-muted)] ml-2 font-body">{post.createdAt}</span>
            </div>
            <span className="text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--accent-mocha)] px-3 py-1.5 uppercase tracking-widest border border-[var(--border-primary)] ml-auto">
              {post.category}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            {post.title}
          </h1>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-body leading-relaxed">
            {post.description}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Star className="w-6 h-6 text-[var(--accent-aurum)] fill-current" />
              <span className="font-display font-bold text-[var(--text-primary)] text-2xl">
                {Number.isFinite(post.avgRating) ? post.avgRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-sm text-[var(--text-muted)] font-body">
                ({post.ratingCount} ratings)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-body">{comments.length} comments</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
        <h3 className="type-label text-[var(--text-primary)]">RATE & COMMENT</h3>
        <div className="bg-[var(--bg-tertiary)] p-4 border border-[var(--border-primary)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)] font-body font-semibold">YOUR RATING</span>
            <span className="text-lg font-display font-bold text-[var(--accent-aurum)]">{myRating}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={myRating}
            onChange={(e) => setMyRating(parseInt(e.target.value))}
            className="w-full h-2 appearance-none cursor-pointer rounded-full accent-[var(--accent-aurum)]"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-body focus:outline-none focus:border-[var(--accent-aurum)]"
          />
          <button
            onClick={submit}
            disabled={submitting || !comment.trim()}
            className="px-5 py-3 bg-[var(--accent-aurum)] text-white hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      <div className="space-y-4">
        <h3 className="type-label text-[var(--text-primary)]">COMMENTS</h3>
        {comments.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] font-body">No comments yet. Be the first to share your thoughts.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-body font-bold text-[var(--text-primary)]">{c.user}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[var(--accent-aurum)] fill-current" />
                <span className="text-sm text-[var(--text-muted)] font-body">{c.rating}</span>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-body ml-auto">{c.createdAt}</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] font-body">{c.text}</p>
          </div>
        ))}
      </div>
      </ScrollBlur>
    </div>
  );
}
