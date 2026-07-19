export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-ink/10 border-t-ink animate-spin" />
        <p className="text-sm text-muted font-mono">Жүктелуде...</p>
      </div>
    </div>
  );
}
