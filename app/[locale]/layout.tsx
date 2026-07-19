import type { Metadata } from 'next';
import { Golos_Text, Manrope, IBM_Plex_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { getMaintenanceFlags } from '@/lib/settings';
import MaintenanceScreen from '@/components/MaintenanceScreen';
import '../globals.css';

const golos = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-golos',
  weight: ['500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-plex-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'KZ Resume — Резюмеңді 5 минутта жаса',
  description: 'Қазақ, орыс және өзбек тілдерінде кәсіби резюме құрастыр',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const { full: fullMaintenance } = await getMaintenanceFlags();

  return (
    <html
      lang={locale}
      style={{ colorScheme: 'light' }}
      className={`${golos.variable} ${manrope.variable} ${plexMono.variable}`}
    >
      <body className="bg-bg text-ink font-body antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {fullMaintenance ? <MaintenanceScreen /> : children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
