import { getTranslations, setRequestLocale } from 'next-intl/server';
import FacilitatorForm from '@/components/FacilitatorForm';
import { FacilitatorScene } from '@/components/Illustrations';

function CoffeeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        d="M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16M7 3.5c-.5.8-.5 1.7 0 2.5M11 3.5c-.5.8-.5 1.7 0 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M17 14.5a5.5 5.5 0 0 1 3.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function FacilitatorPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Facilitator');

  const perks = [
    { icon: <CoffeeIcon />, title: t('perk1.title'), desc: t('perk1.desc') },
    { icon: <PeopleIcon />, title: t('perk2.title'), desc: t('perk2.desc') },
    { icon: <StarIcon />, title: t('perk3.title'), desc: t('perk3.desc') }
  ];

  const roles = [t('role1'), t('role2'), t('role3'), t('role4')];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="grid items-center gap-8 md:grid-cols-2">
        <div className="text-center md:text-left">
          <h1 className="font-serif text-4xl font-bold text-ink">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-ink/70">{t('subtitle')}</p>
        </div>
        <FacilitatorScene className="mx-auto w-full max-w-sm" />
      </header>

      {/* What is a facilitator */}
      <section className="mt-12 grid gap-8 rounded-2xl border border-clay-100 bg-white p-6 shadow-card sm:p-8 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">
            {t('whatTitle')}
          </h2>
          <p className="mt-3 text-ink/70">{t('whatBody')}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-clay-600">
            {t('roleTitle')}
          </h3>
          <ul className="mt-3 space-y-2">
            {roles.map((role, i) => (
              <li key={i} className="flex items-start gap-2 text-ink/80">
                <span className="mt-1 text-forest-500">
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10.5l3.5 3.5L16 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </span>
                {role}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Perks */}
      <section className="mt-12">
        <h2 className="text-center font-serif text-2xl font-bold text-ink">
          {t('perksTitle')}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {perks.map((perk, i) => (
            <div
              key={i}
              className="rounded-2xl border border-clay-100 bg-white p-6 text-center shadow-card"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-100 text-clay-700">
                {perk.icon}
              </div>
              <h3 className="mt-4 font-serif text-lg font-bold text-ink">
                {perk.title}
              </h3>
              <p className="mt-2 text-sm text-ink/70">{perk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Application form */}
      <section className="mt-14">
        <h2 className="mb-6 text-center font-serif text-2xl font-bold text-ink">
          {t('formTitle')}
        </h2>
        <FacilitatorForm />
      </section>
    </div>
  );
}
