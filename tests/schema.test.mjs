import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

// PGLITE_MODULE may point at a temporary installation's dist/index.js.
// With the project's dev dependency installed, no environment override is needed.
const moduleName = process.env.PGLITE_MODULE
  ? pathToFileURL(resolve(process.env.PGLITE_MODULE)).href
  : '@electric-sql/pglite';
const { PGlite } = await import(moduleName);
const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
const migration = await readFile(new URL('../supabase/migrations/20261011_recruitment.sql', import.meta.url), 'utf8');
const legacySchema = schema.slice(0, schema.indexOf('-- Current recruitment storage follows below.'));

const roles = ['anon', 'authenticated', 'service_role'];

async function asRole(db, role, operation) {
  assert.ok(roles.includes(role));
  await db.exec(`set role ${role}`);
  try {
    return await operation();
  } finally {
    await db.exec('reset role');
  }
}

async function insertRegistration(db, overrides = {}) {
  const row = {
    role: 'reader', name: 'Test Reader', email: 'member@example.test',
    meeting_language: 'it', locale: 'it', privacy_notice_version: '2026-10-11',
    ...overrides
  };
  return db.query(
    `insert into public.registrations (role, name, email, meeting_language, locale, privacy_notice_version)
     values ($1, $2, $3, $4, $5, $6) returning id, email_normalized, role`,
    [row.role, row.name, row.email, row.meeting_language, row.locale, row.privacy_notice_version]
  );
}

async function expectSqlState(operation, code) {
  await assert.rejects(operation, (error) => {
    assert.equal(error.code, code, error.message);
    return true;
  });
}

async function snapshot(db) {
  const tables = ['registrations', 'registration_rate_limits', 'group_signups', 'facilitator_applications'];
  const result = {};
  for (const table of tables) {
    // All names here are fixed test constants; no input is interpolated.
    result[table] = (await db.query(`select * from public.${table} order by 1`)).rows;
  }
  return result;
}

