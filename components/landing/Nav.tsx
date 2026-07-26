"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Use Lenis scroll event for reactive detection
    // Falls back to native scroll if Lenis not yet initialized
    const handleScroll = () => setScrolled(window.scrollY > 40);

    // Also try to hook into Lenis if available
    const checkLenis = () => {
      const lenisEl = document.querySelector("[data-lenis-prevent]");
      if (lenisEl) {
        // Lenis is active — use requestAnimationFrame for smooth detection
        let ticking = false;
        const onScroll = () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              setScrolled(window.scrollY > 40);
              ticking = false;
            });
            ticking = true;
          }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
      }
      // Fallback: direct scroll listener
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    };

    const cleanup = checkLenis();
    return cleanup;
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-parchment/85 backdrop-blur-2xl border-b border-tan/30 shadow-warm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-0.5 group">
            <span className="font-display text-[1.1rem] font-bold tracking-[0.08em] text-espresso group-hover:text-amber transition-colors duration-500">
              AURA
            </span>
            <span className="font-display text-[1.1rem] font-bold tracking-[0.08em] text-amber">
              STYLE
            </span>
            <span className="ml-2 text-[0.5rem] font-mono text-tan tracking-widest hidden sm:inline">
              BETA
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            {[
              { label: "Features", href: "#features" },
              { label: "Process", href: "#how-it-works" },
              { label: "Community", href: "#community" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="elegant-underline text-[0.8rem] font-body font-medium text-coffee/70 hover:text-espresso transition-colors duration-300 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/login"
              className="text-[0.8rem] font-body font-medium text-coffee/60 hover:text-espresso transition-colors duration-300"
            >
              Sign In
            </Link>
            <Link href="/signup" className="btn-gold text-[0.7rem] py-2 px-5">
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-espresso p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 left-0 right-0 z-40 bg-parchment/95 backdrop-blur-2xl border-b border-tan/30 shadow-elegant-xl md:hidden"
          >
            <div className="flex flex-col px-8 py-8 gap-5">
              {[
                { label: "Features", href: "#features" },
                { label: "Process", href: "#how-it-works" },
                { label: "Community", href: "#community" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-body font-medium text-coffee hover:text-espresso transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="hr-ornamental my-2" />
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="btn-elegant text-xs py-3 flex-1 justify-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-gold text-xs py-3 flex-1 justify-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
