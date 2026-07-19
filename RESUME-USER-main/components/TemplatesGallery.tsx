import { getTranslations } from 'next-intl/server';
import { getTemplates } from '@/lib/templates';
import TemplateThumbnail from './TemplateThumbnail';
import Reveal from './Reveal';

export default async function TemplatesGallery() {
  const t = await getTranslations('Templates');
  const templates = await getTemplates();

  if (templates.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <Reveal>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-ink text-center mb-12">
          {t('title')}
        </h2>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {templates.map((tpl, i) => (
          <Reveal key={tpl.id} delay={i * 100}>
            <div className="group bg-white rounded-card border border-ink-soft/10 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="aspect-[3/4]">
                <TemplateThumbnail slug={tpl.slug} />
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="font-display font-semibold text-sm text-ink">{tpl.name}</span>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    tpl.isPremium ? 'bg-gold/20 text-gold-deep' : 'bg-success/15 text-success'
                  }`}
                >
                  {tpl.isPremium ? t('premium') : t('free')}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
