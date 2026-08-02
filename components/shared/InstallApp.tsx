"use client";

import { useState, useEffect } from "react";
import { Download, X, AppWindow, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const IOS_KEY = "auraya_ios_install_dismissed";

export function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    if (mq.matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) {
      try {
        const dismissed = localStorage.getItem(IOS_KEY) === "1";
        if (!dismissed) setShowIosHint(true);
      } catch {
        // ignore
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  const dismissIos = () => {
    setShowIosHint(false);
    try {
      localStorage.setItem(IOS_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (installed) return null;

  return (
    <div className="border border-[color-mix(in_srgb,var(--accent-caramel)_35%,transparent)] dark:border-[color-mix(in_srgb,var(--accent-caramel)_20%,transparent)] bg-[var(--bg-tertiary)]/60 dark:bg-[var(--bg-tertiary)]/40 rounded-sm p-3">
      {promptEvent ? (
        <button
          onClick={install}
          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-body font-semibold tracking-widest uppercase text-[var(--bg-primary)] bg-gradient-to-r from-[var(--accent-mocha)] to-[var(--accent-honey)] hover:brightness-110 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Install App
        </button>
      ) : showIosHint ? (
        <div className="relative">
          <button
            onClick={dismissIos}
            className="absolute -top-1 -right-1 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-2 text-[var(--text-primary)] mb-1.5">
            <Share className="w-3.5 h-3.5 text-[var(--accent-honey)]" />
            <span className="text-[10px] font-mono tracking-widest uppercase">Add to Home Screen</span>
          </div>
          <p className="text-[10px] font-body text-[var(--text-muted)] leading-relaxed">
            Tap <AppWindow className="inline w-3 h-3" /> Share, then Add to Home Screen.
          </p>
        </div>
      ) : null}
    </div>
  );
}
