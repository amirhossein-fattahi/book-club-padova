import 'server-only';
import type { Registration } from './registrations';
import { escapeHtml } from './security';

/** Organizer alerts are optional. A failed alert never changes saved interest. */
export async function notifyNewRegistration(registration: Registration): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const recipient = process.env.NOTIFY_EMAIL?.trim();
  if (!key || !recipient) {
    console.warn('[notify] Organizer alerts disabled: configure RESEND_API_KEY and NOTIFY_EMAIL.');
    return;
  }
  const entries: Array<[string, string]> = [
    ['Role', registration.role], ['Name', registration.name], ['Email', registration.email],
    ['Phone (optional)', registration.phone], ['Meeting language', registration.meeting_language],
    ['Availability', registration.availability], ['Book', registration.book_title],
    ['Author', registration.book_author], ['Message', registration.motivation], ['Site language', registration.locale]
  ];
  const html = `<h2>New Padova book club interest</h2><p>This is an interest submission; no seat is reserved.</p><table>${entries.map(([label, value]) => `<tr><th style="text-align:left;padding:4px 12px 4px 0">${escapeHtml(label)}</th><td style="white-space:pre-wrap">${escapeHtml(value || '—')}</td></tr>`).join('')}</table>`;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM?.trim() || 'Circolo del Libro <onboarding@resend.dev>',
        to: [recipient], subject: `Book club interest: ${registration.role}`, html,
        text: `Interest received; no seat reserved.\n\n${entries.map(([label, value]) => `${label}: ${value || '—'}`).join('\n')}`
      }),
      signal: AbortSignal.timeout(5000)
    });
    // Do not log recipients, submitted content, or provider response bodies.
    if (!response.ok) console.error('[notify] Organizer alert rejected.', { status: response.status });
  } catch { console.error('[notify] Organizer alert unavailable; saved registration remains in storage.'); }
}
