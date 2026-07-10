# Circolo del Libro — Padua Book Club

A bilingual (English 🇬🇧 / Italian 🇮🇹) website for a local book club in Padua, built with **Next.js (App Router)**, **Tailwind CSS**, and **next-intl**.

Small reading groups, each focused on a single book and led by a **Facilitator**. Readers can join an existing circle or apply to lead their own.

## Features

- **Homepage** — hero with the concept, a "how it works" section (Choose a book → Join a group → Meet at our cafés), and two calls-to-action.
- **Explore Groups** — responsive grid of active circles. Each card shows the book cover, title, author, facilitator, meeting day/time, café location, and remaining seats, plus a **Join Group** button that opens a modal form (name, email, phone).
- **Become a Facilitator** — explains the role and perks, with an application form (name, email, book proposal, motivation, preferred day/time).
- **i18n** — full English/Italian translations via `next-intl`, with a language toggle in the navbar. Routes are locale-prefixed (`/en`, `/it`).
- **Simulated data** — active groups come from `data/groups.ts`, so you can preview the UI before wiring up a database.

## Getting started

```bash
cd book-club-padova
npm install
npm run dev
```

Open **http://localhost:3000** — you'll be redirected to `/en` (or `/it`).

## Project structure

```
book-club-padova/
├── app/
│   └── [locale]/
│       ├── layout.tsx          # <html>, navbar, footer, i18n provider
│       ├── page.tsx            # Homepage
│       ├── groups/page.tsx     # Explore Groups
│       └── facilitator/page.tsx# Become a Facilitator
├── components/                 # Navbar, LanguageToggle, GroupCard, modals, forms…
├── data/groups.ts              # Simulated group data (swap for a real DB)
├── i18n/                       # next-intl routing / navigation / request config
├── messages/{en,it}.json       # Translation strings
├── middleware.ts               # Locale detection & redirects
└── tailwind.config.ts
```

## Where to plug in a real backend

- **Groups list:** replace the static array in `data/groups.ts` with a fetch/DB query.
- **Join & Facilitator forms:** both currently simulate success on submit. Wire the
  `handleSubmit` in `components/JoinGroupModal.tsx` and `components/FacilitatorForm.tsx`
  to an API route or server action.

## Deploying on a very low budget

**Cheapest realistic option: Vercel Hobby tier — €0/month.** Vercel is made by the
creators of Next.js, so it runs this project with zero configuration and includes a
free `*.vercel.app` subdomain and HTTPS.

1. Push this repo to GitHub (already a git repo).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Set **Root Directory** to `book-club-padova` (important — the app lives in a subfolder).
4. Click **Deploy**. Done — you get a live URL like `circolo-del-libro.vercel.app`.

Total cost: **€0**. Add a custom domain (e.g. `circolodellibro.it`) later for ~€10/year
if you want — everything else stays free at this traffic level.

Alternatives, also with free tiers: **Netlify** and **Cloudflare Pages** (set the same
`book-club-padova` root and `npm run build` build command).

> Note: the Join and Facilitator forms currently simulate success (no backend). They work
> fine on the free tier as-is. When you're ready to actually receive submissions, add a
> Next.js server action or an API route, or point them at a free form service.

## Adding a language

1. Add the locale to `i18n/routing.ts` (`locales` array).
2. Create `messages/<locale>.json` (copy `en.json` and translate).
3. The navbar toggle picks it up automatically.
