import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRecruitmentHandler, FIELD_LIMITS, PRIVACY_NOTICE_VERSION, REGISTRATION_ROLES, RegistrationStorageError, validateRegistration, type Registration } from '../lib/registrations';

function form(values: Record<string, string> = {}): FormData {
  const data = new FormData();
  for (const [field, value] of Object.entries({ name: 'Test Reader', email: 'TEST@example.invalid', role: 'reader', meetingLanguage: 'either', locale: 'it', ...values })) data.set(field, value);
  return data;
}

test('all supported roles accept minimal interest, normalize email and stamp notice version', () => {
  for (const role of REGISTRATION_ROLES) {
    const { registration, fieldErrors } = validateRegistration(form({ role }));
    assert.deepEqual(fieldErrors, {});
    assert.equal(registration?.email, 'test@example.invalid');
    assert.equal(registration?.phone, '');
    assert.equal(registration?.privacy_notice_version, PRIVACY_NOTICE_VERSION);
    assert.equal(registration?.role, role);
  }
});

test('forged enums, bad contacts, files and overlong text are rejected with bounded echoes', () => {
  const invalid = form({ role: 'admin', locale: 'fr', meetingLanguage: 'all', email: 'x@', phone: 'abc', why: 'x'.repeat(1501) });
  invalid.set('name', new Blob(['x']), 'not-a-name.txt');
  invalid.set('cf-turnstile-response', 'never-echo-this');
  const result = validateRegistration(invalid);
  assert.equal(result.registration, undefined);
  for (const field of ['role', 'locale', 'meetingLanguage', 'email', 'phone', 'name']) assert.equal(result.fieldErrors[field], 'invalid');
  assert.equal(result.fieldErrors.why, 'tooLong');
  assert.equal(result.fields.why.length, FIELD_LIMITS.why);
  assert.equal(result.fields['cf-turnstile-response'], undefined);
});

test('field validation happens before CAPTCHA so corrections do not consume a token', async () => {
  let verifications = 0;
  const handle = createRecruitmentHandler({
    checkConfiguration: () => null,
    verifyCaptcha: async () => { verifications++; return true; },
    consumeRateLimit: async () => true,
    save: async () => 'submitted', notify: async () => undefined
  });
  const result = await handle(form({ email: 'bad' }));
  assert.equal(result.error, 'invalid');
  assert.equal(result.fields?.name, 'Test Reader');
  assert.equal(verifications, 0);
});

test('honeypot does not persist, notify or verify', async () => {
  const unexpected = async (): Promise<never> => { throw Error('Should not be called'); };
  const handle = createRecruitmentHandler({ checkConfiguration: () => null, verifyCaptcha: unexpected, consumeRateLimit: unexpected, save: unexpected, notify: unexpected });
  assert.deepEqual(await handle(form({ company: 'bot' })), { status: 'success' });
});

test('duplicate normalized email+role has stable success and no repeated notification', async () => {
  const stored = new Set<string>();
  let notifications = 0;
  const handle = createRecruitmentHandler({
    checkConfiguration: () => null, verifyCaptcha: async () => true, consumeRateLimit: async () => true,
    save: async (row) => { const key = `${row.email}:${row.role}`; if (stored.has(key)) return 'duplicate'; stored.add(key); return 'submitted'; },
    notify: async () => { notifications++; }
  });
  assert.equal((await handle(form())).duplicate, false);
  assert.equal((await handle(form({ email: 'test@EXAMPLE.invalid' }))).duplicate, true);
  assert.equal((await handle(form({ role: 'cohost' }))).duplicate, false);
  assert.equal(stored.size, 2);
  assert.equal(notifications, 2);
});

test('storage failure preserves input and reports error instead of fabricated success', async () => {
  let notifications = 0;
  const handle = createRecruitmentHandler({
    checkConfiguration: () => null, verifyCaptcha: async () => true, consumeRateLimit: async () => true,
    save: async () => { throw new RegistrationStorageError('DATABASE_UNREACHABLE'); },
    notify: async () => { notifications++; }
  });
  const result = await handle(form({ availability: 'Tuesday evening' }));
  assert.equal(result.status, 'error');
  assert.equal(result.error, 'server');
  assert.equal(result.fields?.availability, 'Tuesday evening');
  assert.equal(notifications, 0);
});

test('failed optional organizer notification never turns a saved registration into failure', async () => {
  let saved: Registration | undefined;
  const handle = createRecruitmentHandler({
    checkConfiguration: () => null, verifyCaptcha: async () => true, consumeRateLimit: async () => true,
    save: async (row) => { saved = row; return 'submitted'; },
    notify: async () => { throw Error('Unavailable'); }
  });
  assert.equal((await handle(form())).status, 'success');
  assert.equal(saved?.role, 'reader');
});

test('captcha, configuration and persistent throttle failures cannot reach persistence', async () => {
  for (const expected of ['configuration', 'captcha', 'rateLimit'] as const) {
    let writes = 0;
    const handle = createRecruitmentHandler({
      checkConfiguration: () => expected === 'configuration' ? 'DATABASE_NOT_CONFIGURED' : null,
      verifyCaptcha: async () => expected !== 'captcha',
      consumeRateLimit: async () => expected !== 'rateLimit',
      save: async () => { writes++; return 'submitted'; }, notify: async () => undefined
    });
    assert.equal((await handle(form())).error, expected);
    assert.equal(writes, 0);
  }
});
