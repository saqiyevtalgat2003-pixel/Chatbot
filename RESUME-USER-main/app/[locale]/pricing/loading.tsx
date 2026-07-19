export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-20 gap-8">
      <div className="h-10 w-40 bg-ink/10 rounded animate-pulse" />
      <div className="h-5 w-64 bg-ink/10 rounded animate-pulse" />
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        <div className="flex-1 h-72 bg-ink/10 rounded-3xl animate-pulse" />
        <div className="flex-1 h-72 bg-ink/10 rounded-3xl animate-pulse" />
      </div>
    </div>
  );
}
