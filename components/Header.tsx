import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import LanguageDropdown from './LanguageDropdown';
import AnimatedBrand from './AnimatedBrand';

export default function Header() {
  const t = useTranslations('Header');
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-sm border-b border-ink-soft/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <AnimatedBrand />
        <div className="flex items-center gap-4">
          <LanguageDropdown />
          <Link
            href={`/${locale}/login`}
            className="bg-ink text-bg font-semibold text-sm px-5 py-2 rounded-full hover:bg-ink-soft transition-colors"
          >
            {t('login')}
          </Link>
        </div>
      </div>
    </header>
  );
}
