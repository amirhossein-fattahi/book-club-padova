#!/usr/bin/env node
// Read-only diagnosis. Never print secret values or individual registrations.
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', { info() {}, error() {} });

function finish(status, code, extras = {}) {
  console.log(JSON.stringify({ status, code, ...extras }, null, 2));
  process.exitCode = status === 'ok' ? 0 : 1;
}

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const siteKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
const captchaSecret = Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());

if (!url || !key) {
  finish('error', !url && !key ? 'DATABASE_NOT_CONFIGURED' : 'DATABASE_CONFIGURATION_INVALID', {
    nextStep: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the deployment environment; redeploy.'
  });
} else if (key.startsWith('sb_publishable_') || /YOUR[-_]|changeme|placeholder/i.test(`${url} ${key}`)) {
  finish('error', 'DATABASE_CONFIGURATION_INVALID', { nextStep: 'Replace example values with the real server-only Supabase settings.' });
} else {
  let validUrl = false;
  try {
    const parsed = new URL(url);
    validUrl = !parsed.username && !parsed.password && !parsed.search && !parsed.hash && ['', '/'].includes(parsed.pathname) &&
      (parsed.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)));
  } catch { /* Invalid URL is reported without echoing it. */ }
  if (!validUrl) finish('error', 'DATABASE_CONFIGURATION_INVALID', { nextStep: 'Use the root Supabase project URL, with HTTPS for production.' });
  else if (siteKey !== captchaSecret) finish('error', 'CAPTCHA_CONFIGURATION_INVALID', { nextStep: 'Set both Turnstile keys together, or remove both. Redeploy after changing them.' });
  else {
    try {
      // New sb_secret_* keys are API keys, not JWT bearer tokens.
      const headers = {
        apikey: key,
        ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }),
        Prefer: 'count=exact'
      };
      const columns = 'id,created_at,role,name,email,email_normalized,phone,meeting_language,availability,book_title,book_author,motivation,locale,status,privacy_notice_version';
      const tableUrl = `${url.replace(/\/$/, '')}/rest/v1/registrations?select=${columns}`;
      const response = await fetch(tableUrl, { method: 'HEAD', headers, signal: AbortSignal.timeout(8000) });
      if (!response.ok) {
        finish('error', [400, 404].includes(response.status) ? 'DATABASE_SCHEMA_MISSING' : 'DATABASE_UNREACHABLE', {
          httpStatus: response.status,
          nextStep: [400, 404].includes(response.status) ? 'Run supabase/schema.sql in the Supabase SQL Editor.' : 'Check project status, server key and network connectivity.'
        });
      } else {
        const health = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/registration_storage_health`, {
          headers, signal: AbortSignal.timeout(8000)
        });
        if (!health.ok || await health.json() !== true) {
          finish('error', 'RATE_LIMIT_SCHEMA_MISSING', { nextStep: 'Run supabase/schema.sql; the private rate limiter and health RPC are required.' });
        } else {
          const rawCount = response.headers.get('content-range')?.split('/').pop();
          const count = rawCount && /^\d+$/.test(rawCount) ? Number(rawCount) : null;
          finish('ok', 'READY', { storage: 'supabase', registrationCount: count, captcha: siteKey ? 'configured' : 'disabled', organizerAlerts: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) ? 'configured (delivery untested)' : 'disabled' });
        }
      }
    } catch {
      finish('error', 'DATABASE_UNREACHABLE', { nextStep: 'Check Supabase project status and connectivity, then retry. No registration was submitted.' });
    }
  }
}
