# Train Shane — Project Brief & Audit

**Audience:** an AI agent (or new developer) picking up this codebase cold.
**Written:** 2026-08-19. **Audited against:** commit `9dd1465` (local `main` == `origin/main`, 0 ahead / 0 behind) and the live production site.

---

## 1. What this project is

A custom marketing + e-commerce-lite website for **Train Shane Personal Training**, a
one-person personal-training business (NASM-certified trainer, serves the DC/Maryland/
Northern-Virginia area in person and clients anywhere virtually).

Two audiences:

- **Visitors** — read about Shane, pick a coaching tier, pay, and book their first session.
- **Shane (the owner, non-technical)** — edits every word, price, photo, and link himself
  through a browser CMS at `/studio`. He never touches code, GitHub, or hosting.

It replaces a Squarespace site (the original export is in `SquareSpaceDemo/`, kept as
reference only and excluded from the build; its content was distilled into `content-map.md`).

**Commercial context:** the developer (Philip Bein) built this for Shane; a 5% revenue-share
agreement is in progress but **not yet signed**. Attribution plumbing for that already exists
(see `docs/UTM-SCHEME.md`). Commercial terms live in the gitignored `PROJECT-HANDOFF.md` —
do not surface its contents in shared artifacts.

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15.1.11**, App Router, React 19 | Manually scaffolded (not `create-next-app`) |
| Language | **TypeScript 5.7**, strict | `@/*` path alias → `src/*` |
| Styling | **Tailwind CSS v3.4** | Custom theme in `tailwind.config.ts`; no component library |
| CMS | **Sanity v3** (`next-sanity` v9) | Studio embedded at `/studio` in this same app |
| Hosting | **Vercel** | Git-push-to-deploy from `main` |
| Analytics | **@vercel/analytics** | Site-wide, plus a custom `cta_click` event |
| Unit tests | **Vitest 2** | `tests/**` |
| E2E tests | **Playwright** | `e2e/**`, boots `next dev` as its `webServer` |
| Runtime | Node 23 locally (18.18+ required) | |

There is **no database, no backend API, and no user auth** in the app itself. All dynamic
behavior is delegated to third parties (Sanity, Stripe, Calendly).

---

## 3. Repository layout

```
src/
  app/
    layout.tsx                     # bare <html>/<body> only
    (site)/                        # marketing route group — fonts, header/footer, metadata
      layout.tsx                   # fetches siteSettings, wraps in CtaSettingsProvider
      page.tsx                     # /
      about|services|success-stories|resources|contact/page.tsx
      welcome/page.tsx             # post-payment landing (noindex, dynamic)
    studio/[[...tool]]/page.tsx    # embedded Sanity Studio (kept outside (site) so it renders clean)
    api/revalidate/route.ts        # Sanity webhook → revalidateTag("sanity")
    robots.ts, sitemap.ts
  components/                      # hand-built UI; no UI library
  content/site.ts                  # ⚠️ now TYPES ONLY in practice (see Finding F9)
  lib/
    booking.ts                     # isEmbeddableCalendly()
    cta.ts                         # resolveCtaHref(), isExternal()
    welcome.ts                     # resolveWelcome() — plan → copy + booking URL
    seo.ts                         # SITE_URL + PUBLIC_ROUTES
    sanity/{client,fetch,image,queries}.ts
  sanity/                          # schema definitions + Studio structure
scripts/seed.ts                    # one-time dataset seed from site.ts (already run)
tests/lib/*.test.ts                # 34 unit tests
e2e/{welcome,services}.spec.ts
docs/{TESTING,UTM-SCHEME}.md, docs/Dev Notes/
README.md, DEPLOY.md, OWNER-GUIDE.md, PHASE-2-PLAN.md, content-map.md
```

### The core architectural principle — "Controlled Content Zones"

Content and design are deliberately separated so the owner can never break the layout:

- Every visual decision (spacing, color, motion, arrangement) lives in components and is
  **not** editable from the CMS.
