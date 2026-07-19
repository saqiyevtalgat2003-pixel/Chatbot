'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { makeId, type ResumeSkill } from '@/lib/resume/types';

export default function SkillsSection({
  items,
  onChange,
}: {
  items: ResumeSkill[];
  onChange: (items: ResumeSkill[]) => void;
}) {
  const t = useTranslations('ResumeEditor');
  const [draft, setDraft] = useState('');

  function addSkill() {
    const value = draft.trim();
    if (!value || items.some((s) => s.name.toLowerCase() === value.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...items, { id: makeId(), name: value, level: 3 }]);
    setDraft('');
  }

  function removeSkill(id: string) {
    onChange(items.filter((s) => s.id !== id));
  }

  function setLevel(id: string, level: number) {
    onChange(items.map((s) => (s.id === id ? { ...s, level } : s)));
  }

  return (
    <section className="rounded-card border border-ink-soft/10 bg-white p-5">
      <h2 className="font-display font-semibold text-ink mb-4">{t('skillsTitle')}</h2>

      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder={t('skillsPlaceholder')}
        />
        <button
          type="button"
          onClick={addSkill}
          className="rounded-card bg-ink text-bg px-4 text-sm font-semibold hover:bg-ink-soft transition-colors"
        >
          {t('addSkill')}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">{t('skillsEmpty')}</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-3 rounded-card border border-ink-soft/10 px-3 py-2"
            >
              <span className="flex-1 text-sm text-ink-soft truncate">{skill.name}</span>
              <div className="flex items-center gap-1" role="group" aria-label={t('skillLevel')}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(skill.id, lvl)}
                    aria-label={t('skillLevelDot', { level: lvl })}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      lvl <= skill.level ? 'bg-gold' : 'bg-ink-soft/15'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => removeSkill(skill.id)}
                aria-label={t('removeItem')}
                className="text-muted hover:text-danger transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
