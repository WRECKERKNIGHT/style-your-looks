"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Star, MessageCircle, ArrowRight, RefreshCw, Wifi, WifiOff, ExternalLink } from "lucide-react";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";
import { getHistory, isDemoEntry } from "@/lib/history";

interface Post {
  id: string;
  user: string;
  avatar: string;
  content: string;
  ratingCount: number;
  comments: number;
  tags: string[];
  time: string;
}

const CATEGORIES = ["outfit", "face", "grooming", "body", "color", "tryon"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {}, show: { transition: { staggerChildren: 0.05 } },
};

function mapPost(raw: Record<string, unknown>, index: number): Post {
  const user = (raw.user as { full_name?: string }) || {};
  const category = String(raw.category || "outfit");
  return {
    id: String(raw.id || `seed_${index}`),
    user: user.full_name || `Member${index + 1}`,
    avatar: (user.full_name || "NX").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    content: String(raw.title || raw.description || raw.content || ""),
    ratingCount: Number(raw.rating_count ?? 0),
    comments: 0,
    tags: category ? [category] : [],
    time: raw.created_at ? timeAgo(String(raw.created_at)) : "recently",
  };
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

export default function CommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "tags">("feed");
  const [feed, setFeed] = useState<Post[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [realAnalyses, setRealAnalyses] = useState(0);

  useEffect(() => {
    setRealAnalyses(getHistory().filter((e) => !isDemoEntry(e)).length);
  }, []);

  const loadFeed = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch("/api/community/feed?limit=20", { signal });
      if (signal?.aborted) return;
      if (res.status === 401) {
        setLive(false);
        return;
      }
      if (res.status === 503 || !res.ok) {
        setLive(false);
        return;
      }
      const data = await res.json();
      if (signal?.aborted) return;
      if (Array.isArray(data.posts)) {
        setFeed(data.posts.length ? data.posts.map(mapPost) : []);
        setLive(true);
      }
    } catch {
      if (!signal?.aborted) setLive(false);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadFeed(controller.signal);
    return () => controller.abort();
  }, [loadFeed]);

  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <ScrollParallax speed={0.12} distance={30}>
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // COMMUNITY</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Users className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            STYLE <span className="text-gradient-aurum">COMMUNITY.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Real posts from verified ZERVEY users. No sample data, no inflated scores.
        </p>
      </motion.div>
      </ScrollParallax>

      <ScrollBlur blur={0} minOpacity={0.95}>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-wrap gap-2 items-center">
        {(["feed", "members", "tags"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border type-label transition-all ${
              activeTab === tab
                ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] text-[var(--accent-aurum)]"
                : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] card-nexus"
            }`}>{tab.toUpperCase()}</button>
        ))}
        <button
          onClick={() => loadFeed()}
          disabled={loading}
          className={`ml-auto flex items-center gap-2 px-3 py-2 border type-mono text-[0.6rem] transition-all ${
            live
              ? "border-emerald-400/40 text-emerald-400"
              : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
          }`}
          aria-label="Refresh feed"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {live ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {loading ? "LOADING" : live ? "LIVE FEED" : "FEED OFFLINE"}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "feed" && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
              {feed.length === 0 && !loading && (
                <div className="glass-card p-10 text-center">
                  <p className="text-[var(--text-muted)] font-body text-sm mb-2">
                    No posts yet.
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Run an analysis, then share your results to start the feed.
                  </p>
                </div>
              )}
              {feed.map((post) => (
                <motion.div
                  key={post.id}
                  variants={fadeUp}
                  onClick={() => router.push(`/dashboard/community/${post.id}`)}
                  className="glass-card p-5 cursor-pointer hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-nexus)] to-[var(--accent-aurum)] flex items-center justify-center type-mono text-sm text-white">{post.avatar}</div>
                      <div>
                        <p className="type-body text-[var(--text-primary)]">{post.user}</p>
                        <p className="text-xs text-[var(--text-muted)]">{post.time}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-[var(--text-primary)] mb-3 line-clamp-3">{post.content}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="type-mono text-[0.55rem] px-2 py-0.5 border border-[var(--border-primary)] text-[var(--text-muted)]">#{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[var(--accent-aurum)]" /> {post.ratingCount} ratings
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comments} comments
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "members" && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="glass-card p-10 text-center space-y-3">
              <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
              <h3 className="type-label text-[var(--text-primary)]">MEMBER DIRECTORY — COMING SOON</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                We don&apos;t ship a fake roster of profiles. When the member
                directory is live, it will list real, verified accounts only.
              </p>
            </motion.div>
          )}

          {activeTab === "tags" && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="glass-card p-6">
              <h3 className="type-label text-[var(--text-primary)] mb-1">POST CATEGORIES</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Static category labels — not fabricated trending data.
              </p>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((tag) => (
                  <span key={tag}
                    className="px-4 py-2 border border-[var(--border-primary)] card-nexus type-mono text-xs text-[var(--text-muted)]">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="type-label text-[var(--text-primary)] mb-3">CONNECT</h3>
            <p className="text-xs text-[var(--text-muted)] mb-2">
              Friend discovery and search are not built yet. They will be
              released before we pretend they exist.
            </p>
            <span className="inline-block type-mono text-[0.55rem] text-[var(--accent-mocha)] tracking-widest bg-aurum-400/15 px-2.5 py-1 rounded">
              COMING SOON
            </span>
          </div>

          <div className="glass-card p-4">
            <h3 className="type-label text-[var(--text-primary)] mb-3">YOUR STATS</h3>
            {realAnalyses === 0 ? (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2">
                No saved analyses yet. Every number shown here is computed from
                your own history — nothing is seeded.
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2">
                Based on your {realAnalyses} saved analysis{realAnalyses === 1 ? "" : "es"}.
              </p>
            )}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-muted)]"><span>Analyses</span><span className="text-[var(--text-primary)]">{realAnalyses}</span></div>
            </div>
          </div>

          <Link href="/dashboard/history" className="glass-card p-4 flex items-center justify-between group hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] transition-all">
            <span className="type-label text-[var(--text-primary)]">HISTORY</span>
            <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-aurum)] transition-colors" />
          </Link>
        </motion.div>
      </div>
      </ScrollBlur>
    </div>
  );
}
