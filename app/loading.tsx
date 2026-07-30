export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment dark:bg-dark-base">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-amber/20 rounded-sm" />
          <div className="absolute inset-0 border-2 border-amber border-t-transparent rounded-sm animate-spin" />
        </div>
        <p className="text-sm font-body text-coffee dark:text-dark-muted tracking-widest uppercase animate-pulse">Loading</p>
      </div>
    </div>
  );
}
