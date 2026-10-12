import 'server-only';
import { checkPersistenceHealth } from './db';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://book-club-padova.vercel.app';

export function getContactEmail(): string | null {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'amirhossein.fattahi98@gmail.com';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function getRegistrationAvailability() {
  const contact = getContactEmail();
  const health = await checkPersistenceHealth();
  return { open: health.status === 'ok' && Boolean(contact), contact, health };
}
