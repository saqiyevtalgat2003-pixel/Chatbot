'use client';

import { useState, useTransition } from 'react';
import { updateSettingAction } from './actions';

export default function SettingRow({
  settingKey,
  label,
  value,
}: {
  settingKey: string;
  label: string;
  value: unknown;
}) {
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState<string>(String(value));
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSave() {
    setErrorMsg(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateSettingAction(settingKey, inputValue);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="rounded-card border border-ink-soft/10 bg-white px-5 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}
        {saved && <p className="text-xs text-success">Сақталды</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-28 text-sm rounded-md border border-ink-soft/20 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-azure"
        />
        <button
          disabled={isPending}
          onClick={handleSave}
          className="text-sm px-3 py-1.5 rounded-md bg-azure text-white disabled:opacity-50"
        >
          Сақтау
        </button>
      </div>
    </div>
  );
}
