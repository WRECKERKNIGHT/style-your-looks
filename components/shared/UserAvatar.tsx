"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadProfileAvatar, subscribeProfileAvatar } from "@/lib/profile-avatar";

interface SessionUser {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
}

export function UserAvatar({ compact = false }: { compact?: boolean }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    const syncAvatar = () => {
      setLocalAvatar(loadProfileAvatar());
    };
    syncAvatar();
    const unsub = subscribeProfileAvatar(() => {
      if (active) syncAvatar();
    });
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;
        if (data.user) {
          const meta = data.user.user_metadata ?? {};
          setUser({
            name: meta.full_name ?? meta.name ?? data.user.email,
            email: data.user.email,
            avatarUrl: meta.avatar_url ?? meta.picture ?? null,
          });
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const initial = (user?.name?.[0] ?? user?.email?.[0] ?? "Z").toUpperCase();
  const avatarSrc = localAvatar ?? user?.avatarUrl ?? null;

  return (
    <Link
      href="/dashboard/profile"
      aria-label="Open profile"
      className={`flex items-center gap-3 p-1.5 rounded-sm hover:bg-[var(--bg-tertiary)] transition-colors group ${
        compact ? "ml-auto" : ""
      }`}
    >
      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] shadow-aurum shrink-0">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={user?.name ?? "Profile"}
            fill
            sizes="36px"
            referrerPolicy="no-referrer"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--accent-nexus)] to-[var(--accent-aurum)] flex items-center justify-center">
            <span className="text-white text-sm font-display font-bold">
              {checked ? initial : "…"}
            </span>
          </div>
        )}
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="text-[11px] font-body font-semibold text-[var(--text-primary)] truncate">
            {user?.name ?? "Sign in"}
          </p>
          <p className="text-[9px] font-mono text-[var(--text-muted)] tracking-widest uppercase">
            Profile
          </p>
        </div>
      )}
    </Link>
  );
}
