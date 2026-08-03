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
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-[color-mix(in_srgb,var(--bg-primary)_85%,transparent)] backdrop-blur-2xl border-b border-[var(--border-primary)] shadow-paper"
            : "bg-gradient-to-b from-[color-mix(in_srgb,var(--bg-primary)_60%,transparent)] to-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/zervey-logo.svg"
              alt="ZERVEY"
              className="h-7 md:h-8 w-auto drop-shadow-[0_2px_6px_rgba(87,58,39,0.18)]"
            />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActive(link.href)}
                  className={`relative font-body text-[0.8rem] font-medium transition-colors duration-300 tracking-wide py-1 group ${
                    isActive
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 right-0 h-px bg-[color-mix(in_srgb,var(--accent-caramel)_60%,transparent)] transition-transform duration-500 origin-left ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-aurum-400"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="btn-outline text-[0.65rem] py-2.5 px-5 border-[var(--accent-mocha)] text-[var(--text-secondary)]"
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
            className="md:hidden text-[var(--text-primary)] p-2 -mr-2"
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
            className="fixed top-16 left-0 right-0 z-40 bg-[color-mix(in_srgb,var(--bg-secondary)_95%,transparent)] backdrop-blur-2xl border-b border-[var(--border-primary)] md:hidden"
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
                    onClick={() => {
                      setMobileOpen(false);
                      setActive(link.href);
                    }}
                    className={`text-lg font-display font-medium transition-colors py-1 block ${
                      active === link.href
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.hr
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="border-[var(--border-primary)] my-2 origin-left"
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4"
              >
                <Link
                  href="/login"
                  className="btn-outline text-xs py-3 flex-1 justify-center text-center border-[var(--accent-mocha)] text-[var(--text-secondary)]"
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
