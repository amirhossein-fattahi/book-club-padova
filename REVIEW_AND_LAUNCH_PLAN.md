# Padova book club: review and seven-day launch plan

Reviewed: 10 October 2026. Target: Saturday, 17 October 2026, Europe/Rome.

This is the original review, recorded before implementation. For the current fixes,
verification results and updated target of 3–4 facilitators plus one café, see
`LAUNCH_CHECKLIST.md`. The findings below describe the original version.

## Recommended outcome

Launch recruitment for a new book club and, if the commitments are secured, hold one founding meetup. The organizer has confirmed that no facilitator, book, venue, cafe agreement or reader group exists yet. The site must reflect that stage.

Recommended targets, rather than forecasts: one committed lead facilitator, one backup/helper, one agreed venue, and 6–10 confirmed participants within the venue's capacity. The founding meetup can introduce people, hear two or three short book proposals, choose a first book, and agree the next discussion date. Allow a realistic reading period after that meetup.

## What was verified

- `npm run build` passes, including TypeScript checking and generation of the six EN/IT content routes.
- Public EN homepage, IT groups and IT facilitator pages returned HTTP 200. Live signup dialog was inspected without submitting any production form.
- EN and IT contain the same 103 translation string keys.
- `npm run lint` fails to complete: it prompts for initial ESLint setup and exits with code 1. No configured repeatable lint check exists.
- `npm audit --json` reports 15 vulnerable dependency entries: 1 critical, 10 high, 4 moderate. `npm audit --omit=dev --json` reports 6 production entries: 1 critical, 4 high, 1 moderate. These counts include dependency chains and do not represent distinct proven exploits.
- Locked versions include Next.js 15.5.20, React/React DOM 19.2.7 and next-intl 3.26.5.
- Actual local browser submissions demonstrated that both validation errors and database errors clear the join form's name, email and phone. Test submissions used synthetic details; neither was persisted or emailed.
- A read-only backend harness with mocked persistence demonstrated acceptance of full, unknown and empty group IDs, repeated signups, unsupported locale/day/time, and raw HTML in notification values.
- At a 320 × 568 viewport, the live dialog panel measured about 595 pixels high, began at y=-27, and clipped its heading. Body scrolling was disabled and the panel had no internal scrolling. Pressing Tab from the submit button moved focus to a background group button.
- Deployed database, email, CAPTCHA secrets and database contents were not inspected. Production persistence and delivery remain unverified.

Application source was reviewed without modifications. This document records the review and proposed work; the fixes below remain to be implemented.

## Prioritized findings and fixes

### 1. Public content describes a club that does not exist yet — launch blocker

`data/groups.ts:1` explicitly labels all six circles simulated. They are displayed as active with named facilitators, cafe locations, meeting times and occupied seats. `app/[locale]/page.tsx:51` hardcodes six circles, two partner cafes and 30+ readers; line 61 claims “dal 2024.” `messages/en.json:86` promises free coffee, with equivalent Italian copy.

**Fix now:** Remove simulated groups, statistics, founding-year claims and unconfirmed venue/perk promises from public pages and metadata. Explain that the club is forming. Show confirmed events only; otherwise show an invitation to register interest.

### 2. Recruitment has the wrong entry points — launch blocker

The reader form only joins a particular group. Removing the demo circles leaves no reader interest form. `components/FacilitatorForm.tsx` and `app/actions.ts:99` require a book title, author, motivation and preferred day, preventing potential helpers from simply expressing interest before choosing a book.

**Fix now:** Add two clear paths: “Help start the club” and “Join the interest list.” Collect name, email, preferred meeting language and availability. For helpers, allow role choices such as facilitator, co-host, outreach or venue help; book suggestions can be optional. Store these as interests/applications, without claiming a reservation. Tell applicants who will reply and when. Keep ordinary signup short.

### 3. Seat reservations are not implemented — launch blocker for event bookings

`components/GroupCard.tsx:65` computes seats from static data. `lib/db.ts:71` inserts a signup without a capacity check. `supabase/schema.sql:5` has no group relationship, capacity model, registration status or duplicate constraint. The success copy at `messages/en.json:70` promises a reserved seat and facilitator email.

**Fix for the first week:** Use “Request received; we will confirm your place by email.” Remove exact seat availability. Have the organizer confirm a private roster and waitlist manually, replying within 24 hours. Prevent duplicate interests/requests using normalized email and the relevant event/group identifier.

**Later, if instant booking is needed:** Store real events and capacity in the database. Reserve atomically in a transaction, locking the event row before checking and inserting. Add a uniqueness constraint, cancellation/status fields and waitlist behavior. A count followed by an independent insert is insufficient under concurrency.

### 4. Dependency security fixes are overdue — high priority before promotion

Next.js 15.5.20 is flagged critical by the dependency audit. Other production flagged entries include next-intl, PostCSS, Sharp, NanoID and source-map-js. Applicability varies with hosting and features; this review does not establish that each reported exploit is exposed on the deployed site.

