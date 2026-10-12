import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getContactEmail } from '@/lib/site';

export default function Footer() {
  const t = useTranslations('Footer');
  const nav = useTranslations('Nav');
  const year = new Date().getFullYear();
  const contact = getContactEmail();

  return (
    <footer className="mt-16 border-t border-clay-100 bg-parchment/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-serif text-lg font-bold text-ink">
              {nav('brand')}
            </p>
            <p className="mt-2 text-sm text-ink/60">{t('tagline')}</p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/" className="text-ink/70 hover:text-clay-700">
              {nav('home')}
            </Link>
            <Link href="/groups" className="text-ink/70 hover:text-clay-700">
              {nav('groups')}
            </Link>
            <Link
              href="/facilitator"
              className="text-ink/70 hover:text-clay-700"
            >
              {nav('facilitator')}
            </Link>
            <Link href="/contact" className="text-ink/70 hover:text-clay-700">{t('contact')}</Link>
            <Link href="/privacy" className="text-ink/70 hover:text-clay-700">{t('privacy')}</Link>
            {contact && <a href={'mailto:' + contact} className="break-all text-ink/70 hover:text-clay-700">{contact}</a>}
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-1 border-t border-clay-100 pt-6 text-xs text-ink/50 sm:flex-row sm:justify-between">
          <span>
            © {year} {nav('brand')} · Padova. {t('rights')}
          </span>
          <span>{t('madeWith')}</span>
        </div>
      </div>
    </footer>
  );
}
