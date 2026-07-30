import { cn } from "@/lib/utils";

function SkeletonBlock({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-tan/20 dark:bg-dark-border/30 rounded-sm", className)}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-cream dark:bg-dark-surface border border-tan dark:border-dark-border rounded-sm p-8 space-y-4">
      <SkeletonBlock className="h-5 w-40" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-3/4" />
      <div className="flex gap-3 pt-2">
        <SkeletonBlock className="h-8 w-8 rounded-full" />
        <SkeletonBlock className="h-8 w-8 rounded-full" />
        <SkeletonBlock className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonScore() {
  return (
    <div className="flex flex-col items-center gap-2">
      <SkeletonBlock className="w-24 h-24 rounded-full" />
      <SkeletonBlock className="h-4 w-16" />
    </div>
  );
}

export function SkeletonImage({ className }: { className?: string }) {
  return (
    <div className={cn("bg-cream dark:bg-dark-surface border border-tan dark:border-dark-border rounded-sm overflow-hidden", className)}>
      <div className="aspect-[4/3] bg-tan/10 dark:bg-dark-border/10 flex items-center justify-center">
        <SkeletonBlock className="w-16 h-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-cream dark:bg-dark-surface border border-tan dark:border-dark-border rounded-sm overflow-hidden">
      <div className="p-4 border-b border-tan dark:border-dark-border">
        <SkeletonBlock className="h-5 w-40" />
      </div>
      <div className="divide-y divide-tan dark:divide-dark-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <SkeletonBlock className="h-10 w-10 rounded-sm flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
            <SkeletonBlock className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <SkeletonBlock className="h-3 w-32 mb-4" />
        <SkeletonBlock className="h-10 w-64 mb-2" />
        <SkeletonBlock className="h-5 w-80" />
      </div>
      <SkeletonImage className="max-h-[400px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function SkeletonAnalysis() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <SkeletonBlock className="h-3 w-24 mb-3" />
          <SkeletonBlock className="h-8 w-56 mb-1" />
          <SkeletonBlock className="h-4 w-72" />
        </div>
        <SkeletonBlock className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonImage className="h-80" />
        </div>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
      </div>
    </div>
  );
}

export function SkeletonHistory() {
  return (
    <div className="space-y-6 animate-pulse">
      <SkeletonBlock className="h-8 w-48 mb-2" />
      <SkeletonBlock className="h-4 w-64 mb-6" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-cream dark:bg-dark-surface border border-tan dark:border-dark-border rounded-sm p-5 flex items-center gap-4">
          <SkeletonBlock className="h-14 w-14 rounded-sm flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-3 w-32" />
          </div>
          <SkeletonBlock className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-6">
        <SkeletonBlock className="w-20 h-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-4 w-56" />
        </div>
      </div>
      <div className="flex gap-3">
        <SkeletonBlock className="h-10 w-28" />
        <SkeletonBlock className="h-10 w-28" />
      </div>
      <SkeletonTable rows={3} />
    </div>
  );
}
