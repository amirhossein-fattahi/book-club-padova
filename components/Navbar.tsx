'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageToggle from './LanguageToggle';

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6 text-clay-600"
      aria-hidden="true"
    >
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11a2 2 0 0 1 2 2v13a1.6 1.6 0 0 0-1.2-.55H5.5A1.5 1.5 0 0 1 4 17V5.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13a2 2 0 0 0-2 2v13a1.6 1.6 0 0 1 1.2-.55h6.3A1.5 1.5 0 0 0 20 17V5.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: t('home') },
    { href: '/groups', label: t('groups') },
    { href: '/facilitator', label: t('facilitator') },
    { href: '/contact', label: t('contact') }
  ] as const;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-clay-100 bg-parchment/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <BookIcon />
          <span className="font-serif text-lg font-bold text-ink">
            {t('brand')}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-clay-100 text-clay-800'
                  : 'text-ink/70 hover:bg-clay-50 hover:text-ink'
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-3">
            <LanguageToggle />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={t('menu')}
            className="rounded-md p-2 text-ink hover:bg-clay-100"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-clay-100 bg-parchment md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={[
                  'rounded-lg px-3 py-3 text-sm font-medium',
                  isActive(link.href)
                    ? 'bg-clay-100 text-clay-800'
                    : 'text-ink/80 hover:bg-clay-50'
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
