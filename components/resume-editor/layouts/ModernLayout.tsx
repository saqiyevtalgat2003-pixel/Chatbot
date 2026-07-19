import type { ResumeData } from '@/lib/resume/types';
import { formatMonth } from '../ResumePreview';

/** Заманауи: сол жақта қара sidebar (фото, дағдылар, білімі), оң жақта тәжірибе. */
export default function ModernLayout({
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
    <div className="grid sm:grid-cols-[220px_1fr]">
      <aside className="bg-ink text-bg p-6 flex flex-col gap-6">
        {personal.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={personal.photoUrl}
            alt=""
            className="w-24 h-24 rounded-full object-cover border-4 border-gold/70 shadow-lg mx-auto"
          />
        )}

        {personal.summary && (
          <section>
            <h2 className="font-display font-semibold text-xs uppercase tracking-wide text-gold mb-2">
              {t('summaryTitle')}
            </h2>
            <p className="text-xs text-bg/75 leading-relaxed">{personal.summary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-xs uppercase tracking-wide text-gold mb-3">
              {t('skillsTitle')}
            </h2>
            <div className="flex flex-col gap-2.5">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <p className="text-xs text-bg/90 mb-1 truncate">{skill.name}</p>
                  <div className="h-1 w-full bg-bg/15 rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${(skill.level / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-xs uppercase tracking-wide text-gold mb-3">
              {t('educationTitle')}
            </h2>
            <div className="flex flex-col gap-3">
              {education.map((item) => (
                <div key={item.id}>
                  <p className="text-xs font-semibold text-bg leading-snug">
                    {item.degree || t('previewUntitledInstitution')}
                  </p>
                  <p className="text-xs text-bg/70 leading-snug">{item.institution}</p>
                  <p className="text-[10px] text-bg/50 font-mono mt-0.5">
                    {formatMonth(item.startDate, locale)} — {formatMonth(item.endDate, locale)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      <div className="p-6 md:p-8 flex flex-col gap-6">
        <p className="text-xs font-mono text-muted uppercase tracking-wide">{t('previewLabel')}</p>

        <header className="pb-5 border-b-2 border-ink">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-ink leading-tight uppercase">
            {personal.fullName || t('previewNoName')}
          </h1>
          {personal.jobTitle && (
            <p className="text-azure-deep font-semibold mt-1 tracking-wide text-sm uppercase">{personal.jobTitle}</p>
          )}
          <p className="text-xs text-muted font-mono mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {personal.phone && <span>☎ {personal.phone}</span>}
            {personal.email && <span>✉ {personal.email}</span>}
            {personal.city && <span>⚲ {personal.city}</span>}
          </p>
        </header>

        {experience.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-sm text-ink uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" aria-hidden="true" />
              {t('experienceTitle')}
            </h2>
            <div className="flex flex-col gap-4">
              {experience.map((item) => (
                <div key={item.id}>
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-ink text-sm">
                      {item.position || t('previewUntitledPosition')}
                      {item.company && <span className="text-ink-soft font-normal"> — {item.company}</span>}
                    </p>
                    <p className="text-xs text-muted font-mono whitespace-nowrap">
                      {formatMonth(item.startDate, locale)} — {item.current ? t('currentJob') : formatMonth(item.endDate, locale)}
                    </p>
                  </div>
                  {item.description && (
                    <p className="text-sm text-ink-soft mt-1 leading-relaxed whitespace-pre-line">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {title && <p className="mt-auto pt-4 border-t border-dashed border-ink-soft/10 text-[11px] text-muted font-mono">{title}</p>}
      </div>
    </div>
  );
}
