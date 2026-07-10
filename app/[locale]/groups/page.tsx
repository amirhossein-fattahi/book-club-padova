import { getTranslations, setRequestLocale } from 'next-intl/server';
import { groups } from '@/data/groups';
import GroupCard from '@/components/GroupCard';

export default async function GroupsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Groups');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-4xl font-bold text-ink">{t('title')}</h1>
        <p className="mt-3 text-ink/70">{t('subtitle')}</p>
      </header>

      {groups.length === 0 ? (
        <p className="mt-16 text-center text-ink/60">{t('empty')}</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
