'use client';

import { useTranslations } from 'next-intl';
import { makeId, type ResumeExperience } from '@/lib/resume/types';

const inputClass =
  'rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure text-sm';

export default function ExperienceSection({
  items,
  onChange,
}: {
  items: ResumeExperience[];
  onChange: (items: ResumeExperience[]) => void;
}) {
  const t = useTranslations('ResumeEditor');

  function addItem() {
    onChange([
      ...items,
      {
        id: makeId(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  }

  function update(id: string, patch: Partial<ResumeExperience>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <section className="rounded-card border border-ink-soft/10 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-ink">{t('experienceTitle')}</h2>
        <button
          type="button"
          onClick={addItem}
          className="text-sm font-semibold text-azure hover:text-azure-deep transition-colors"
        >
          + {t('addExperience')}
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted">{t('experienceEmpty')}</p>
      )}

      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-card border border-ink-soft/10 p-4 relative">
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label={t('removeItem')}
              className="absolute top-3 right-3 text-muted hover:text-danger transition-colors text-sm"
            >
              ✕
            </button>
            <p className="text-xs font-mono text-muted mb-3">#{index + 1}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className={inputClass}
                value={item.position}
                onChange={(e) => update(item.id, { position: e.target.value })}
                placeholder={t('positionPlaceholder')}
              />
              <input
                className={inputClass}
                value={item.company}
                onChange={(e) => update(item.id, { company: e.target.value })}
                placeholder={t('companyPlaceholder')}
              />
              <input
                type="month"
                className={inputClass}
                value={item.startDate}
                onChange={(e) => update(item.id, { startDate: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  className={`${inputClass} flex-1 disabled:opacity-40`}
                  value={item.endDate}
                  disabled={item.current}
                  onChange={(e) => update(item.id, { endDate: e.target.value })}
                />
                <label className="flex items-center gap-1.5 text-xs text-ink-soft whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={item.current}
                    onChange={(e) => update(item.id, { current: e.target.checked, endDate: '' })}
                  />
                  {t('currentJob')}
                </label>
              </div>
              <textarea
                className={`${inputClass} sm:col-span-2 min-h-[80px] resize-y`}
                value={item.description}
                onChange={(e) => update(item.id, { description: e.target.value })}
                placeholder={t('experienceDescPlaceholder')}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
