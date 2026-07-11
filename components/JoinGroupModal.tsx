'use client';

import { useActionState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { BookGroup } from '@/data/groups';
import { joinGroupAction, type FormState } from '@/app/actions';
import TurnstileWidget from './TurnstileWidget';

interface Props {
  group: BookGroup;
  onClose: () => void;
}

const INITIAL: FormState = { status: 'idle' };

export default function JoinGroupModal({ group, onClose }: Props) {
  const t = useTranslations('JoinModal');
  const tErr = useTranslations('Errors');
  const tDays = useTranslations('Days');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    joinGroupAction,
    INITIAL
  );

  const day = tDays(group.day);
  const succeeded = state.status === 'success';

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {succeeded ? (
          <div className="text-center">
            <h2
              id="join-title"
              className="font-serif text-2xl font-bold text-ink"
            >
              {t('successTitle')}
            </h2>
            <p className="mt-3 text-ink/70">
              {t('successBody', { name: state.name ?? '', book: group.title })}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-clay-600 px-4 py-2.5 font-semibold text-white hover:bg-clay-700"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h2
                id="join-title"
                className="font-serif text-2xl font-bold text-ink"
              >
                {t('title', { book: group.title })}
              </h2>
              <p className="mt-1 text-sm text-ink/60">
                {t('subtitle', {
                  facilitator: group.facilitator,
                  day,
                  time: group.time
                })}
              </p>
            </div>

            <form action={formAction} className="space-y-4">
              {/* Hidden context + honeypot */}
              <input type="hidden" name="groupId" value={group.id} />
              <input type="hidden" name="groupTitle" value={group.title} />
              <input type="hidden" name="locale" value={locale} />
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <Field
                label={t('name')}
                name="name"
                placeholder={t('namePlaceholder')}
                type="text"
                autoFocus
              />
              <Field
                label={t('email')}
                name="email"
                placeholder={t('emailPlaceholder')}
                type="email"
              />
              <Field
                label={t('phone')}
                name="phone"
                placeholder={t('phonePlaceholder')}
                type="tel"
              />

              <TurnstileWidget />

              {state.status === 'error' && (
                <p className="text-sm font-medium text-red-600">
                  {tErr(state.error ?? 'server')}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-clay-200 px-4 py-2.5 font-semibold text-ink/70 hover:bg-clay-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-full bg-clay-600 px-4 py-2.5 font-semibold text-white hover:bg-clay-700 disabled:opacity-60"
                >
                  {pending ? tErr('submitting') : t('submit')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink/80">
        {label}
      </span>
      <input
        required
        {...props}
        className="w-full rounded-lg border border-clay-200 bg-parchment/50 px-3 py-2.5 text-ink outline-none transition-colors focus:border-clay-400 focus:bg-white"
      />
    </label>
  );
}
