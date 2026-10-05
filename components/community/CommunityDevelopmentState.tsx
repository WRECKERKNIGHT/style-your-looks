"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Lock,
  Sparkles,
  ArrowRight,
  HardHat,
  MessagesSquare,
  Compass,
  Star,
} from "lucide-react";

/**
 * Why the community feed may not be showing posts.
 *
 * `unconfigured` means the backend has no Supabase credentials, which only
 * happens locally — on a deployed environment the feed is live. `signedOut`
 * is the visitor's state, and is not an error: the feed is a members-only
 * space, so it should read as an invitation to sign in rather than a fault.
 * `developing` is the honest default for the features that have not shipped.
 */
export type CommunityStatus = "live" | "signedOut" | "unconfigured" | "developing";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/** Features that are built and working. */
const SHIPPED = [
  {
    icon: Users,
    label: "Members-only feed",
    body: "Share a scored analysis from your own history. Ratings and comments are tied to real accounts.",
  },
  {
    icon: Star,
    label: "Style ratings",
    body: "Rate a look on the metrics you actually measured, so the score means something specific.",
  },
  {
    icon: MessagesSquare,
    label: "Threaded critique",
    body: "Comment on a post. Every reply keeps the poster's own numbers in view while you discuss them.",
  },
];

/** Things that are genuinely not built yet, stated plainly. */
const IN_PROGRESS = [
  { icon: Compass, label: "Member directory", body: "Browse and follow other members." },
  { icon: HardHat, label: "Style circles", body: "Small private groups around a focus." },
  { icon: Sparkles, label: "Trend signals", body: "What the community is wearing this season." },
];

export function CommunityDevelopmentState({
  status,
  realAnalyses,
}: {
  status: Exclude<CommunityStatus, "live">;
  realAnalyses: number;
}) {
  const unconfigured = status === "unconfigured";
  const signedOut = status === "signedOut";

  const heading = unconfigured
    ? "Community backend not connected"
    : signedOut
    ? "Members only"
    : "Under development";

  const lede = unconfigured
    ? "The feed needs Supabase credentials to reach the database. Without them there is nothing to show, so this is an empty state rather than a broken one."
    : signedOut
    ? "The community feed is live and running on real posts. Sign in to read it, rate a look, and share your own analysis."
    : "No member has posted yet. The first version of the feed opens as soon as real people put real results on it.";

  const canPost = realAnalyses > 0;

  return (
    <motion.section
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden"
      aria-labelledby="community-state-heading"
    >
      {/* Atelier backdrop: a faint measuring grid, matching the tailoring theme. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35] pointer-events-none
          bg-[linear-gradient(to_right,var(--border-primary)_1px,transparent_1px),
               linear-gradient(to_bottom,var(--border-primary)_1px,transparent_1px)]
          bg-[size:28px_28px]
          [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      <div className="relative glass-card p-6 sm:p-8">
        <motion.div variants={fadeUp} className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div
            className="flex items-center justify-center w-14 h-14 shrink-0 border
              border-[var(--accent-aurum)]/40
              bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]"
          >
            {unconfigured ? (
              <HardHat className="w-6 h-6 text-[var(--accent-aurum)]" />
            ) : signedOut ? (
              <Lock className="w-6 h-6 text-[var(--accent-aurum)]" />
            ) : (
              <Users className="w-6 h-6 text-[var(--accent-aurum)]" />
            )}
          </div>

          <div className="min-w-0">
            <span className="type-mono text-[0.6rem] tracking-[0.25em] uppercase text-[var(--text-secondary)]">
              {signedOut ? "SIGN IN TO CONTINUE" : "COMMUNITY // STATUS"}
            </span>
            <h2
              id="community-state-heading"
              className="type-display text-[var(--text-primary)] tracking-tight mt-1"
            >
              {heading}
            </h2>
          </div>

          <span
            className={`sm:ml-auto type-mono text-[0.55rem] tracking-widest px-2.5 py-1 border ${
              unconfigured
                ? "border-amber-400/50 text-[var(--text-secondary)] bg-amber-400/10"
                : signedOut
                ? "border-[var(--accent-aurum)]/40 text-[var(--text-secondary)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]"
                : "border-[var(--border-primary)] text-[var(--text-secondary)]"
            }`}
          >
            {unconfigured ? "BACKEND OFFLINE" : signedOut ? "LIVE · PRIVATE" : "PREVIEW"}
          </span>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-sm text-[var(--text-secondary)] font-body leading-relaxed max-w-2xl mt-4"
        >
          {lede}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5 mt-6">
          {signedOut && (
            <Link href="/login" className="btn-nexus inline-flex items-center gap-2 px-5 py-2.5 type-label">
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {!signedOut && (
            <Link
              href="/dashboard/face-analysis"
              className="btn-nexus inline-flex items-center gap-2 px-5 py-2.5 type-label"
            >
              Run an analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 px-5 py-2.5 type-label
              border border-[var(--border-primary)] !text-[var(--text-secondary)]
              hover:border-[color-mix(in_srgb,var(--accent-aurum)_50%,transparent)]
              hover:!text-[var(--accent-mocha)] dark:hover:!text-[var(--accent-aurum)]
              transition-all card-nexus"
          >
            Your history
            {canPost ? ` (${realAnalyses})` : ""}
          </Link>
        </motion.div>

        {canPost && !signedOut && (
          <motion.p
            variants={fadeUp}
            className="text-xs text-[var(--text-secondary)] mt-4 leading-relaxed"
          >
            You have {realAnalyses} real analysis{realAnalyses === 1 ? "" : "es"} saved.
            Posting an analysis shares its measured numbers — nothing is invented, and demo
            results are refused by the server.
          </motion.p>
        )}
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <motion.div variants={fadeUp} className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <h3 className="type-label !text-[var(--text-primary)]">WORKING NOW</h3>
          </div>
          <ul className="space-y-4">
            {SHIPPED.map(({ icon: Icon, label, body }) => (
              <li key={label} className="flex gap-3">
                <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent-aurum)]" />
                <div className="min-w-0">
                  <p className="type-body text-[var(--text-primary)]">{label}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]"
              aria-hidden="true"
            />
            <h3 className="type-label !text-[var(--text-primary)]">IN THE WORKSHOP</h3>
          </div>
          <ul className="space-y-4">
            {IN_PROGRESS.map(({ icon: Icon, label, body }) => (
              <li key={label} className="flex gap-3">
                <Icon
                  className="w-4 h-4 mt-0.5 shrink-0 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="type-body text-[var(--text-primary)]">
                    {label}
                    <span className="type-mono text-[0.5rem] tracking-widest text-[var(--text-secondary)] ml-2">
                      SOON
                    </span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--text-secondary)] mt-5 pt-4 border-t border-[var(--border-primary)] leading-relaxed">
            We would rather show an empty room than fill it with fake profiles and invented
            activity.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}