- Every string, price, photo, and URL comes from Sanity via typed fetchers in
  `src/lib/sanity/fetch.ts`, which map raw GROQ results into the interfaces declared in
  `src/content/site.ts`.
- Because components are written against those interfaces, the CMS layer was swapped in
  under them with **zero component changes** (commit `d8ba4a7`).

When adding a field: schema (`src/sanity/schemaTypes/**`) → GROQ (`src/lib/sanity/queries.ts`)
→ raw type + mapper (`src/lib/sanity/fetch.ts`) → interface (`src/content/site.ts`) → component.

---

## 4. Integrations — what is actually wired up

### 4.1 Sanity CMS — **live and in use**

- Project ID `gze75b…` (value in `.env.local`), dataset `production`, API version `2025-01-01`.
- Studio embedded at **`/studio`** — Shane logs in with a Google account invited to the Sanity
  project. Excluded from `robots.txt` and from the sitemap.
- Reads use `useCdn: false`, `perspective: "published"`, no token (published content is public).
- Caching: every fetch is tagged `"sanity"` with a 60 s ISR fallback. A Sanity publish webhook
  POSTs `/api/revalidate` with an `x-revalidate-secret` header → `revalidateTag("sanity")` →
  the whole site refreshes immediately.
- Document types: **singletons** `siteSettings`, `homepage`, `aboutPage` (creation/deletion
  disabled in `sanity.config.ts`); **repeatable** `service`, `testimonial`, `resource`.
- `service` has a `status: active | retired` field so old offers can be hidden without deleting
  their copy; `status != "retired"` is applied in both service queries and treats legacy `null` as active.

Current dataset contents (verified live): 1 siteSettings, 1 homepage, 1 aboutPage,
**4 services**, **2 testimonials** (placeholders), **3 resources** (placeholders).

### 4.2 Stripe — **live mode, real products, verified working**

Payment Links only — no Stripe SDK, no webhooks, no server-side Stripe code. URLs are stored
as CMS fields so Shane can rotate them without a deploy.

| Service | Price | Payment Link | Verified |
|---|---|---|---|
| In Person 1-1 Session | $100 one-time | `buy.stripe.com/28E8wObk24w2cvm1kw3sI02` | ✅ renders "Pay TrainShane $100.00" |
| Essential Coaching (Most Popular) | $199/month | `buy.stripe.com/eVqfZgco6aUq8f67IU3sI01` | ✅ renders "Subscribe to Essential Coaching $199.00 per month" |
| Premium Coaching | $349/month | `buy.stripe.com/3cIdR887Q8Mi2UM8MY3sI00` | ✅ renders "Subscribe to Premium Coaching $349.00 per month" |
| Customer Portal (self-serve cancel) | — | `billing.stripe.com/p/login/3cIdR887Q8Mi2UM8MY3sI00` | ✅ renders the TrainShane portal login |

All four load in a headless browser with correct branding and **no test-mode banner** → Stripe
is in **live mode**. Note the Premium payment link and the portal link share the same 22-char
id; that is coincidental, both were confirmed independently.

Each Payment Link's *after-payment redirect* is expected to be
`https://shane-fitness-site.vercel.app/welcome?plan=<essential|premium|in-person>`. That
redirect is configured **inside the Stripe dashboard, not in this repo** — see Finding F3.

### 4.3 Calendly — **live, 4 event types, verified reachable**

| Purpose | CMS field | URL |
|---|---|---|
| Free consultation / default | `bookingUrl` | `calendly.com/shane12-sb/free-consultation` |
| Essential first session | `essentialBookingUrl` | `calendly.com/shane12-sb/30min` |
| Premium first session | `premiumBookingUrl` | `calendly.com/shane12-sb/weekly-one-on-one` |
| In-person session | `inPersonBookingUrl` | `calendly.com/shane12-sb/in-person-1-1-session` |

