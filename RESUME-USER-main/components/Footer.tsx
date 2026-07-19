import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-bg border-t border-ink-soft/10 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="font-display font-bold text-lg text-ink mb-1">
            KZ Resume
          </div>
          <p className="text-muted text-sm">{t('tagline')}</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-soft font-mono">
          <span className="hover:text-azure cursor-pointer transition-colors">
            {t('templates')}
          </span>
          <span className="hover:text-azure cursor-pointer transition-colors">
            {t('pricing')}
          </span>
          <span className="hover:text-azure cursor-pointer transition-colors">
            {t('support')}
          </span>
          <span className="hover:text-azure cursor-pointer transition-colors">
            {t('contact')}
          </span>
        </div>
      </div>
    </footer>
  );
}
