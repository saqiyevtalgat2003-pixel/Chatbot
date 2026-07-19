export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 bg-bg/90 backdrop-blur-sm border-b border-ink-soft/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="h-6 w-24 bg-ink/10 rounded-full animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-16 bg-ink/10 rounded-full animate-pulse" />
            <div className="h-9 w-9 bg-ink/10 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-ink/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div className="h-8 w-48 bg-ink/10 rounded animate-pulse" />
        <div className="h-24 w-full bg-ink/10 rounded-2xl animate-pulse" />
        <div className="h-6 w-32 bg-ink/10 rounded animate-pulse mt-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-ink/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
