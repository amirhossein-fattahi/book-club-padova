# Circolo del Libro — Padua Book Club

A bilingual (English 🇬🇧 / Italian 🇮🇹) website for a local book club in Padua, built with
**Next.js (App Router)**, **Tailwind CSS**, and **next-intl**, with a **Supabase** database
and optional **Resend** email notifications.

Small reading groups, each focused on a single book and led by a **Facilitator**. Readers
can join an existing circle or apply to lead their own.

- 🌐 **Live site:** https://book-club-padova.vercel.app  ( 🇬🇧 [/en](https://book-club-padova.vercel.app/en) · 🇮🇹 [/it](https://book-club-padova.vercel.app/it) )
- 💻 **Repository:** https://github.com/amirhossein-fattahi/book-club-padova

> Hosted free on Vercel. Every push to `main` auto-deploys.

## Features

- **Homepage** — hero with the concept, a "how it works" section (Choose a book → Join a group → Meet at our cafés), and two calls-to-action.
- **Explore Groups** — responsive grid of active circles. Each card shows the book cover, title, author, facilitator, meeting day/time, café location, and remaining seats, plus a **Join Group** button with a modal form (name, email, phone).
- **Become a Facilitator** — explains the role and perks, with an application form (name, email, book proposal, motivation, preferred day/time).
- **Working forms** — submissions are validated server-side (Next.js server actions), saved to **Supabase** (Postgres), and protected by a honeypot against spam.
- **Email on signup** *(optional)* — get an email the moment someone joins or applies, via Resend. Disabled automatically if not configured.
- **i18n** — full English/Italian translations via `next-intl`, with a language toggle in the navbar. Routes are locale-prefixed (`/en`, `/it`).
- **QR code** — a print-ready QR for the live site lives in `public/qr-code.svg` (vector, best for posters) and `public/qr-code.png`.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| i18n | next-intl (EN / IT) |
| Database | Supabase (Postgres) |
| Email | Resend (optional) |
| Hosting | Vercel (free tier) |

## Getting started (local)

```bash
cd book-club-padova
npm install
cp .env.example .env.local   # optional — fill in Supabase values to use the real DB
npm run dev                  # http://localhost:3000  (redirects to /en or /it)
```

Without `.env.local`, forms still work locally and write to `.data/*.json` so you can test
the full flow. With it, they write to Supabase.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | for the live DB | Your project URL, e.g. `https://xxxx.supabase.co` (no `/rest/v1`) |
| `SUPABASE_SERVICE_ROLE_KEY` | for the live DB | Supabase **secret** key (`sb_secret_…`) — server-only |
| `RESEND_API_KEY` | optional | Enables email-on-signup (from resend.com) |
| `NOTIFY_EMAIL` | optional | Where signup alerts are sent |

Set these in **Vercel → Settings → Environment Variables** for production, and in
`.env.local` for local dev. Never commit `.env.local`.

## Editing content

- **Books / groups** — edit `data/groups.ts` (title, author, facilitator, café, day/time,
  seats, cover colors). You can edit it directly on GitHub (✏️ → commit) and it auto-deploys.
- **Text & wording** — edit `messages/en.json` and `messages/it.json` (edit both languages).
- **Homepage stats / taglines** — in `app/[locale]/page.tsx`.

## Project structure

```
book-club-padova/
├── app/
│   ├── actions.ts              # Server actions: validate + save + notify
│   └── [locale]/
│       ├── layout.tsx          # <html>, navbar, footer, i18n provider
│       ├── page.tsx            # Homepage
│       ├── groups/page.tsx     # Explore Groups
│       └── facilitator/page.tsx# Become a Facilitator
├── components/                 # Navbar, LanguageToggle, GroupCard, modal, forms…
├── data/groups.ts              # Active groups (edit this to change the books)
├── lib/
│   ├── db.ts                   # Supabase writes (+ dev local-file fallback)
│   └── notify.ts               # Resend email notifications (optional)
├── i18n/                       # next-intl routing / navigation / request config
├── messages/{en,it}.json       # Translation strings
├── supabase/schema.sql         # Database tables (run once in Supabase)
├── scripts/generate-qr.mjs     # Regenerate the QR code for a URL
├── public/qr-code.{svg,png}    # Print-ready QR for the live site
├── middleware.ts               # Locale detection & redirects
├── DEPLOY.md                   # Step-by-step Supabase + Vercel + domain guide
└── tailwind.config.ts
```

## Deployment

Already deployed on Vercel. For the full step-by-step (Supabase setup, env vars, custom
`.it` domain), see **[DEPLOY.md](DEPLOY.md)**. In short:

1. Create a free **Supabase** project → run `supabase/schema.sql` → copy the URL + secret key.
2. Import this repo on **Vercel** (Root Directory `./`) → add the env vars → **Deploy**.
3. Every subsequent `git push` to `main` redeploys automatically.

Viewing submissions: **Supabase → Table Editor → `group_signups` / `facilitator_applications`**.

## Regenerating the QR code

If the live URL changes:

```bash
node scripts/generate-qr.mjs "https://your-new-url/it"
```

## Adding a language

1. Add the locale to `i18n/routing.ts` (`locales` array).
2. Create `messages/<locale>.json` (copy `en.json` and translate).
3. The navbar toggle picks it up automatically.
