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
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/face-analysis", label: "Face Analysis", icon: ScanFace },
  { href: "/dashboard/body-analysis", label: "Body Analysis", icon: Layers },
  { href: "/dashboard/virtual-tryon", label: "Virtual Try-On", icon: Shirt },
  { href: "/dashboard/mannequin", label: "Color Studio", icon: Palette },
  { href: "/dashboard/grooming", label: "Grooming", icon: Scissors },
  { href: "/dashboard/recommendations", label: "Outfit Picks", icon: Sparkles },
  { href: "/dashboard/community", label: "Community", icon: Users },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-xl border-b border-[#E8E0D8]/50 z-50 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-[#F4EFEA] rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-[#3C2A21]" />
          ) : (
            <Menu className="w-5 h-5 text-[#3C2A21]" />
          )}
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-7 h-7 rounded-lg bg-[#3C2A21] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#C89D7C]" />
          </div>
          <span className="font-bold text-[#3C2A21]">AuraStyle</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-[#E8E0D8] z-40 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3C2A21] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C89D7C]" />
            </div>
            <span className="text-lg font-bold text-[#3C2A21]">
              Aura<span className="text-[#C89D7C]">Style</span>
            </span>
          </Link>
        </div>

        <nav className="px-3 space-y-1">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#3C2A21] text-white"
                    : "text-[#8B7D6B] hover:bg-[#F4EFEA] hover:text-[#3C2A21]"
                )}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-3 right-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#8B7D6B] hover:text-[#3C2A21] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
