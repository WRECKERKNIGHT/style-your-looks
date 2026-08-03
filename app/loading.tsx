import { Logo } from "@/components/shared/Logo";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-base dark:bg-cosmic-base gap-6">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-2 border-aurum-500/20 rounded-sm" />
        <div className="absolute inset-0 border-2 border-aurum-500 border-t-transparent rounded-sm animate-spin" />
        <div className="absolute inset-1.5 bg-gradient-to-br from-aurum-500 to-aurum-300 rounded-[2px] flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Logo className="h-5 w-auto opacity-90" />
        <p className="type-mono text-[0.55rem] text-nexus-400/50 dark:text-cosmic-muted/50 tracking-[0.3em] uppercase animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
