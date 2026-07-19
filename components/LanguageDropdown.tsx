'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const LANGS = [
  { code: 'kk', label: 'ҚАЗ' },
  { code: 'ru', label: 'РУС' },
  { code: 'uz', label: 'UZB' },
];

export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function switchLocale(code: string) {
    const segments = pathname.split('/');
    segments[1] = code;
    router.push(segments.join('/'));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="font-mono text-sm text-ink-soft border border-ink-soft/20 rounded-full px-3 py-1.5 hover:border-azure transition-colors"
      >
        {LANGS.find((l) => l.code === locale)?.label} ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white rounded-card shadow-lg overflow-hidden border border-ink-soft/10 z-50">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`block w-full text-left px-4 py-2 text-sm font-mono hover:bg-bg transition-colors ${
                l.code === locale ? 'text-azure font-semibold' : 'text-ink-soft'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
