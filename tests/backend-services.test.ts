import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { checkPersistenceConfiguration, checkPersistenceHealth, consumeRegistrationRateLimit, saveRegistration } from '../lib/db';
import { notifyNewRegistration } from '../lib/notify';
import { checkCaptchaConfiguration, escapeHtml, rateLimitKey, verifyCaptcha } from '../lib/security';
import { PRIVACY_NOTICE_VERSION, type Registration } from '../lib/registrations';

const registration: Registration = {
  role: 'reader', name: 'Test Reader', email: 'test@example.invalid', phone: '', meeting_language: 'either',
  availability: '', book_title: '', book_author: '', motivation: '', locale: 'it', privacy_notice_version: PRIVACY_NOTICE_VERSION
};

function setEnvironment(t: TestContext, overrides: Record<string, string | undefined> = {}) {
  const variables: Record<string, string | undefined> = {
    NODE_ENV: 'production', SUPABASE_URL: 'https://unit-test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'unit-test-server-secret',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: undefined, TURNSTILE_SECRET_KEY: undefined, TURNSTILE_EXPECTED_HOSTNAME: undefined,
    RATE_LIMIT_SECRET: 'unit-test-rate-secret', RESEND_API_KEY: undefined, NOTIFY_EMAIL: undefined, NOTIFY_FROM: undefined,
    ...overrides
  };
  const original = Object.fromEntries(Object.keys(variables).map((name) => [name, process.env[name]]));
  for (const [name, value] of Object.entries(variables)) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
  t.after(() => {
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  });
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}

test('database config distinguishes local dev, absent production config, placeholders and bad URLs', () => {
  assert.equal(checkPersistenceConfiguration({ NODE_ENV: 'development' }), null);
  assert.equal(checkPersistenceConfiguration({ NODE_ENV: 'production' }), 'DATABASE_NOT_CONFIGURED');
  assert.equal(checkPersistenceConfiguration({ NODE_ENV: 'production', SUPABASE_URL: 'https://example.supabase.co' }), 'DATABASE_CONFIGURATION_INVALID');
  assert.equal(checkPersistenceConfiguration({ SUPABASE_URL: 'https://YOUR-PROJECT-ref.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'YOUR-SECRET-KEY' }), 'DATABASE_CONFIGURATION_INVALID');
  assert.equal(checkPersistenceConfiguration({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'sb_publishable_wrong_key' }), 'DATABASE_CONFIGURATION_INVALID');
  assert.equal(checkPersistenceConfiguration({ NODE_ENV: 'production', SUPABASE_URL: 'http://localhost:54321', SUPABASE_SERVICE_ROLE_KEY: 'test' }), 'DATABASE_CONFIGURATION_INVALID');
  assert.equal(checkPersistenceConfiguration({ NODE_ENV: 'development', SUPABASE_URL: 'http://localhost:54321', SUPABASE_SERVICE_ROLE_KEY: 'test' }), null);
  assert.equal(checkPersistenceConfiguration({ SUPABASE_URL: 'https://example.supabase.co/rest/v1', SUPABASE_SERVICE_ROLE_KEY: 'test' }), 'DATABASE_CONFIGURATION_INVALID');
});

test('production without DB cannot silently write to local JSON', async (t) => {
  setEnvironment(t, { SUPABASE_URL: undefined, SUPABASE_SERVICE_ROLE_KEY: undefined });
  await assert.rejects(saveRegistration(registration), { code: 'DATABASE_NOT_CONFIGURED' });
  await assert.rejects(consumeRegistrationRateLimit(registration.email), { code: 'DATABASE_NOT_CONFIGURED' });
  assert.deepEqual(await checkPersistenceHealth(), { status: 'error', storage: 'unconfigured', code: 'DATABASE_NOT_CONFIGURED' });
});

test('database saves are bounded, report duplicates, and sanitize provider errors', async (t) => {
  setEnvironment(t);
  let next = new Response(null, { status: 201 });
  let method: string | undefined;
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => {
    assert.ok(init?.signal);
    method = init?.method;
    return next;
  });
  assert.equal(await saveRegistration(registration), 'submitted');
  assert.equal(method, 'POST');
  next = json({ code: '23505', message: 'Private email must never reach errors' }, 409);
  assert.equal(await saveRegistration(registration), 'duplicate');
  next = json({ code: '42P01', message: 'Private database details' }, 404);
  await assert.rejects(saveRegistration(registration), { code: 'DATABASE_SCHEMA_MISSING', message: 'DATABASE_SCHEMA_MISSING' });
});

test('health reads headers/schema and read-only RPC; returns no registration contents', async (t) => {
  setEnvironment(t);
  const methods: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string, init?: RequestInit) => {
    methods.push(init?.method ?? 'GET');
    return url.includes('/rpc/') ? json(true) : new Response(null, { status: 200 });
  });
  assert.deepEqual(await checkPersistenceHealth(), { status: 'ok', storage: 'supabase' });
  assert.equal(methods[0], 'HEAD');
  assert.equal(methods.length, 2);
});

