import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../scripts/check-storage.mjs', import.meta.url));

for (const key of ['sb_secret_diagnostic_test_key', 'legacy.diagnostic.jwt']) {
  test(`storage diagnostic sends correct credentials and makes read-only requests (${key.startsWith('sb_') ? 'secret API key' : 'legacy JWT'})`, async (t) => {
    const requests = [];
    const server = createServer((request, response) => {
      requests.push({ method: request.method, url: request.url, headers: request.headers });
      if (request.method === 'HEAD' && request.url.startsWith('/rest/v1/registrations?')) {
        response.writeHead(200, { 'content-range': '*/3' });
        response.end();
      } else if (request.method === 'GET' && request.url === '/rest/v1/rpc/registration_storage_health') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end('true');
      } else {
        response.writeHead(405);
        response.end();
      }
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise((resolve) => server.close(resolve)));
    const directory = await mkdtemp(join(tmpdir(), 'book-club-diagnostic-'));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const child = spawn(process.execPath, [script], {
      cwd: directory,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        SUPABASE_URL: `http://127.0.0.1:${server.address().port}`,
        SUPABASE_SERVICE_ROLE_KEY: key,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: '', TURNSTILE_SECRET_KEY: '',
        RESEND_API_KEY: '', NOTIFY_EMAIL: ''
      },
      timeout: 15000,
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    const exitCode = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', resolve);
    });
    assert.equal(exitCode, 0, stderr);
    assert.deepEqual(JSON.parse(stdout), {
      status: 'ok', code: 'READY', storage: 'supabase', registrationCount: 3,
      captcha: 'disabled', organizerAlerts: 'disabled'
    });
    assert.equal(stdout.includes(key), false);
    assert.deepEqual(requests.map((request) => request.method), ['HEAD', 'GET']);
    for (const request of requests) {
      assert.equal(request.headers.apikey, key);
      assert.equal(request.headers.authorization, key.startsWith('sb_secret_') ? undefined : `Bearer ${key}`);
    }
  });
}
