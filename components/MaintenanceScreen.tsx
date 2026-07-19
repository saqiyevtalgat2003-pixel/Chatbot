import { getTranslations } from 'next-intl/server';

/**
 * Full-site takeover shown when the admin enables "Толық тех жұмыс" in the
 * admin dashboard. Rendered from the locale layout so every route (login,
 * dashboard, editor, everything) is replaced by this screen for regular
 * users while the toggle is on.
 */
export default async function MaintenanceScreen() {
  const t = await getTranslations('Maintenance');

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden bg-ink px-6">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-azure/20 blur-3xl animate-maintenance-drift motion-reduce:animate-none" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl animate-maintenance-drift-slow motion-reduce:animate-none" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="relative mb-8 h-20 w-20">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping motion-reduce:animate-none"
          />
          <div className="relative h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-4xl animate-maintenance-spin motion-reduce:animate-none inline-block">
              ⚙️
            </span>
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl md:text-3xl text-white">
          {t('title')}
        </h1>
        <p className="mt-3 text-sm md:text-base text-white/60">{t('desc')}</p>

        <div className="mt-8 flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-gold animate-maintenance-bounce motion-reduce:animate-none [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-gold animate-maintenance-bounce motion-reduce:animate-none [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-gold animate-maintenance-bounce motion-reduce:animate-none [animation-delay:300ms]" />
        </div>

        <p className="mt-6 text-xs font-mono uppercase tracking-wide text-white/40">
          {t('backSoon')}
        </p>
      </div>
    </div>
  );
}
