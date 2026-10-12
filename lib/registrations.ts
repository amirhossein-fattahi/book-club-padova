/** Shared field limits and validation; this module contains no secrets. */
export const REGISTRATION_ROLES = ['reader', 'facilitator', 'cohost', 'outreach', 'venue'] as const;
export type RegistrationRole = (typeof REGISTRATION_ROLES)[number];
export type MeetingLanguage = 'it' | 'en' | 'either';
export const PRIVACY_NOTICE_VERSION = '2026-10-11';

export const FIELD_LIMITS = {
  name: 120, email: 254, phone: 40, role: 20, meetingLanguage: 10,
  availability: 300, bookTitle: 200, bookAuthor: 160, why: 1500, locale: 2
} as const;

export type FormState = {
  status: 'idle' | 'success' | 'error';
  error?: 'invalid' | 'server' | 'captcha' | 'rateLimit' | 'configuration';
  fields?: Record<string, string>;
  fieldErrors?: Record<string, string>;
  name?: string;
  duplicate?: boolean;
};

export interface Registration {
  role: RegistrationRole;
  name: string;
  email: string;
  phone: string;
  meeting_language: MeetingLanguage;
  availability: string;
  book_title: string;
  book_author: string;
  motivation: string;
  locale: 'en' | 'it';
  privacy_notice_version: string;
}

export class RegistrationStorageError extends Error {
  constructor(public readonly code: string) { super(code); }
}

export function validateRegistration(formData: FormData): {
  registration?: Registration;
  fields: Record<string, string>;
  fieldErrors: Record<string, string>;
} {
  const fields: Record<string, string> = {};
  const fieldErrors: Record<string, string> = {};
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = formData.get(field);
    const text = typeof value === 'string' ? value.trim() : '';
    // Bound reflected values too; never echo a CAPTCHA token or honeypot.
    fields[field] = text.slice(0, limit);
    if (value !== null && typeof value !== 'string') fieldErrors[field] = 'invalid';
    else if (text.length > limit) fieldErrors[field] = 'tooLong';
    else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) fieldErrors[field] = 'invalid';
  }
  for (const field of ['name', 'email', 'role', 'meetingLanguage', 'locale']) {
    if (!fields[field] && !fieldErrors[field]) fieldErrors[field] = 'required';
  }
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) fieldErrors.email = 'invalid';
  if (fields.name && /[\r\n]/.test(fields.name)) fieldErrors.name = 'invalid';
  if (fields.role && !REGISTRATION_ROLES.includes(fields.role as RegistrationRole)) fieldErrors.role = 'invalid';
  if (fields.meetingLanguage && !['it', 'en', 'either'].includes(fields.meetingLanguage)) fieldErrors.meetingLanguage = 'invalid';
  if (fields.locale && !['it', 'en'].includes(fields.locale)) fieldErrors.locale = 'invalid';
  if (fields.phone && (!/^[+\d\s().-]+$/.test(fields.phone) || fields.phone.replace(/\D/g, '').length < 6 || fields.phone.replace(/\D/g, '').length > 18)) fieldErrors.phone = 'invalid';
  if (Object.keys(fieldErrors).length) return { fields, fieldErrors };
  const registration: Registration = {
    role: fields.role as RegistrationRole,
    name: fields.name,
    email: fields.email.toLowerCase(),
    phone: fields.phone,
    meeting_language: fields.meetingLanguage as MeetingLanguage,
    availability: fields.availability,
    book_title: fields.bookTitle,
    book_author: fields.bookAuthor,
    motivation: fields.why,
    locale: fields.locale as 'en' | 'it',
    privacy_notice_version: PRIVACY_NOTICE_VERSION
  };
  return { registration, fields, fieldErrors };
}

interface RecruitmentDependencies {
  checkConfiguration: () => string | null;
  verifyCaptcha: (token: string) => Promise<boolean>;
  consumeRateLimit: (email: string) => Promise<boolean>;
  save: (registration: Registration) => Promise<'submitted' | 'duplicate'>;
  notify: (registration: Registration) => Promise<void>;
  reportError?: () => void;
}

/** Dependencies are explicit so failures and retries can be tested without accounts. */
export function createRecruitmentHandler(dependencies: RecruitmentDependencies) {
  return async (formData: FormData): Promise<FormState> => {
    const trap = formData.get('company');
    if (typeof trap === 'string' && trap.trim()) return { status: 'success' };
    const { registration, fields, fieldErrors } = validateRegistration(formData);
    if (!registration) return { status: 'error', error: 'invalid', fields, fieldErrors };
    if (dependencies.checkConfiguration()) return { status: 'error', error: 'configuration', fields };
    try {
      const token = formData.get('cf-turnstile-response');
      if (!(await dependencies.verifyCaptcha(typeof token === 'string' ? token : ''))) {
        return { status: 'error', error: 'captcha', fields };
      }
      if (!(await dependencies.consumeRateLimit(registration.email))) {
        return { status: 'error', error: 'rateLimit', fields };
      }
      const outcome = await dependencies.save(registration);
      // Persistence is the source of truth. Alert delivery cannot undo a saved row.
      if (outcome === 'submitted') {
        try { await dependencies.notify(registration); } catch { dependencies.reportError?.(); }
      }
      return { status: 'success', name: registration.name, duplicate: outcome === 'duplicate' };
    } catch (error) {
      dependencies.reportError?.();
      const configuration = error instanceof RegistrationStorageError &&
        ['DATABASE_NOT_CONFIGURED', 'DATABASE_CONFIGURATION_INVALID', 'DATABASE_SCHEMA_MISSING', 'RATE_LIMIT_SCHEMA_MISSING'].includes(error.code);
      return { status: 'error', error: configuration ? 'configuration' : 'server', fields };
    }
  };
}
