"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Reveal } from "@/components/shared/Reveal";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "/about" },
];

const resourceLinks = [
  { label: "Community", href: "#community" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const companyLinks: { label: string; href: string; external?: boolean }[] = [
  { label: "About", href: "/about" },
  { label: "Source on GitHub", href: "https://github.com/WRECKERKNIGHT/style-your-looks", external: true },
  { label: "Community", href: "#community" },
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const watermarkY = useSpring(useTransform(scrollYProgress, [0, 1], [28, 0]), {
    stiffness: 70,
    damping: 22,
  });
  const watermarkOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <footer ref={ref} className="bg-[var(--bg-primary)] border-t border-[var(--border-primary)] relative overflow-hidden">
      <motion.div
        aria-hidden
        style={{ y: watermarkY, opacity: watermarkOpacity, willChange: "transform, opacity" }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex items-end justify-center text-[clamp(5.5rem,19vw,17rem)] font-display font-black leading-none text-[var(--text-primary)]/[0.04] dark:text-[var(--cosmic-muted)]/[0.04] tracking-tight whitespace-nowrap select-none"
      >
        ZERVEY
      </motion.div>

      {/* CTA band */}
      <Reveal amount={0.2} className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 pt-20 md:pt-28">
        <div className="relative overflow-hidden rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-paper-lg px-8 md:px-16 py-14 md:py-20 text-center">
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurum-400/60 to-transparent" />
          <div className="relative z-10">
            <span className="section-number">READY WHEN YOU ARE</span>
            <h2 className="type-display text-[var(--text-primary)] tracking-tight mt-3">
              MEASURED LIKE A <span className="text-gradient-aurum">TAILOR.</span>
            </h2>
            <p className="text-[var(--text-muted)] font-body max-w-md mx-auto mt-3 leading-relaxed">
              Face, body, and color — computed privately on your device. No servers, no uploads.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-8">
              <Link href="/signup" className="btn-nexus">
                START YOUR ANALYSIS <span className="text-lg leading-none inline-block">&rarr;</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </Reveal>

      <Reveal y={24} amount={0.1} className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block group">
              <Logo className="h-8 w-auto transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105" />
            </Link>
            <p className="text-sm text-[var(--text-muted)] font-body max-w-xs leading-relaxed">
              AI-powered style intelligence. Your photos never leave your
              device.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://github.com/WRECKERKNIGHT/style-your-looks" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg glass-card flex items-center justify-center hover:border-[var(--accent-caramel)] transition-colors" aria-label="GitHub">
                <svg className="w-4 h-4 text-[var(--accent-mocha)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest block mb-5 uppercase">
              Product
            </span>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-body text-[color-mix(in_srgb,var(--text-secondary)_70%,transparent)] hover:text-[var(--text-primary)] transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest block mb-5 uppercase">
              Resources
            </span>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-body text-[color-mix(in_srgb,var(--text-secondary)_70%,transparent)] hover:text-[var(--text-primary)] transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest block mb-5 uppercase">
              Company
            </span>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-sm font-body text-[color-mix(in_srgb,var(--text-secondary)_70%,transparent)] hover:text-[var(--text-primary)] transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--border-primary)] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest">
            &copy; 2026 ZERVEY. ALL RIGHTS RESERVED.
          </span>
          <div className="flex items-center gap-4">
            <span className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest uppercase">
              Made by Harshit Mishra
            </span>
            <span className="text-[color-mix(in_srgb,var(--text-muted)_50%,transparent)]">|</span>
            <span className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest uppercase">
              Designed for humans
            </span>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
