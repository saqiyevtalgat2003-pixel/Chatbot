import { getTranslations, setRequestLocale } from 'next-intl/server';
import AuthShell from '@/components/auth/AuthShell';

export default async function CheckEmailPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Auth');

  return (
    <AuthShell
      locale={locale}
      title={t('checkEmailTitle')}
      subtitle={t('checkEmailSubtitle')}
      footer={null}
    >
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="text-4xl">✉️</span>
        <p className="text-sm text-ink-soft">{t('checkEmailBody')}</p>
      </div>
    </AuthShell>
  );
}
