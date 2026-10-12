# Circolo del Libro — forming a book club in Padova

A bilingual English/Italian recruitment website for a new book club. The club is
being formed: there are no confirmed books, readers, facilitators or café partners
at the starting point. The website invites readers, prospective facilitators and
venues to express interest; a registration is not a seat reservation or an event
confirmation.

- Website: [book-club-padova.vercel.app](https://book-club-padova.vercel.app)
- Repository: [amirhossein-fattahi/book-club-padova](https://github.com/amirhossein-fattahi/book-club-padova)
- Hosting and database setup: [DEPLOY.md](DEPLOY.md)
- Current recruitment launch checklist: [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)
- Launch review and plan: [REVIEW_AND_LAUNCH_PLAN.md](REVIEW_AND_LAUNCH_PLAN.md)

## What is included

- English and Italian pages and a language switcher.
- Interest registration for readers, facilitators and potential venues. Facilitators
  can suggest their first book; venue interest does not create a partnership.
- Server validation, duplicate handling, honeypot and a persistent database rate
  limiter. Cloudflare Turnstile can be enabled with a matched pair of keys.
- Durable storage in Supabase once configured. Public forms remain unavailable
  when production storage is not healthy or no effective organizer email is set.
- Optional organizer alerts through Resend. These do not email the applicant or
  replace the organizer's follow-up work.
- Privacy/contact information and QR assets in `public/qr-code.{svg,png}`.

The first launch goal is recruitment: find 3–4 prospective facilitators and secure
one confirmed café for a founding meetup. Hold an introductory discussion, choose
the first book and agree a future reading date; do not promise a full novel read
within the recruitment week.

## Run locally on Windows

Install Node.js 22 or newer. Open PowerShell in this folder and run:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. `start.ps1` also starts the development server and
stops if first-time dependency installation fails. After pulling dependency
changes, run `npm ci` again to match `package-lock.json`.

Edit `.env.local` before testing forms. `NEXT_PUBLIC_CONTACT_EMAIL` can override the
confirmed public organizer email defined in `lib/site.ts`. Leave both Supabase values blank to use
**development-only** `.data/registrations.json` storage. This file contains personal
data and is ignored by Git. To test durable storage, fill in the Supabase URL and
server-only secret after applying `supabase/schema.sql`.

`npm run build` followed by `npm start` runs production mode. Production never uses
local JSON as its registration database. Do not advertise a local development
server as the public signup website.

## Environment variables

Copy `.env.example` for the complete list. Local changes require a server restart;
Vercel changes require a fresh deployment.

| Variable | Use |
|---|---|
| `SUPABASE_URL` | Required for public storage; project URL, without `/rest/v1`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required server-only Supabase secret/service-role key. Never use a public/anon key here. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional override for the public organizer inbox in `lib/site.ts`, also used for privacy requests. |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical website URL for metadata. |
| `RESEND_API_KEY`, `NOTIFY_EMAIL` | Optional organizer email alerts; both are needed. |
| `NOTIFY_FROM` | Optional Resend sender on a verified domain. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional CAPTCHA; set both or leave both blank. |
| `TURNSTILE_EXPECTED_HOSTNAME` | Optional extra token check; hostname only. |
| `RATE_LIMIT_SECRET` | Optional separate random HMAC secret; otherwise derived from the server-only Supabase key. |

Only `NEXT_PUBLIC_` values are intended to be public. Never put API secret keys in
those variables or commit `.env.local`.

## Verify changes

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

`npm run check:storage` checks the configured Supabase registrations schema and
rate limiter without creating registrations or printing personal records. It
loads local environment files through Next's environment loader. A failed check
must be fixed before public recruitment; successful storage health alone does not
prove a complete form submission.

After deployment, test both languages and one clearly labelled registration using
an organizer-controlled email, then verify it in Supabase. Test duplicate/error
states and keyboard/mobile access. See [DEPLOY.md](DEPLOY.md) for launch checks.
The GitHub checks workflow runs lint, type checks, tests and a production build.

## Maintaining registrations

Readers register via `/groups#reader-interest`; facilitators and potential venues
use `/facilitator`. Open Supabase → Table Editor → `registrations`. One organizer should check this
table daily, respond individually and maintain contact/status notes privately.
Facilitator applications need a real conversation and agreed book/date before
being described as a running group. Only publish venues after explicit agreement.

Check storage before sharing an invitation and during recruitment. Supabase Free
can pause after a week of inactivity and does not include automatic backups; keep
private exports and follow the site's six-month recruitment retention policy.
The organizer reviews records monthly and deletes expired or requested records,
including copies in exports. This is an organizer task, not an automatic deletion
job. See
[Supabase's plan details](https://supabase.com/pricing).

Old `group_signups` and `facilitator_applications` tables are preserved by the
additive schema update. New recruitment submissions go to `registrations`; inspect
legacy tables separately if the previous version received real submissions.

## Content and QR codes

Edit both `messages/en.json` and `messages/it.json` when changing wording. Pages
live under `app/[locale]`. Confirm event facts before adding them to the site;
remove an event promptly if it is cancelled. Revisit the privacy page if the
organizer, data use, processors or retention policy changes.

Regenerate the QR when the public URL changes, then scan the actual printed code:

```powershell
node scripts/generate-qr.mjs "https://book-club-padova.vercel.app/it"
```

The app uses Next.js 15, React 19, next-intl 4, Tailwind 3 and Supabase. Security
resolutions in `package.json` update Next's older PostCSS dependency, Sharp's native
image libraries and Tailwind's selector parser without migrating Tailwind to v4.
Recheck these overrides during dependency updates and verify the resulting build
and rendered pages before deployment.

Dependency verification on 12 October 2026: `npm ci` completed and
`npm audit --omit=dev` reported zero vulnerabilities. The full audit reported
seven high-severity entries stemming from one `braces` stack-exhaustion advisory
in the development lint/CSS tool chain
([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)).
Build patterns are controlled by this repository; the public forms do not feed
patterns into these tools. The currently suggested audit fixes either downgrade
the Next lint configuration or migrate Tailwind to v4. Keep untrusted patterns
out of the build tools and review a compatible upstream patch when available;
do not run `npm audit fix --force` as a launch shortcut. Recheck the audit after
dependency updates.