- Rendered as an **inline embed** (`src/components/CalendlyInline.tsx`, loads Calendly's
  `widget.js` on mount) on `/contact` and `/welcome`.
- `isEmbeddableCalendly()` (`src/lib/booking.ts`) gates the embed: a bare `https://calendly.com/`
  placeholder falls back to a plain "Choose a time" button instead of an empty widget.
- **Google Calendar** connects on the Calendly side (availability + Google Meet links for the
  virtual tiers, invitee-entered location for in-person). Nothing in this repo touches Google.

### 4.4 Vercel

- Project `shane-fitness-site`, org `team_YDomhmsFRn40Erqb3GON89qK` (`pbeins-projects`).
- Production alias: **`https://shane-fitness-site.vercel.app`** — always share this, never the
  per-deploy `-<hash>-pbeins-projects.vercel.app` snapshots.
- Push to `main` → production; any other branch → preview URL.
- **No custom domain yet.**
- The Vercel MCP token available in this environment only sees a different project
  (`made-med-spa`) and 403/404s on this one — verify against live URLs, not MCP.

### 4.5 Analytics / attribution

`@vercel/analytics` is enabled site-wide; every `CtaButton` fires
`track("cta_click", { type, text })`, so booking and payment clicks are counted with no extra
setup. The intended attribution model for the revenue share (site-unique Calendly link, UTM
scheme, "how did you hear about us" intake, monthly reconciliation) is written up in
`docs/UTM-SCHEME.md` — **designed but not yet implemented**.

### 4.6 Not integrated

No email service, no CRM, no newsletter, no forms backend, no error monitoring, no CI.
The contact form is a `mailto:` composer with no server component (and it is broken — F1).

---

## 5. The money flow (the most important path in the app)

```
/services or /  →  ServiceCard → CtaButton (type "payment", target = service.paymentLink)
                     ↓ opens in a new tab
                   Stripe Payment Link (live mode)
                     ↓ after-payment redirect configured in Stripe
                   /welcome?plan=essential|premium|in-person
                     ↓ resolveWelcome(plan, siteSettings)   [src/lib/welcome.ts]
                   per-plan heading + intro + per-plan Calendly URL
                     ↓ inline Calendly embed
                   booking lands on Shane's Google Calendar
```

`resolveWelcome` maps a free-form `?plan=` string to `PLAN_COPY` and to the matching
`*BookingUrl` field, falling back to `bookingUrl` and `DEFAULT_COPY` for unknown/missing plans,
so the page can never render blank. The `subscription` flag controls whether the "manage your
subscription" (Stripe portal) note appears — off for in-person.

**Verified live on production, 2026-08-19:**

| URL | Heading rendered | Calendly `data-url` embedded |
|---|---|---|
| `/welcome?plan=essential` | "Welcome to Essential Coaching" | `…/30min` ✅ |
| `/welcome?plan=premium` | "Welcome to Premium Coaching" | `…/weekly-one-on-one` ✅ |
| `/welcome?plan=in-person` | "Payment received — let's get you on the calendar" | `…/in-person-1-1-session` ✅ |
| `/welcome` (no plan) | "Payment received — let's get started" | `…/free-consultation` ✅ |

---

## 6. Environment variables

Local `.env.local` (gitignored); the same public three + the secret must be set in Vercel.

| Variable | Purpose | Present locally |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project | ✅ |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | ✅ |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2025-01-01` | ✅ |
| `SANITY_API_READ_TOKEN` | reserved for future draft/preview; **not used by `client.ts` today** | ✅ |
| `SANITY_API_WRITE_TOKEN` | only for the one-time `scripts/seed.ts`; not in `.env.example` | ✅ |
| `SANITY_REVALIDATE_SECRET` | shared secret for the Sanity → `/api/revalidate` webhook | ❌ **missing locally** |
| `NEXT_PUBLIC_SITE_URL` | overrides the hardcoded canonical URL | ❌ unset |

> Booking and payment URLs deliberately do **not** live in env vars — they are CMS fields so the
> owner can change them without a redeploy.

---

## 7. Verified health (run 2026-08-19)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run test:run` (Vitest) | ✅ 34/34 passing across 3 files |
| `npm run build` | ✅ 13 routes; all static except `/welcome` and `/api/revalidate` |
| Production homepage | ✅ 200, correct title, real Stripe + Calendly hrefs |
| `/studio` on production | ✅ 200 |
| `robots.txt` / `sitemap.xml` | ✅ served, `/studio` disallowed |
| Git sync | ✅ `main` == `origin/main`; only untracked file is `docs/Dev Notes/` |

