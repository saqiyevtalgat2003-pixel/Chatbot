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
        <div className="h-8 w-52 bg-ink/10 rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-ink/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
