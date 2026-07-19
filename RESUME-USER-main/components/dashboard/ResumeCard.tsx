import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import DownloadButton from './DownloadButton';

export default async function ResumeCard({
  locale,
  id,
  title,
  updatedAt,
  locked,
}: {
  locale: string;
  id: string;
  title: string;
  updatedAt: string;
  locked: boolean;
}) {
  const t = await getTranslations('Dashboard');

  if (locked) {
    return (
      <div className="relative overflow-hidden rounded-card border border-ink-soft/10 bg-white/60 px-5 py-5 flex flex-col gap-3">
        <div className="absolute inset-0 bg-bg/40 backdrop-blur-[1px]" />
        <div className="relative flex items-center justify-between gap-2">
          <p className="font-display font-semibold text-ink truncate">{title}</p>
          <span aria-hidden="true" className="text-lg">
            🔒
          </span>
        </div>
        <p className="relative text-xs text-muted">{t('lockedBadge')}</p>
        <Link
          href={`/${locale}/pricing`}
          className="relative mt-1 text-sm font-semibold text-azure hover:text-azure-deep transition-colors w-fit"
        >
          {t('unlockAction')} →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-ink-soft/10 bg-white px-5 py-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <p className="font-display font-semibold text-ink truncate">{title}</p>
      <p className="text-xs text-muted font-mono">{t('updatedAt', { date: updatedAt })}</p>
      <div className="mt-1 flex items-center gap-4 text-sm">
        <Link
          href={`/${locale}/dashboard/resumes/${id}`}
          className="flex items-center gap-1.5 text-ink-soft hover:text-azure transition-colors"
        >
          <span aria-hidden="true">✏️</span> {t('editAction')}
        </Link>
        <DownloadButton locale={locale} id={id} label={t('downloadAction')} />
      </div>
    </div>
  );
}
