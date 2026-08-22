# Launch Readiness — Train Shane

**Target: Sunday 2026-08-23.** Custom domain connected, site live, clients able to
book and buy.

**Status of this repo: ACTIVE again.** The 2026-08-19 decision to freeze it as
reference-only for the Spiderweb port is reversed. `PORT-INVENTORY.md` stays valid as
a description of the site, but its "known gaps to carry into the port" list is now a
work list for *this* codebase. Ship here; port later.

Audited 2026-08-21 against `main` (3b7e169) and against the live production site.

---

## 0. How the audit was run

`scripts/audit-site.mjs` drives headless Chromium over every public route at
390×844 (phone) and 1440×900 (desktop). It scrolls each page so the
reveal-on-scroll sections actually render, then records HTTP status, console
errors, failed requests, horizontal overflow, tap-target sizes, heading
structure, per-page asset weight, and the mobile menu's behaviour, plus a
full-page screenshot of each.

```bash
npm run dev                                  # in one terminal
OUT=./tmp node scripts/audit-site.mjs        # writes tmp/audit-report.json + tmp/shots/
BASE=https://<domain> node scripts/audit-site.mjs   # or point it at production
```

Also run: `npm run test:run` (52 pass), `npx tsc --noEmit` (clean), `npm run build`
(clean, 13 routes). Every outbound Stripe / Calendly / Instagram / billing-portal
URL in the CMS returns 200.

---

## 1. Blockers — must be resolved before Sunday

### B1. The contact form does not send anything, to anyone

