'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LABELS: Record<string, string> = {
  en: 'EN',
  it: 'IT'
};

export default function LanguageToggle() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(nextLocale: string) {
    if (nextLocale === locale) return;
    startTransition(() => {
      // `pathname` is locale-agnostic (e.g. "/groups"); just swap the locale.
      // None of our routes carry extra dynamic segments, so no params needed.
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-clay-200 bg-white/70 p-0.5"
      role="group"
      aria-label={t('toggleLabel')}
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            disabled={isPending}
            aria-pressed={active}
            className={[
              'rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors',
              active
                ? 'bg-clay-600 text-white shadow-sm'
                : 'text-clay-700 hover:bg-clay-100'
            ].join(' ')}
          >
            {LABELS[loc] ?? loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
