"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Share2,
  Loader2,
  CheckCircle,
  EyeOff,
  Eye,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import { blurFaceRegion } from "@/lib/face-blur";
import { isDemoPhoto } from "@/lib/demo/demo-analysis";

export const COMMUNITY_CATEGORIES = [
  { id: "face", label: "Face" },
  { id: "outfit", label: "Outfit" },
  { id: "body", label: "Body" },
  { id: "color", label: "Color" },
  { id: "grooming", label: "Grooming" },
  { id: "tryon", label: "Try-On" },
] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number]["id"];

interface ShareToCommunityProps {
  open: boolean;
  onClose: () => void;
  photo: string | null;
  landmarks: number[][];
  defaultCategory?: CommunityCategory;
  summary: string;
}

export function ShareToCommunity({
  open,
  onClose,
  photo,
  landmarks,
  defaultCategory = "face",
  summary,
}: ShareToCommunityProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CommunityCategory>(defaultCategory);
  const [blurFace, setBlurFace] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const demo = !photo || isDemoPhoto(photo);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory(defaultCategory);
    setBlurFace(true);
    setIsPrivate(false);
    setSubmitting(false);
    setCreatedId(null);
  };

  const close = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const submit = async () => {
    if (submitting || !photo || demo) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      addToast("Give your post a title", "error");
      return;
    }

    setSubmitting(true);
    try {
      let imageData = photo;
      if (blurFace && landmarks.length > 0) {
        try {
          imageData = await blurFaceRegion(photo, landmarks);
        } catch {
          addToast("Could not blur the photo — posting the original", "info");
        }
      }

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim(),
          category,
          imageData,
          faceBlurred: blurFace,
          isPrivate,
        }),
      });

      if (res.status === 401) {
        addToast("Sign in to share to the community", "error");
        router.push("/login");
        return;
      }
      if (res.status === 403) {
        addToast("Confirm your email before posting", "error");
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        addToast(data?.error || "Could not publish your post", "error");
        return;
      }

      setCreatedId(data?.post?.id ?? null);
      addToast(
        isPrivate ? "Private post published" : "Published to the community feed",
        "success"
      );
    } catch {
      addToast("Network error. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-md" onClick={close} />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg glass-card overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurum-400/60 to-transparent" />

            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--border-primary)]/60">
              <div>
                <span className="section-number">COMMUNITY</span>
                <h2 className="type-subhead text-[var(--text-primary)] mt-1">
                  {createdId ? "POSTED" : "SHARE THIS RESULT"}
                </h2>
              </div>
              <button
                onClick={close}
                aria-label="Close share to community"
                className="w-9 h-9 rounded-sm border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-aurum-500/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto" data-lenis-prevent>
              {demo ? (
                <div className="flex items-start gap-3 bg-aurum-400/10 border border-aurum-400/30 p-4">
                  <ShieldCheck className="w-5 h-5 text-[var(--accent-aurum)] shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--text-primary)] font-body leading-relaxed">
                    Demo previews can&apos;t be shared — run a scan on a real photo to
                    publish to the community.
                  </p>
                </div>
              ) : createdId ? (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="type-subhead text-[var(--text-primary)]">
                    YOUR POST IS LIVE
                  </p>
                  <p className="text-sm text-[var(--text-muted)] font-body">
                    {isPrivate
                      ? "It's private — only you can see it in your profile."
                      : "It's now visible to verified community members."}
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link
                      href={`/dashboard/community/${createdId}`}
                      className="btn-nexus !py-2.5 text-xs"
                    >
                      VIEW POST
                    </Link>
                    <Link
                      href="/dashboard/community"
                      className="btn-outline !py-2.5 text-xs"
                    >
                      OPEN FEED
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest block mb-1.5">
                      TITLE *
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`${summary} — share the result`}
                      className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-body focus:outline-none focus:border-[var(--accent-aurum)]"
                    />
                  </div>

                  <div>
                    <label className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest block mb-1.5">
                      DESCRIPTION
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What did you notice? What feedback are you looking for?"
                      className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-body focus:outline-none focus:border-[var(--accent-aurum)] resize-none"
                    />
                  </div>

                  <div>
                    <label className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest block mb-2">
                      CATEGORY
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMMUNITY_CATEGORIES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategory(c.id)}
                          className={`px-3 py-1.5 border type-mono text-[0.55rem] tracking-widest transition-all ${
                            category === c.id
                              ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] text-[var(--accent-aurum)]"
                              : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                          }`}
                        >
                          {c.label.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBlurFace(!blurFace)}
                      className={`flex items-start gap-3 p-4 border text-left transition-all ${
                        blurFace
                          ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_7%,transparent)]"
                          : "border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                      }`}
                    >
                      <EyeOff className="w-4 h-4 text-[var(--accent-aurum)] shrink-0 mt-0.5" />
                      <span>
                        <span className="block text-xs font-bold font-body uppercase tracking-wider text-[var(--text-primary)]">
                          Blur my face
                        </span>
                        <span className="block text-[0.65rem] text-[var(--text-muted)] font-body mt-1 leading-snug">
                          Real on-device blur using the landmark mesh. Posts are
                          marked &ldquo;face blurred&rdquo;.
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`flex items-start gap-3 p-4 border text-left transition-all ${
                        isPrivate
                          ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_7%,transparent)]"
                          : "border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                      }`}
                    >
                      <Eye className="w-4 h-4 text-[var(--accent-aurum)] shrink-0 mt-0.5" />
                      <span>
                        <span className="block text-xs font-bold font-body uppercase tracking-wider text-[var(--text-primary)]">
                          Keep private
                        </span>
                        <span className="block text-[0.65rem] text-[var(--text-muted)] font-body mt-1 leading-snug">
                          Only you can see it. No ratings, no comments.
                        </span>
                      </span>
                    </button>
                  </div>

                  <div className="flex items-start gap-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] p-4">
                    <Sparkles className="w-4 h-4 text-[var(--accent-aurum)] shrink-0 mt-0.5" />
                    <p className="text-[0.7rem] text-[var(--text-muted)] font-body leading-relaxed">
                      Only verified, email-confirmed accounts can post or rate. You
                      can&apos;t rate your own post, and averages are recomputed
                      server-side.
                    </p>
                  </div>

                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="btn-nexus w-full justify-center disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    {submitting ? "PUBLISHING..." : "PUBLISH TO COMMUNITY"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