The official [July Next.js security release](https://nextjs.org/blog/july-2026-security-release) fixes a denial-of-service issue affecting App Router applications with Server Actions in 15.5.21. This app uses Server Actions and its locked version precedes that fix.

**Fix now:** Upgrade to currently supported patched releases, review the resulting lockfile and advisory applicability, then rebuild and check both languages and form flows. Avoid blindly accepting forced major upgrades. Re-run both audits and document any unresolved entries.

**14 October checkpoint:** Next.js has [announced another security update for 14 October](https://nextjs.org/blog/upcoming-nextjs-security-update-october-2026). Check the released affected-version list and apply the relevant patches before launch. Do not assume today's update will cover that future release.

### 5. Failed submissions erase entered details — confirmed usability bug

`components/JoinGroupModal.tsx:95` uses an action with uncontrolled inputs. Server actions return an error state normally, causing the form reset. Local browser tests confirmed every entered field cleared after validation failure and after database failure. The facilitator form uses the same pattern and needs the same recovery treatment.

**Fix:** Preserve submitted values on errors using controlled fields or explicit returned values/defaults. Reset only after successful submission. Provide useful field-specific errors and announce failures with `role="alert"`.

### 6. CAPTCHA retry can fail after a transient error — confirmed code/harness finding

`app/actions.ts:52` verifies the token before ordinary validation and database saving. `components/TurnstileWidget.tsx:33` mounts once and never resets after an action error. [Cloudflare tokens are single-use](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), so a database failure can consume the token and cause a retry to fail CAPTCHA.

**Fix:** Validate ordinary fields first; reset/remount the widget after failed attempts, expose readiness/expiry/error state, and enable submission with a fresh token. Validate that both site and secret keys are configured together. Add proportionate rate limiting before advertising broadly.

### 7. Server input validation trusts client data — confirmed backend bug

`app/actions.ts:56` accepts editable group ID/title hidden fields without resolving a trusted group. Validation checks only name, an email pattern and nonempty phone. Unsupported locale/day/time and empty/invented groups reach persistence.

**Fix:** Validate IDs against real server records and derive titles there. Normalize email, enforce sensible length limits, whitelist locale/day values and validate time. Apply the corresponding constraints in the database. Required phone is not a useful validity check; make it optional unless the chosen operating model requires it.

### 8. Organizer emails permit injected HTML — confirmed backend bug

`lib/notify.ts:56` places user values directly in HTML, and line 83 does the same for motivation. A mock request retained an injected link in the applicant name.

**Fix:** Escape user-controlled HTML characters consistently or use plain-text email. The issue allows misleading links/formatting in organizer alerts; it is not evidence of browser script execution.

### 9. Mobile dialog and keyboard handling are broken — confirmed browser findings

`components/JoinGroupModal.tsx:42` has a fixed overlay, bottom-aligned panel and no maximum height/internal scrolling, while body scrolling is locked. Small screens clip the panel. There is no focus containment or restoration, so Tab reaches background controls despite `aria-modal`.

**Fix:** Use an accessible dialog implementation, restore focus to its opener, and add viewport-relative maximum height and internal scrolling. Test a small phone, keyboard navigation, zoom and the mobile keyboard. Add live announcements for submission status.

### 10. Personal-data collection lacks privacy information — launch prerequisite

Forms collect names/emails and the join form requires phone, but the routes and footer contain no privacy notice or organizer contact. Decide what data is actually needed, who controls it, the lawful basis, recipients/processors, retention and the rights/contact process before collecting public registrations. [EDPB guidance](https://www.edpb.europa.eu/sme/be-compliant/respect-individuals-rights_en) requires information at the time of direct collection; its [data-minimization guidance](https://www.edpb.europa.eu/sme/be-compliant/be-compliant_en) supports collecting only necessary data.

**Fix:** Add clear EN/IT privacy information beside forms and an organizer email. Make phone optional if email is sufficient, choose a retention/deletion process, and restrict organizer access. Obtain a separate opt-in for optional promotional updates or a messaging group; a blanket mandatory consent checkbox does not itself resolve the notice or lawful-basis questions.

### 11. Saved submissions need an accountable follow-up process — operational prerequisite

`lib/notify.ts:38` only sends alerts to `NOTIFY_EMAIL`; no attendee confirmation is sent. Missing configuration skips notifications and sending failures are logged. Production saving correctly fails without database configuration (`lib/db.ts:51`), but a functioning page does not prove the configured backend works.

**Fix:** Verify persistence and alerts using clearly marked test records in the intended environment. Assign one person to check Supabase daily, reply within 24 hours and maintain a private application/confirmation/waitlist record. The database remains the source of truth if an alert fails. Provide cancellation and help contact information.

### 12. Development checks need repair — secondary technical work

The lint script in `package.json` lacks an ESLint setup. `start.ps1:12` builds and starts production mode, which rejects the local JSON fallback without Supabase even though `npm run dev` supports it. The script also continues after failed installation/build commands.

**Fix:** Configure a noninteractive lint command. Make the shortcut explicitly use development mode or require database setup, and stop on failed commands. Add focused regression checks for the meaningful signup failures above.

## Seven-day execution plan

| Date | Organizer work | Website work / deliverable |
|---|---|---|
| **10 Oct — today** | Decide the initial audience and preferred meeting language. Make a list of 10 friends/readers and 3 candidate hosts. Draft one specific ask: lead a 60–90 minute founding meetup and propose a book. | Replace fictional operating-club claims with formation-stage copy. Define the two interest paths and a reply-within-24-hours commitment. |
| **11 Oct** | Personally invite those contacts to help. Aim for two facilitator conversations and one co-organizer. Ask each potential host about availability, language and willingness to lead. | Implement simple reader/helper interest forms, server validation and durable storage. Make book proposal optional for helper recruitment. |
| **12 Oct** | Contact 3 possible venues with a concrete request for 6–10 people and a 60–90 minute slot. Confirm costs/refreshments, noise, access and capacity. Select a lead and backup. | Fix dependency security, error preservation, CAPTCHA recovery, email escaping and mobile/focus issues. Add privacy/contact information. |
| **13 Oct** | Agree one venue and host arrangement in writing. Prepare the event card with exact date/time, address, language, duration, cost, reading requirement and cancellation contact. A founding meetup can require no completed book. | Test EN/IT forms on phone and desktop. Verify saved records, organizer retrieval and alert delivery. Scan the printed QR on a phone and confirm its intended landing page. |
| **14 Oct** | Share the accurate invitation through friends and local community/university/book groups where posting is allowed. Ask the venue to share it or display the QR. If venue/host remain pending, advertise the interest list with details to follow. | Check the announced Next.js security release, apply relevant patches and repeat affected checks. Publish only confirmed event details. |
| **15 Oct** | Reply to every interest/application. Aim for 6–10 confirmed attendees within agreed capacity. Keep additional applicants on a waitlist; follow up with promising facilitators. | Review stored interests daily and reconcile them with replies/confirmed attendance. Fix any observed signup failure immediately. |
| **16 Oct** | Reconfirm the venue/host and send attendees the exact location, time, language, cost and arrival instructions. Prepare 2–3 short book pitches and five discussion prompts. | Perform the launch checklist on the actual deployed version. Ensure organizer contact and cancellation route work. |
| **17 Oct** | Hold the founding meetup if logistics are confirmed. Agree the first book, reading portion and next discussion date. Collect brief feedback and recruit a future co-host. If commitments are still pending, complete the recruitment launch and announce a meetup only when secured. | Update the site with real outcomes and the next confirmed event. |

Suggested founding agenda: 10 minutes introductions, 10 minutes club expectations, 15 minutes book proposals, 20 minutes discussion and choice, 10 minutes agreeing the next date/reading, 5 minutes assigning helpers. Add time if the group prefers a longer conversation.

## Suggested recruitment copy

**Italian:**

> Stiamo creando un nuovo circolo del libro a Padova. Cerchiamo lettori e persone che abbiano voglia di facilitare una piccola discussione e proporre un libro. Puoi partecipare anche se non hai ancora scelto un titolo. Lascia il tuo interesse: ti contatteremo per organizzare il primo incontro. Data, sede e lingua saranno confermate prima delle iscrizioni all'evento.

**English:**

> We are starting a new book club in Padova. We are looking for readers and people who would enjoy leading a small discussion and suggesting a book. You can help even if you have not chosen a title yet. Register your interest and we will contact you about the first meetup. We will confirm the date, venue and meeting language before taking event bookings.

Once confirmed, add the actual event details and an organizer contact; keep claims aligned with what has been agreed.

## Acceptance checklist

- [ ] Formation-stage claims match reality; no demo people, meetings, occupancies or unagreed perks appear publicly.
- [ ] A reader and an undecided prospective facilitator can each register interest.
- [ ] Both languages save to the intended database, with safe validation and duplicate handling.
- [ ] Errors retain entered information; CAPTCHA retries obtain a fresh token.
- [ ] Small-screen and keyboard signup flows remain usable.
- [ ] Privacy information and organizer contact appear at collection.
- [ ] A named organizer checks submissions and replies within 24 hours.
- [ ] Security patches are applied and remaining audit entries assessed; the 14 October advisory is reviewed.
- [ ] A meetup is advertised only with a confirmed host, venue, date/time, address, language, capacity and cost.
- [ ] Every attendee receives an explicit confirmation; requests never masquerade as guaranteed bookings.

Later work can include automated attendee emails, atomic instant booking, a richer event calendar, SEO/social preview images and an admin dashboard. For the first week, Supabase's existing table view and manual confirmations are sufficient when the workflow is clear and reliable.
