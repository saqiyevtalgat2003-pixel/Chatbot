import type { ResumeData } from '@/lib/resume/types';
import { formatMonth } from '../ResumePreview';

/** Креативті: түрлі-түсті header, тимлайн стилінде тәжірибе, дөңгелек skill тегтер. */
export default function CreativeLayout({
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
    <div className="p-6 md:p-8 flex flex-col gap-7">
      <header className="rounded-card bg-gradient-to-br from-azure via-azure-deep to-ink p-6 flex items-center gap-4">
        {personal.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={personal.photoUrl}
            alt=""
            className="w-16 h-16 rounded-full object-cover border-2 border-white/70 shrink-0"
          />
        )}
        <div className="min-w-0">
          <h1 className="font-display font-bold text-xl md:text-2xl text-white truncate">
            {personal.fullName || t('previewNoName')}
          </h1>
          {personal.jobTitle && <p className="text-white/80 font-medium mt-0.5 text-sm">{personal.jobTitle}</p>}
          <p className="text-[11px] text-white/70 font-mono mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {personal.phone && <span>{personal.phone}</span>}
            {personal.email && <span>{personal.email}</span>}
            {personal.city && <span>{personal.city}</span>}
          </p>
        </div>
      </header>

      <p className="text-xs font-mono text-muted uppercase tracking-wide">{t('previewLabel')}</p>

      {personal.summary && (
        <p className="text-sm text-ink-soft leading-relaxed rounded-card bg-azure/5 p-4 border-l-4 border-azure">
          {personal.summary}
        </p>
      )}

      {skills.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-sm text-ink mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold" aria-hidden="true" />
            {t('skillsTitle')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-azure/10 text-azure-deep"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-sm text-ink mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-azure" aria-hidden="true" />
            {t('experienceTitle')}
          </h2>
          <div className="flex flex-col gap-0 relative pl-5 border-l-2 border-dashed border-ink-soft/15">
            {experience.map((item) => (
              <div key={item.id} className="relative pb-5 last:pb-0">
                <span className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-gold border-2 border-white shadow" aria-hidden="true" />
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
                  <p className="text-sm text-ink-soft mt-1 leading-relaxed whitespace-pre-line">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-sm text-ink mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success" aria-hidden="true" />
            {t('educationTitle')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {education.map((item) => (
              <div key={item.id} className="rounded-card bg-bg p-3">
                <p className="text-xs font-semibold text-ink">{item.degree || t('previewUntitledInstitution')}</p>
                <p className="text-xs text-ink-soft">{item.institution}</p>
                <p className="text-[10px] text-muted font-mono mt-0.5">
                  {formatMonth(item.startDate, locale)} — {formatMonth(item.endDate, locale)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {title && <p className="mt-2 pt-4 border-t border-dashed border-ink-soft/10 text-[11px] text-muted font-mono">{title}</p>}
    </div>
  );
}
