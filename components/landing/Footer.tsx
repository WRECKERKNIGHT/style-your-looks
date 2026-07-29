"use client";

export function Footer() {
  return (
    <footer className="bg-dark-base border-t border-tan/10">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-20">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="space-y-4">
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-display font-bold text-parchment/80 tracking-[0.08em]">
                AURA
              </span>
              <span className="text-base font-display font-bold text-amber tracking-[0.08em]">
                STYLE
              </span>
              <span className="ml-2 type-mono text-[0.45rem] text-tan/30 tracking-[0.15em] border border-tan/10 px-1.5 py-0.5">
                BETA
              </span>
            </div>
            <p className="text-sm text-tan/30 font-body max-w-xs leading-relaxed">
              AI-powered style intelligence. Your photos never leave your device.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-olive/50" />
              <span className="type-mono text-[0.5rem] text-tan/20 tracking-widest">PRIVACY FIRST</span>
            </div>
          </div>

          <div className="flex gap-16">
            <div className="space-y-3">
              <span className="type-mono text-[0.5rem] text-tan/20 tracking-widest block mb-4">PRODUCT</span>
              {["Features", "How It Works", "Community"].map((link) => (
                <span key={link} className="text-sm font-body text-tan/40 hover:text-parchment/70 cursor-pointer transition-colors duration-300 block">
                  {link}
                </span>
              ))}
            </div>
            <div className="space-y-3">
              <span className="type-mono text-[0.5rem] text-tan/20 tracking-widest block mb-4">LEGAL</span>
              {["Privacy", "Terms", "Security"].map((link) => (
                <span key={link} className="text-sm font-body text-tan/40 hover:text-parchment/70 cursor-pointer transition-colors duration-300 block">
                  {link}
                </span>
              ))}
            </div>
            <div className="space-y-3">
              <span className="type-mono text-[0.5rem] text-tan/20 tracking-widest block mb-4">SOCIAL</span>
              {["Twitter / X", "Instagram", "GitHub"].map((link) => (
                <span key={link} className="text-sm font-body text-tan/40 hover:text-parchment/70 cursor-pointer transition-colors duration-300 block">
                  {link}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-olive/60" />
              <p className="type-mono text-[0.6rem] text-tan/30 tracking-widest uppercase">All analysis runs in your browser</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber/40" />
              <p className="type-mono text-[0.5rem] text-tan/20 tracking-widest uppercase">Your photos never leave your device</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-tan/8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="type-mono text-[0.5rem] text-tan/20 tracking-widest">
            &copy; 2026 AURASTYLE. ALL RIGHTS RESERVED.
          </span>
          <div className="flex items-center gap-4">
            <span className="type-mono text-[0.45rem] text-tan/15 tracking-widest uppercase">Built with intention</span>
            <span className="type-mono text-[0.45rem] text-tan/10">|</span>
            <span className="type-mono text-[0.45rem] text-tan/15 tracking-widest uppercase">Designed for humans</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
