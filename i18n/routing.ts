import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // The two locales this site supports.
  locales: ['en', 'it'],

  // Used when no locale matches (and as the "root" default).
  defaultLocale: 'en'
});

export type Locale = (typeof routing.locales)[number];
