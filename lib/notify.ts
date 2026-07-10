import 'server-only';
import type { GroupSignup, FacilitatorApplication } from './db';

/**
 * Best-effort email notifications via Resend (https://resend.com).
 *
 * Sends you an email whenever someone joins a circle or applies to facilitate,
 * so you don't have to watch the database. Entirely optional: if the env vars
 * aren't set, this silently does nothing and never blocks a form submission.
 *
 * Env vars:
 *   RESEND_API_KEY  — from resend.com → API Keys
 *   NOTIFY_EMAIL    — where to send alerts (defaults to the Resend account owner)
 *   NOTIFY_FROM     — sender; defaults to Resend's shared onboarding address
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
const NOTIFY_FROM = process.env.NOTIFY_FROM || 'Circolo del Libro <onboarding@resend.dev>';

async function send(subject: string, html: string) {
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) return; // Not configured — skip quietly.
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_EMAIL],
        subject,
        html
      })
    });
  } catch {
    // Never let a notification failure break the user's submission.
  }
}

const row = (label: string, value: string) =>
  `<tr><td style="padding:4px 12px 4px 0;color:#8f5a39;font-weight:600">${label}</td><td style="padding:4px 0">${value || '—'}</td></tr>`;

export async function notifyNewSignup(s: GroupSignup) {
  const html = `
    <h2 style="font-family:Georgia,serif;color:#2b2320">New member 📖</h2>
    <table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
      ${row('Book', s.group_title)}
      ${row('Name', s.name)}
      ${row('Email', s.email)}
      ${row('Phone', s.phone)}
      ${row('Language', s.locale)}
    </table>`;
  await send(`New member for "${s.group_title}"`, html);
}

export async function notifyNewFacilitator(a: FacilitatorApplication) {
  const html = `
    <h2 style="font-family:Georgia,serif;color:#2b2320">New facilitator application 📚</h2>
    <table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
      ${row('Name', a.name)}
      ${row('Email', a.email)}
      ${row('Book', `${a.book_title} — ${a.book_author}`)}
      ${row('Preferred', `${a.preferred_day} ${a.preferred_time}`)}
      ${row('Language', a.locale)}
    </table>
    <p style="font-family:system-ui,sans-serif;font-size:14px;color:#2b2320">
      <strong>Why this book:</strong><br>${a.motivation}</p>`;
  await send(`New facilitator application: ${a.book_title}`, html);
}
