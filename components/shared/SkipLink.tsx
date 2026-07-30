"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed top-0 left-0 z-[10001] -translate-y-full focus:translate-y-0 bg-amber text-cream px-6 py-3 text-sm font-body font-bold tracking-wider uppercase transition-transform duration-300 outline-none"
    >
      Skip to main content
    </a>
  );
}
