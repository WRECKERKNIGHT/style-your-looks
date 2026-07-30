"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
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
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Process", href: "#how-it-works" },
    { label: "Community", href: "#community" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-parchment/80 backdrop-blur-2xl border-b border-tan/20 shadow-elegant"
            : "bg-gradient-to-b from-parchment/40 to-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-0.5 group relative">
            <motion.span
              className="font-display text-[1.1rem] md:text-[1.3rem] font-bold tracking-[0.08em] text-espresso transition-colors duration-500 relative"
              whileHover={{ letterSpacing: "0.12em" }}
            >
              AURA
              <motion.span
                className="absolute -bottom-0.5 left-0 h-px bg-amber origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.span>
            <span className="font-display text-[1.1rem] md:text-[1.3rem] font-bold tracking-[0.08em] text-amber">
              STYLE
            </span>
            <span className="ml-2 text-[0.45rem] font-mono text-tan tracking-[0.15em] hidden sm:inline border border-tan/20 px-1.5 py-0.5">
              BETA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoveredLink(link.href)}
                onMouseLeave={() => setHoveredLink(null)}
                className="relative text-[0.8rem] font-body font-medium text-coffee/70 hover:text-espresso transition-colors duration-300 tracking-wide py-1"
              >
                {link.label}
                <motion.span
                  className="absolute -bottom-0.5 left-0 right-0 h-px bg-amber origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hoveredLink === link.href ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="relative text-[0.8rem] font-body font-medium text-coffee/60 hover:text-espresso transition-colors duration-300 group"
            >
              Sign In
              <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-coffee/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/signup" className="btn-gold text-[0.65rem] py-2.5 px-5">
                Get Started
              </Link>
            </motion.div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-espresso p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 left-0 right-0 z-40 bg-parchment/95 backdrop-blur-2xl border-b border-tan/20 shadow-elegant-xl md:hidden"
          >
            <div className="flex flex-col px-8 py-8 gap-5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-body font-medium text-coffee hover:text-espresso transition-colors py-1 block"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.hr
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="hr-ornamental my-2 origin-left"
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4"
              >
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
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
