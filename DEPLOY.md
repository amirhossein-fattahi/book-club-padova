# Going live — step by step

The site is already on GitHub: **https://github.com/amirhossein-fattahi/book-club-padova**

You need two free accounts: **Supabase** (database) and **Vercel** (hosting). Total
cost to be fully online: **€0**. A custom `.it` domain is optional (see the bottom).

---

## 1. Database — Supabase (free)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in with GitHub.
2. **New project**. Pick a name (e.g. `book-club-padova`), a strong database password
   (save it somewhere), and the region **Central EU (Frankfurt)** — closest to Padua.
3. Wait ~2 minutes for it to provision.
4. Left sidebar → **SQL Editor** → **New query**. Open `supabase/schema.sql` from this
   repo, paste its contents, and click **Run**. This creates the two tables.
5. Left sidebar → **Project Settings** (gear) → **API**. Copy two values:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role** secret key (under "Project API keys") → this is `SUPABASE_SERVICE_ROLE_KEY`

> The service_role key is a secret. Only ever put it in Vercel's env vars (step 2) or a
> local `.env.local` — never commit it.

**Where you'll see submissions:** Supabase → **Table Editor** → `group_signups` and
`facilitator_applications`. Every join/application shows up here as a row; you can
sort, search, and export to CSV.

---

## 2. Hosting — Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **Sign up / Log in with GitHub**.
2. **Add New… → Project** → **Import** `book-club-padova`.
3. Framework is auto-detected as **Next.js**. Leave **Root Directory** as `./` (this repo
   *is* the app — no subfolder needed).
4. Expand **Environment Variables** and add the two from step 1:
   | Name | Value |
   |------|-------|
   | `SUPABASE_URL` | your Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |
5. Click **Deploy**. After ~1 minute you get a live URL like
   `https://book-club-padova.vercel.app`.

From now on, every `git push` to `main` auto-deploys. 🎉

---

## 3. Custom `.it` domain (optional, ~€5–9/year)

Hosting stays free on Vercel; you only pay for the domain name.

1. Buy a `.it` domain at a cheap registrar — e.g. **OVH** (~€4–7/yr), **Aruba**
   (first year often ~€1, then ~€9/yr), or **Namecheap**. Pick something like
   `circolodellibropadova.it`.
2. In Vercel → your project → **Settings → Domains** → add the domain.
3. Vercel shows you two DNS records (an `A` record and/or `CNAME`). Copy them into your
   registrar's DNS settings. HTTPS is issued automatically.
4. Done — total ongoing cost is just the domain (well under €10/year in year one).

If you'd rather not bother, the free `*.vercel.app` URL works perfectly and costs nothing.

---

## Email notifications (Resend) — setup & troubleshooting

1. Sign up at [resend.com](https://resend.com) **with the email you want alerts sent to**.
2. Verify that email (check your inbox) — required before Resend will send anything.
3. **API Keys → Create** → copy the key (`re_…`).
4. In **Vercel → Settings → Environment Variables**, add for **Production**:
   - `RESEND_API_KEY` = your `re_…` key
   - `NOTIFY_EMAIL` = the same email you signed up to Resend with
5. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy) — env changes only take effect after a redeploy.

**Not getting emails?** Submit a test, then open **Vercel → your project → Logs** (or the
Functions tab of the latest deployment) and look for a `[notify]` line:
- `Skipped: … not set` → the env vars aren't reaching this deployment (add them to
  Production and redeploy).
- `Resend responded 403 …` with "testing emails" → in Resend's free mode you can only send
  to **your own** verified account email. Make sure `NOTIFY_EMAIL` is exactly that address,
  and that you verified it. (To send to any address, verify a domain in Resend later.)
- `Email sent to …` → it worked; check your spam folder.

## Bot protection (Cloudflare Turnstile) — free CAPTCHA

Stops bots from flooding your database. Free and unlimited.

1. Sign up at [cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add site**.
2. Domain: `book-club-padova.vercel.app` (add your custom domain too if you have one).
   Widget type: **Managed** (recommended).
3. Copy the **Site Key** and **Secret Key**.
4. In **Vercel → Settings → Environment Variables**, add for **Production**:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the Site Key
   - `TURNSTILE_SECRET_KEY` = the Secret Key
5. **Redeploy.** A verification widget now appears on both forms, and submissions with a
   missing/invalid token are rejected before anything is saved.

Until these keys are set, the forms still work (protected by the built-in honeypot);
the CAPTCHA simply doesn't appear.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values (optional locally)
npm run dev                  # http://localhost:3000
```

Without `.env.local`, forms still work locally and write to `.data/*.json` so you can
test the flow. With it, they write to Supabase.
