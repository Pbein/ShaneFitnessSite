# Phase 2 Plan — Booking, Payments, CMS & Handoff

**Target day:** Tue, 2026-06-10
**Goal:** Turn the visual demo into a site Shane can actually run a business on — real booking, real payments, and a simple CMS he manages himself — while the developer keeps owning the tech. Plus an optional, no-pressure path to give Shane full ownership whenever he wants it.

**Guiding principle (unchanged):** Shane edits *what the site says and shows* (text, prices, images, links). He never touches layout, code, or deploys. The architecture already supports this — `src/content/site.ts` is shaped exactly like the planned Sanity schema, so swapping it for live CMS reads is mechanical and changes no components.

---

## 0. Before we start — collect from Shane (15 min, do first)
Without these, the day stalls. Get them up front:

- [ ] **Google account** he wants bookings tied to (the calendar that should show his availability).
- [ ] **Stripe account** — does he have one? If not, create it (needs business name, bank account for payouts, basic ID). Payouts can be finished later; we only need the account to make Payment Links.
- [ ] **Confirm pricing & cadence:** In-Person $100/session (one-time), Virtual Coaching $200 — **per month** or one-time? (Demo assumes /month.) Free Consultation length (30 min?).
- [ ] **Instagram URL** and a **phone number** (if he wants it public).
- [ ] **Preferred contact email** for booking notifications (currently `Shane12.sb@gmail.com`).
- [ ] **Domain**: does he own one (e.g. `trainshane.com`) or want us to buy one?

---

## Track A — Booking (Calendly + Google Calendar)

**Recommendation:** Use **Calendly** as the booking UI, **connected to Shane's Google Calendar** for real-time availability and two-way sync. This gives him one familiar dashboard, automatic conflict-checking against his personal calendar, reminders, and reschedule links — far less for a non-technical owner to manage than raw Google Appointment Scheduling.

### Steps
1. **Create Calendly account** (free tier is fine to start; Standard ~$10/mo unlocks reminders + multiple event types).
2. **Connect Google Calendar** in Calendly → Integrations, so booked slots block his real calendar and vice-versa.
3. Create **event types** matching the services:
   - "Free Consultation" — 30 min, video call (Google Meet auto-link).
   - "In-Person Session" — 60 min, location = DC/MD/VA (collect address in intake).
   - Optional "Virtual Coaching intro/check-in".
4. Turn on **confirmation + reminder emails** and an **intake question** ("What are your goals?").
5. Grab the public Calendly URLs.
6. **Wire into the site** (once CMS is live, this is just pasting a URL into a field):
   - Global `bookingUrl` → the Free Consultation link.
   - Per-service booking overrides where relevant.
7. Decide presentation: button that opens Calendly in a new tab (current) **and/or** an inline Calendly embed on `/contact` or a `/book` page. (Embed = nicer UX; one small `<script>` component, still CMS-driven URL.)

### Google Calendar (alternative / fallback)
If Shane prefers Google-native: **Google Calendar → Appointment Schedules** creates a public booking page with its own URL. Same wiring (paste URL into `bookingUrl`). Downside: fewer reminder/intake features than Calendly. Keep as Plan B.

**Done when:** clicking "Book a Free Consultation" anywhere on the site opens a working calendar that books a real slot and emails both parties.

---

## Track B — Payments (Stripe Payment Links only)

**Scope reminder:** Payment **Links only** — no custom checkout, no Stripe API, no database. This is deliberately low-maintenance.

### Steps
1. In **Stripe Dashboard → Payment Links**, create one link per paid offering:
   - **In-Person Session** — $100, one-time.
   - **Virtual Coaching** — $200 (set as **recurring/monthly** if confirmed, else one-time).
   - (Optional) deposit/package links later.
2. For recurring, create a **Product + monthly Price**, then a Payment Link on it.
3. Configure each link: collect customer email, success message/redirect (can point back to a "thanks" page), optional promo codes.
4. (Optional, recommended) **Connect Stripe to Google/email receipts** so Shane gets notified on each sale.
5. **Wire into the site:** paste each URL into the matching `paymentLinks` / per-service `paymentLink` field. The CTA buttons already resolve `type: "payment"` to these.
6. Replace the `https://buy.stripe.com/` **stubs** currently in `src/content/site.ts`.

**Done when:** "Book a Session" / "Start Coaching" open real Stripe checkout and a test purchase (use a real card in live mode or Stripe test mode first) succeeds and notifies Shane.

---

## Track C — Sanity CMS (the "simple tools he understands")

This is the heart of the handoff: Shane logs into a friendly editor, changes text/prices/images/links, hits Publish, and the live site updates — no developer, no redeploy.

