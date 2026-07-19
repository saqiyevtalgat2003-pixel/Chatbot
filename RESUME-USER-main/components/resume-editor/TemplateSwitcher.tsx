'use client';

import { useTranslations } from 'next-intl';
import type { ResumeTemplate } from '@/lib/templates';

export default function TemplateSwitcher({
  templates,
  selectedId,
  isPremium,
  onSelect,
  error,
}: {
  templates: ResumeTemplate[];
  selectedId: string | null;
  isPremium: boolean;
  onSelect: (id: string) => void;
  error: string | null;
}) {
  const t = useTranslations('ResumeEditor');

  if (templates.length === 0) return null;

  return (
    <section className="rounded-card border border-ink-soft/10 bg-white p-5">
      <h2 className="font-display font-semibold text-ink mb-3">{t('templateTitle')}</h2>
      <div className="flex flex-wrap gap-2.5">
        {templates.map((template) => {
          const locked = template.isPremium && !isPremium;
          const active = template.id === selectedId;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                active
                  ? 'bg-ink text-bg border-ink'
                  : 'bg-white text-ink-soft border-ink-soft/15 hover:border-ink-soft/40'
              }`}
            >
              {template.name}
              {template.isPremium && (
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    active ? 'bg-gold text-ink' : 'bg-gold/15 text-gold-deep'
                  }`}
                >
                  {locked ? `🔒 ${t('templatePremiumBadge')}` : t('templatePremiumBadge')}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </section>
  );
}
