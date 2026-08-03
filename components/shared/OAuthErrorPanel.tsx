"use client";

import { useState } from "react";
import { AlertTriangle, ShieldCheck, RefreshCw, ExternalLink, ClipboardList } from "lucide-react";

const GOOGLE_BLOCK_PATTERNS = [
  "access blocked",
  "openid",
  "oidc",
  "unverified",
  "not eligible",
  "consent",
  "redirect_uri",
  "redirect uri",
  "provider_error",
  "permission denied",
  "403",
  "400",
];

export function isGoogleBlockError(message: string | null): message is string {
  if (!message) return false;
  const lower = message.toLowerCase();
  return GOOGLE_BLOCK_PATTERNS.some((p) => lower.includes(p));
}

export function OAuthErrorPanel({
  error,
  onRetry,
  retrying = false,
  origin = "",
}: {
  error: string;
  onRetry?: () => void;
  retrying?: boolean;
  origin?: string;
}) {
  const [copied, setCopied] = useState(false);
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  const redirectUri = `${base}/auth/callback`;

  const steps = [
    {
      title: "Publish the Google app",
      detail:
        "Google Cloud Console → APIs & Services → OAuth consent screen → Publishing status → set to In production (or add your email under Test users).",
    },
    {
      title: "Authorize the callback URL",
      detail:
        `Under Authorized redirect URIs, add exactly: ${redirectUri}. It must match the configured value character-for-character.`,
    },
    {
      title: "Wait and retry",
      detail:
        "Google propagates OAuth changes within a few minutes. Try sign-in again after a short wait.",
    },
  ];

  const copyRedirect = async () => {
    try {
      await navigator.clipboard.writeText(redirectUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="p-4 mb-4 rounded-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-red-700 dark:text-red-300 font-body">
            Google sign-in is blocked
          </p>
          <p className="text-xs text-red-600/80 dark:text-red-400/80 font-body mt-1 leading-relaxed">
            This is a configuration issue with the Google OAuth app, not your account. The
            sign-in code is correct — the Google app is either in Testing mode or the callback URL
            is not whitelisted.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-3">
            <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full border border-red-300 dark:border-red-700 text-[0.6rem] font-mono text-red-500 dark:text-red-400">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-red-700 dark:text-red-300 font-body">
                {step.title}
              </p>
              <p className="text-[0.7rem] text-red-600/80 dark:text-red-400/80 font-body leading-relaxed break-all">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank", "noopener")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-300 dark:border-red-700/60 text-red-600 dark:text-red-400 text-[0.65rem] font-mono tracking-wider hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors rounded-sm"
        >
          <ExternalLink className="w-3 h-3" />
          OPEN GOOGLE CONSOLE
        </button>
        <button
          type="button"
          onClick={copyRedirect}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-300 dark:border-red-700/60 text-red-600 dark:text-red-400 text-[0.65rem] font-mono tracking-wider hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors rounded-sm"
        >
          <ClipboardList className="w-3 h-3" />
          {copied ? "COPIED" : "COPY CALLBACK URL"}
        </button>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[0.65rem] font-mono tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50 rounded-sm"
          >
            <RefreshCw className={`w-3 h-3 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "RETRYING…" : "TRY AGAIN"}
          </button>
        )}
      </div>

      {error && (
        <details className="mt-3">
          <summary className="text-[0.6rem] font-mono text-red-400/70 cursor-pointer tracking-wider uppercase">
            Technical details
          </summary>
          <p className="mt-1 text-[0.65rem] font-mono text-red-400/70 break-all leading-relaxed">
            {error}
          </p>
        </details>
      )}
    </div>
  );
}

export function OAuthStatusBadge() {
  return (
    <div className="flex items-center gap-2 p-2 mb-2 rounded-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
      <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
      <span className="text-[0.65rem] font-mono text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">
        OAuth configured
      </span>
    </div>
  );
}
