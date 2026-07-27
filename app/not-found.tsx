import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <span className="section-number">EST. MMXXIV // 404</span>
        <h1 className="text-7xl md:text-9xl font-display font-bold text-gradient-gold mt-4 mb-6">404</h1>
        <h2 className="text-2xl font-display font-bold text-espresso tracking-tight mb-4">PAGE NOT FOUND</h2>
        <p className="text-coffee font-body text-lg mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-gold inline-flex"
        >
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}
