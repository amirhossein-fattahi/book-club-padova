import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { HeroReadingScene, StepChooseBook, StepJoinGroup, StepMeetCafe } from '@/components/Illustrations';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const steps = [
    { icon: <StepChooseBook />, title: t('how.step1.title'), desc: t('how.step1.desc') },
    { icon: <StepJoinGroup />, title: t('how.step2.title'), desc: t('how.step2.desc') },
    { icon: <StepMeetCafe />, title: t('how.step3.title'), desc: t('how.step3.desc') }
  ];
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white/70 px-3 py-1 text-xs font-semibold text-clay-700">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-500" />{t('hero.badge')}
            </span>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-ink sm:text-5xl">{t('hero.title')}</h1>
            <p className="mt-5 max-w-xl text-lg text-ink/70">{t('hero.subtitle')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/facilitator" className="inline-flex items-center justify-center rounded-full bg-clay-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-clay-700">{t('hero.facilitatorCta')}</Link>
              <Link href="/groups#reader-interest" className="inline-flex items-center justify-center rounded-full border border-clay-300 bg-white px-6 py-3 font-semibold text-clay-800 transition-colors hover:bg-clay-50">{t('hero.exploreCta')}</Link>
            </div>
            <div className="mt-9 rounded-2xl border border-clay-200 bg-white/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-clay-700">{t('hero.goalTitle')}</p>
              <dl className="mt-3 grid grid-cols-2 gap-5">
                <div><dt className="font-serif text-2xl font-bold text-clay-700">3–4</dt><dd className="mt-1 text-sm text-ink/70">{t('hero.facilitatorGoal')}</dd></div>
                <div><dt className="font-serif text-2xl font-bold text-clay-700">1</dt><dd className="mt-1 text-sm text-ink/70">{t('hero.cafeGoal')}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-ink/60">{t('hero.goalNote')}</p>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <HeroReadingScene className="mx-auto w-full max-w-md" />
            <p className="mt-2 text-center text-sm italic text-ink/50">{t('hero.caption')}</p>
          </div>
        </div>
      </section>
      <section className="border-y border-clay-100 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-ink">{t('how.title')}</h2>
            <p className="mt-3 text-ink/70">{t('how.subtitle')}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => <div key={step.title} className="rounded-2xl border border-clay-100 bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">{step.icon}<span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-100 font-serif text-clay-700">{i + 1}</span></div>
              <h3 className="mt-4 font-serif text-xl font-bold text-ink">{step.title}</h3><p className="mt-2 text-sm text-ink/70">{step.desc}</p>
            </div>)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-forest-700 px-6 py-10 text-white sm:px-12">
          <h2 className="font-serif text-3xl font-bold">{t('cta.title')}</h2>
          <p className="mt-4 max-w-2xl text-white/85">{t('cta.subtitle')}</p>
          <p className="mt-4 max-w-2xl text-sm text-white/75">{t('cta.venueNote')}</p>
          <Link href="/facilitator" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-forest-700 hover:bg-clay-50">{t('cta.button')}</Link>
        </div>
      </section>
    </div>
  );
}
