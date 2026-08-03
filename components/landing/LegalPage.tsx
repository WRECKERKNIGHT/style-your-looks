import { Nav } from "./Nav";
import { Footer } from "./Footer";

interface LegalPageProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}

export function LegalPage({
  eyebrow,
  title,
  subtitle,
  children,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Nav />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <header className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 pt-32 md:pt-40 pb-14">
          <span className="section-number">{eyebrow}</span>
          <h1 className="type-display text-[var(--text-primary)] tracking-tight mt-3">
            {title}
          </h1>
          <p className="text-[var(--text-muted)] font-body type-subhead mt-4 leading-relaxed">
            {subtitle}
          </p>
        </header>
      </div>
      <div className="max-w-3xl mx-auto px-6 md:px-8 pb-24 space-y-10">
        {children}
      </div>
      <Footer />
    </div>
  );
}
