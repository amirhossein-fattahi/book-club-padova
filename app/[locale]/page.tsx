import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  HeroReadingScene,
  StepChooseBook,
  StepJoinGroup,
  StepMeetCafe
} from '@/components/Illustrations';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white/70 px-3 py-1 text-xs font-semibold text-clay-700">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-500" />
              {t('hero.badge')}
            </span>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-ink sm:text-5xl">
              {t('hero.title')}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink/70">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/groups"
                className="inline-flex items-center justify-center rounded-full bg-clay-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-clay-700"
              >
                {t('hero.exploreCta')}
              </Link>
              <Link
                href="/facilitator"
                className="inline-flex items-center justify-center rounded-full border border-clay-300 bg-white px-6 py-3 font-semibold text-clay-800 transition-colors hover:bg-clay-50"
              >
                {t('hero.facilitatorCta')}
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              <Stat value="6" label={t('hero.stat1')} />
              <Stat value="2" label={t('hero.stat2')} />
              <Stat value="30+" label={t('hero.stat3')} />
            </dl>
          </div>

          {/* Warm reading-table illustration */}
          <div className="relative hidden lg:block">
            <HeroReadingScene className="mx-auto w-full max-w-md" />
            <p className="mt-2 text-center text-sm italic text-ink/40">
              Padova · dal 2024
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-clay-100 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-ink">
              {t('how.title')}
            </h2>
            <p className="mt-3 text-ink/70">{t('how.subtitle')}</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Step
              n="1"
              illustration={<StepChooseBook />}
              title={t('how.step1.title')}
              desc={t('how.step1.desc')}
            />
            <Step
              n="2"
              illustration={<StepJoinGroup />}
              title={t('how.step2.title')}
              desc={t('how.step2.desc')}
            />
            <Step
              n="3"
              illustration={<StepMeetCafe />}
              title={t('how.step3.title')}
              desc={t('how.step3.desc')}
            />
          </div>
        </div>
      </section>

      {/* Facilitator CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-forest-700 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-bold">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            {t('cta.subtitle')}
          </p>
          <Link
            href="/facilitator"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-forest-700 transition-colors hover:bg-clay-50"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-serif text-2xl font-bold text-clay-700">{value}</dt>
      <dd className="mt-1 text-xs text-ink/60">{label}</dd>
    </div>
  );
}

function Step({
  n,
  title,
  desc,
  illustration
}: {
  n: string;
  title: string;
  desc: string;
  illustration: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-clay-100 bg-white p-6 shadow-card">
      <div className="flex items-center gap-3">
        {illustration}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-100 font-serif text-base font-bold text-clay-700">
          {n}
        </span>
      </div>
      <h3 className="mt-4 font-serif text-xl font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/70">{desc}</p>
    </div>
  );
}