### Setup steps (developer)
1. `npm install sanity next-sanity @sanity/image-url @sanity/vision`.
2. Create a Sanity project (free plan: plenty for this) → note **Project ID** + dataset `production`.
3. Add env vars locally (`.env.local`) and in **Vercel → Settings → Environment Variables**:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_READ_TOKEN` (server-only).
4. **Define schemas** exactly as in the original brief / `content-map.md` §5:
   - `siteSettings` (singleton): businessName, tagline, phone, email, address, socialLinks[], **bookingUrl**, **primaryPaymentLink + paymentLinks[]**, logo, favicon, SEO defaults.
   - `homepage` (singleton): hero (headline, subheadline, image, ctaText/Type/Target), featuredServices[]→service, optional section headings.
   - `aboutPage` (singleton): bodyText (Portable Text **locked to safe formatting — no custom HTML**), image, mission/values.
   - `service` (doc): name, description, price, duration, image, bookingLink override, order.
   - `testimonial` (doc): quote, author, role/source, photo.
   - `galleryImage` (doc): image, caption, order.
   - Add **validation** (required fields, `Rule.uri()` on links) so Shane can't publish a broken page.
5. **Embed Studio at `/studio`**: `src/app/studio/[[...tool]]/page.tsx`.
6. Add the Sanity client + GROQ queries (`src/lib/sanity.ts`). **Replace each export in `src/content/site.ts` with a typed fetch returning the same shape.** Components are already written against those shapes → no component edits.
7. Add `cdn.sanity.io` to `next.config.mjs` images (already done) and use Sanity's image pipeline for responsive/lazy images + alt text.
8. **Seed the dataset** from `content-map.md` (recreate current content so nothing is lost).
9. Set Sanity **CORS origins**: production domain + `http://localhost:3000`.

### Owner enablement
- Create Shane's login (invite his email as an **editor** in Sanity).
- Update `OWNER-GUIDE.md` from "coming soon" to live steps, and do a **10-min screen-share walkthrough**: edit text, change a price, swap a photo, change the booking link, update a payment link, Publish.

**Done when:** Shane changes a price/photo/booking link in `/studio`, publishes, and the live site reflects it within ~1 minute — without us touching anything.

---

## Track D — (Optional) Ownership & shared access

Goal: Shane *can* take the whole thing over at any time, but isn't forced to. Set this up so there's no lock-in and no single point of failure.

| Asset | How to share now | Full handoff later |
|---|---|---|
| **GitHub repo** | Add Shane as a **collaborator** (read) or transfer to a `TrainShane` org with both as members | Transfer repo ownership to his account/org |
| **Vercel** | Create/move project under a **Vercel Team**; invite Shane as Member (or Owner) | Make Shane Team Owner; project follows the repo |
| **Sanity** | Invite Shane as **Administrator** (not just editor) on the Sanity project | He owns the dataset + can manage users |
| **Stripe** | It's already **his** Stripe account; add developer as a **team member** with limited role | Remove developer access |
| **Calendly / Google** | His own accounts from the start | Nothing to transfer |
| **Domain** | Register in **his** name (Shane as registrant); developer as technical contact | Already his |

### Recommended structure (clean + future-proof)
- Put the repo in a **GitHub Organization** (e.g. `train-shane`) and the Vercel project in a **Vercel Team** of the same name, with **both** Shane and developer as members. Ownership is shared from day one; "handoff" becomes just *removing the developer*, not migrating anything.
- Keep all **third-party accounts in Shane's name** (Stripe, Calendly, Google, domain registrar) with the developer added as a delegate. Money and bookings should never depend on the developer's personal accounts.

### Handoff packet (prepare once, hand over when asked)
- This repo + `README`, `DEPLOY.md`, `OWNER-GUIDE.md`.
- A one-page "where everything lives" sheet: which account hosts what, how to log in, who to call.
- Confirm he can run `npm install && npm run dev` if he ever wants to (nice-to-have, not required).

**Done when:** every account is either Shane's or shared via a team, and there's a written record of access. He could fire the developer tomorrow and lose nothing.

---

## Suggested running order for the day
1. **(0)** Collect inputs from Shane (15 min) — blocks everything.
2. **(A)** Calendly + Google Calendar (45 min) — independent, do first for a quick win.
3. **(B)** Stripe Payment Links (45 min) — independent.
4. **(C)** Sanity: install → schemas → Studio → client/queries → seed (2–3 hrs, the big block).
5. Paste the real Calendly/Stripe URLs into the CMS (now that fields exist) — removes all stubs.
6. **(D)** Stand up the GitHub Org + Vercel Team + Sanity admin invite (30 min) — optional but cheap to do now.
7. Deploy, smoke-test on production, then the **screen-share walkthrough** with Shane.

## End-of-day acceptance checklist
- [ ] Booking button → real, working calendar; test booking received.
- [ ] Payment buttons → real Stripe checkout; test purchase succeeds.
- [ ] `/studio` live; Shane can log in and publish a change that appears on the site.
- [ ] No `https://buy.stripe.com/` or `https://calendly.com/` stub links remain in `site.ts` / CMS.
- [ ] All content from `content-map.md` migrated into Sanity (nothing lost).
- [ ] `OWNER-GUIDE.md` updated to live instructions; walkthrough done.
- [ ] (Optional) Access shared via team(s); handoff sheet written.

## Risks / watch-outs
- **Cache busting:** when Shane uploads images via Sanity, they get unique CDN URLs automatically — no more "same filename, stale image" problem we hit with `/public`.
- **Stripe live vs test mode:** test the flow in test mode, then flip to live and re-test one real transaction.
- **Singletons in Sanity:** enforce one-of via structure config so Shane can't create a second "Homepage."
- **Portable Text:** lock the About body to a safe subset (headings, bold, lists, links) — no raw HTML — to protect the design.
- **Don't gate production behind Vercel Auth** if Shane needs to share the live link before the custom domain is set.

---

*Phase 1 (visual demo) is complete and deployed. This plan delivers Phase 2 (booking + payments + CMS) and sets up Phase 3 (ownership) so Shane is never locked in.*
