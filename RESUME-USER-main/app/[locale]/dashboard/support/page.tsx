import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getMaintenanceFlags } from '@/lib/settings';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import TicketForm from '@/components/dashboard/TicketForm';

const DATE_LOCALES: Record<string, string> = {
  kk: 'kk-KZ',
  ru: 'ru-RU',
  uz: 'uz-UZ',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'statusOpen',
  answered: 'statusAnswered',
  closed: 'statusClosed',
};

export default async function SupportPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Support');

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: profile }, { data: tickets }, maintenanceFlags] = await Promise.all([
    supabase.from('profiles').select('full_name, is_premium').eq('id', user.id).single(),
    supabase
      .from('support_tickets')
      .select('id, subject, message, status, admin_reply, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    getMaintenanceFlags(),
  ]);

  // Пайдаланушының ашық (қаралуда) тікеті бар ма?
  const hasOpenTicket = (tickets ?? []).some((t) => t.status === 'open');

  const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? 'kk-KZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        locale={locale}
        fullName={profile?.full_name || ''}
        email={user.email ?? ''}
        isPremium={profile?.is_premium ?? false}
        newResumeMaintenanceEnabled={maintenanceFlags.newResume}
      />

      <main className="flex-1 max-w-lg w-full mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-ink mb-1">{t('title')}</h1>
        <p className="text-sm text-muted mb-8">{t('subtitle')}</p>

        <TicketForm locale={locale} hasOpenTicket={hasOpenTicket} />

        {tickets && tickets.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display font-semibold text-lg text-ink mb-4">{t('myTicketsTitle')}</h2>
            <div className="flex flex-col gap-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-card border border-ink-soft/10 bg-white px-5 py-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-semibold text-ink truncate">{ticket.subject}</p>
                    <span
                      className={`shrink-0 text-xs font-mono px-2 py-0.5 rounded-full ${
                        ticket.status === 'answered'
                          ? 'bg-success/15 text-success'
                          : ticket.status === 'closed'
                            ? 'bg-ink-soft/10 text-muted'
                            : 'bg-gold/15 text-gold-deep'
                      }`}
                    >
                      {t(STATUS_LABELS[ticket.status] as 'statusOpen')}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft mt-2">{ticket.message}</p>
                  <p className="text-xs text-muted font-mono mt-2">
                    {dateFormatter.format(new Date(ticket.created_at))}
                  </p>
                  {ticket.admin_reply && (
                    <div className="mt-3 rounded-card bg-bg px-4 py-3">
                      <p className="text-xs font-medium text-azure-deep mb-1">{t('adminReplyLabel')}</p>
                      <p className="text-sm text-ink-soft">{ticket.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
