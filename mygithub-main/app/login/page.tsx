"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <span className="w-2 h-2 rounded-full bg-wire" />
          <span className="w-2 h-2 rounded-full bg-amber" />
          <span className="w-2 h-2 rounded-full bg-coral" />
        </div>

        <h1 className="font-mono text-text text-xl mb-1 text-center">
          git-dashboard
        </h1>
        <p className="text-muted text-sm text-center mb-8 font-sans">
          Репозиторийлеріңізді басқару панелі
        </p>

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-surface2 border border-border hover:border-muted text-text font-sans text-sm py-3 rounded-sm transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          GitHub аккаунтпен кіру
        </button>

        {error && (
          <p className="text-coral text-xs mt-4 text-center font-sans">{error}</p>
        )}

        <p className="text-muted text-xs mt-8 text-center font-sans">
          Тек бір белгіленген GitHub аккаунтқа рұқсат етілген
        </p>
      </div>
    </main>
  );
}
