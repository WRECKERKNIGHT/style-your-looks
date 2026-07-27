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
} from "lucide-react";
import { useState } from "react";

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
  { href: "/dashboard/recommendations", label: "OUTFITS", icon: Sparkles },
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
    <div className="min-h-screen bg-parchment">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-cream/95 backdrop-blur-xl border-b border-tan z-50 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-tan/10 rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-espresso" />
          ) : (
            <Menu className="w-5 h-5 text-espresso" />
          )}
        </button>
        <div className="flex items-center gap-2.5 ml-3">
          <div className="w-7 h-7 bg-amber flex items-center justify-center rounded-sm">
            <Sparkles className="w-3.5 h-3.5 text-cream" />
          </div>
          <span className="text-sm font-display font-bold text-espresso tracking-wider">AURASTYLE</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-64 bg-cream border-r border-tan z-40 transition-transform duration-300 flex flex-col",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-tan">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber flex items-center justify-center rounded-sm shadow-gold">
              <Sparkles className="w-4 h-4 text-cream" />
            </div>
            <div>
              <span className="text-base font-display font-bold text-espresso tracking-wider block leading-none">AURASTYLE</span>
              <span className="text-[10px] font-mono text-coffee tracking-widest uppercase">Gentleman&apos;s Journal</span>
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
                    ? "bg-amber/10 text-amber border-amber"
                    : "text-coffee hover:bg-tan/10 hover:text-espresso border-transparent"
                )}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-5 border-t border-tan">
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] font-body text-coffee hover:text-espresso transition-colors tracking-widest uppercase"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-espresso/30 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
