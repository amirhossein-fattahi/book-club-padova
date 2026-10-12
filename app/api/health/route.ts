import { NextResponse } from 'next/server';
import { getRegistrationAvailability } from '@/lib/site';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/** Public readiness only: never return credentials, account IDs or records. */
export async function GET() {
  const { open } = await getRegistrationAvailability();
  return NextResponse.json(
    { status: open ? 'ok' : 'unavailable', registrationOpen: open },
    { status: open ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
