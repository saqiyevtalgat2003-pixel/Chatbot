import { useTranslations } from 'next-intl';
import Reveal from './Reveal';

export default function Pricing({ premiumPriceKzt }: { premiumPriceKzt: number }) {
  const t = useTranslations('Pricing');

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <Reveal>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-ink text-center mb-12">
          {t('title')}
        </h2>
      </Reveal>
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free plan */}
        <Reveal delay={0}>
          <div className="bg-white rounded-card p-8 border border-ink-soft/10 h-full">
            <h3 className="font-display font-semibold text-xl text-ink mb-1">
              {t('freeTitle')}
            </h3>
            <div className="font-mono text-3xl font-bold text-ink mb-6">
              {t('freePrice')}
            </div>
            <ul className="space-y-3 text-sm text-ink-soft">
              <li>✓ {t('freeFeature1')}</li>
              <li>✓ {t('freeFeature2')}</li>
              <li>✓ {t('freeFeature3')}</li>
            </ul>
          </div>
        </Reveal>

        {/* Premium plan */}
        <Reveal delay={150}>
          <div className="bg-ink rounded-card p-8 border-2 border-gold relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 bg-gold text-ink text-xs font-mono font-semibold px-3 py-1 rounded-bl-card">
              PRO
            </div>
            <h3 className="font-display font-semibold text-xl text-bg mb-1">
              {t('premiumTitle')}
            </h3>
            <div className="font-mono text-3xl font-bold text-gold mb-6">
              {t('premiumPrice', { amount: premiumPriceKzt })}
            </div>
            <ul className="space-y-3 text-sm text-bg/80">
              <li>✓ {t('premiumFeature1')}</li>
              <li>✓ {t('premiumFeature2')}</li>
              <li>✓ {t('premiumFeature3')}</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
