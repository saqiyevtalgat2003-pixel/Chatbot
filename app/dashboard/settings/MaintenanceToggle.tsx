'use client';

import { useState, useTransition } from 'react';
import { updateSettingAction } from './actions';

export default function MaintenanceToggle({
  settingKey,
  label,
  description,
  initialValue,
}: {
  settingKey: string;
  label: string;
  description: string;
  initialValue: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initialValue);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleToggle() {
    const next = !enabled;
    setErrorMsg(null);
    setEnabled(next); // optimistic — snappy feedback while the request is in flight
    startTransition(async () => {
      const res = await updateSettingAction(settingKey, next ? 'true' : 'false');
      if (res?.error) {
        setEnabled(!next); // revert on failure
        setErrorMsg(res.error);
      }
    });
  }

  return (
    <div
      className={`rounded-card border px-5 py-4 flex items-center justify-between gap-4 transition-colors ${
        enabled ? 'border-gold/40 bg-gold/5' : 'border-ink-soft/10 bg-white'
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink">{label}</p>
          {enabled && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-gold-deep bg-gold/15 px-1.5 py-0.5 rounded">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-gold-deep animate-pulse"
              />
              ҮСТІНДЕ
            </span>
          )}
        </div>
        <p className="text-xs text-muted mt-0.5">{description}</p>
        {errorMsg && <p className="text-xs text-danger mt-1">{errorMsg}</p>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        disabled={isPending}
        onClick={handleToggle}
        className={`relative shrink-0 h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azure disabled:opacity-60 ${
          enabled ? 'bg-gold-deep' : 'bg-ink-soft/25'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ease-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
