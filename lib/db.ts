import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Server-side data layer for form submissions.
 *
 * In production it writes to Supabase (Postgres). When Supabase env vars are
 * not configured (e.g. local development before you've set things up), it falls
 * back to appending to a local JSON file so the forms still work end-to-end.
 */

export interface GroupSignup {
  group_id: string;
  group_title: string;
  name: string;
  email: string;
  phone: string;
  locale: string;
}

export interface FacilitatorApplication {
  name: string;
  email: string;
  book_title: string;
  book_author: string;
  motivation: string;
  preferred_day: string;
  preferred_time: string;
  locale: string;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cached: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!cached) {
    cached = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
  }
  return cached;
}

/** Dev-only fallback so submissions are visible without a database configured. */
async function appendLocal(file: string, row: unknown) {
  if (process.env.NODE_ENV === 'production') {
    // No writable filesystem on serverless; a real DB must be configured.
    throw new Error('DATABASE_NOT_CONFIGURED');
  }
  const dir = path.join(process.cwd(), '.data');
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, file);
  let existing: unknown[] = [];
  try {
    existing = JSON.parse(await fs.readFile(target, 'utf8'));
  } catch {
    existing = [];
  }
  existing.push({ ...(row as object), created_at: new Date().toISOString() });
  await fs.writeFile(target, JSON.stringify(existing, null, 2), 'utf8');
}

export async function saveGroupSignup(row: GroupSignup) {
  const supabase = getSupabase();
  if (!supabase) return appendLocal('group_signups.json', row);
  const { error } = await supabase.from('group_signups').insert(row);
  if (error) throw new Error(error.message);
}

export async function saveFacilitatorApplication(row: FacilitatorApplication) {
  const supabase = getSupabase();
  if (!supabase) return appendLocal('facilitator_applications.json', row);
  const { error } = await supabase
    .from('facilitator_applications')
    .insert(row);
  if (error) throw new Error(error.message);
}
