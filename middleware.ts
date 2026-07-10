import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Handles locale detection + redirects (e.g. "/" -> "/en", "/groups" -> "/en/groups").
export default createMiddleware(routing);

export const config = {
  // Match all paths except Next internals, API routes, and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
