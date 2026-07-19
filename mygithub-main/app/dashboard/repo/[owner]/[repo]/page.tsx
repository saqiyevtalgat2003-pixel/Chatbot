"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface TreeEntry {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha: string;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export default function RepoPage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;
  const [branch] = useState("main");
  const [entries, setEntries] = useState<TreeEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);

  function loadTree() {
    setError(null);
    fetch(`/api/repos/${owner}/${repo}/tree?branch=${branch}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setEntries(data.entries);
      })
      .catch((e) => setError(String(e)));
  }

  useEffect(() => {
    loadTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, repo]);

  function onFilesChosen(files: FileList | null) {
    setPendingFiles(files);
    setSelectedCount(files?.length || 0);
  }

  async function handleUpload() {
    if (!pendingFiles || pendingFiles.length === 0) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const files = await Promise.all(
        Array.from(pendingFiles).map(async (f) => {
          const buf = new Uint8Array(await f.arrayBuffer());
          // webkitRelativePath preserves the folder structure the user selected
          const relPath = (f as any).webkitRelativePath || f.name;
          // strip the top-level selected folder name so paths are relative to it
          const parts = relPath.split("/");
          const trimmed = parts.length > 1 ? parts.slice(1).join("/") : parts[0];
          return { path: trimmed, contentBase64: bytesToBase64(buf) };
        })
      );

      const res = await fetch(`/api/repos/${owner}/${repo}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch,
          folderPath,
          files,
          message: `Update ${folderPath || "/"} via git-dashboard`,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setUploadMsg(`Қате: ${data.error}`);
      } else {
        setUploadMsg(`Сәтті жүктелді — commit ${data.commitSha.slice(0, 7)}`);
        setPendingFiles(null);
        setSelectedCount(0);
        loadTree();
      }
    } catch (e: any) {
      setUploadMsg(`Қате: ${e.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Link href="/dashboard" className="text-muted text-xs font-sans hover:text-text">
        ← Репозиторийлер
      </Link>

      <h1 className="font-mono text-lg text-text mt-3 mb-6">
        {owner}/{repo}
      </h1>

      <div className="border border-border rounded-sm p-4 mb-8">
        <h2 className="font-mono text-sm text-amber mb-3">Папканы ауыстыру</h2>
        <p className="text-muted text-xs font-sans mb-4">
          Мақсатты жол (репо ішінде) бос болса — түбір (root) толығымен ауыстырылады.
          Таңдалған жергілікті папкадағы файлдар GitHub-тағы сол жолдағы
          файлдармен бір commit-те алмастырылады, ал жаңа жүктемеде жоқ ескі
          файлдар өшіріледі.
        </p>

        <label className="block text-muted text-xs font-sans mb-1">
          Мақсатты жол (мысалы: public немесе бос қалдыруға болады)
        </label>
        <input
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="/"
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm font-mono text-text mb-4 outline-none focus:border-amber"
        />

        <label className="block text-muted text-xs font-sans mb-1">
          Ауыстыратын папканы таңдаңыз
        </label>
        <input
          type="file"
          // @ts-ignore - non-standard but widely supported attribute
          webkitdirectory=""
          directory=""
          multiple
          onChange={(e) => onFilesChosen(e.target.files)}
          className="w-full text-xs font-sans text-muted file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border file:border-border file:bg-surface2 file:text-text file:text-xs mb-4"
        />

        {selectedCount > 0 && (
          <p className="text-muted text-xs font-sans mb-3">
            {selectedCount} файл таңдалды
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || selectedCount === 0}
          className="bg-wire text-ink font-sans text-sm px-4 py-2 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? "Жіберілуде…" : "GitHub-қа commit жасау"}
        </button>

        {uploadMsg && (
          <p className="text-xs font-sans mt-3 text-text">{uploadMsg}</p>
        )}
      </div>

      <h2 className="font-mono text-sm text-muted mb-3">
        Ағымдағы файлдар ({branch})
      </h2>

      {error && (
        <div className="border border-coral/40 bg-coral/5 rounded-sm px-4 py-3 text-coral text-sm font-sans">
          {error}
        </div>
      )}

      {!entries && !error && (
        <p className="text-muted text-sm font-sans">Жүктелуде…</p>
      )}

      <div className="border border-border rounded-sm divide-y divide-border max-h-[420px] overflow-y-auto">
        {entries
          ?.filter((e) => e.type === "blob")
          .map((e) => (
            <div
              key={e.path}
              className="px-4 py-2 text-xs font-mono text-muted flex justify-between"
            >
              <span className="truncate">{e.path}</span>
              {typeof e.size === "number" && (
                <span className="text-muted/60 ml-4 shrink-0">
                  {(e.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
