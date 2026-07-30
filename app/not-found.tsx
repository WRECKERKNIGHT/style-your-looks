import Link from "next/link";
import { Sparkles, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment dark:bg-dark-base flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-amber/10 border border-amber/20 flex items-center justify-center mx-auto mb-6 rounded-full">
          <Sparkles className="w-7 h-7 text-amber" />
        </div>
        <span className="section-number dark:text-amber">EST. MMXXIV // 404</span>
        <h1 className="text-8xl md:text-9xl font-display font-bold text-gradient-gold mt-4 mb-2">404</h1>
        <h2 className="text-2xl font-display font-bold text-espresso dark:text-dark-text tracking-tight mb-4">PAGE NOT FOUND</h2>
        <p className="text-coffee dark:text-dark-muted font-body text-lg mb-8 max-w-sm mx-auto leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-gold inline-flex">
            <Home className="w-4 h-4" />
            RETURN HOME
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-cream dark:bg-dark-surface text-espresso dark:text-dark-text font-body text-sm tracking-wider uppercase border border-tan dark:border-dark-border hover:bg-tan/10 transition-colors rounded-sm">
            <ArrowLeft className="w-4 h-4" />
            DASHBOARD
          </Link>
        </div>
      </div>
    </div>
  );
}
