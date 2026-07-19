import Link from 'next/link';
import LanguageDropdown from '@/components/LanguageDropdown';

export default function AuthShell({
  locale,
  title,
  subtitle,
  children,
  footer,
}: {
  locale: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Link href={`/${locale}`} className="font-display font-bold text-xl text-ink">
          KZ Resume
        </Link>
        <LanguageDropdown />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-2xl text-ink">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>

          <div className="rounded-card bg-white/70 border border-ink-soft/10 shadow-sm p-6 sm:p-8">
            {children}
          </div>

          <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>
        </div>
      </div>
    </div>
  );
}
