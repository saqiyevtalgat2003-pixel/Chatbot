'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { ResumeData } from '@/lib/resume/types';
import type { ResumeTemplate } from '@/lib/templates';
import { setResumeTemplateAction } from '@/app/[locale]/dashboard/resumes/actions';
import PersonalSection from './PersonalSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import ResumePreview from './ResumePreview';
import TemplateSwitcher from './TemplateSwitcher';

type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';
const AUTOSAVE_DELAY_MS = 1200;

export default function ResumeEditor({
  locale,
  resumeId,
  initialTitle,
  initialData,
  initialTemplateId,
  templates,
  isPremium,
}: {
  locale: string;
  resumeId: string;
  initialTitle: string;
  initialData: ResumeData;
  initialTemplateId: string | null;
  templates: ResumeTemplate[];
  isPremium: boolean;
}) {
  const t = useTranslations('ResumeEditor');
  const [title, setTitle] = useState(initialTitle);
  const [data, setData] = useState<ResumeData>(initialData);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [templateId, setTemplateId] = useState<string | null>(initialTemplateId);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const supabase = createClient();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const selectedTemplate = templates.find((tpl) => tpl.id === templateId) ?? null;

  const handleTemplateSelect = useCallback(
    async (nextTemplateId: string) => {
      const target = templates.find((tpl) => tpl.id === nextTemplateId);
      if (target?.isPremium && !isPremium) {
        setTemplateError(t('templatePremiumLocked'));
        return;
      }
      setTemplateError(null);
      const prev = templateId;
      setTemplateId(nextTemplateId);
      const result = await setResumeTemplateAction(resumeId, nextTemplateId);
      if ('error' in result) {
        setTemplateId(prev);
        setTemplateError(t('templateUpdateError'));
      }
    },
    [templates, isPremium, templateId, resumeId, t]
  );

  const persist = useCallback(
    async (nextTitle: string, nextData: ResumeData) => {
      setStatus('pending');
      const { error } = await supabase
        .from('resumes')
        .update({
          title: nextTitle.trim() || null,
          data: nextData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resumeId);

      setStatus(error ? 'error' : 'saved');
    },
    [resumeId, supabase]
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persist(title, data);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, data]);

  const statusLabel: Record<SaveStatus, string> = {
    idle: '',
    pending: t('saving'),
    saved: t('saved'),
    error: t('saveError'),
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-sm border-b border-ink-soft/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
          <Link
            href={`/${locale}/dashboard`}
            aria-label={t('backToDashboard')}
            className="text-xl text-ink-soft hover:text-azure transition-colors shrink-0"
          >
            ←
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            className="flex-1 min-w-0 bg-transparent font-display font-semibold text-ink text-lg focus:outline-none placeholder:text-muted"
          />
          <span
            className={`text-xs font-mono shrink-0 transition-colors ${
              status === 'error' ? 'text-danger' : 'text-muted'
            }`}
            role="status"
          >
            {statusLabel[status]}
          </span>
        </div>

        {/* Мобильді табтар */}
        <div className="md:hidden max-w-6xl mx-auto px-4 pb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 rounded-card px-3 py-1.5 text-sm font-medium transition-colors ${
              mobileTab === 'form' ? 'bg-ink text-bg' : 'bg-white text-ink-soft'
            }`}
          >
            {t('tabForm')}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 rounded-card px-3 py-1.5 text-sm font-medium transition-colors ${
              mobileTab === 'preview' ? 'bg-ink text-bg' : 'bg-white text-ink-soft'
            }`}
          >
            {t('tabPreview')}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-6 grid md:grid-cols-2 gap-6 items-start">
        <div className={`flex flex-col gap-5 ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <TemplateSwitcher
            templates={templates}
            selectedId={templateId}
            isPremium={isPremium}
            onSelect={handleTemplateSelect}
            error={templateError}
          />
          <PersonalSection
            value={data.personal}
            onChange={(personal) => setData((d) => ({ ...d, personal }))}
          />
          <ExperienceSection
            items={data.experience}
            onChange={(experience) => setData((d) => ({ ...d, experience }))}
          />
          <EducationSection
            items={data.education}
            onChange={(education) => setData((d) => ({ ...d, education }))}
          />
          <SkillsSection
            items={data.skills}
            onChange={(skills) => setData((d) => ({ ...d, skills }))}
          />
        </div>

        <div className={`md:sticky md:top-24 ${mobileTab === 'form' ? 'hidden md:block' : 'block'}`}>
          <ResumePreview title={title} data={data} templateSlug={selectedTemplate?.slug ?? 'modern'} />
        </div>
      </main>
    </div>
  );
}
