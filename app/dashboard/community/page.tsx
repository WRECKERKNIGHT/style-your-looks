"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Heart, MessageCircle, Share2, UserPlus, ArrowRight, Search, RefreshCw, Wifi, WifiOff, ExternalLink, Sparkles } from "lucide-react";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";
import { getHistory, isDemoEntry } from "@/lib/history";
import { DEMO_FEED, DEMO_MEMBERS } from "@/lib/demo/demo-community";

interface Post {
  id: string;
  user: string;
  avatar: string;
  badge: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  time: string;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  style: string;
  match: number;
}

const FEED: Post[] = DEMO_FEED;

const MEMBERS: Member[] = DEMO_MEMBERS;

const TRENDING_TAGS = ["color-analysis", "virtual-tryon", "silhouettes", "skin-health", "accessories", "deep-autumn", "capsule-wardrobe", "sustainable-fashion"];

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
    badge: "STYLE ICON",
    content: String(raw.title || raw.description || raw.content || ""),
    likes: Number(raw.rating_count ?? 0),
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
  const [feed, setFeed] = useState<Post[]>(FEED);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [realAnalyses, setRealAnalyses] = useState(0);

  useEffect(() => {
    setRealAnalyses(getHistory().filter((e) => !isDemoEntry(e)).length);
  }, []);

  const loadFeed = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch("/api/community/feed?limit=20", { signal });
      if (signal?.aborted) return;
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

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      setFeed((f) =>
        f.map((p) => (p.id === id ? { ...p, likes: p.likes + (next[id] ? 1 : -1) } : p))
      );
      return next;
    });
  };

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
          Connect, share, and discover with fellow ZERVEY users.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 type-mono text-[0.55rem] tracking-[0.25em] uppercase px-3 py-1.5 border border-[color-mix(in_srgb,var(--accent-honey)_50%,transparent)] text-[var(--accent-honey)] bg-[color-mix(in_srgb,var(--accent-honey)_8%,transparent)]">
          <Sparkles className="w-3 h-3" />
          SAMPLE SHOWCASE &mdash; NOT YOUR STATS
        </div>
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
          {loading ? "LOADING" : live ? "LIVE FEED" : "DEMO FEED"}
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
                        <div className="flex items-center gap-2">
                          <p className="type-body text-[var(--text-primary)]">{post.user}</p>
                          <span className="type-mono text-[0.55rem] px-1.5 py-0.5 border border-[var(--accent-aurum)] text-[var(--accent-aurum)]">{post.badge}</span>
                        </div>
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
                    <button onClick={(e) => toggleLike(e, post.id)}
                      className={`flex items-center gap-1 transition-colors ${liked[post.id] ? "text-[var(--accent-aurum)]" : "hover:text-[var(--accent-aurum)]"}`}>
                      <Heart className={`w-3.5 h-3.5 ${liked[post.id] ? "fill-current" : ""}`} /> {post.likes}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5" /> SHARE
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "members" && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
              {MEMBERS.map((member) => (
                <motion.div key={member.id} variants={fadeUp}
                  className="glass-card p-4 flex items-center justify-between group hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-nexus)] to-[var(--accent-aurum)] flex items-center justify-center type-mono text-sm text-white">{member.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="type-body text-[var(--text-primary)]">{member.name}</p>
                        <span className="type-mono text-[0.5rem] px-1.5 py-0.5 border border-[var(--accent-aurum)] text-[var(--accent-aurum)]">{member.badge}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{member.style}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="type-mono text-[var(--accent-aurum)]">{member.match}% MATCH</span>
                    <button className="btn-outline text-xs !py-1 !px-3">
                      <UserPlus className="w-3 h-3" /> FOLLOW
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "tags" && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="glass-card p-6">
              <h3 className="type-label text-[var(--text-primary)] mb-4">TRENDING TOPICS</h3>
              <div className="flex flex-wrap gap-3">
                {TRENDING_TAGS.map((tag) => (
                  <motion.button key={tag} variants={fadeUp}
                    className="px-4 py-2 border border-[var(--border-primary)] card-nexus hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] transition-all type-mono text-xs text-[var(--text-muted)] hover:text-[var(--accent-aurum)]">
                    #{tag}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="type-label text-[var(--text-primary)] mb-3">CONNECT</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Link your profiles and share your style journey.</p>
            <button className="btn-nexus w-full justify-center text-sm mb-2">
              <UserPlus className="w-4 h-4" /> FIND FRIENDS
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input type="text" placeholder="Search community..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-aurum)] outline-none" />
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="type-label text-[var(--text-primary)] mb-3">YOUR STATS</h3>
            {realAnalyses === 0 ? (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2">
                No real analyses yet. Feed and member numbers above are sample
                showcase data, not yours.
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2">
                Based on your {realAnalyses} saved analysis{realAnalyses === 1 ? "" : "es"}.
              </p>
            )}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-muted)]"><span>Analyses</span><span className="text-[var(--text-primary)]">{realAnalyses}</span></div>
              <div className="flex justify-between text-[var(--text-muted)]"><span>Posts</span><span className="text-[var(--text-primary)]">{realAnalyses > 0 ? realAnalyses : "0"}</span></div>
              <div className="flex justify-between text-[var(--text-muted)]"><span>Rank</span><span className="text-[var(--accent-aurum)]">{realAnalyses > 0 ? "BRONZE" : "—"}</span></div>
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
