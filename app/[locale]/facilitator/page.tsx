import { getTranslations, setRequestLocale } from 'next-intl/server';
import FacilitatorForm from '@/components/FacilitatorForm';
import { FacilitatorScene } from '@/components/Illustrations';
import { getRegistrationAvailability } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function FacilitatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Facilitator');
  const { open, contact } = await getRegistrationAvailability();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="grid items-center gap-8 md:grid-cols-2">
        <div><span className="rounded-full bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-700">{t('badge')}</span>
          <h1 className="mt-5 font-serif text-4xl font-bold text-ink">{t('title')}</h1><p className="mt-4 text-lg text-ink/70">{t('subtitle')}</p></div>
        <FacilitatorScene className="mx-auto w-full max-w-sm" />
      </header>
      <section className="mt-10 grid gap-8 rounded-2xl border border-clay-100 bg-white p-6 shadow-card sm:p-8 md:grid-cols-2">
        <div><h2 className="font-serif text-2xl font-bold text-ink">{t('whatTitle')}</h2><p className="mt-3 text-ink/70">{t('whatBody')}</p><p className="mt-3 text-sm text-ink/60">{t('commitment')}</p></div>
        <div><h3 className="text-sm font-semibold uppercase tracking-wide text-clay-600">{t('roleTitle')}</h3>
          <ul className="mt-3 space-y-3">{[t('role1'), t('role2'), t('role3'), t('role4')].map(role => <li key={role} className="flex items-start gap-2 text-ink/80"><span aria-hidden="true" className="text-forest-600">✓</span>{role}</li>)}</ul>
        </div>
      </section>
      <section className="mt-8 rounded-2xl border border-forest-500/20 bg-forest-500/5 p-6"><h2 className="font-serif text-xl font-bold text-forest-700">{t('helpTitle')}</h2><p className="mt-2 text-sm text-ink/70">{t('helpBody')}</p></section>
      <section id="facilitator-interest" className="mt-12 scroll-mt-24"><h2 className="mb-3 text-center font-serif text-2xl font-bold text-ink">{t('formTitle')}</h2><p className="mx-auto mb-6 max-w-xl text-center text-sm text-ink/70">{t('formIntro')}</p><FacilitatorForm registrationOpen={open} contactEmail={contact} /></section>
    </div>
  );
}
