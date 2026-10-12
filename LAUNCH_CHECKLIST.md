# Launch checklist — 12 October 2026

The club is forming. No facilitator, book, café or meeting date is confirmed.
The starting goal is **3–4 facilitators and one café**. Caffein and Steampower
are possible venues to approach; neither is a confirmed partner.

Organizer and public contact: Amirhossein Fattahi,
amirhossein.fattahi98@gmail.com.

## Website and storage

The updated website has separate reader and helper interest forms. A helper can
offer to facilitate, co-host, help with outreach or offer a venue. A book proposal
and phone number are optional. Submitting interest does not reserve a seat.

The code validates and normalizes submissions, prevents repeat records for the
same email/role, preserves typed details after failures, and recovers CAPTCHA
challenges. Contact and privacy pages are available in Italian and English.
The database migration adds private recruitment tables and preserves the older
`group_signups` and `facilitator_applications` tables and their records.

The original Supabase project was paused and was resumed on 11 October. The
dashboard now reports Healthy. The existing tables contain 7 reader records and
1 facilitator application; these are stored records, not confirmed attendees or
hosts. Review them privately before counting anyone as committed.

Vercel retains Supabase URL and server-key settings for Production and Preview,
paired CAPTCHA settings for Production, and a compatible Node.js 24 runtime.
The additive migration was applied successfully on 12 October. Its read-only
health check passes; anonymous and authenticated public clients cannot read the
new registrations table. All 8 legacy records are preserved.

The local release checks pass: lint, TypeScript, 45 tests (including PostgreSQL
schema/privacy tests), and the production build. The production dependency audit
reports zero known vulnerabilities. Seven development-tool entries trace to one
unpatched `braces` advisory; see the scoped assessment in `README.md`.
Local browser checks confirm reader error recovery and saving, an Italian helper
submission with no book/phone, and no horizontal overflow at a 320 × 568 viewport.

The changes are pushed to GitHub and deployed at
https://book-club-padova.vercel.app. Live verification on 12 October confirmed
that the English reader form and Italian facilitator form both save to the
original Supabase project. The facilitator test supplied no book or phone.
A repeated submission returned the duplicate message and left one record for
that email/role. The two clearly labelled website-verification records are marked
`withdrawn`; exclude them from recruitment counts. The public health endpoint
returns HTTP 200 with registration open. Organizer email-alert delivery has not
been independently verified; the database is the source of truth.

If storage becomes unavailable, the website shows a contact-email fallback
instead of accepting an unsaved form. Follow `DEPLOY.md` for recovery, migration,
redeployment, private backups and verification steps.

## Your organizer plan to 17 October

1. **12 October — today:** Send personal invitations to 8–12 potential helpers. Ask for
   a clear commitment to facilitate one short book introduction/discussion,
   their meeting language and availability. Aim to secure 3–4 people by
   13 October. Live saving is verified, so you can start collecting reader
   interest using the website and published organizer email.
2. **12 October:** Approach Caffein, Steampower and one backup venue. Ask about
   one 60–90 minute slot for 6–10 people, noise, seating, accessibility and
   whether each person should buy a drink. Confirm any fee or minimum spend.
3. **13 October:** Agree one café and the 3–4 facilitators. Assign a lead for the
   first meetup and a backup; the others can introduce books and lead later
   discussions. Collect two or three optional book suggestions. An introductory
   meetup can require no advance reading.
4. **14 October:** Check the announced Next.js security release and apply any
   relevant fixes. Publish an invitation only after agreeing the exact time,
   address, language, cost and capacity. Ask friends and the café to share it;
   post in local groups only where allowed. If logistics remain pending, share
   the recruitment invitation and email instead.
5. **15 October:** Check new interests, reply personally within 24 hours, and
   confirm 6–10 attendees within the café's agreed capacity. Keep a private
   waitlist. A website interest submission is not an attendee confirmation.
6. **16 October:** Reconfirm the café and facilitators. Send confirmed attendees
   the location, time, language, cost, arrival and cancellation information.
   Prepare a short agenda and five discussion prompts.
7. **17 October:** Hold the founding meetup if commitments are secured. Agree
   the first book, reading portion and next meeting date. If the café or hosts
   are still pending, launch recruitment and announce a meetup when confirmed.

## Messages you can adapt and send

**Potential facilitator:**

> Ciao! Sto creando un circolo del libro a Padova e cerco 3–4 persone che vogliano
> facilitare le prime discussioni. Ti andrebbe di presentare brevemente un libro
> e aiutare a guidare un incontro? Non serve aver già scelto il titolo. Stiamo
> organizzando un primo incontro conoscitivo: mi dici in quale lingua e quando
> saresti disponibile? Data e locale saranno confermati insieme.

**Café:**

> Buongiorno, sto organizzando un piccolo circolo del libro a Padova. Vorremmo
> fare un primo incontro di 60–90 minuti per circa 6–10 persone. Avete un giorno
> e un orario adatti, con un tavolo in una zona abbastanza tranquilla? Potete
> indicarci eventuali costi, consumazioni richieste e capienza? Prima di pubblicare
> il vostro nome e la data vorrei concordare tutti i dettagli con voi.

## Ongoing low-cost routine

- Use the existing Vercel deployment and Supabase free project initially, within
  their applicable limits. No paid service was purchased for these changes.
- Check `registrations` daily; use the database even if organizer alerts fail.
  Export a private backup before changes and regularly thereafter. Never commit
  exports, keys or participant details to GitHub.
- Review stored recruitment details and private exports monthly. Delete records
  after six months, or process a valid deletion request sooner. This is a manual
  organizer responsibility; the app does not automatically delete applications.
- Update the public event data only with confirmed details. The first version
  uses personal confirmations and a private roster, with no instant seat booking.
