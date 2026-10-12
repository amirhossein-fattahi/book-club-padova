import { getTranslations, setRequestLocale } from 'next-intl/server';
import { groups } from '@/data/groups';
import { GroupsBanner } from '@/components/Illustrations';
import RegistrationForm from '@/components/RegistrationForm';
import { getRegistrationAvailability } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function GroupsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Groups');
  const { open, contact } = await getRegistrationAvailability();
  const confirmed = groups.filter(group => group.confirmed);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <GroupsBanner className="mx-auto mb-6 w-full max-w-lg" />
        <h1 className="font-serif text-4xl font-bold text-ink">{t('title')}</h1>
        <p className="mt-4 text-lg text-ink/70">{t('subtitle')}</p>
      </header>
      {confirmed.length > 0 ? <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {confirmed.map(group => <article key={group.id} className="rounded-2xl border border-clay-100 bg-white p-6 shadow-card">
          <h2 className="font-serif text-2xl font-bold">{group.title}</h2>
          <p className="mt-1 text-ink/70">{group.author} · {group.facilitator}</p>
          <p className="mt-3">{group.firstMeetingDate} · {group.time} · {group.durationMinutes} min</p>
          <p>{group.location} · {group.address}</p>
          <p className="mt-2 text-sm">{t('meetingLanguage')}: {group.meetingLanguage === 'either' ? t('either') : group.meetingLanguage.toUpperCase()}</p>
          <p className="text-sm">{t('cost')}: {group.cost}</p>
          <p className="mt-2 text-sm">{group.readingAssignment}</p>
          <p className="mt-3 text-xs text-ink/60">{t('requestNote')}</p>
        </article>)}
      </div> :
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-clay-200 bg-white/70 p-6 text-center"><p className="font-semibold text-clay-800">{t('empty')}</p><p className="mt-2 text-sm text-ink/70">{t('detailsPending')}</p></div>}
      <section id="reader-interest" className="mx-auto mt-12 max-w-3xl scroll-mt-24">
        <h2 className="text-center font-serif text-2xl font-bold text-ink">{t('formTitle')}</h2>
        <p className="mx-auto mb-6 mt-3 max-w-xl text-center text-sm text-ink/70">{t('formIntro')}</p>
        <RegistrationForm kind="reader" registrationOpen={open} contactEmail={contact} />
      </section>
    </div>
  );
}