async function verifySql(t, sql, additive) {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      grant usage on schema public to anon, authenticated, service_role;
      alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    `);
    // The migration must coexist with the existing tables, including their rows.
    if (additive) await db.exec(legacySchema);
    else await db.exec(sql);
    await db.query(
      `insert into public.group_signups (group_id, group_title, name, email, phone)
       values ($1, $2, $3, $4, $5)`,
      ['legacy-circle', 'Legacy Book', 'Legacy Reader', 'legacy-reader@example.test', '+39 000000000']
    );
    await db.query(
      `insert into public.facilitator_applications (name, email, book_title, book_author, motivation, preferred_day)
       values ($1, $2, $3, $4, $5, $6)`,
      ['Legacy Helper', 'legacy-helper@example.test', 'Legacy Book', 'Legacy Author', 'Existing application', 'monday']
    );
    if (additive) await db.exec(sql);

    await t.test('service role can save, with one normalized email per role', async () => {
      await asRole(db, 'service_role', async () => {
        const first = await insertRegistration(db);
        assert.equal(first.rows[0].email_normalized, 'member@example.test');
        await expectSqlState(() => insertRegistration(db, { email: 'MEMBER@EXAMPLE.TEST' }), '23505');
        for (const role of ['facilitator', 'cohost', 'outreach', 'venue']) {
          const helper = await insertRegistration(db, { role, email: 'MEMBER@EXAMPLE.TEST' });
          assert.equal(helper.rows[0].role, role);
        }
        assert.equal((await db.query(`select count(*)::integer as count from public.registrations where email_normalized = $1`, ['member@example.test'])).rows[0].count, 5);
      });
    });

    await t.test('competing inserts cannot create duplicate registrations', async () => {
      await asRole(db, 'service_role', async () => {
        // PGlite has one connection; concurrently submitted calls are queued.
        // This verifies the real Postgres unique index, not multi-session timing.
        const writes = await Promise.allSettled(Array.from({ length: 20 }, (_, index) =>
          insertRegistration(db, { email: index % 2 ? 'CONCURRENT@EXAMPLE.TEST' : 'concurrent@example.test' })
        ));
        assert.equal(writes.filter((result) => result.status === 'fulfilled').length, 1);
        for (const result of writes.filter((entry) => entry.status === 'rejected')) assert.equal(result.reason.code, '23505');
        assert.equal((await db.query(`select count(*)::integer as count from public.registrations where email_normalized = $1`, ['concurrent@example.test'])).rows[0].count, 1);
      });
    });

    await t.test('database rejects invalid role, locale, language, name, and email', async () => {
      await asRole(db, 'service_role', async () => {
        for (const overrides of [
          { role: 'admin' }, { locale: 'xx' }, { meeting_language: 'xx' },
          { name: '   ' }, { name: 'x'.repeat(121) }, { email: 'not-an-email' }
        ]) {
          await expectSqlState(() => insertRegistration(db, { email: 'invalid-fixture@example.test', ...overrides }), '23514');
        }
        for (const [column, maximum] of [
          ['phone', 40], ['availability', 300], ['book_title', 200], ['book_author', 160], ['motivation', 1500]
        ]) {
          await expectSqlState(() => db.query(`update public.registrations set ${column} = $1 where email_normalized = $2`, ['x'.repeat(maximum + 1), 'member@example.test']), '23514');
        }
      });
    });

    await t.test('anonymous and authenticated callers have no contact-table or RPC privileges', async () => {
      for (const role of ['anon', 'authenticated']) {
        const privilege = await db.query(`select has_table_privilege($1, 'public.registrations', 'select') as readable`, [role]);
        assert.equal(privilege.rows[0].readable, false);
        await asRole(db, role, async () => {
          await expectSqlState(() => db.query('select * from public.registrations'), '42501');
          await expectSqlState(() => insertRegistration(db, { email: 'blocked@example.test' }), '42501');
          await expectSqlState(() => db.query('select * from public.registration_rate_limits'), '42501');
          await expectSqlState(() => db.query(`select public.consume_registration_rate_limit($1, 5, 600)`, [`email:${'c'.repeat(64)}`]), '42501');
          await expectSqlState(() => db.query('select public.registration_storage_health()'), '42501');
          assert.equal((await db.query('select * from public.group_signups')).rows.length, 0);
          assert.equal((await db.query('select * from public.facilitator_applications')).rows.length, 0);
        });
      }
    });

    await t.test('row-level security remains effective if a table grant is accidentally added', async () => {
      await db.exec('grant select, insert on public.registrations to anon, authenticated');
      try {
        for (const role of ['anon', 'authenticated']) {
          await asRole(db, role, async () => {
            assert.equal((await db.query('select * from public.registrations')).rows.length, 0);
            await expectSqlState(() => insertRegistration(db, { email: 'rls-blocked@example.test' }), '42501');
          });
        }
      } finally {
        await db.exec('revoke all on public.registrations from anon, authenticated');
      }
    });

    await t.test('persistent rate limiter accepts five attempts and rejects subsequent attempts atomically', async () => {
      await asRole(db, 'service_role', async () => {
        const key = `email:${'a'.repeat(64)}`;
        // now() stays fixed in this transaction, avoiding a clock-window boundary.
        await db.exec('begin');
        try {
          const attempts = await Promise.all(Array.from({ length: 12 }, () =>
            db.query('select public.consume_registration_rate_limit($1, 5, 600) as allowed', [key])
          ));
          assert.deepEqual(attempts.map((result) => result.rows[0].allowed), [true, true, true, true, true, false, false, false, false, false, false, false]);
          assert.equal((await db.query('select attempts from public.registration_rate_limits where key = $1', [key])).rows[0].attempts, 6);
        } finally {
          await db.exec('commit');
        }
        for (const args of [['raw-email@example.test', 5, 600], [key, 0, 600], [key, 5, 1]]) {
          await expectSqlState(() => db.query('select public.consume_registration_rate_limit($1, $2, $3)', args), 'P0001');
        }
      });
    });

    await t.test('rate limiter resets an old window and removes expired anonymous counters', async () => {
      await asRole(db, 'service_role', async () => {
        const previous = `ip:${'b'.repeat(64)}`;
        const expired = `ip:${'d'.repeat(64)}`;
        await db.query(`insert into public.registration_rate_limits (key, window_start, attempts) values ($1, now() - interval '2 hours', 6), ($2, now() - interval '2 days', 9)`, [previous, expired]);
        assert.equal((await db.query('select public.consume_registration_rate_limit($1, 5, 600) as allowed', [previous])).rows[0].allowed, true);
        assert.equal((await db.query('select attempts from public.registration_rate_limits where key = $1', [previous])).rows[0].attempts, 1);
        assert.equal((await db.query('select * from public.registration_rate_limits where key = $1', [expired])).rows.length, 0);
      });
    });

    await t.test('health diagnostics succeed without changing recruitment, limiter, or legacy rows', async () => {
      const before = await snapshot(db);
      await asRole(db, 'service_role', async () => {
        for (let index = 0; index < 3; index++) assert.equal((await db.query('select public.registration_storage_health() as ok')).rows[0].ok, true);
      });
      assert.deepEqual(await snapshot(db), before);
    });

    await t.test('health diagnostics detect missing duplicate protection and disabled RLS', async () => {
      await db.exec('drop index public.registrations_email_role_unique');
      assert.equal((await db.query('select public.registration_storage_health() as ok')).rows[0].ok, false);
      await db.exec(sql);
      await db.exec('alter table public.registrations disable row level security');
      assert.equal((await db.query('select public.registration_storage_health() as ok')).rows[0].ok, false);
      await db.exec('alter table public.registrations enable row level security');
    });

    await t.test('rerunning SQL retains registrations, counters, and all existing legacy entries', async () => {
      const before = await snapshot(db);
      await db.exec(sql);
      assert.deepEqual(await snapshot(db), before);
      assert.equal(before.group_signups.length, 1);
      assert.equal(before.facilitator_applications.length, 1);
      assert.ok(before.registrations.length >= 3);
      assert.equal((await db.query('select public.registration_storage_health() as ok')).rows[0].ok, true);
    });
  } finally {
    await db.close();
  }
}

test('fresh Supabase schema enforces recruitment privacy and integrity', async (t) => {
  await verifySql(t, schema, false);
});

test('additive migration preserves existing tables and enforces recruitment privacy and integrity', async (t) => {
  await verifySql(t, migration, true);
});
