import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl font-display font-bold text-gradient-gold mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-espresso mb-2">Page not found</h1>
        <p className="text-coffee font-body mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-gold inline-flex"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
