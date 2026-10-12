'use client';

import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { recruitmentInterestAction, type FormState } from '@/app/actions';
import { Link } from '@/i18n/navigation';
import TurnstileWidget, { type CaptchaStatus } from './TurnstileWidget';

const INITIAL: FormState = { status: 'idle' };
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
const DEFAULT_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
const HELPER_ROLES = ['facilitator', 'cohost', 'outreach', 'venue'] as const;

interface Props {
  kind: 'reader' | 'facilitator';
  registrationOpen?: boolean;
  contactEmail?: string | null;
}

type Values = {
  name: string;
  email: string;
  phone: string;
  meetingLanguage: string;
  availability: string;
  role: string;
  bookTitle: string;
  bookAuthor: string;
  why: string;
};

const inputClass = 'w-full rounded-lg border border-clay-200 bg-parchment/50 px-3 py-2.5 text-ink transition-colors focus:border-clay-400 focus:bg-white disabled:opacity-60';

async function submitInterest(previous: FormState, formData: FormData): Promise<FormState> {
  try {
    return await recruitmentInterestAction(previous, formData);
  } catch {
    // Network failures also keep the form mounted and its controlled values intact.
    return { status: 'error', error: 'server' };
  }
}

export default function RegistrationForm({ kind, registrationOpen = true, contactEmail = DEFAULT_CONTACT_EMAIL }: Props) {
  const t = useTranslations('Registration');
  const locale = useLocale();
  const id = useId();
  const contact = contactEmail?.trim();
  const hasContact = contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const [state, formAction, pending] = useActionState(submitInterest, INITIAL);
  // Controlled values survive React's form reset when an action returns an error.
  const [values, setValues] = useState<Values>(() => ({
    name: state.fields?.name ?? '',
    email: state.fields?.email ?? '',
    phone: state.fields?.phone ?? '',
    meetingLanguage: state.fields?.meetingLanguage ?? '',
    availability: state.fields?.availability ?? '',
    role: kind === 'reader' ? 'reader' : state.fields?.role ?? 'facilitator',
    bookTitle: state.fields?.bookTitle ?? '',
    bookAuthor: state.fields?.bookAuthor ?? '',
    why: state.fields?.why ?? ''
  }));
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaStatus, setCaptchaStatus] = useState<CaptchaStatus>(SITE_KEY ? 'loading' : 'unconfigured');
  const [captchaReset, setCaptchaReset] = useState(0);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === 'error') {
      setCaptchaToken('');
      setCaptchaStatus(SITE_KEY ? 'loading' : 'unconfigured');
      setCaptchaReset((value) => value + 1);
      errorRef.current?.focus();
    } else if (state.status === 'success') {
      successRef.current?.focus();
    }
  }, [state]);

  function update(field: keyof Values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }
  const fieldError = (field: keyof Values) => state.status === 'error' && Boolean(state.fieldErrors?.[field]);
  const errorId = (field: keyof Values) => `${id}-${field}-error`;
  const fieldFeedback = (field: keyof Values) => fieldError(field) ? (
    <p id={errorId(field)} className="mt-1 text-sm text-red-700">{t('fieldInvalid')}</p>
  ) : null;

  function textField(field: keyof Values, options: {
    type?: string;
    required?: boolean;
    maxLength: number;
    autoComplete?: string;
    placeholder?: string;
    hint?: string;
  }) {
    const fieldId = `${id}-${field}`;
    const descriptionIds = [options.hint ? `${fieldId}-hint` : '', fieldError(field) ? errorId(field) : ''].filter(Boolean).join(' ');
    return (
      <div>
        <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-ink/80">
          {t(field)} {!options.required && <span className="font-normal text-ink/60">({t('optional')})</span>}
        </label>
        <input id={fieldId} name={field} type={options.type ?? 'text'} required={options.required} maxLength={options.maxLength} autoComplete={options.autoComplete} placeholder={options.placeholder} value={values[field]} onChange={(event) => update(field, event.target.value)} aria-invalid={fieldError(field) || undefined} aria-describedby={descriptionIds || undefined} className={inputClass} />
        {options.hint && <p id={`${fieldId}-hint`} className="mt-1 text-xs text-ink/60">{options.hint}</p>}
        {fieldFeedback(field)}
      </div>
    );
  }

  if (!registrationOpen) {
    return (
      <div className="rounded-2xl border border-clay-100 bg-white p-6 sm:p-8">
        <h3 className="font-serif text-xl font-bold text-ink">{t('unavailableTitle')}</h3>
        <p className="mt-3 text-ink/70">{t('unavailableBody')}</p>
        {hasContact && <a href={`mailto:${contact}`} className="mt-4 inline-block font-semibold text-clay-800 underline underline-offset-4">{t('contact')}</a>}
      </div>
    );
  }

  if (state.status === 'success') {
    return (
      <div ref={successRef} tabIndex={-1} role="status" aria-live="polite" className="rounded-2xl border border-forest-500/20 bg-forest-500/5 p-6 sm:p-8">
        <h3 className="font-serif text-2xl font-bold text-forest-700">{t('savedTitle')}</h3>
        <p className="mt-3 text-ink/80">{state.duplicate ? t('duplicateBody') : t('savedBody', { name: state.name ?? values.name })}</p>
        {hasContact && <a href={`mailto:${contact}`} className="mt-4 inline-block font-semibold text-clay-800 underline underline-offset-4">{t('contact')}</a>}
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-clay-100 bg-white p-6 shadow-card sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="cf-turnstile-response" value={captchaToken} />
      {kind === 'reader' && <input type="hidden" name="role" value="reader" />}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <p className="mb-2 text-sm text-ink/70">{t('purpose')}</p>
      <p className="mb-6 text-xs text-ink/60">{t('requiredFields')}</p>

      <fieldset disabled={pending} className="grid min-w-0 gap-5 sm:grid-cols-2">
        {textField('name', { required: true, maxLength: 120, autoComplete: 'name' })}
        {textField('email', { type: 'email', required: true, maxLength: 254, autoComplete: 'email' })}
        {textField('phone', { type: 'tel', maxLength: 40, autoComplete: 'tel', hint: t('phoneHint') })}
        <div>
          <label htmlFor={`${id}-meetingLanguage`} className="mb-1 block text-sm font-medium text-ink/80">{t('meetingLanguage')}</label>
          <select id={`${id}-meetingLanguage`} name="meetingLanguage" required value={values.meetingLanguage} onChange={(event) => update('meetingLanguage', event.target.value)} aria-invalid={fieldError('meetingLanguage') || undefined} aria-describedby={fieldError('meetingLanguage') ? errorId('meetingLanguage') : undefined} className={inputClass}>
            <option value="" disabled>{t('selectLanguage')}</option>
            <option value="it">{t('languageIt')}</option>
            <option value="en">{t('languageEn')}</option>
            <option value="either">{t('languageEither')}</option>
          </select>
          {fieldFeedback('meetingLanguage')}
        </div>
        <div className="sm:col-span-2">{textField('availability', { maxLength: 300, placeholder: t('availabilityPlaceholder') })}</div>
        {kind === 'facilitator' && (
          <>
            <div className="sm:col-span-2">
              <label htmlFor={`${id}-role`} className="mb-1 block text-sm font-medium text-ink/80">{t('role')}</label>
              <select id={`${id}-role`} name="role" required value={values.role} onChange={(event) => update('role', event.target.value)} aria-invalid={fieldError('role') || undefined} aria-describedby={fieldError('role') ? errorId('role') : undefined} className={inputClass}>
                {HELPER_ROLES.map((role) => <option key={role} value={role}>{t(`roles.${role}`)}</option>)}
              </select>
              {fieldFeedback('role')}
            </div>
            <p className="text-sm text-ink/70 sm:col-span-2">{t('proposalHint')}</p>
            {textField('bookTitle', { maxLength: 200, placeholder: t('bookTitlePlaceholder') })}
            {textField('bookAuthor', { maxLength: 160, placeholder: t('bookAuthorPlaceholder') })}
            <div className="sm:col-span-2">
              <label htmlFor={`${id}-why`} className="mb-1 block text-sm font-medium text-ink/80">{t('why')} <span className="font-normal text-ink/60">({t('optional')})</span></label>
              <textarea id={`${id}-why`} name="why" rows={4} maxLength={1500} placeholder={t('whyPlaceholder')} value={values.why} onChange={(event) => update('why', event.target.value)} aria-invalid={fieldError('why') || undefined} aria-describedby={fieldError('why') ? errorId('why') : undefined} className={`${inputClass} resize-y`} />
              {fieldFeedback('why')}
            </div>
          </>
        )}
      </fieldset>

      <p className="mt-6 text-sm text-ink/70">{t('privacyText')}{' '}<Link href="/privacy" className="font-medium text-clay-800 underline underline-offset-4">{t('privacyLink')}</Link></p>
      <div className="mt-5"><TurnstileWidget resetKey={captchaReset} onTokenChange={setCaptchaToken} onStateChange={setCaptchaStatus} /></div>
      {state.status === 'error' && (
        <div ref={errorRef} tabIndex={-1} role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{t(`errors.${state.error ?? 'server'}`)}</div>
      )}
      <button type="submit" disabled={pending || Boolean(SITE_KEY && (captchaStatus !== 'ready' || !captchaToken))} className="mt-6 w-full rounded-full bg-clay-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-clay-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8">
        {pending ? t('submitting') : t(kind === 'reader' ? 'submitReader' : 'submitFacilitator')}
      </button>
    </form>
  );
}
