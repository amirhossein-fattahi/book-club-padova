'use server';

import {
  saveGroupSignup,
  saveFacilitatorApplication
} from '@/lib/db';
import { notifyNewSignup, notifyNewFacilitator } from '@/lib/notify';

export type FormState = {
  status: 'idle' | 'success' | 'error';
  error?: 'invalid' | 'server' | 'captcha';
  /** Echoed back on success so the UI can greet the user by name. */
  name?: string;
  /** Proposed book title, echoed back for the facilitator success message. */
  book?: string;
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const s = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

/**
 * Verify the Cloudflare Turnstile token server-side. If no secret is configured,
 * verification is skipped (so the site works before Cloudflare is set up).
 */
async function passesCaptcha(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured — allow through
  if (!token) return false;
  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token })
      }
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function joinGroupAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  // Honeypot: real users never fill this hidden field.
  if (s(formData.get('company'))) return { status: 'success' };

  if (!(await passesCaptcha(s(formData.get('cf-turnstile-response'))))) {
    return { status: 'error', error: 'captcha' };
  }

  const row = {
    group_id: s(formData.get('groupId')),
    group_title: s(formData.get('groupTitle')),
    name: s(formData.get('name')),
    email: s(formData.get('email')),
    phone: s(formData.get('phone')),
    locale: s(formData.get('locale')) || 'en'
  };

  if (!row.name || !isEmail(row.email) || !row.phone) {
    return { status: 'error', error: 'invalid' };
  }

  try {
    await saveGroupSignup(row);
    await notifyNewSignup(row);
    return { status: 'success', name: row.name };
  } catch {
    return { status: 'error', error: 'server' };
  }
}

export async function facilitatorAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (s(formData.get('company'))) return { status: 'success' };

  if (!(await passesCaptcha(s(formData.get('cf-turnstile-response'))))) {
    return { status: 'error', error: 'captcha' };
  }

  const row = {
    name: s(formData.get('name')),
    email: s(formData.get('email')),
    book_title: s(formData.get('bookTitle')),
    book_author: s(formData.get('bookAuthor')),
    motivation: s(formData.get('why')),
    preferred_day: s(formData.get('day')),
    preferred_time: s(formData.get('time')),
    locale: s(formData.get('locale')) || 'en'
  };

  if (
    !row.name ||
    !isEmail(row.email) ||
    !row.book_title ||
    !row.book_author ||
    !row.motivation ||
    !row.preferred_day
  ) {
    return { status: 'error', error: 'invalid' };
  }

  try {
    await saveFacilitatorApplication(row);
    await notifyNewFacilitator(row);
    return { status: 'success', name: row.name, book: row.book_title };
  } catch {
    return { status: 'error', error: 'server' };
  }
}
