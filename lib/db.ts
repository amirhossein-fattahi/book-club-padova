import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import path from 'node:path';
import { RegistrationStorageError, type Registration } from './registrations';
import { checkLocalStorage, saveLocalRegistration } from './local-storage';
import { checkCaptchaConfiguration, rateLimitKey } from './security';

export function checkPersistenceConfiguration(env: Record<string, string | undefined> = process.env): string | null {
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url && !key) return env.NODE_ENV === 'production' ? 'DATABASE_NOT_CONFIGURED' : null;
  if (!url || !key || key.startsWith('sb_publishable_') || /YOUR[-_]|changeme|placeholder/i.test(`${url} ${key}`)) return 'DATABASE_CONFIGURATION_INVALID';
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) return 'DATABASE_CONFIGURATION_INVALID';
    if (parsed.protocol !== 'https:' && !(env.NODE_ENV !== 'production' && parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname))) return 'DATABASE_CONFIGURATION_INVALID';
  } catch { return 'DATABASE_CONFIGURATION_INVALID'; }
  return null;
}

let cached: { url: string; key: string; client: SupabaseClient } | undefined;
function getSupabase(): SupabaseClient | null {
  const code = checkPersistenceConfiguration();
  if (code) throw new RegistrationStorageError(code);
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  if (!cached || cached.url !== url || cached.key !== key) {
    cached = { url, key, client: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        // Secret API keys belong in apikey; only legacy JWTs use Bearer.
        if (key.startsWith('sb_secret_') && headers.get('Authorization') === `Bearer ${key}`) {
          headers.delete('Authorization');
        }
        return fetch(input, {
          ...init,
          headers,
          signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000)
        });
      } }
    }) };
  }
  return cached.client;
}

function storageCode(code?: string): string {
  return ['42P01', '42703', 'PGRST204', 'PGRST205'].includes(code ?? '') ? 'DATABASE_SCHEMA_MISSING' : 'DATABASE_UNREACHABLE';
}

export async function saveRegistration(registration: Registration): Promise<'submitted' | 'duplicate'> {
  const supabase = getSupabase();
  if (!supabase) return saveLocalRegistration(path.join(process.cwd(), '.data'), registration);
  const { error } = await supabase.from('registrations').insert({ ...registration, status: 'new' });
  if (error?.code === '23505') return 'duplicate';
  if (error) throw new RegistrationStorageError(storageCode(error.code));
  return 'submitted';
}

// Local throttling is explicitly development-only. Production always uses Postgres.
const localLimits = new Map<string, { count: number; expires: number }>();
export async function consumeRegistrationRateLimit(email: string, trustedIp?: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    const now = Date.now();
    for (const [key, entry] of localLimits) if (entry.expires <= now) localLimits.delete(key);
    const entry = localLimits.get(email) ?? { count: 0, expires: now + 600_000 };
    entry.count += 1; localLimits.set(email, entry);
    return entry.count <= 5;
  }
  const secret = process.env.RATE_LIMIT_SECRET?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  const limits: Array<[string, number]> = [[rateLimitKey('email', email, secret), 5]];
  if (trustedIp) limits.push([rateLimitKey('ip', trustedIp, secret), 20]);
  for (const [key, limit] of limits) {
    const { data, error } = await supabase.rpc('consume_registration_rate_limit', {
      p_key: key, p_limit: limit, p_window_seconds: 600
    });
    if (error) throw new RegistrationStorageError(['42883', '42P01', 'PGRST202'].includes(error.code) ? 'RATE_LIMIT_SCHEMA_MISSING' : 'DATABASE_UNREACHABLE');
    if (data !== true) return false;
  }
  return true;
}

export interface PersistenceHealth {
  status: 'ok' | 'error';
  storage: 'supabase' | 'local' | 'unconfigured';
  code?: string;
}

/** Read-only checks; returns no credentials, contact details, or record contents. */
export async function checkPersistenceHealth(): Promise<PersistenceHealth> {
  const code = checkPersistenceConfiguration() ?? checkCaptchaConfiguration();
  if (code) return { status: 'error', storage: 'unconfigured', code };
  try {
    const supabase = getSupabase();
    if (!supabase) {
      await checkLocalStorage(path.join(process.cwd(), '.data'));
      return { status: 'ok', storage: 'local' };
    }
    const { error } = await supabase.from('registrations').select('id,created_at,role,name,email,email_normalized,phone,meeting_language,availability,book_title,book_author,motivation,locale,status,privacy_notice_version', { head: true });
    if (error) return { status: 'error', storage: 'supabase', code: storageCode(error.code) };
    const { data, error: healthError } = await supabase.rpc('registration_storage_health');
    if (healthError || data !== true) return { status: 'error', storage: 'supabase', code: 'RATE_LIMIT_SCHEMA_MISSING' };
    return { status: 'ok', storage: 'supabase' };
  } catch (error) {
    return { status: 'error', storage: process.env.SUPABASE_URL ? 'supabase' : 'local', code: error instanceof RegistrationStorageError ? error.code : 'DATABASE_UNREACHABLE' };
  }
}
