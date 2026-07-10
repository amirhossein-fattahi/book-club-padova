import createNextIntlPlugin from 'next-intl/plugin';

// Points the plugin at our request config (./i18n/request.ts).
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
