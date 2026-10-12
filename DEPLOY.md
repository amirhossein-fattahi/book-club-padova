# Make recruitment registrations reliable

Use this guide to configure Supabase and deploy the new recruitment site. The
public website can be viewed without a database, but production registration
forms are enabled only after durable storage passes its health check and a public
organizer email is configured. A stored registration expresses interest; the
organizer still needs to follow up and confirm books, hosts and venues.

## 1. Restore an existing Supabase project or create one

1. Open the [Supabase dashboard](https://supabase.com/dashboard) using the account
   that owns the project. Check the project status before changing any keys.
2. If it is paused, use the dashboard's restore/resume action and wait until the
   project is available. If recovery is unavailable, follow the recovery options
   shown there or create a replacement project. Keep the old project until any
   data recovery is resolved; a new project does not recover old registrations.
3. For a new project, choose the Free plan, a strong database password and an EU
   region. Save the password in your password manager.
4. In SQL Editor, create a query, paste the **complete current**
   `supabase/schema.sql`, then run it. This additive script can be rerun; it creates
   `public.registrations`, a private persistent rate limiter and the storage-health
   function. It keeps legacy signup/application tables.
5. Copy the project URL from the project's Connect dialog or Data API settings.
   Copy a server secret key from API Keys, or the legacy `service_role` key.
   The application accepts that server-side key in `SUPABASE_SERVICE_ROLE_KEY`.

A publishable/`anon` key is not the server key required here. Secret and
`service_role` keys bypass database row policies and belong only in server
environment variables. See [Supabase's API key guide](https://supabase.com/docs/guides/getting-started/api-keys).

Supabase Free currently pauses inactive projects after a week and has no automatic
backups. Review [the plan details](https://supabase.com/pricing) and keep a private
registration export during recruitment. The [backup guide](https://supabase.com/docs/guides/platform/backups)
explains manual backups. Keep exports outside the repository and delete them under
the same retention policy as the live records.

## 2. Connect the local project without exposing secrets

In PowerShell inside the repository:

```powershell
npm ci
Copy-Item .env.example .env.local
```

Skip the copy if `.env.local` already exists; preserve its values. Edit the file
locally and set:

```dotenv
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVER-SECRET-KEY
NEXT_PUBLIC_CONTACT_EMAIL=YOUR-MONITORED-ORGANIZER-EMAIL
NEXT_PUBLIC_SITE_URL=https://book-club-padova.vercel.app
```

Replace the placeholders. The contact email and site URL are public. The Supabase
key is secret. Do not paste it into chat, browser-side code or screenshots.
The confirmed organizer email in `lib/site.ts` is used when the contact override
is blank; set the override if the organizer's inbox changes.

Run:

```powershell
npm run check:storage
```

This is a read-only check of the registrations schema and rate-limiter function.
It reports health/counts without printing names or email addresses and does not
submit a form. If it fails, check project availability, credentials and whether the
entire current schema ran successfully. Do not work around failure by allowing a
production JSON fallback.

For development without Supabase, leave both Supabase values blank and run
`npm run dev`. Submissions then stay in `.data/registrations.json` on this machine.
That development file is not the public website's database.

## 3. Configure Vercel and deploy

1. Open your existing Vercel project. If none exists, import the
   [GitHub repository](https://github.com/amirhossein-fattahi/book-club-padova).
2. Use the Next.js framework preset and repository root `./`. Select Node.js 22
   or newer in project settings.
3. In Settings → Environment Variables, set the Supabase URL, server key and
   `NEXT_PUBLIC_CONTACT_EMAIL` for **Production**. Set `NEXT_PUBLIC_SITE_URL` to
   your final public origin. Preview deployments need their own intended values;
   do not accidentally test against production records.
4. Deploy the current reviewed revision, or redeploy after editing environment
   values. Environment changes do not update an existing deployment. Public
   `NEXT_PUBLIC_` values are included at build time.
5. Open `/en` and `/it` on the resulting public URL. Check that registration is
   available. A successful build alone does not prove storage is configured.

With a Git integration configured for `main`, subsequent pushes to `main` deploy
automatically. Verify the deployment status and exact revision before sharing it.
You can use the existing `*.vercel.app` address for recruitment. A custom domain is
optional; if added, update the public site URL and regenerate/scan the QR code.
Check provider plan limits and domain renewal pricing before buying anything.

## 4. Optional organizer email alerts

1. Create a Resend API key and set `RESEND_API_KEY` and `NOTIFY_EMAIL` in Vercel.
2. With the default `onboarding@resend.dev` sender, use the email belonging to your
   Resend account as the recipient. To send to other recipients, verify your own
   domain and set `NOTIFY_FROM` to an address on it. See
   [Resend's test-domain restrictions](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).
3. Redeploy. Test an organizer-controlled registration and check both Supabase and
   the organizer inbox/spam folder.

Alerts go to the organizer, not to the applicant. Email failures do not erase a
saved registration. Check `registrations` daily even when alerts are configured.
Review deployment logs for sanitized error categories if an alert is missing.

## 5. Optional Cloudflare Turnstile

The server's durable rate limiter and honeypot run without CAPTCHA. To add
Turnstile, create a widget for your production hostname, then set both
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` and redeploy. Add a custom
domain to the widget if you use one. `TURNSTILE_EXPECTED_HOSTNAME` can optionally
require that exact hostname in server verification (no `https://` or path).

Both keys blank is supported; a half-configured pair prevents registration. For
local/preview testing, use Cloudflare's test keys or add the appropriate allowed
hostname. Never expose the secret key as a public environment value.

`RATE_LIMIT_SECRET` is optional. If set, use a separate randomly generated secret
of at least 32 characters; if blank, the server derives the rate-limit HMAC key
from its Supabase secret. Rate-limit rows contain hashed identifiers, not raw
emails or IP addresses.

## 6. Verify storage and follow-up before advertising

Use an organizer-controlled email and clearly labelled test details. Complete one
production interest registration, reload the page and verify the row in Supabase
→ Table Editor → `registrations`. Confirm that a repeated email/role submission
does not create a duplicate. Check the Italian and English forms, error messages,
phone screen layout, keyboard navigation and actual printed QR.

Before publishing recruitment, confirm these operational details:

- The public organizer inbox is monitored and the privacy/contact page accurately
  names the organizer, purposes, processors, rights and retention/deletion process.
- Recruitment records and private exports are reviewed monthly and removed after
  six months or an applicable deletion request. This is a manual organizer task.
- Someone checks the database daily, replies within the published response time
  and keeps application/follow-up notes privately.
- Café names are described as candidates until their owner explicitly agrees.
  Free drinks, dates, book titles and facilitators are advertised only after confirmation.
- Registrations are interest requests. Host selection and event confirmation are
  handled personally; the site does not automatically allocate seats.
- Private exports exist and a failed/paused database is addressed before more
  invitations are shared. Remove labelled test data after verification.

For the founding launch, recruit 3–4 prospective facilitators and secure one café.
A first meetup can introduce the club, hear proposed books and choose the reading
schedule. Announce its exact address, language, date, duration and refreshments
only when those details are agreed. No full-book reading deadline is needed for
that introductory meetup.

## Troubleshooting

| Symptom | Check/action |
|---|---|
| Website loads but registration is unavailable | Run the read-only storage check; restore a paused project, apply current schema, verify production env and public contact email, then redeploy. |
| Missing new submissions | Inspect `registrations`; previous versions used separate legacy tables. Confirm the tested deployment and its database project. |
| Registration rejected as duplicate | The normalized email already exists for that role. Organizer can follow up on its existing row. |
| Anti-spam error after editing CAPTCHA env | Set both Turnstile keys or neither; verify hostname/widget configuration and redeploy. |
| No organizer alert | Verify both Resend env values and recipient/sender restrictions; check the database independently. |
| Works in dev but fails under `npm start` | Development JSON storage is intentionally unavailable in production; configure Supabase. |
| SQL/API permission error | Reapply the complete schema using SQL Editor and use a server secret/service-role key, not `anon`. |
