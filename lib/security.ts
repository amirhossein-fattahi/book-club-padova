import 'server-only';
import { createHmac } from 'node:crypto';

export function checkCaptchaConfiguration(env: Record<string, string | undefined> = process.env): string | null {
  const site = Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
  const secret = Boolean(env.TURNSTILE_SECRET_KEY?.trim());
  return site !== secret ? 'CAPTCHA_CONFIGURATION_INVALID' : null;
}

export async function verifyCaptcha(token: string): Promise<boolean> {
  if (checkCaptchaConfiguration()) return false;
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  // Both keys absent is supported: durable DB throttling still protects submissions.
  if (!secret) return true;
  if (!token || token.length > 2048) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(7000)
    });
    if (!response.ok) return false;
    const data = await response.json() as { success?: boolean; hostname?: string };
    const expectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME?.trim().toLowerCase();
    return data.success === true && (!expectedHostname || data.hostname?.toLowerCase() === expectedHostname);
  } catch { return false; }
}

/** HMAC prevents guessing hashed email/IP values if the rate table is exposed. */
export function rateLimitKey(kind: 'email' | 'ip', value: string, secret: string): string {
  return `${kind}:${createHmac('sha256', secret).update(`${kind}:${value}`).digest('hex')}`;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]!);
}
