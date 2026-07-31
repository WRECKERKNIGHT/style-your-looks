"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Process", href: "#how-it-works" },
  { label: "Community", href: "#community" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-cosmic-base/80 backdrop-blur-2xl border-b border-nexus-800/30 shadow-nexus"
            : "bg-gradient-to-b from-cosmic-base/50 to-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/nexari-logo.svg"
              alt="NEXARI"
              className="h-7 md:h-8 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-[0.8rem] font-body font-medium text-nexus-200/70 hover:text-white transition-colors duration-300 tracking-wide py-1 group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-aurum-400/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="btn-outline text-[0.65rem] py-2.5 px-5 border-nexus-400 text-nexus-300 hover:text-white"
            >
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/signup" className="btn-nexus text-[0.65rem] py-2.5 px-5">
                Get Started
              </Link>
            </motion.div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2 -mr-2"
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
            className="fixed top-16 left-0 right-0 z-40 bg-cosmic-surface/95 backdrop-blur-2xl border-b border-nexus-800/30 md:hidden"
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
                    className="text-lg font-body font-medium text-nexus-200 hover:text-white transition-colors py-1 block"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.hr
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="border-nexus-800/30 my-2 origin-left"
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4"
              >
                <Link
                  href="/login"
                  className="btn-outline text-xs py-3 flex-1 justify-center text-center border-nexus-400 text-nexus-300"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn-nexus text-xs py-3 flex-1 justify-center text-center"
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