`ContactForm.tsx` sets `window.location.href` to a `mailto:` link and then shows
"Your email app should have opened…" **unconditionally** — it never checks, because
it cannot. Verified in the browser: submitting a filled form produced no navigation
and no request. There is no backend, no email service, no stored record
(`PORT-INVENTORY.md` §7.6: "There is no email service, CRM, newsletter, forms
backend, or error monitoring").

Failure modes in the wild:

- Desktop visitor with no OS mail client registered (anyone living in Gmail's web
  app — a large share of the audience): clicking Send does nothing at all. The
  success message still appears. The lead is gone and nobody knows.
- Phone visitor: the mail app opens with a pre-filled draft they must still send.
  Real-world drop-off on that extra step is heavy.
- Shane gets no notification and there is no record anywhere of who tried.

For a launch whose entire purpose is inbound clients, this is the single most
expensive defect on the site. **Fix: a real form backend** — a server route that
posts the inquiry to a transactional email provider, plus an on-page success/error
state that reflects what actually happened. Decide the provider (see §5) and wire it.

### B2. ~~The launch-insurance fixes were never pushed~~ — RESOLVED 2026-08-21

Live `https://shane-fitness-site.vercel.app/services` returns
`<link rel="canonical" href="https://shane-fitness-site.vercel.app"/>` — the
homepage URL, i.e. pre-F2 behaviour. (Independently reproduced from outside this
session, given how much rides on it.)

The cause is worse than a missed deploy. `origin/main` is at `9dd1465`. Local `main`
is **4 commits ahead and unpushed**, and the working branch is `launch/demo-copy`:

- `85af5fb` — **fix: send contact inquiries to Shane, not back to the sender.**
- `d2cc382` — fix: per-page canonical URLs.
- `3b7e169` — docs: PORT-INVENTORY.md
- `da44733` — chore: snapshot working tree

So these aren't merely undeployed, they are **not backed up anywhere** — one disk
failure and both fixes plus the port inventory are gone. Meanwhile **the contact form
on the live site today mails inquiries to the visitor's own address**, which is not
just useless but actively misleading.

Pushing was therefore both the backup and the fix.

**Done.** `git push origin main` (`9dd1465..3b7e169`), Vercel deployed, verified live:
`/services` now returns `<link rel="canonical" href="https://shane-fitness-site.vercel.app/services"/>`.
The live contact form mails Shane again rather than the visitor. Note the previous
production deploy was two days old, consistent with the finding.

### B3. Success Stories is an empty page, in the main nav and the sitemap

The CMS has zero `testimonial` documents. `/success-stories` renders a heading, then
a 160–224px band of nothing where the grid would be, then a footer. The homepage
already guards this (its testimonial band is gated on `testimonials.length > 0`); the
dedicated page does not. It is linked from the header, the footer, and
`sitemap.xml`. See §4 — this needs a decision from Shane, not just code.

### B4. Resources is three dead teasers

Three `resource` documents render as cards ending in a non-clickable "Coming soon →".
There is no body field and no detail route, so there is nothing to click through to.
Also in the header, footer, and sitemap. Same call as B3 — see §4.

### B5. Domain, `NEXT_PUBLIC_SITE_URL`, and the redeploy that has to follow

`src/lib/seo.ts` falls back to `https://shane-fitness-site.vercel.app` when
`NEXT_PUBLIC_SITE_URL` is unset — and `vercel env ls` confirms it **is** unset in
Production, so the fallback is what is live today. That value feeds `metadataBase`, every canonical,
`robots.txt`, `sitemap.xml`, and the OG/Twitter image URLs.

The catch: every marketing page is **statically prerendered at build time**
(`npm run build` shows them as `○ Static`). Setting the env var in Vercel does
nothing to the already-built HTML. `robots.txt` and `sitemap.xml` are worse —
`initialRevalidateSeconds: false`, so they are frozen at build and will keep
advertising the old host until a rebuild, with no ISR to save them.

The order on Sunday must be: add the domain → set `NEXT_PUBLIC_SITE_URL` for
Production → **redeploy** → verify. Full runbook in §6.

---

## 2. Fixed in this pass

| Fix | What was wrong |
|---|---|
| **Mobile menu fills the viewport, and locks the page behind it** | The panel was a `max-h-[28rem]` drawer: 405px tall in an 844px viewport, leaving a strip of page showing underneath, and the page scrolled freely behind it (measured: 600px of scroll leaked through). Now `fixed inset-x-0 top-20 bottom-0` with `overflow-y-auto overscroll-contain`, `overflow:hidden` on the scrolling elements while open, Escape to close, and `aria-controls`. Scroll position is captured on open and restored on close — `overflow:hidden` clamps the offset to 0, so without that, closing the menu jumped you to the top of the page. Restoring is skipped when the menu closed because a nav link was tapped, so a new page still starts at the top. |
| **Header restructured so `fixed` works inside it** | `backdrop-blur` on `<header>` makes it the containing block for any `fixed` descendant, which would have silently broken the panel above. The blur now lives on an inner wrapper. |
| **Services page reads as a pricing page** | Four cards in a 3-column grid with `items-start` gave ragged heights and an orphan fourth card alone on row two. The free consultation — the only service you *book* rather than *buy* — now leads as a full-width "Start here" strip, and the three paid plans sit side by side at equal height with their CTAs aligned. Falls back to one grid if the CMS ever has zero or several bookable services. |
| **The "Most Popular" tier is actually highlighted** | `ServiceCard` gated its primary styling on `service.featured && service.slug === "virtual-coaching"`. That slug was cleaned up in the CMS to `essential-coaching`, so the condition had been dead — no card had rendered as featured, on any page, since. Now driven by `featured` alone, with a badge, a red CTA, and a brand-tinted border. |
| **"(Most Popular)" no longer printed twice** | It was typed into the CMS *name* field. Stripped for display so the badge is the only place it appears. (Still worth removing at the source — §3, C4.) |
| **Missing `<h1>` on /services, /success-stories, /resources** | All three started at `<h2>` — including `/services`, the page that has to rank. `SectionHeading` takes an `as` prop; each page now has exactly one `<h1>`. |
| **CMS whitespace trimmed** | `"$100 "`, `"1 Hour "`, `"Book Session "`, `"All training equipment provided "` etc. now trimmed in the fetch layer, so trailing spaces stop showing as odd gaps. |
| **Real hero photo, and a treatment that lets it show** | The old image sat at `opacity-40` under two stacked scrims and was effectively invisible. Replaced with Shane's gym photo, which carries its own composition — him on the right, empty wall on the left — so the treatment now only protects the headline instead of trying to rescue the image. Narrow screens crop in on him and get a flat scrim; wide screens don't need one. **Shipped from `/public`, not the CMS field**, because the Sanity `production` dataset is frozen read-only for the Spiderweb fallback — move it back to `homepage.hero.image` once that lifts, so Shane can swap it himself. Source is 1672×941; worth getting the full-resolution original from the photographer for 2× displays. |
| **Branded 404 and error boundaries** | Added `app/not-found.tsx` (global 404), `app/(site)/error.tsx` (page-level), and `app/global-error.tsx` — the last of which is the only thing that catches a throw in the `(site)` layout, which is exactly what a missing siteSettings document causes. All three make no CMS call and pull no shared chrome, on the principle that they render when nothing else does. Verified: an unmatched URL now returns 404 with the branded page. |
| **Page no longer depends on JS to be visible** | Every section below the hero starts at `opacity: 0` and is un-hidden by an IntersectionObserver (19 of 19 elements on the homepage). Added a `@media (scripting: none)` fallback so a scripting failure doesn't render the site blank. |

Verified after the changes: menu panel bottom = viewport bottom, 0px scroll leak,
scroll position preserved on close and reset on navigation, `<h1>` present on every
route, tests and typecheck clean, build clean.

---

## 3. Should fix before or shortly after launch

**S1 — Stripe → `/welcome` has never been tested with a real card.** The three
Payment Links' after-payment redirects are configured in the Stripe dashboard, not
in this repo, and they point at the current `vercel.app` host. They must be
re-pointed at the new domain (§6) and then walked end-to-end once with a real card
and a refund. This is the buying flow; it is the one path that must not be assumed.

**S2 — No branded error or 404 page.** There is no `not-found.tsx` and no
`error.tsx`. A bad URL gets Next's bare default with no header, nav, or way back.
Worse: every page does `throw new Error("Missing siteSettings document")` if the CMS
read fails, so a Sanity outage takes the *whole site* to a 500 rather than degrading.

**S3 — RESOLVED, and the answer is that on-demand revalidation is dead.**
`vercel env ls` on `pbeins-projects/shane-fitness-site` returns exactly four
variables — `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_SANITY_DATASET`,
`NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_API_READ_TOKEN`, all Production.
**`SANITY_REVALIDATE_SECRET` is not set, in any environment.** So if a Sanity
webhook exists at all it has been silently 401ing since the day it was configured,
and every CMS edit has been landing via the 60s ISR fallback.

The 60s ISR fallback underneath it **is** confirmed working, so this is a
nice-to-have rather than a blocker: `.next/prerender-manifest.json` shows
`initialRevalidateSeconds: 60` on all five CMS-backed routes, and production
responds with `x-vercel-cache: STALE` at `age: 166` — i.e. serving the cached copy
and regenerating behind it, exactly as ISR should. (The alarming-looking
`x-nextjs-stale-time: 4294967294` on those responses is the *client router* cache
stale time for a prerendered page, not the ISR window. It does not mean
revalidation is dead.) Worst case without the webhook: Shane's edits appear within
a minute instead of instantly.

Two ways forward, both fine:
- **Set it** (~10 min): `vercel env add SANITY_REVALIDATE_SECRET production`, then
  point a Sanity webhook at `https://<domain>/api/revalidate` with a matching
  `x-revalidate-secret` header, filtered to the **`production` dataset** (an
  unfiltered project-level webhook would also fire on the Spiderweb project's
  `platform` dataset). Shane's edits then appear instantly.
- **Accept the 60s fallback** and delete the route rather than leave a dead endpoint
  on the site. Defensible for launch — a minute's delay on a marketing edit is not
  a problem anyone will notice.

Note the Vercel MCP is not a substitute for the CLI here: it 404s on this project
(and on others in the same team) while `list_projects` returns only an unrelated
one, so the project is *not auditable through it* — which is not the same as absent.
Production serves 200 on both its aliases.

Fixed in passing: the route returned the same 401 whether the secret was *wrong* or
*absent on the server*. Those are very different problems and the second is the
dangerous one, so an unset secret now fails loudly with a 500 that says so.

**S4 — `/contact` pulls ~860KB of third-party JS; `/welcome` ~1.2MB.** All of it
from the Calendly inline embed: reCAPTCHA (312KB ×2), `js.stripe.com/v3` (238KB),
OneTrust (121KB), and the **Facebook pixel** (105KB). Slow on a phone, and it means
third-party tracking loads on those pages with no notice on the site. Consider
loading the embed on interaction ("Pick a time" → then mount) rather than on page
load.

**S5 — DONE.** Footer links measured 17px tall. Padding moved onto the links
themselves (not gaps on the list) so the hit area grew with them: now 36px. That
clears the WCAG 2.2 AA minimum of 24px with room. Apple's 44px HIG figure would make
a five-item footer list disproportionately tall, so 36px is the deliberate stopping
point rather than an oversight.

**S6 — DONE.** Added `src/app/icon.png` (192px) and `src/app/apple-icon.png` (180px),
generated from the Sanity logo asset. This also required **removing `icons` from the
`(site)` layout metadata** — declaring it there overrides Next's file convention, which
is why the tab icon had been an unsized remote CDN fetch with nothing for bookmarks or
home-screen saves. Verified serving as `/icon.png` and `/apple-touch-icon`.

**S7 — OG image is the 2500×1667 hero at 514KB.** Share cards want ~1200×630. Worth
one purpose-made image, since Instagram → link-share is the likely traffic path.

**S8 — Nothing measures the contact form.** `CtaButton` fires
`track("cta_click", …)` for booking/payment, but a form submit is untracked. Add one
once B1 gives it a real submit.

**S9a — Do not merge `origin/vercel/react-server-components-cve-vu-6ku0wv`.**
Vercel auto-opened this branch, but it is based on `50127d9` ("Phase 1 — visual
demo"), long before the CMS existed. Diffed against `origin/main` it removes **20,075
lines** — all of Sanity, the Studio, every schema, the Vitest suite, and Playwright —
and it does **not** bump Next (still `15.1.11`). Merging it would delete most of the
site. Delete the branch so nobody trusts the name.

The underlying question it raises is still worth answering separately: check whether
`next@15.1.11` is actually affected by the RSC advisory and, if so, bump Next on a
branch of your own. Do not let a misleading auto-branch stand in for that.

**S9 — No privacy policy, terms, or refund/cancellation policy.** The site now takes
names and emails, runs Vercel Analytics, loads a Facebook pixel via Calendly, and
sells recurring subscriptions. A short policy page and a refund/cancellation
statement are worth having on day one, and Stripe will expect the latter.

---

## 4. Needs Shane — revisit, do not guess

These are content decisions, not code. He hasn't trained clients through the site
yet, so the honest answer is that some of this content doesn't exist yet.

### Success Stories (`/success-stories`) — B3

Zero testimonials. Options, in the order I'd suggest them:

1. **Hide the page for launch.** Remove it from `navLinks` (`SiteHeader.tsx`), the
   footer, and `PUBLIC_ROUTES` (`src/lib/seo.ts`). Restore it the moment he has two
   or three real quotes. The homepage band already reappears by itself when a
   testimonial is published — the same gating should exist here.
2. **Reframe as founding clients.** Keep the page, replace the empty grid with an
   honest "I'm taking on my first coaching clients — your story could be the first
   one here" panel. Works only if the copy is genuinely upfront about it.
3. **Use his own story.** He has a transformation of his own (it's already the
   `/about` narrative). A single first-person case study is real content and beats
   an empty grid.

**Also needed: a way to collect them.** Two or three sentences asked for at the end
of week 4, in writing, with permission to publish and a first name + role. Worth
agreeing the ask now so the page fills in six weeks instead of never.

### Resources (`/resources`) — B4

Three teasers with nowhere to go. Options:

1. **Hide the page for launch** (same three places as above). Cleanest — an empty
   content section on a brand-new site costs more credibility than it buys.
2. **Write the three posts.** Needs a `body` field on the `resource` schema and a
   `/resources/[slug]` route. Realistically a post-launch job, not a Saturday one.
3. **Point them somewhere real** — an Instagram post or a PDF. Needs an honest link
   instead of "Coming soon".

### Home page hero image

Shane's instinct here is right — the current one barely registers. The photo is
CMS-driven (`homepage.hero.image`), so **he can swap it in the Studio with no
deploy**, which makes it the cheapest win on this list. But the treatment is
crushing it: the image renders at `opacity-40` under *two* stacked gradients
(`from-ink-950 via-ink-950/85 to-ink-950/40` plus a bottom-up fade). Even a great
photo would be nearly invisible on the left half, which is exactly where the
headline sits.

Suggested: pick a real gym / lifting photo with a dark-ish right side and open space
on the left, raise the image to roughly `opacity-60`, and soften the horizontal
gradient so the right third of the frame actually shows. Contrast on the headline
needs re-checking after any change.

### CMS data hygiene (5 minutes in the Studio)

- **C1** — Premium Coaching stores "Per Month" in `duration`, Essential stores it in
  `priceNote`. They render in different places on the card. Move Premium's to
  `priceNote` so the two subscription tiers match.
- **C2** — Hero headline is `"More results - Less time "`: trailing space, and a
  hyphen where an en dash belongs.
- **C3** — `siteSettings.phone` and `aboutPage.heading` are editable in the Studio
  but rendered nowhere. Either use them or drop them, so nobody edits a dead field.
- **C4** — Remove "(Most Popular)" from the Essential Coaching *name*. The code
  strips it now, but the CMS is where it should stop existing.

---

## 5. Open decision: the contact form backend (B1)

Needs picking before it can be built. The shape is the same either way: a Next.js
route handler that validates the payload, sends Shane a notification email, and
returns a real success/failure the form can render. Additions worth considering:
a copy to the visitor confirming receipt, basic spam protection (honeypot + rate
limit), and a `track()` call on success.

**Provider: Resend.** `vercel integration discover --category messaging` returns
exactly one product — `resend/resend-email`. `vercel integration list` shows no
resources currently provisioned on this project, so it needs installing:
`vercel integration add resend/resend-email`, then `vercel env pull` and build
against the real env vars. Do not `npm install` an email SDK and hand-wire it.

This is the only blocker with real build time in it, and the one that decides
whether launch day produces clients or silence.

---

## 6. Sunday runbook

Order matters — several of these bake values into a static build.

1. **Ship `main`.** Production is behind (B2). Deploy and confirm
   `/services` canonical is `…/services`, not the bare domain.
2. **Add the domain** in Vercel → Project → Domains. Set the apex/www redirect the
   way Shane wants it. DNS can take a while — do this first.
3. **Set `NEXT_PUBLIC_SITE_URL`** = `https://<the new domain>` for the Production
   environment. Confirm `SANITY_REVALIDATE_SECRET` is also set (S3).
4. **Redeploy.** Non-negotiable: canonicals, `robots.txt`, `sitemap.xml`, and OG URLs
   are baked into the static HTML at build time. The env var alone changes nothing.
5. **Re-point the three Stripe Payment Link redirects** at
   `https://<domain>/welcome?plan=…` (S1), and the `manageSubscriptionUrl` portal
   return URL.
6. **Walk the money path on the real domain**: buy the cheapest tier with a real
   card → land on `/welcome` → book the Calendly slot → confirm the calendar invite
   arrives → refund the charge. Then the same for the free-consultation booking.
7. **Submit the contact form** on the live domain and confirm Shane receives it
   (after B1 is built).
8. **Re-run the browser audit against production**:
   `BASE=https://<domain> node scripts/audit-site.mjs` — expect 200s everywhere, no
   console errors, an `<h1>` per route, and canonicals on the new host.
9. **Verify `/robots.txt` and `/sitemap.xml`** show the new domain and that
   `/studio` is disallowed.
10. **Google Search Console**: add the property, submit the sitemap. Also worth
    setting up a Google Business Profile — for "personal trainer DC/MD/VA", local
    search is where this audience actually is.
11. **Publish a trivial CMS edit and watch it land.** Appears in seconds = the
    webhook and the secret are both good. Appears in ~a minute = the webhook is
    dead and ISR is carrying it (survivable — see S3). Never appears = stop and
    investigate. One test, three answers, no dashboard needed.

---

## 7. Revisit after launch

- Success stories and resources (§4) once real content exists.
- Testimonial collection habit — the week-4 ask.
- Attribution: `docs/UTM-SCHEME.md` is designed but not built; no UTMs are appended
  to outbound booking or payment links, so Calendly bookings can't be traced back to
  the site.
- No CI. Tests and typecheck are green but nothing enforces that on push.
- Graceful CMS-outage degradation (S2) instead of a site-wide 500.
- The Spiderweb port, whenever it resumes — `PORT-INVENTORY.md` stays the reference,
  minus the gaps this document closes.
