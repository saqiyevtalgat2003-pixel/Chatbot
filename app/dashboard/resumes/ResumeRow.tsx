'use client';

import { useState, useTransition } from 'react';
import { deleteResumeAction } from './actions';

export default function ResumeRow({ resume }: { resume: any }) {
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);

  function handleDelete() {
    if (!confirm('Бұл резюмені толығымен жоюға сенімдісіз бе?')) return;
    startTransition(async () => {
      const res = await deleteResumeAction(resume.id);
      if (!res?.error) setDeleted(true);
    });
  }

  if (deleted) return null;

  return (
    <tr className="border-t border-ink-soft/10">
      <td className="px-4 py-3 font-medium text-ink">{resume.title || 'Атаусыз'}</td>
      <td className="px-4 py-3 text-muted">
        {resume.profiles?.full_name || resume.profiles?.email || '—'}
      </td>
      <td className="px-4 py-3 text-muted">{resume.templates?.name || '—'}</td>
      <td className="px-4 py-3 text-muted uppercase">{resume.language}</td>
      <td className="px-4 py-3 text-muted">
        {new Date(resume.updated_at).toLocaleDateString('kk-KZ')}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          disabled={isPending}
          onClick={handleDelete}
          className="text-xs px-3 py-1.5 rounded-md bg-danger text-white disabled:opacity-50"
        >
          Жою
        </button>
      </td>
    </tr>
  );
}
