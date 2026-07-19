import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Hero');
  const locale = useLocale();

  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col items-center text-center overflow-hidden">
      <h1
        className="font-display font-bold text-4xl md:text-6xl text-ink mb-5 max-w-3xl leading-tight opacity-0 animate-[fadeUp_0.7s_ease-out_0.05s_both] motion-reduce:opacity-100 motion-reduce:animate-none"
      >
        {t('title')}
      </h1>
      <p
        className="text-muted text-lg md:text-xl mb-9 max-w-xl opacity-0 animate-[fadeUp_0.7s_ease-out_0.2s_both] motion-reduce:opacity-100 motion-reduce:animate-none"
      >
        {t('subtitle')}
      </p>
      <Link
        href={`/${locale}/signup`}
        className="bg-gold hover:bg-gold-deep transition-colors text-ink font-semibold px-8 py-3.5 rounded-card text-lg shadow-lg shadow-gold/20 opacity-0 animate-[fadeUp_0.7s_ease-out_0.35s_both] motion-reduce:opacity-100 motion-reduce:animate-none"
      >
        {t('ctaStart')}
      </Link>

      <div className="mt-16 w-full max-w-md relative">
        <div
          className="bg-white rounded-card shadow-xl border border-ink-soft/10 p-6 text-left opacity-0 [animation:cardIn_0.7s_ease-out_0.5s_both,float_4s_ease-in-out_1.2s_infinite] motion-reduce:opacity-100 motion-reduce:[animation:none]"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full bg-azure/15 opacity-0 origin-center animate-[popIn_0.5s_ease-out_0.75s_both] motion-reduce:opacity-100 motion-reduce:animate-none"
            />
            <div>
              <div
                className="h-3 w-28 bg-ink/80 rounded mb-2 origin-left scale-x-0 animate-[typeIn_0.4s_ease-out_0.95s_both] motion-reduce:scale-x-100 motion-reduce:animate-none"
              />
              <div
                className="h-2 w-20 bg-muted/40 rounded origin-left scale-x-0 animate-[typeIn_0.35s_ease-out_1.15s_both] motion-reduce:scale-x-100 motion-reduce:animate-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div
              className="h-2 w-full bg-muted/20 rounded origin-left scale-x-0 animate-[typeIn_0.4s_ease-out_1.4s_both] motion-reduce:scale-x-100 motion-reduce:animate-none"
            />
            <div
              className="h-2 w-5/6 bg-muted/20 rounded origin-left scale-x-0 animate-[typeIn_0.4s_ease-out_1.6s_both] motion-reduce:scale-x-100 motion-reduce:animate-none"
            />
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-4/6 bg-muted/20 rounded origin-left scale-x-0 animate-[typeIn_0.4s_ease-out_1.8s_both] motion-reduce:scale-x-100 motion-reduce:animate-none"
              />
              <span
                className="w-[2px] h-3 bg-azure opacity-0 animate-[fadeUp_0.1s_linear_2.05s_forwards,blinkCaret_0.5s_step-end_2.05s_5] motion-reduce:hidden"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Сақтау батырмасы — толтырылған соң басылады */}
          <div className="mt-5 pt-4 border-t border-ink-soft/10 flex items-center justify-between opacity-0 animate-[fadeUp_0.4s_ease-out_2.5s_both] motion-reduce:opacity-100 motion-reduce:animate-none">
            <span className="text-xs font-mono text-muted">resume.pdf</span>
            <span
              className="text-xs font-display font-semibold text-white bg-azure px-3 py-1.5 rounded-full animate-[buttonPress_0.3s_ease-in-out_2.9s_both]"
            >
              Сақтау
            </span>
          </div>

          {/* Жүктеу (upload) индикаторы — сақтаудан кейін іске қосылады */}
          <div className="mt-3 h-1.5 w-full bg-muted/15 rounded-full overflow-hidden opacity-0 animate-[fadeUp_0.3s_ease-out_3.2s_both] motion-reduce:opacity-100 motion-reduce:animate-none">
            <div className="h-full bg-azure rounded-full origin-left scale-x-0 animate-[progressFill_1.1s_ease-out_3.3s_both]" />
          </div>
        </div>

        {/* "Дайын" белгісі — жүктеу аяқталғанда шығады */}
        <div
          className="absolute -top-3 -right-3 md:-right-5 bg-success text-white text-xs font-display font-semibold px-3 py-1.5 rounded-full shadow-lg opacity-0 animate-[badgeIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)_4.4s_both] motion-reduce:hidden"
        >
          ✓ Дайын
        </div>
      </div>
    </section>
  );
}