test('new secret API keys use apikey only and legacy JWT keys keep Bearer', async (t) => {
  setEnvironment(t, { SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_unit_test_key' });
  const seen: Headers[] = [];
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => {
    seen.push(new Headers(init?.headers));
    return new Response(null, { status: 201 });
  });
  assert.equal(await saveRegistration(registration), 'submitted');
  assert.equal(seen[0].get('apikey'), 'sb_secret_unit_test_key');
  assert.equal(seen[0].has('Authorization'), false);
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'legacy.unit.test';
  assert.equal(await saveRegistration(registration), 'submitted');
  assert.equal(seen[1].get('apikey'), 'legacy.unit.test');
  assert.equal(seen[1].get('Authorization'), 'Bearer legacy.unit.test');
});

test('health rejects missing private rate-limit schema even when table is reachable', async (t) => {
  setEnvironment(t);
  t.mock.method(globalThis, 'fetch', async (url: string) => url.includes('/rpc/') ? json({ code: 'PGRST202' }, 404) : new Response(null, { status: 200 }));
  assert.deepEqual(await checkPersistenceHealth(), { status: 'error', storage: 'supabase', code: 'RATE_LIMIT_SCHEMA_MISSING' });
});

test('durable rate limit sends HMAC keys only, checks email+trusted IP and fails closed', async (t) => {
  setEnvironment(t);
  const calls: Array<{ p_key: string; p_limit: number; p_window_seconds: number }> = [];
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => {
    const parameters = JSON.parse(init?.body as string);
    calls.push(parameters);
    return json(parameters.p_limit === 5);
  });
  assert.equal(await consumeRegistrationRateLimit('test@example.invalid', '203.0.113.20'), false);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].p_limit, 5);
  assert.equal(calls[1].p_limit, 20);
  assert.equal(calls[0].p_window_seconds, 600);
  assert.match(calls[0].p_key, /^email:[a-f0-9]{64}$/);
  assert.match(calls[1].p_key, /^ip:[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(calls).includes('test@example.invalid'), false);
  assert.equal(JSON.stringify(calls).includes('203.0.113.20'), false);
});

test('CAPTCHA paired configuration, one-use tokens, hostname and external failures are enforced', async (t) => {
  assert.equal(checkCaptchaConfiguration({}), null);
  assert.equal(checkCaptchaConfiguration({ NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site' }), 'CAPTCHA_CONFIGURATION_INVALID');
  setEnvironment(t, { NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site', TURNSTILE_SECRET_KEY: 'secret', TURNSTILE_EXPECTED_HOSTNAME: 'book.example.invalid' });
  let response = json({ success: true, hostname: 'book.example.invalid' });
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => { calls++; assert.ok(init?.signal); return response; });
  assert.equal(await verifyCaptcha(''), false);
  assert.equal(await verifyCaptcha('x'.repeat(2049)), false);
  assert.equal(calls, 0);
  assert.equal(await verifyCaptcha('fresh-token'), true);
  response = json({ success: false, 'error-codes': ['timeout-or-duplicate'] });
  assert.equal(await verifyCaptcha('same-token'), false);
  response = json({ success: true, hostname: 'wrong.example.invalid' });
  assert.equal(await verifyCaptcha('fresh-token'), false);
  response = json({ success: true, hostname: 'book.example.invalid' }, 500);
  assert.equal(await verifyCaptcha('fresh-token'), false);
});

test('optional CAPTCHA disabled mode does not call Cloudflare', async (t) => {
  setEnvironment(t);
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw Error('Unexpected external request'); });
  assert.equal(await verifyCaptcha(''), true);
  assert.equal(fetch.mock.callCount(), 0);
});

test('organizer HTML escapes user text and logs no submitted PII/provider error body', async (t) => {
  setEnvironment(t, { RESEND_API_KEY: 'test-resend-key', NOTIFY_EMAIL: 'organizer@example.invalid' });
  let request: { html: string; subject: string; to: string[] } | undefined;
  const logged: unknown[] = [];
  t.mock.method(console, 'error', (...values: unknown[]) => { logged.push(...values); });
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init?: RequestInit) => {
    assert.ok(init?.signal);
    request = JSON.parse(init?.body as string);
    return json({ message: 'PRIVATE-PROVIDER-BODY' }, 403);
  });
  await notifyNewRegistration({ ...registration, name: '<a href="https://evil.invalid">Bad link</a>', motivation: '<img src=x onerror=bad()>' });
  assert.ok(request?.html.includes('&lt;a href=&quot;https://evil.invalid&quot;&gt;'));
  assert.equal(request?.html.includes('<a href="https://evil.invalid">'), false);
  assert.equal(request?.html.includes('<img src=x'), false);
  assert.equal(request?.subject, 'Book club interest: reader');
  const output = JSON.stringify(logged);
  assert.equal(output.includes('PRIVATE-PROVIDER-BODY'), false);
  assert.equal(output.includes('test@example.invalid'), false);
  assert.equal(output.includes('organizer@example.invalid'), false);
});

test('escaping and HMAC protect content and separate email/IP rate namespaces', () => {
  assert.equal(escapeHtml('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
  assert.notEqual(rateLimitKey('email', 'same', 'secret'), rateLimitKey('ip', 'same', 'secret'));
  assert.notEqual(rateLimitKey('email', 'same', 'secret'), rateLimitKey('email', 'same', 'other-secret'));
});
