import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getContactEmail } from '@/lib/site';
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Privacy');
  const contact = getContactEmail();
  const sections = ['controller', 'data', 'purpose', 'retention', 'security', 'transfers', 'rights', 'spam'] as const;
  return <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <h1 className="font-serif text-4xl font-bold text-ink">{t('title')}</h1>
    <p className="mt-4 text-lg text-ink/70">{t('intro')}</p>
    <p className="mt-3 text-xs text-ink/60">{t('updated')}</p>
    {sections.map(section => <section key={section} className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{t(section + 'Title')}</h2>
      <p className="mt-3 leading-relaxed text-ink/80">{t(section + 'Body')}</p>
    </section>)}
    {contact && <a href={'mailto:' + contact} className="mt-8 inline-flex rounded-full bg-clay-600 px-5 py-3 font-semibold text-white hover:bg-clay-700">{t('contact')}</a>}
    <section className="mt-10 border-t border-clay-200 pt-6">
      <h2 className="font-semibold text-ink">{t('providers')}</h2>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm underline underline-offset-4">
        <li><a href="https://vercel.com/legal/privacy-policy">Vercel</a></li>
        <li><a href="https://supabase.com/privacy">Supabase</a></li>
        <li><a href="https://resend.com/legal/privacy-policy">Resend</a></li>
        <li><a href="https://www.cloudflare.com/privacypolicy/">Cloudflare</a></li>
      </ul>
      <a href="https://www.garanteprivacy.it/" className="mt-4 inline-block text-sm underline underline-offset-4">{t('authority')}</a>
    </section>
  </div>;
}
