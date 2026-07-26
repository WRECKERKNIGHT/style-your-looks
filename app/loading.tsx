export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber border-t-transparent animate-spin" />
        <p className="text-sm text-coffee font-body">Loading...</p>
      </div>
    </div>
  );
}
