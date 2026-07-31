"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Heart, MessageCircle, Share2, UserPlus, ArrowRight, Search } from "lucide-react";

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

const FEED: Post[] = [
  { id: "p1", user: "AriaChen", avatar: "AC", badge: "STYLE ICON", content: "Just completed my full pillar analysis — the color season recommendations were spot on. Turns out I'm a Deep Autumn. Anyone else?", likes: 24, comments: 8, tags: ["color-analysis", "deep-autumn"], time: "2h ago" },
  { id: "p2", user: "MarcoR", avatar: "MR", badge: "RISING STAR", content: "Tried the virtual glasses try-on with the Gold Aviators. Game changer for shopping online.", likes: 18, comments: 5, tags: ["virtual-tryon", "accessories"], time: "4h ago" },
  { id: "p3", user: "StyleBot", avatar: "SB", badge: "AI CURATOR", content: "Weekly trend alert: structured blazers are peaking. Pair with wide-leg trousers for a 10/10 silhouette.", likes: 42, comments: 12, tags: ["trends", "silhouettes"], time: "6h ago" },
  { id: "p4", user: "LenaW", avatar: "LW", badge: "STYLE ICON", content: "My skin health score went from 72 to 88 in 3 months. Routine in bio.", likes: 35, comments: 15, tags: ["skin-health", "routine"], time: "8h ago" },
  { id: "p5", user: "DrewK", avatar: "DK", badge: "NEW", content: "First time using AI style analysis — mind officially blown. The body analysis measurements were within 2% of my tailor's.", likes: 29, comments: 7, tags: ["body-analysis", "first-post"], time: "12h ago" },
];

const MEMBERS: Member[] = [
  { id: "m1", name: "Priya S.", avatar: "PS", badge: "DIAMOND", style: "Classic Minimalist", match: 94 },
  { id: "m2", name: "James L.", avatar: "JL", badge: "GOLD", style: "Smart Casual", match: 91 },
  { id: "m3", name: "Emma W.", avatar: "EW", badge: "SILVER", style: "Avant-Garde", match: 87 },
  { id: "m4", name: "Carlos M.", avatar: "CM", badge: "GOLD", style: "Streetwear", match: 85 },
  { id: "m5", name: "Yuki T.", avatar: "YT", badge: "DIAMOND", style: "Japanese Minimalist", match: 82 },
];

const TRENDING_TAGS = ["color-analysis", "virtual-tryon", "silhouettes", "skin-health", "accessories", "deep-autumn", "capsule-wardrobe", "sustainable-fashion"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {}, show: { transition: { staggerChildren: 0.05 } },
};

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "tags">("feed");

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // COMMUNITY</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Users className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            STYLE <span className="text-gradient-aurum">COMMUNITY.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Connect, share, and discover with fellow NEXARI users.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex gap-2">
        {(["feed", "members", "tags"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border type-label transition-all ${
              activeTab === tab
                ? "border-[var(--accent-aurum)] bg-[var(--accent-aurum)]/10 text-[var(--accent-aurum)]"
                : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/40 card-nexus"
            }`}>{tab.toUpperCase()}</button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "feed" && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
              {FEED.map(post => (
                <motion.div key={post.id} variants={fadeUp} className="glass-card p-5">
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
                  </div>
                  <p className="text-sm text-[var(--text-primary)] mb-3">{post.content}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="type-mono text-[0.55rem] px-2 py-0.5 border border-[var(--border-primary)] text-[var(--text-muted)]">#{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <button className="flex items-center gap-1 hover:text-[var(--accent-aurum)] transition-colors">
                      <Heart className="w-3.5 h-3.5" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-[var(--accent-aurum)] transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                    </button>
                    <button className="flex items-center gap-1 hover:text-[var(--accent-aurum)] transition-colors">
                      <Share2 className="w-3.5 h-3.5" /> SHARE
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "members" && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
              {MEMBERS.map(member => (
                <motion.div key={member.id} variants={fadeUp}
                  className="glass-card p-4 flex items-center justify-between group hover:border-[var(--accent-aurum)]/40 transition-all">
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
                {TRENDING_TAGS.map(tag => (
                  <motion.button key={tag} variants={fadeUp}
                    className="px-4 py-2 border border-[var(--border-primary)] card-nexus hover:border-[var(--accent-aurum)]/40 transition-all type-mono text-xs text-[var(--text-muted)] hover:text-[var(--accent-aurum)]">
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
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-muted)]"><span>Posts</span><span className="text-[var(--text-primary)]">3</span></div>
              <div className="flex justify-between text-[var(--text-muted)]"><span>Followers</span><span className="text-[var(--text-primary)]">12</span></div>
              <div className="flex justify-between text-[var(--text-muted)]"><span>Following</span><span className="text-[var(--text-primary)]">8</span></div>
              <div className="flex justify-between text-[var(--text-muted)]"><span>Rank</span><span className="text-[var(--accent-aurum)]">SILVER</span></div>
            </div>
          </div>

          <Link href="/dashboard/history" className="glass-card p-4 flex items-center justify-between group hover:border-[var(--accent-aurum)]/40 transition-all">
            <span className="type-label text-[var(--text-primary)]">HISTORY</span>
            <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-aurum)] transition-colors" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
