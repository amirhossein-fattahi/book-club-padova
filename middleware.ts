import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Detects a visitor's language; Italian is the fallback when none matches.
export default createMiddleware(routing);

export const config = {
  // Match all paths except Next internals, API routes, and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
