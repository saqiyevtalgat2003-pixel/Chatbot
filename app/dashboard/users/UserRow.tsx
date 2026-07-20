'use client';

import { useState, useTransition } from 'react';
import { togglePremiumAction } from './actions';

export default function UserRow({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [isPremium, setIsPremium] = useState<boolean>(user.is_premium);

  function handleToggle() {
    const next = !isPremium;
    startTransition(async () => {
      const res = await togglePremiumAction(user.id, next);
      if (!res?.error) setIsPremium(next);
    });
  }

  return (
    <tr className="border-t border-ink-soft/10">
      <td className="px-4 py-3">
        <p className="font-medium text-ink">{user.full_name || '—'}</p>
        <p className="text-xs text-muted">{user.email}</p>
      </td>
      <td className="px-4 py-3 text-muted">
        {new Date(user.created_at).toLocaleDateString('kk-KZ')}
      </td>
      <td className="px-4 py-3">
        <button
          disabled={isPending}
          onClick={handleToggle}
          className={`text-xs px-3 py-1.5 rounded-md font-medium disabled:opacity-50 ${
            isPremium ? 'bg-gold text-white' : 'bg-bg text-muted'
          }`}
        >
          {isPremium ? 'Premium' : 'Тегін'}
        </button>
      </td>
      <td className="px-4 py-3">
        {user.is_admin ? (
          <span className="text-xs text-azure-deep font-medium">Admin</span>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>
      <td className="px-4 py-3"></td>
    </tr>
  );
}
