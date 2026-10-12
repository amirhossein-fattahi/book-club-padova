import assert from 'node:assert/strict';
import { test } from 'node:test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkLocalStorage, saveLocalRegistration } from '../lib/local-storage';
import { PRIVACY_NOTICE_VERSION, type Registration } from '../lib/registrations';

function row(email: string): Registration {
  return { name: 'Test Reader', email, role: 'reader', phone: '', meeting_language: 'either', locale: 'it', availability: '', book_title: '', book_author: '', motivation: '', privacy_notice_version: PRIVACY_NOTICE_VERSION };
}

test('concurrent development writes preserve every unique registration and deduplicate retries', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'padova-registration-test-'));
  try {
    const outcomes = await Promise.all(Array.from({ length: 25 }, (_, index) => saveLocalRegistration(directory, row(`test-${index}@example.invalid`))));
    assert.equal(outcomes.filter((value) => value === 'submitted').length, 25);
    const repeats = await Promise.all(Array.from({ length: 5 }, () => saveLocalRegistration(directory, row('test-0@example.invalid'))));
    assert.deepEqual(repeats, Array(5).fill('duplicate'));
    const rows = JSON.parse(await fs.readFile(path.join(directory, 'registrations.json'), 'utf8'));
    assert.equal(rows.length, 25);
    assert.equal(new Set(rows.map((value: { id: string }) => value.id)).size, 25);
    assert.deepEqual(await fs.readdir(directory), ['registrations.json']);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('corrupt/non-array local files are preserved and block success', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'padova-registration-test-'));
  const target = path.join(directory, 'registrations.json');
  try {
    for (const corrupt of ['{invalid JSON', '{"email":"not an array"}', '[null]']) {
      await fs.writeFile(target, corrupt);
      await assert.rejects(saveLocalRegistration(directory, row('test@example.invalid')), { code: 'LOCAL_STORAGE_CORRUPT' });
      await assert.rejects(checkLocalStorage(directory), { code: 'LOCAL_STORAGE_CORRUPT' });
      assert.equal(await fs.readFile(target, 'utf8'), corrupt);
    }
    // Failure releases the queue, allowing a deliberately repaired file to work.
    await fs.writeFile(target, '[]');
    assert.equal(await saveLocalRegistration(directory, row('test@example.invalid')), 'submitted');
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
