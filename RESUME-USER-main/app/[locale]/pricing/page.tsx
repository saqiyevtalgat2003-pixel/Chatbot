import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getPremiumPriceKzt, getMaintenanceFlags } from '@/lib/settings';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ReceiptUploadForm from '@/components/dashboard/ReceiptUploadForm';

export default async function PricingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('PricingPage');
  const tPlans = await getTranslations('Pricing');

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: profile }, { data: pendingPayment }, premiumPriceKzt, maintenanceFlags] = await Promise.all([
    supabase.from('profiles').select('full_name, is_premium, premium_until').eq('id', user.id).single(),
    supabase
      .from('payments')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    getPremiumPriceKzt(),
    getMaintenanceFlags(),
  ]);

  const isPremium = profile?.is_premium ?? false;
  const premiumPriceLabel = tPlans('premiumPrice', { amount: premiumPriceKzt });

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        locale={locale}
        fullName={profile?.full_name || ''}
        email={user.email ?? ''}
        isPremium={isPremium}
        newResumeMaintenanceEnabled={maintenanceFlags.newResume}
      />

      <main className="flex-1 max-w-lg w-full mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-ink mb-1">
          {t('title')}
        </h1>
        <p className="text-sm text-muted mb-8">{t('subtitle')}</p>

        {isPremium ? (
          <div className="rounded-card border border-success/20 bg-success/5 px-5 py-5">
            <p className="font-display font-semibold text-ink">{t('alreadyPremiumTitle')}</p>
            {profile?.premium_until && (
              <p className="text-sm text-muted mt-1">
                {t('activeUntil', {
                  date: new Intl.DateTimeFormat(locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date(profile.premium_until)),
                })}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-card border border-gold/30 bg-gold/5 px-5 py-5 mb-6">
              <div className="flex items-baseline justify-between">
                <p className="font-display font-semibold text-lg text-ink">{tPlans('premiumTitle')}</p>
                <p className="font-mono font-semibold text-gold-deep">{premiumPriceLabel}</p>
              </div>
              <ul className="mt-3 text-sm text-ink-soft space-y-1">
                <li>· {tPlans('premiumFeature1')}</li>
                <li>· {tPlans('premiumFeature2')}</li>
                <li>· {tPlans('premiumFeature3')}</li>
              </ul>
            </div>

            {pendingPayment?.status === 'pending' ? (
              <div className="rounded-card border border-ink-soft/10 bg-white px-5 py-5">
                <p className="font-medium text-ink">{t('pendingTitle')}</p>
                <p className="text-sm text-muted mt-1">{t('pendingDesc')}</p>
              </div>
            ) : (
              <div className="rounded-card border border-ink-soft/10 bg-white px-5 py-5">
                <p className="font-medium text-ink mb-1">{t('kaspiInstructionsTitle')}</p>
                <p className="text-sm text-muted mb-4">{t('kaspiInstructionsDesc')}</p>

                <div className="rounded-card bg-bg px-4 py-3 mb-5 font-mono text-sm text-ink">
                  <p>{t('kaspiCardLabel')}: 4400 4302 XXXX XXXX</p>
                  <p className="mt-1">{t('kaspiAmountLabel')}: {premiumPriceLabel}</p>
                </div>

                <ReceiptUploadForm locale={locale} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
