import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-[#C89D7C] mb-4">404</div>
        <h1 className="text-2xl font-bold text-[#3C2A21] mb-2">Page not found</h1>
        <p className="text-[#8B7D6B] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#3C2A21] text-white rounded-xl font-medium hover:bg-[#2B1E16] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
