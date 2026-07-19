"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Repo {
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  private: boolean;
  updatedAt: string;
  description: string | null;
}

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setRepos(data.repos);
      })
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-mono text-lg text-text mb-1">Репозиторийлер</h1>
        <p className="text-muted text-sm font-sans">
          Файлдарын басқару үшін репозиторийді таңдаңыз
        </p>
      </div>

      {error && (
        <div className="border border-coral/40 bg-coral/5 rounded-sm px-4 py-3 text-coral text-sm font-sans">
          {error}
        </div>
      )}

      {!repos && !error && (
        <p className="text-muted text-sm font-sans">Жүктелуде…</p>
      )}

      {repos && repos.length === 0 && (
        <p className="text-muted text-sm font-sans">
          Репозиторий табылмады. GITHUB_TOKEN дұрыс орнатылғанын тексеріңіз.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {repos?.map((repo) => (
          <Link
            key={repo.fullName}
            href={`/dashboard/repo/${repo.owner}/${repo.name}`}
            className="group border border-border hover:border-muted rounded-sm px-4 py-3 flex items-center justify-between transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-text">{repo.name}</span>
                {repo.private && (
                  <span className="text-[10px] uppercase tracking-wide text-muted border border-border rounded-sm px-1.5 py-0.5">
                    private
                  </span>
                )}
              </div>
              {repo.description && (
                <p className="text-muted text-xs font-sans mt-1">
                  {repo.description}
                </p>
              )}
            </div>
            <span className="text-muted text-xs font-mono group-hover:text-amber transition-colors">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
