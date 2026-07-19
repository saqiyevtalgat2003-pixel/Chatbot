'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ResumeData } from '@/lib/resume/types';
import type { TemplateSlug } from '@/lib/templates';
import ClassicLayout from './layouts/ClassicLayout';
import ModernLayout from './layouts/ModernLayout';
import ExecutiveLayout from './layouts/ExecutiveLayout';
import CreativeLayout from './layouts/CreativeLayout';

export const DATE_LOCALES: Record<string, string> = {
  kk: 'kk-KZ',
  ru: 'ru-RU',
  uz: 'uz-UZ',
};

export function formatMonth(value: string, locale: string): string {
  if (!value) return '';
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? 'kk-KZ', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

const LAYOUTS: Record<TemplateSlug, typeof ModernLayout> = {
  classic: ClassicLayout,
  modern: ModernLayout,
  executive: ExecutiveLayout,
  creative: CreativeLayout,
};

export default function ResumePreview({
  title,
  data,
  templateSlug = 'modern',
}: {
  title: string;
  data: ResumeData;
  templateSlug?: TemplateSlug;
}) {
  const t = useTranslations('ResumeEditor');
  const locale = useLocale();
  const { personal, experience, education, skills } = data;

  const hasContent =
    personal.fullName ||
    personal.jobTitle ||
    experience.length > 0 ||
    education.length > 0 ||
    skills.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-card border border-ink-soft/10 bg-white shadow-sm p-6 md:p-8 min-h-[500px]">
        <p className="text-xs font-mono text-muted mb-4 uppercase tracking-wide">{t('previewLabel')}</p>
        <p className="text-sm text-muted">{t('previewEmpty')}</p>
      </div>
    );
  }

  const Layout = LAYOUTS[templateSlug] ?? ModernLayout;

  return (
    <div className="rounded-card border border-ink-soft/10 bg-white shadow-sm overflow-hidden min-h-[500px]">
      <Layout title={title} data={data} locale={locale} t={t} />
    </div>
  );
}
