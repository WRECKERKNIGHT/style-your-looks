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
} from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { PageTransition } from "@/components/shared/PageTransition";
import { AutoSave } from "@/components/shared/AutoSave";

const CommandPalette = dynamic(
  () => import("@/components/shared/CommandPalette"),
  { ssr: false }
);
const KeyboardShortcutHint = dynamic(
  () => import("@/components/shared/KeyboardShortcutHint"),
  { ssr: false }
);
const OnboardingTour = dynamic(
  () => import("@/components/shared/OnboardingTour"),
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
  { href: "/dashboard/color-analysis", label: "COLOR ANALYSIS", icon: Droplets },
  { href: "/dashboard/virtual-tryon", label: "TRY-ON", icon: Shirt },
  { href: "/dashboard/mannequin", label: "COLOR LAB", icon: Palette },
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

  return (
    <div className="min-h-screen bg-[#0F0A2E] dark:bg-[#0A0618]">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A1540]/95 dark:bg-[#0D0920]/95 backdrop-blur-xl border-b border-[#2A1B6B]/30 dark:border-[#1A0F3D]/50 z-50 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-[#3A2B8B]/20 dark:hover:bg-[#2A1B6B]/20 rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-[#E8E0FF] dark:text-[#C4B5FD]" />
          ) : (
            <Menu className="w-5 h-5 text-[#E8E0FF] dark:text-[#C4B5FD]" />
          )}
        </button>
        <div className="flex items-center gap-2.5 ml-3">
          <div className="w-7 h-7 bg-gradient-to-br from-[#FF6B35] to-[#FFD700] flex items-center justify-center rounded-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#0F0A2E]" />
          </div>
          <span className="text-sm font-display font-bold text-[#E8E0FF] dark:text-[#C4B5FD] tracking-wider">NEXARI</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-64 bg-[#1A1540] dark:bg-[#0D0920] border-r border-[#2A1B6B]/30 dark:border-[#1A0F3D]/50 z-40 transition-transform duration-300 flex flex-col",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#2A1B6B]/30 dark:border-[#1A0F3D]/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B35] to-[#FFD700] flex items-center justify-center rounded-sm shadow-lg shadow-[#FF6B35]/25 group-hover:shadow-[#FF6B35]/40 transition-shadow">
              <Sparkles className="w-4 h-4 text-[#0F0A2E]" />
            </div>
            <div>
              <span className="text-base font-display font-bold text-[#E8E0FF] dark:text-[#C4B5FD] tracking-wider block leading-none">NEXARI</span>
              <span className="text-[10px] font-mono text-[#7C6BC4] dark:text-[#5B4BA4] tracking-widest uppercase">STYLE INTELLIGENCE</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
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
                  "flex items-center gap-3 px-4 py-3 text-xs font-body font-semibold tracking-wider transition-all border-l-2 rounded-r-sm",
                  isActive
                    ? "bg-gradient-to-r from-[#FF6B35]/15 to-transparent text-[#FFD700] border-[#FF6B35]"
                    : "text-[#7C6BC4] dark:text-[#5B4BA4] hover:bg-[#2A1B6B]/20 dark:hover:bg-[#1A0F3D]/30 hover:text-[#E8E0FF] dark:hover:text-[#C4B5FD] border-transparent"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-5 border-t border-[#2A1B6B]/30 dark:border-[#1A0F3D]/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7C6BC4] dark:text-[#5B4BA4] tracking-widest uppercase">Theme</span>
            <ThemeToggle />
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] font-body text-[#7C6BC4] dark:text-[#5B4BA4] hover:text-[#E8E0FF] dark:hover:text-[#C4B5FD] transition-colors tracking-widest uppercase"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      <CommandPalette />
      <KeyboardShortcutHint />
      <OnboardingTour />
      <AutoSave />
    </div>
  );
}
