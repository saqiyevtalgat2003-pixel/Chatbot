import type { ResumeData } from '@/lib/resume/types';
import { formatMonth } from '../ResumePreview';

/** Executive: жоғарыда терең көк-алтын header banner, оң жақта sidebar. */
export default function ExecutiveLayout({
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
    <div>
      <header className="bg-ink px-6 md:px-8 py-8 flex items-center gap-5 border-b-4 border-gold">
        {personal.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={personal.photoUrl}
            alt=""
            className="w-20 h-20 rounded-md object-cover border-2 border-gold shrink-0"
          />
        )}
        <div className="min-w-0">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gold tracking-wide truncate">
            {personal.fullName || t('previewNoName')}
          </h1>
          {personal.jobTitle && (
            <p className="text-bg/80 font-semibold mt-1 text-sm uppercase tracking-[0.15em]">{personal.jobTitle}</p>
          )}
          <p className="text-xs text-bg/60 font-mono mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {personal.phone && <span>{personal.phone}</span>}
            {personal.email && <span>{personal.email}</span>}
            {personal.city && <span>{personal.city}</span>}
          </p>
        </div>
      </header>

      <div className="grid sm:grid-cols-[1fr_200px]">
        <div className="p-6 md:p-8 flex flex-col gap-6 order-2 sm:order-1">
          <p className="text-xs font-mono text-muted uppercase tracking-wide">{t('previewLabel')}</p>

          {personal.summary && (
            <section>
              <h2 className="font-display font-bold text-xs text-gold-deep uppercase tracking-[0.2em] mb-2">
                {t('summaryTitle')}
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed">{personal.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-xs text-gold-deep uppercase tracking-[0.2em] mb-3">
                {t('experienceTitle')}
              </h2>
              <div className="flex flex-col gap-4">
                {experience.map((item) => (
                  <div key={item.id} className="border-l-2 border-gold/40 pl-4">
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

        <aside className="bg-bg p-6 flex flex-col gap-6 border-l border-ink-soft/10 order-1 sm:order-2">
          {skills.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-xs text-ink uppercase tracking-[0.2em] mb-3">{t('skillsTitle')}</h2>
              <div className="flex flex-col gap-2.5">
                {skills.map((skill) => (
                  <div key={skill.id}>
                    <p className="text-xs text-ink-soft mb-1 truncate">{skill.name}</p>
                    <div className="h-1 w-full bg-ink-soft/15 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-deep rounded-full" style={{ width: `${(skill.level / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-xs text-ink uppercase tracking-[0.2em] mb-3">{t('educationTitle')}</h2>
              <div className="flex flex-col gap-3">
                {education.map((item) => (
                  <div key={item.id}>
                    <p className="text-xs font-semibold text-ink leading-snug">{item.degree || t('previewUntitledInstitution')}</p>
                    <p className="text-xs text-ink-soft leading-snug">{item.institution}</p>
                    <p className="text-[10px] text-muted font-mono mt-0.5">
                      {formatMonth(item.startDate, locale)} — {formatMonth(item.endDate, locale)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
