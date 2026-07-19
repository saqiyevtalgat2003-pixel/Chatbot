import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import TemplatesGallery from '@/components/TemplatesGallery';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import CTABand from '@/components/CTABand';
import Footer from '@/components/Footer';
import { getPremiumPriceKzt } from '@/lib/settings';

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const premiumPriceKzt = await getPremiumPriceKzt();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <TemplatesGallery />
        <Pricing premiumPriceKzt={premiumPriceKzt} />
        <FAQ />
      </main>
      <CTABand />
      <Footer />
    </>
  );
}
