import type { ResumeData } from '@/lib/resume/types';
import { formatMonth } from '../ResumePreview';

/** Классикалық: бір бағанды, ақ-қара, жіңішке сызықтармен бөлінген қатаң дизайн. */
export default function ClassicLayout({
  title,
  data,
  locale,
  t,
}: {
  title: string;
  data: ResumeData;
  locale: string;
  t: (key: string) => string;
}) {
  const { personal, experience, education, skills } = data;

  return (
    <div className="p-6 md:p-10 flex flex-col gap-7 max-w-2xl mx-auto">
      <p className="text-xs font-mono text-muted uppercase tracking-wide text-center">{t('previewLabel')}</p>

      <header className="text-center pb-6 border-b border-ink">
        {personal.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={personal.photoUrl}
            alt=""
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 grayscale"
          />
        )}
        <h1 className="font-display font-bold text-3xl text-ink tracking-tight">
          {personal.fullName || t('previewNoName')}
        </h1>
        {personal.jobTitle && (
          <p className="text-ink-soft font-medium mt-1.5 text-sm uppercase tracking-[0.2em]">{personal.jobTitle}</p>
        )}
        <p className="text-xs text-muted font-mono mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {personal.phone && <span>{personal.phone}</span>}
          {personal.email && <span>{personal.email}</span>}
          {personal.city && <span>{personal.city}</span>}
        </p>
      </header>

      {personal.summary && (
        <section>
          <p className="text-sm text-ink-soft leading-relaxed text-center italic">{personal.summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-sm text-ink uppercase tracking-[0.2em] mb-4 text-center">
            {t('experienceTitle')}
          </h2>
          <div className="flex flex-col gap-5">
            {experience.map((item) => (
              <div key={item.id} className="border-t border-ink-soft/15 pt-3">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-ink text-sm">
                    {item.position || t('previewUntitledPosition')}
                    {item.company && <span className="text-ink-soft font-normal"> · {item.company}</span>}
                  </p>
                  <p className="text-xs text-muted font-mono whitespace-nowrap">
                    {formatMonth(item.startDate, locale)} — {item.current ? t('currentJob') : formatMonth(item.endDate, locale)}
                  </p>
                </div>
                {item.description && (
                  <p className="text-sm text-ink-soft mt-1.5 leading-relaxed whitespace-pre-line">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-sm text-ink uppercase tracking-[0.2em] mb-4 text-center">
            {t('educationTitle')}
          </h2>
          <div className="flex flex-col gap-3">
            {education.map((item) => (
              <div key={item.id} className="border-t border-ink-soft/15 pt-3 flex items-baseline justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.degree || t('previewUntitledInstitution')}</p>
                  <p className="text-xs text-ink-soft">{item.institution}</p>
                </div>
                <p className="text-xs text-muted font-mono whitespace-nowrap">
                  {formatMonth(item.startDate, locale)} — {formatMonth(item.endDate, locale)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-sm text-ink uppercase tracking-[0.2em] mb-3 text-center">
            {t('skillsTitle')}
          </h2>
          <p className="text-sm text-ink-soft text-center leading-relaxed">
            {skills.map((s) => s.name).filter(Boolean).join('  ·  ')}
          </p>
        </section>
      )}

      {title && <p className="mt-2 pt-4 border-t border-dashed border-ink-soft/10 text-[11px] text-muted font-mono text-center">{title}</p>}
    </div>
  );
}
