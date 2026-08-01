"use client";

import { useState, useEffect } from "react";
import { Download, X, AppWindow, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const IOS_KEY = "nexari_ios_install_dismissed";

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
    <div className="border border-[#2A1B6B]/40 dark:border-[#1A0F3D]/50 bg-[#0F0A2E]/40 dark:bg-[#0A0618]/40 rounded-sm p-3">
      {promptEvent ? (
        <button
          onClick={install}
          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-body font-semibold tracking-widest uppercase text-[#0F0A2E] bg-gradient-to-r from-[#FF6B35] to-[#FFD700] hover:brightness-110 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Install App
        </button>
      ) : showIosHint ? (
        <div className="relative">
          <button
            onClick={dismissIos}
            className="absolute -top-1 -right-1 p-1 text-[#7C6BC4] hover:text-[#E8E0FF] transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-2 text-[#E8E0FF] dark:text-[#C4B5FD] mb-1.5">
            <Share className="w-3.5 h-3.5 text-[#FFD700]" />
            <span className="text-[10px] font-mono tracking-widest uppercase">Add to Home Screen</span>
          </div>
          <p className="text-[10px] font-body text-[#7C6BC4] leading-relaxed">
            Tap <AppWindow className="inline w-3 h-3" /> Share, then Add to Home Screen.
          </p>
        </div>
      ) : null}
    </div>
  );
}
