"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ScanFace,
  Shirt,
  Scissors,
  Users,
  User,
  Sparkles,
  Home,
  Layers,
  Palette,
  Dna,
  Droplets,
  ChevronLeft,
  Menu,
  X,
  Target,
  Clock,
  GitCompareArrows,
  Glasses,
  ClipboardList,
  Boxes,
  BookOpen,

} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { PageTransition } from "@/components/shared/PageTransition";
import { InstallApp } from "@/components/shared/InstallApp";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LogoMark } from "@/components/shared/Logo";
import { MediaPersistence } from "@/components/shared/MediaPersistence";

const OnboardingTour = dynamic(
  () => import("@/components/shared/OnboardingTour").then((m) => m.OnboardingTour),
  { ssr: false }
);

const navItems = [
  { href: "/dashboard", label: "HOME", icon: Home },
  { href: "/dashboard/face-analysis", label: "FACE IQ", icon: ScanFace },
  { href: "/dashboard/pillar-analysis", label: "4 PILLARS", icon: Target },

  { href: "/dashboard/skin-health", label: "SKIN HEALTH", icon: Droplets },
  { href: "/dashboard/face-comparison", label: "COMPARE", icon: GitCompareArrows },
  { href: "/dashboard/body-analysis", label: "BODY + TONE", icon: Layers },
  { href: "/dashboard/style-dna", label: "STYLE DNA", icon: Dna },
  { href: "/dashboard/color-analysis", label: "TONE STUDIO", icon: Droplets },
  { href: "/dashboard/color-book", label: "COLOR BOOK", icon: BookOpen },
  { href: "/dashboard/3d-studio", label: "3D STUDIO", icon: Boxes },
  { href: "/dashboard/virtual-tryon", label: "TRY-ON", icon: Shirt },
  { href: "/dashboard/mannequin", label: "OUTFIT LAB", icon: Palette },
  { href: "/dashboard/grooming", label: "GROOMING", icon: Scissors },
  { href: "/dashboard/accessories", label: "GLASSES", icon: Glasses },
  { href: "/dashboard/hair-preview", label: "HAIR COLOR", icon: Palette },
  { href: "/dashboard/recommendations", label: "OUTFITS", icon: Sparkles },
  { href: "/dashboard/style-quiz", label: "STYLE QUIZ", icon: ClipboardList },
  { href: "/dashboard/community", label: "FEED", icon: Users },
  { href: "/dashboard/history", label: "HISTORY", icon: Clock },
  { href: "/dashboard/profile", label: "PROFILE", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Close sidebar on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSidebarOpen(false);
  }, []);
  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [sidebarOpen, handleKeyDown]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[color-mix(in_srgb,var(--bg-secondary)_95%,transparent)] backdrop-blur-xl border-b border-[var(--border-primary)] rounded-b-[var(--radius-lg)] z-50 flex items-center px-4 shadow-paper">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-[var(--text-primary)]" />
          ) : (
            <Menu className="w-5 h-5 text-[var(--text-primary)]" />
          )}
        </button>
        <div className="flex items-center gap-2.5 ml-3">
          <LogoMark className="w-7 h-auto drop-shadow-aurum" />
          <span className="text-sm font-display font-bold text-[var(--text-primary)] tracking-wider">ZERVEY</span>
        </div>
        <UserAvatar compact />
      </div>

      {/* Sidebar — floats as a rounded rail on desktop */}
      <aside
        role="dialog"
        aria-modal={sidebarOpen}
        aria-label="Navigation sidebar"
        className={cn(
          "fixed top-16 left-0 bottom-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] z-40 transition-transform duration-300 flex flex-col",
          "lg:top-4 lg:left-4 lg:bottom-4 lg:right-auto lg:border lg:border-[var(--border-primary)] lg:rounded-[var(--radius-xl)] lg:shadow-paper-lg lg:overflow-hidden",
          "rounded-r-[var(--radius-lg)]",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border-primary)]">
          <Link href="/" className="flex items-center gap-3 group">
            <LogoMark className="w-9 h-auto drop-shadow-aurum group-hover:opacity-90 transition-opacity" />
            <div>
              <span className="text-base font-display font-bold text-[var(--text-primary)] tracking-wider block leading-none">ZERVEY</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">STYLE INTELLIGENCE</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav data-lenis-prevent className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 min-h-[44px] text-xs font-body font-semibold tracking-wider transition-all rounded-[var(--radius-sm)]",
                  isActive
                    ? "bg-gradient-to-r from-aurum-400/15 to-transparent text-[var(--accent-mocha)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent-caramel)_28%,transparent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-5 border-t border-[var(--border-primary)] space-y-3">
          <UserAvatar />
          <InstallApp />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">Theme</span>
            <ThemeToggle />
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] font-body text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors tracking-widest uppercase"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-[17rem] pt-16 lg:pt-4 lg:pr-4 lg:pb-4 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>

      <OnboardingTour />
      <MediaPersistence />
    </div>
  );
}
