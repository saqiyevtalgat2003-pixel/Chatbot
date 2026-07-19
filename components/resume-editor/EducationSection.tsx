'use client';

import { useTranslations } from 'next-intl';
import { makeId, type ResumeEducation } from '@/lib/resume/types';

const inputClass =
  'rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure text-sm';

export default function EducationSection({
  items,
  onChange,
}: {
  items: ResumeEducation[];
  onChange: (items: ResumeEducation[]) => void;
}) {
  const t = useTranslations('ResumeEditor');

  function addItem() {
    onChange([
      ...items,
      { id: makeId(), institution: '', degree: '', startDate: '', endDate: '' },
    ]);
  }

  function update(id: string, patch: Partial<ResumeEducation>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <section className="rounded-card border border-ink-soft/10 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-ink">{t('educationTitle')}</h2>
        <button
          type="button"
          onClick={addItem}
          className="text-sm font-semibold text-azure hover:text-azure-deep transition-colors"
        >
          + {t('addEducation')}
        </button>
      </div>

      {items.length === 0 && <p className="text-sm text-muted">{t('educationEmpty')}</p>}

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
                value={item.institution}
                onChange={(e) => update(item.id, { institution: e.target.value })}
                placeholder={t('institutionPlaceholder')}
              />
              <input
                className={inputClass}
                value={item.degree}
                onChange={(e) => update(item.id, { degree: e.target.value })}
                placeholder={t('degreePlaceholder')}
              />
              <input
                type="month"
                className={inputClass}
                value={item.startDate}
                onChange={(e) => update(item.id, { startDate: e.target.value })}
              />
              <input
                type="month"
                className={inputClass}
                value={item.endDate}
                onChange={(e) => update(item.id, { endDate: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
