import { useTranslations } from 'next-intl';
import Reveal from './Reveal';

export default function HowItWorks() {
  const t = useTranslations('HowItWorks');

  const steps = [
    { title: t('step1Title'), desc: t('step1Desc') },
    { title: t('step2Title'), desc: t('step2Desc') },
    { title: t('step3Title'), desc: t('step3Desc') },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <Reveal>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-ink text-center mb-12">
          {t('title')}
        </h2>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <Reveal key={i} delay={i * 120}>
            <div className="bg-white rounded-card p-7 border border-ink-soft/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="font-mono text-azure text-sm font-semibold mb-3">
                0{i + 1}
              </div>
              <h3 className="font-display font-semibold text-xl text-ink mb-2">
                {step.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
