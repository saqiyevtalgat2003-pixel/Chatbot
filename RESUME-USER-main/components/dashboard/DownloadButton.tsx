'use client';

import { useState } from 'react';

export default function DownloadButton({
  locale,
  id,
  label,
}: {
  locale: string;
  id: string;
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleDownload() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/${locale}/dashboard/resumes/${id}/download`);
      if (!res.ok) throw new Error('failed');
      const blob = await res.blob();
      const file = new File([blob], 'resume.pdf', { type: 'application/pdf' });

      // iOS Safari: use Web Share API (shows "Save to Files" option)
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: 'Resume' });
        return;
      }

      // Desktop / Android: standard blob download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      // AbortError means user dismissed the share sheet — not a real error
      if (e instanceof Error && e.name === 'AbortError') return;
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 text-ink-soft hover:text-azure transition-colors disabled:opacity-50"
    >
      <span aria-hidden="true">{loading ? '⏳' : error ? '❌' : '⬇️'}</span>
      {label}
    </button>
  );
}