Playwright E2E was **not** run in this audit (needs `npx playwright install chromium` plus a
dev server with CMS connectivity).

---

## 8. Audit findings

Ordered by impact. F1 and F2 are real defects on the live site.

### F1 — 🔴 The contact form emails the visitor, not Shane
`src/components/ContactForm.tsx:19` declares `const email = String(data.get("email") || "")`,
which **shadows the `email` prop** (Shane's address, line 11). Line 26 then builds
`mailto:${email}` from the shadowed local, so submitting the form opens the visitor's mail
client addressed **to the visitor themselves**. Every inquiry through `/contact` silently
fails to reach Shane. Fix: rename the local (e.g. `senderEmail`) and keep the prop for the
`mailto:` target — or, better, replace the `mailto:` approach with a real form endpoint.

### F2 — 🔴 Every page declares the homepage as its canonical URL
`src/app/(site)/layout.tsx:35` sets `alternates: { canonical: "/" }` in the route-group
layout. Next.js metadata is inherited, and no child page overrides it, so `/about`,
`/services`, `/contact`, `/resources`, and `/success-stories` all emit
`<link rel="canonical" href="https://shane-fitness-site.vercel.app">` (confirmed on
production). Search engines will treat every page as a duplicate of the homepage and drop
them from the index. Given that "increase traffic" is the client's top ask, fix this first:
remove `canonical` from the layout and set a per-page canonical (or derive it from the pathname).

### F3 — 🟠 The Stripe → `/welcome` redirect is still unverified end-to-end
The three after-payment redirect URLs live in the Stripe dashboard, outside this repo. The
site side is confirmed working (§5), but nobody has yet completed a real purchase and
confirmed the redirect, the Calendly booking, the Google Calendar event, and the receipt
email. `docs/TESTING.md` has the full per-plan manual checklist. **This is the gating task
before any further refactor** — the backlog in §9 was explicitly deferred until it passes.

### F4 — 🟠 A placeholder Stripe URL is still the fallback for payment CTAs
`siteSettings.primaryPaymentLink` is `null` and `siteSettings.paymentLinks[0].url` is still the
literal stub `https://buy.stripe.com/`. `resolveCtaHref` (`src/lib/cta.ts`) falls back to those
for any `payment` CTA without an explicit `target`. Nothing hits that path today (all three
paid services carry their own `paymentLink`), but the stub is serialized into the RSC payload
of every page and would become a dead checkout link the moment a payment CTA is added without
an override. It also defeats `e2e/services.spec.ts`, which only asserts the host is
`buy.stripe.com` — the stub would pass. Fix: delete the placeholder entry in the CMS, and
consider making `resolveCtaHref` return a safe route rather than a bare host.

### F5 — 🟠 Placeholder testimonials and resources are live on production
Both testimonials are authored by "Sample Client", and all three resources are dev-written
articles marked "Coming soon". Both pages render a visible dashed-border disclaimer ("Sample
stories shown for the demo…" / "Placeholder articles for the demo…"). Acceptable for a demo,
not for a site that is taking live payments. Needs real client testimonials and either real
posts or the removal of `/resources` from the nav and sitemap.

### F6 — 🟡 `siteSettings.phone` is a dead CMS field
The field exists in the schema, the GROQ query, and the `SiteSettings` type, but no component
renders it (`grep` for `phone` in `src/components` and `src/app` returns nothing). Shane can
fill it in and see no effect. Either render it in the footer/contact card or drop the field.

### F7 — 🟡 Fragile service slugs
Essential's slug is `virtual-coaching`; Premium's is `"virtual-coaching "` — **with a trailing
space**. They differ by one invisible character. Nothing breaks today (the homepage matches by
exact string and GROQ preserves the space), but any trim/normalize/slugify anywhere would
collapse them into a collision. Rename to `essential-coaching` / `premium-coaching`. Safe to
do: `homepage.featuredServices` are document *references*, not slug strings.

### F8 — 🟡 The "Most Popular" highlight is hardcoded to a slug
`src/components/ServiceCard.tsx:86` picks the red primary button via
`service.featured && service.slug === "virtual-coaching"`. Replace with a dedicated boolean
field on the `service` schema (the intent is already spelled out in the service *name*,
"Essential Coaching (Most Popular)").

### F9 — 🟡 `src/content/site.ts` is ~300 lines of dead data
Every remaining import of it is `import type` — the actual `siteSettings` / `homepage` /
`services` data exports are unreferenced since the CMS swap. Keeping them invites edits that
silently do nothing. Split the file into a types-only module (e.g. `src/content/types.ts`) and
delete the data, or move the data into `scripts/seed.ts` where it is the only consumer.

### F10 — 🟡 Owner- and developer-facing docs are stale
`README.md` still says "Status: Phase 1 — Visual Demo… Booking and payment buttons point at
placeholder links", and its roadmap marks Phase 2/3/4 unchecked. `OWNER-GUIDE.md` tells Shane
his Book and Pay buttons are placeholders. Both were true in June and are wrong now — Shane is
the primary reader of `OWNER-GUIDE.md`, so this actively misinforms the client.

### F11 — 🟡 No CI, and the revalidation webhook is unverified
There is no `.github/` directory, so the 34 unit tests and the E2E suite only run when someone
runs them locally. Separately, `SANITY_REVALIDATE_SECRET` is absent from `.env.local`, and
`/api/revalidate` returns 401 both when the secret is wrong *and* when it is unset — so it is
not possible to confirm remotely whether the Vercel env var and the Sanity webhook are actually
configured. Verify in the Sanity and Vercel dashboards; without it, publishes take up to 60 s
(the ISR fallback) instead of being instant.

### F12 — 🟡 No custom domain; canonical URL is hardcoded
`src/lib/seo.ts` defaults `SITE_URL` to `https://shane-fitness-site.vercel.app`, which flows
into `metadataBase`, OG tags, `robots.txt`, and the sitemap. A domain purchase (registered in
**Shane's** name per the ownership plan) plus setting `NEXT_PUBLIC_SITE_URL` is a prerequisite
for serious SEO work — and note that `/studio` becomes `your-domain.com/studio`, which the
owner guide already promises.

### F13 — ⚪ CMS outages 500 the site
`(site)/layout.tsx`, `/welcome`, `/contact`, and `/services` all `throw` when `siteSettings`
is missing. That is a deliberate fail-loud choice and it makes the E2E suite CMS-dependent by
design, but there is no `error.tsx` boundary, so a Sanity outage yields an unstyled Next error
page rather than a branded fallback.

---

## 9. What should happen next

### Immediate (before anything else)
1. **Fix F1** — the contact form. One-line shadowing bug losing real leads.
2. **Fix F2** — per-page canonical URLs. Blocks the client's #1 goal (traffic).
3. **Run the F3 manual checklist** in `docs/TESTING.md` — one real purchase per tier, end to
   end, confirming redirect → Calendly → Google Calendar → receipt. Stripe is in **live mode**,
   so use a real card and refund, or temporarily switch to test-mode links.
4. **Clear the F4 placeholder** payment link out of the CMS.

### Deferred tidy-up pass (explicitly backlogged by the developer on 2026-06-28, to be done as *one* deliberate change only after step 3 passes)
- Move the three per-tier booking URLs off `siteSettings` and onto each `service` document as a
  `firstSessionBookingUrl` field, make `?plan=` equal the service **slug**, and have `/welcome`
  call `getService(plan)`. Requires clean slugs (F7), re-editing the three Stripe redirect URLs,
  and deciding where `PLAN_COPY` lives.
- Clean the service slugs (F7) and add a "Most popular" boolean (F8).
- Update `tests/lib/welcome.test.ts` and `e2e/welcome.spec.ts` alongside.

### Content and launch readiness
- Real testimonials and either real resource posts or removal of the section (F5).
- Refresh `README.md` and `OWNER-GUIDE.md` to reflect the live state (F10).
- Buy the domain in Shane's name; set `NEXT_PUBLIC_SITE_URL` (F12).
- Add CI running `tsc --noEmit`, `vitest run`, and `next build` on PRs (F11).

### Client requests captured on 2026-06-13 (not yet built)
From `docs/Dev Notes/06-13-2026.txt` — these are the client's own words and represent the next
*feature* wave, not bugs:

- **Video on the homepage**, uploadable and swappable through the CMS. Shane is shooting
  footage. No video field exists in any schema today. This is his biggest ask — he wants the
  personal/emotional hook so visitors "know what they are getting."
- **Mobile impact** — "on mobile it doesn't hit as hard visually." A responsive walkthrough was
  requested; reference site is **kinobody.com** (minus the supplement store).
- **Design tokens the owner can nudge** — he asked whether he can change colors and background
  graphics himself. Likely too much CMS surface to expose safely; needs a scoped answer.
- **Visual polish** — "lighten the blacks, whiten the whites so there is more contrast, bold the
  letters a little more." Concrete and cheap: `tailwind.config.ts` `ink`/`cream` scales.
- **Services page copy** — the Virtual Coaching description reads long.
- **Google Business Profile / targeted ads** — access has been shared. Open question: how to run
  local ads without a fixed location. Strategy is to lean online rather than in-person; all
  consultations are virtual (Zoom/Meet).
- **Business** — get the 5% revenue-share contract signed before invoicing anything.

### Ownership / handoff (Phase 3, planned in `PHASE-2-PLAN.md`, not started)
Move the repo into a GitHub org and the Vercel project into a team with both parties as
members; invite Shane as Sanity **Administrator**; keep Stripe, Calendly, Google, and the
domain in his name with the developer as a delegate. Goal: "he could fire the developer
tomorrow and lose nothing."

---

## 10. Conventions and gotchas for an agent working in this repo

- **Never put booking or payment URLs in code or env vars.** They belong in the CMS so the
  owner can change them without a deploy. Same for any user-visible string.
- **Design is not owner-editable, by design.** Do not add CMS fields that control layout,
  spacing, or arrangement — that violates the Controlled Content Zones principle the whole
  architecture is built on.
- **Adding a content field is a 5-file change:** schema → GROQ query → raw type + mapper →
  interface in `content/site.ts` → component.
- **Never overwrite an image at the same `/public` path** — Next's image optimizer plus the CDN
  will serve the stale one. Give swapped images a new filename. (CMS-uploaded images get unique
  CDN URLs automatically and are exempt.)
- **`/studio` lives outside the `(site)` route group** so it renders full-screen without the
  marketing chrome. Keep it that way; it is also 1.4 MB of JS, which is why it is isolated.
- **Retire services, don't delete them** — flip `status` to `retired` and the copy is preserved.
- **`e2e` specs assert on structure and URL *hosts*, never on CMS values**, so they stay green as
  Shane edits content. Preserve that property.
- **Verify against live URLs, not the Vercel MCP tools** — the available token cannot see this
  project.
- `PROJECT-HANDOFF.md` and `SquareSpaceDemo/` are gitignored/reference-only; `.env.local`
  contains a Sanity **write** token — never commit or echo it.
