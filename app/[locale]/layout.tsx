import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  setRequestLocale
} from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { siteUrl } from '@/lib/site';
import '../globals.css';

// Pre-render both locales at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as never)) notFound();
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    icons: { icon: '/icon.svg' },
    openGraph: {
      title: t('title'), description: t('description'), siteName: 'Circolo del Libro',
      locale: locale === 'it' ? 'it_IT' : 'en_GB', type: 'website'
    },
    twitter: { card: 'summary', title: t('title'), description: t('description') }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Guard against unknown locales.
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const messages = await getMessages();
  const nav = await getTranslations('Nav');

  return (
    <html lang={locale}>
      <body className="bg-paper min-h-screen flex flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <a href="#main" className="sr-only z-50 rounded-lg bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">{nav('skip')}</a>
          <Navbar />
          <main id="main" tabIndex={-1} className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
