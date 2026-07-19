import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function CTABand() {
  const t = useTranslations('CTA');
  const locale = useLocale();

  return (
    <section className="bg-ink py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-bg mb-7">
          {t('title')}
        </h2>
        <Link
          href={`/${locale}/signup`}
          className="bg-gold hover:bg-gold-deep transition-colors text-ink font-semibold px-8 py-3.5 rounded-card text-lg inline-block"
        >
          {t('button')}
        </Link>
      </div>
    </section>
  );
}
