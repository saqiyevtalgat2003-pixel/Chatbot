export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="sticky top-0 z-30 bg-bg/90 border-b border-ink-soft/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="h-6 w-24 bg-ink/10 rounded-full animate-pulse" />
          <div className="h-9 w-9 bg-ink/10 rounded-full animate-pulse" />
        </div>
      </div>
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div className="h-8 w-44 bg-ink/10 rounded animate-pulse" />
        <div className="space-y-4 max-w-xl">
          <div className="h-11 w-full bg-ink/10 rounded-xl animate-pulse" />
          <div className="h-32 w-full bg-ink/10 rounded-xl animate-pulse" />
          <div className="h-11 w-28 bg-ink/10 rounded-full animate-pulse" />
        </div>
      </main>
    </div>
  );
}
