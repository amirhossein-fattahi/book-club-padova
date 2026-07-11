'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { facilitatorAction, type FormState } from '@/app/actions';
import TurnstileWidget from './TurnstileWidget';

const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

const INITIAL: FormState = { status: 'idle' };

export default function FacilitatorForm() {
  const t = useTranslations('Facilitator.form');
  const tErr = useTranslations('Errors');
  const tDays = useTranslations('Days');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    facilitatorAction,
    INITIAL
  );

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-forest-500/20 bg-forest-500/5 p-8 text-center">
        <h3 className="font-serif text-2xl font-bold text-forest-700">
          {t('successTitle')}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-ink/70">
          {t('successBody', { name: state.name ?? '', book: state.book ?? '' })}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-clay-100 bg-white p-6 shadow-card sm:p-8"
    >
      {/* Locale context + honeypot */}
      <input type="hidden" name="locale" value={locale} />
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Text
          label={t('name')}
          name="name"
          placeholder={t('namePlaceholder')}
        />
        <Text
          label={t('email')}
          name="email"
          type="email"
          placeholder={t('emailPlaceholder')}
        />
        <Text
          label={t('bookTitle')}
          name="bookTitle"
          placeholder={t('bookTitlePlaceholder')}
        />
        <Text
          label={t('bookAuthor')}
          name="bookAuthor"
          placeholder={t('bookAuthorPlaceholder')}
        />
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink/80">
            {t('why')}
          </span>
          <textarea
            required
            name="why"
            rows={4}
            placeholder={t('whyPlaceholder')}
            className="w-full resize-y rounded-lg border border-clay-200 bg-parchment/50 px-3 py-2.5 text-ink outline-none transition-colors focus:border-clay-400 focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink/80">
            {t('preferredDay')}
          </span>
          <select
            required
            name="day"
            defaultValue=""
            className="w-full rounded-lg border border-clay-200 bg-parchment/50 px-3 py-2.5 text-ink outline-none transition-colors focus:border-clay-400 focus:bg-white"
          >
            <option value="" disabled>
              {t('selectDay')}
            </option>
            {DAY_KEYS.map((d) => (
              <option key={d} value={d}>
                {tDays(d)}
              </option>
            ))}
          </select>
        </label>
        <Text label={t('preferredTime')} name="time" type="time" required={false} />
      </div>

      <div className="mt-5">
        <TurnstileWidget />
      </div>

      {state.status === 'error' && (
        <p className="mt-4 text-sm font-medium text-red-600">
          {tErr(state.error ?? 'server')}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-7 w-full rounded-full bg-clay-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-clay-700 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {pending ? tErr('submitting') : t('submit')}
      </button>
    </form>
  );
}

function Text({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { required = true } = props;
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink/80">
        {label}
      </span>
      <input
        {...props}
        required={required}
        className="w-full rounded-lg border border-clay-200 bg-parchment/50 px-3 py-2.5 text-ink outline-none transition-colors focus:border-clay-400 focus:bg-white"
      />
    </label>
  );
}
