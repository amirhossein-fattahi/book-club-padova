import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getContactEmail } from '@/lib/site';
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Contact');
  const contact = getContactEmail();
  return <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <h1 className="font-serif text-4xl font-bold">{t('title')}</h1>
    <p className="mt-4 text-lg text-ink/70">{t('intro')}</p>
    <div className="mt-8 rounded-2xl border border-clay-100 bg-white p-6 shadow-card">
      <p className="font-semibold">{t('name')}</p>
      {contact && <a href={'mailto:' + contact} className="mt-4 inline-block break-all text-clay-700 underline underline-offset-4">{contact}</a>}
      <p className="mt-4 text-sm text-ink/70">{t('reply')}</p>
    </div>
    <section className="mt-8"><h2 className="font-serif text-2xl font-bold">{t('statusTitle')}</h2><p className="mt-3 text-ink/70">{t('statusBody')}</p></section>
    <Link href="/privacy" className="mt-8 inline-block text-sm text-clay-700 underline underline-offset-4">{t('privacy')}</Link>
  </div>;
}
