# Port Inventory — Train Shane site → Spiderweb platform

**Purpose.** This is the complete functional inventory of the standalone Train Shane
site, written as the input to composing it out of Spiderweb blocks. It is derived from
the codebase and the live Sanity dataset (read 2026-08-19), not from memory.

**How to read it.** Sections 3–5 are the block-library brief: every route, every visual
section, and the data each one needs. Sections 6–10 are the behaviour, integration, and
design contracts a re-implementation has to honour. Section 12 lists what is knowingly
imperfect today, so the port doesn't faithfully reproduce a defect.

Repo state at time of writing: branch `main`, tag `pre-spiderweb-port`. This repo is
reference-only from here.

---

## 1. What the site is

A six-page marketing site for a personal trainer (Train Shane — DC/MD/VA and virtual),
plus a non-indexed post-payment page. It sells three paid offers and a free
consultation. It takes no payments itself and stores no user data: money goes through
Stripe Payment Links, scheduling goes through Calendly, and the contact form composes a
`mailto:` in the visitor's own mail client.

All owner-editable content lives in Sanity, and every destination URL (booking, payment,
billing portal) is a CMS field — so the owner can rotate a Stripe link or a Calendly
event without a deploy. **Preserving that property is the single most important
constraint on the port.**

## 2. Stack and runtime shape

| Concern | Implementation |
|---|---|
| Framework | Next.js 15.1.11, App Router, React 19 |
| Styling | Tailwind 3.4 plus a small `globals.css` component layer |
| CMS | Sanity v3 (`next-sanity`), Studio embedded at `/studio` |
| Fonts | `next/font/google` — Oswald (display), Inter (body), exposed as CSS variables |
| Hosting | Vercel, project `shane-fitness-site`; no custom domain |
| Analytics | `@vercel/analytics` plus one custom event |
| Tests | Vitest (unit, node env) and Playwright (E2E, browsers not installed) |

**Layout split.** `src/app/layout.tsx` is a bare `<html><body>` only. All site chrome —
fonts, Tailwind, metadata, header, footer, analytics, CTA context — lives in the `(site)`
route-group layout, so `/studio` renders full-screen with none of it. A block platform
needs the same escape hatch for any admin-style surface.

**Rendering and caching.**

- Every CMS read goes through `fetchOpts = { next: { revalidate: 60, tags: ["sanity"] } }`.
- All `(site)` pages prerender statically **except `/welcome`**, which is dynamic because
  it reads `searchParams`.
- `/studio` is `dynamic = "force-static"`; `/api/revalidate` is a dynamic route handler.
- A Sanity publish webhook POSTs `/api/revalidate`, which calls `revalidateTag("sanity")`
  so the whole site refreshes immediately instead of waiting out the 60s fallback.
- **Failure mode:** every page that needs `siteSettings` (or `homepage` / `aboutPage`)
  throws when the document is missing, so a CMS outage 500s the site rather than
  degrading. The port should decide deliberately whether to keep that.

---

## 3. Route map

| Route | Render | Data it reads | Canonical | Robots |
|---|---|---|---|---|
| `/` | static | homepage, services, aboutPage (credentials), testimonials, siteSettings | `/` | index |
| `/about` | static | aboutPage, credentials, interests, siteSettings | `/about` | index |
| `/services` | static | services, siteSettings | `/services` | index |
| `/success-stories` | static | testimonials | `/success-stories` | index |
| `/resources` | static | resources | `/resources` | index |
| `/contact` | static | siteSettings | `/contact` | index |
| `/welcome` | dynamic | siteSettings plus `?plan=` | `/welcome` | **noindex, nofollow** |
| `/studio/[[...tool]]` | force-static | Sanity Studio | — | disallowed in robots.txt |
| `/api/revalidate` | route handler (POST) | — | — | — |
| `/robots.txt`, `/sitemap.xml` | generated | `PUBLIC_ROUTES` | — | — |

`PUBLIC_ROUTES` (`src/lib/seo.ts`) is the single source for the sitemap and for the
canonical test: `["", "/about", "/services", "/success-stories", "/resources", "/contact"]`.
`/welcome` and `/studio` are deliberately excluded.

There is **one dynamic content route**: `/resources/[slug]`, the article pages, added
2026-08-24. It is prerendered per published `post` via `generateStaticParams`, with
`dynamicParams` left at its default so an article published after a deploy renders on
first request. Its sitemap entries are appended in `sitemap.ts` rather than living in
`PUBLIC_ROUTES`.

There is still no `/services/[slug]`. A `getService(slug)` fetcher and a
`serviceBySlugQuery` exist but nothing calls them; they are the seam a future
per-service detail page would use.

---

## 4. Content model (Sanity)

Three singletons (creation and deletion disabled in `sanity.config.ts`) and three
repeatable types. The Studio desk (`src/sanity/structure.ts`) pins the singletons at the
top and splits Services into **Active / Retired** lists.

### 4.1 `siteSettings` (singleton, `_id: "siteSettings"`)

| Field | Type | Required | Consumed by |
|---|---|---|---|
| `businessName` | string | yes | header aria-label, footer, title template, OG siteName |
| `tagline` | string | yes | footer |
| `email` | string (email) | yes | contact card, footer, **contact form recipient**, welcome fallback |
| `phone` | string | no | **nothing — dead field** |
| `serviceArea` | text | yes | footer, home CTA band, about CTA band, services fine print, contact page |
| `socialLinks[]` | `socialLink` | no | footer and contact page (only `platform === "instagram"` is ever read) |
| `bookingUrl` | url | yes | every `booking` CTA site-wide; `/contact` embed; welcome fallback |
| `essentialBookingUrl` | url | no | `/welcome?plan=essential` |
| `premiumBookingUrl` | url | no | `/welcome?plan=premium` |
| `inPersonBookingUrl` | url | no | `/welcome?plan=in-person` |
| `primaryPaymentLink` | url | no | fallback for `payment` CTAs with no target |
| `paymentLinks[]` | `paymentLink` | no | second fallback (`paymentLinks[0].url`) |
| `manageSubscriptionUrl` | url | no | footer link and welcome footnote (subscription plans only) |
| `logo` | image (hotspot) | no | header, footer, favicon (`icons.icon`) |
| `seo.title` / `seo.description` | string / text | no | default title, title template, description, OG, Twitter |

Live values: `primaryPaymentLink` is null and `paymentLinks` is now **empty** — the
placeholder `https://buy.stripe.com/` entry was deleted (finding F4). Both fallback tiers
are therefore unpopulated, so a `payment` CTA with no per-service link would resolve to
`"#"`. Today every paid service carries its own link, so nothing depends on the fallbacks.

### 4.2 `homepage` (singleton, `_id: "homepage"`)

`hero { eyebrow, headline*, subheadline, image, primaryCta: cta, secondaryCta: cta }`,
`whoHeading`, `whoIntro`, `whoFor: string[]`, `philosophy { heading, body: plainText }`,
`featuredServices: reference[] -> service` (order preserved), `mission`.

The GROQ projection dereferences to slugs (`featuredServices[]->slug.current`) and the
page re-matches them against the already-fetched services list. **Featured order comes
from the reference array, not from `service.order`.**

### 4.3 `aboutPage` (singleton, `_id: "aboutPage"`)

`heading*`, `portrait` (image), `story: plainText`, `goalHeading`, `goal: plainText`,
`mission`, `credentials[]: credential`, `interests[]: interest`.

`heading` is fetched but **never rendered** — the About page `<h1>` is the hardcoded
string "About Me".

### 4.4 `service` (repeatable)

`name*`, `slug*`, `shortDescription`, `price` (string, e.g. "$100"), `priceNote`
(e.g. "per month"), `duration`, `ctaType*` (`booking` | `payment` | `link`, radio),
`ctaText*`, `paymentLink` (url — the per-service Stripe link), `included: string[]`,
`whoFor: string[]`, `approach` (text), `featured` (bool), `order` (number),
`status` (`active` | `retired`, radio).

`status != "retired"` is applied in **both** service queries, and a legacy `null` counts
as active. Retiring a service hides it everywhere while preserving its copy — the
intended alternative to deleting an old offer.

Live services (order asc):

| Name | Slug | Price | CTA type | Stripe link |
|---|---|---|---|---|
| Consultation | `free-consultation` | Free | `booking` | — |
| In Person 1-1 Session | `in-person-1-1-session` | $100 | `payment` | `buy.stripe.com/28E8wObk24w2cvm1kw3sI02` |
| Essential Coaching (Most Popular) | `virtual-coaching` | $199 / Per Month | `payment` | `buy.stripe.com/eVqfZgco6aUq8f67IU3sI01` |
| Premium Coaching | `virtual-coaching ` (trailing space) | $349 | `payment` | `buy.stripe.com/3cIdR887Q8Mi2UM8MY3sI00` |

### 4.5 `testimonial` and `resource` (repeatable)

- `testimonial`: `quote*`, `author*`, `role`, `order`. Live: 2, both placeholders.
- `resource`: `title*`, `summary`, `category`, `order`. Live: 3, all placeholders.
  Resources have **no body field and no detail route** — they are teaser cards only, and
  the card's affordance reads "Coming soon" rather than linking anywhere.

### 4.6 Object types

| Object | Fields |
|---|---|
| `cta` | `text*`, `type*` (`booking` / `payment` / `link`, radio, default `link`), `target` (href for `link`; an override for the other two) |
| `socialLink` | `platform*` (instagram, facebook, youtube, tiktok, x, linkedin), `url*` |
| `paymentLink` | `label*`, `url*` |
| `credential` | `icon*` (education / certification / experience / focus), `title*`, `lines: string[]` (min 1) |
| `interest` | `title*`, `detail*` |
| `plainText` | Portable Text locked to plain paragraphs — style `normal` only, **no lists, no marks, no annotations, no custom blocks** |

`plainText` is the project's controlled-content-zone primitive: the owner gets a real
multi-paragraph editor but cannot introduce formatting that breaks the design. The fetch
layer flattens it to `string[]` (one string per block), so components only ever consume
plain paragraphs. **The block library needs an equivalent constrained rich-text field.**

### 4.7 Fetch layer

`src/lib/sanity/fetch.ts` maps every raw GROQ result onto a plain typed shape (the
interfaces in `src/content/site.ts`). Images resolve to CDN URLs through `imageUrl()`
(`.auto("format").fit("max")`); a missing image resolves to `""`.

Fetchers: `getSiteSettings`, `getHomepage`, `getAboutPage`, `getCredentials`,
`getInterests`, `getServices`, `getService(slug)` (unused), `getTestimonials`,
`getResources`. `getCredentials` and `getInterests` each re-run the whole `aboutPage`
query, so `/about` issues that query three times — deduplicated by Next's fetch cache.

Client config: `useCdn: false`, `perspective: "published"`, **no token** (published
content is public). `SANITY_API_READ_TOKEN` exists but is unused, reserved for a future
draft/preview mode.

`src/content/site.ts` is now types plus dead seed data: the app imports only its types;
the literal exports are consumed solely by `scripts/seed.ts`, the one-time seeding script.

---

## 5. Section-by-section block inventory

Every section below is a candidate block. "Static" means the copy is hardcoded in the
page component today and would need to become either block config or new CMS fields.

### 5.1 Global chrome

**Site header** (`SiteHeader`, client) — sticky, `z-50`.
- Transparent over the hero; switches to `bg-ink-950/90` + `backdrop-blur-md` + bottom
  border once `window.scrollY > 12` (or the mobile menu is open).
- Left: CMS logo image (48px source, rendered 44px, rounded, `object-contain`) plus the wordmark "Train" +
  "Shane" with the second word in brand red. Wordmark text is hardcoded.
- Desktop nav (>= lg): Home, About, Services, Success Stories, Resources, Contact.
  Active state = exact match for `/`, `startsWith` for everything else; active link is
  brand red.
- Right: a `Book Now` primary CTA of type `booking` (no arrow, tighter padding).
- Mobile: animated three-bar hamburger that morphs into an X; the panel is a
  `max-height` transition (0 to 28rem), closes automatically on route change, and repeats
  the nav plus the Book Now CTA.

**Site footer** (`SiteFooter`, server) — 3-column grid on md+.
- Brand column: logo (56px), wordmark, `serviceArea`, then `tagline` in brand red.
- "Explore" column: About, Services, Success Stories, Resources, Contact (no Home).
- "Get in touch" column: `mailto:` email with icon; Instagram link (only when a social
  link with `platform === "instagram"` exists); "Manage subscription" link to the Stripe
  portal (only when `manageSubscriptionUrl` is set). Both external links open in a new tab.
- Bottom bar: `© {current year} {businessName}. All rights reserved.` (year computed at
  render) and the static line "NASM Certified Personal Trainer · M.S. Health Promotion
  Management".

### 5.2 Home (`/`)

1. **Hero** — full-bleed background image from `homepage.hero.image` at 40% opacity under
   two gradients (left-to-right ink fade, plus bottom-up ink fade); `min-h-[88vh]`.
   Content: eyebrow with a red rule, `<h1>` headline (up to `text-7xl`), subheadline, and
   two CMS-driven CTAs (`primaryCta` primary, `secondaryCta` secondary). Fades in on load.
2. **Credentials grid** — static eyebrow/title/intro ("Credentials" / "Education and
   experience you can trust" / …) over `aboutPage.credentials` rendered as 4-up
   `CredentialCard`s. *Note: the home page reads the About page's credentials.*
3. **Who I help** — two columns: `SectionHeading` from `whoHeading` + `whoIntro`, and a
   list of `whoFor[]` bullets, each a card row with a red check icon.
4. **Featured services** — static heading/intro over the resolved `featuredServices` as
   3-up compact `ServiceCard`s, followed by a ghost CTA "See full details" → `/services`.
5. **Philosophy** — two columns. Left: a static image (`/images/plan-paper.jpg`, 4:5,
   gradient overlay) with the overlaid display caption "Your plan starts / with a blank
   page." Right: `SectionHeading` from `philosophy.heading`, the `philosophy.body`
   paragraphs, and a ghost CTA "More about Shane" → `/about`. Order swaps on lg.
6. **Testimonials** — centred static heading over `testimonials[]` as 3-up
   `TestimonialCard`s, plus a text link "Read more stories →" → `/success-stories`.
7. **Mission / CTA band** — `homepage.mission` as large centred text, the static display
   line "Realistic. Sustainable. Results.", a `booking` CTA, and `serviceArea` beneath.

### 5.3 About (`/about`)

1. **Split hero** — left: eyebrow "About", hardcoded `<h1>` "About Me", `story[0]` as
   the intro paragraph, and a `booking` CTA. Right: `aboutPage.portrait` in a square card
   (`object-contain`, so portraits are never cropped).
2. **Story** — `story[1..]` in a two-column paragraph grid, each paragraph revealing in
   sequence.
3. **Credentials** — `SectionHeading` "Credentials / Education & Experience" over the
   4-up `CredentialCard` grid, on the `ink-900` band.
4. **My goal for you** — `SectionHeading` with static eyebrow "My Philosophy" and title
   `aboutPage.goalHeading`, beside the `goal` paragraphs.
5. **Interests** — static eyebrow/title/intro over `interests[]` as 3-up cards, each
   numbered `01`, `02`, … in brand red above the title and detail.
6. **Mission / CTA** — `aboutPage.mission`, the "Realistic. Sustainable. Results." line,
   a `booking` CTA labelled "Start the Conversation", and `serviceArea`.

### 5.4 Services (`/services`)

1. **Page header band** — static `SectionHeading` ("Coaching Options" / "Find the right
   way to train" / intro), bottom border.
2. **Service grid** — every active service as a `ServiceCard variant="full"` in a 3-column
   grid (there are currently **four** active services, so the fourth wraps).
3. **Fine print** — a static line about Stripe and booking links, ending with
   `serviceArea`.
4. **CTA band** — "Not sure which is right for you?" plus a `booking` CTA, on `ink-900`.

### 5.5 Success stories (`/success-stories`)

1. **Page header band** — static `SectionHeading`.
2. **Testimonial grid** — `testimonials[]` as `TestimonialCard`s, 2-up on md, 3-up on lg.
3. **Placeholder notice** — a dashed-border note saying the stories are samples and real
   ones will be managed through the CMS. **Currently live in production.**
4. **CTA band** — "Your story could be next." plus a `booking` CTA.

### 5.6 Resources (`/resources`)

1. **Page header band** — static `SectionHeading` ("Resources" / "Cut through the noise").
2. **Article cards** — 3-up `<article>` cards wrapped in a whole-card `<Link>` to
   `/resources/<slug>`: `category` as a brand-red eyebrow, `title`, `excerpt`, date and
   reading estimate. Rendered from published `post` documents.
3. **"Elsewhere" band** — the older link-out `resource` cards, shown below the articles
   and only when any are published. These still have no body and no route; without a
   `url` the card reads "Coming soon".
4. **CTA band** — "Want guidance tailored to you?" plus a `booking` CTA.

### 5.7 Contact (`/contact`)

1. **Split intro + form**
   - Left: eyebrow "Contact", `<h1>` "Tell me how I can help", static intro, then two
     card rows — `mailto:` with the CMS email, and an Instagram link (only when the
     social link exists) — then `serviceArea` and a secondary "Book a Free Consultation"
     CTA.
   - Right: a card containing "Send a message" and the **contact form** (5.9).
2. **Conditional Calendly section** — rendered **only** when
   `isEmbeddableCalendly(siteSettings.bookingUrl)` is true: a centred `SectionHeading`
   "Booking / Or pick a time right now" over the inline Calendly embed.

### 5.8 Welcome (`/welcome?plan=…`) — the post-payment page

Non-indexed, dynamic. Full behaviour in section 6.2.

1. **Confirmation header** — a circled brand-tinted check icon, the eyebrow "Payment
   confirmed", the per-plan heading and intro, and the static reassurance line "Only
   times Shane is free are shown, so whatever you pick is confirmed automatically."
2. **Booking** — inline Calendly embed for the plan's booking URL when embeddable;
   otherwise a fallback card ("Book your first session") with a `mailto:` support line
   and a "Choose a time" button opening the URL in a new tab.
3. **Footnotes** — the "manage your subscription" Stripe-portal link, shown only when the
   plan is a subscription **and** `manageSubscriptionUrl` is set; then a "Back to home"
   link.

### 5.9 Contact form (`ContactForm`, client)

- Fields, all required: `firstName`, `lastName`, `email` (type=email), `message`
  (textarea, 4 rows, placeholder "Tell me a bit about your goals…"). Styling is
  underline-only inputs on a transparent background, with uppercase display-font labels
  and a red required asterisk.
- Submit is intercepted; **no backend, no database, no form service.** It builds a
  `mailto:` via `buildInquiryMailto()` (`src/lib/contact.ts`) and assigns
  `window.location.href`, which opens the visitor's mail client.
  - Recipient: **always** `siteSettings.email`.
  - Subject: `New inquiry from {first} {last}`.
  - Body: `Name: …`, `Email: {visitor's address}`, blank line, message.
  - Both are percent-encoded.
- After submit, a confirmation paragraph appears explaining that the mail app should have
  opened, with a `mailto:` fallback link to the business address.
- **Port note:** if the platform offers a real form backend, this is the obvious upgrade
  — but the invariant "the recipient is the configured business address, never the
  visitor's" must survive the port. It is pinned by `tests/lib/contact.test.ts`.

### 5.10 Shared primitives

| Component | Contract |
|---|---|
| `SectionHeading` | optional eyebrow (with red rule), title (`h2`), optional intro; `align: left \| center`; wrapped in `Reveal` |
| `ServiceCard` | `compact` (home) vs `full` (services). Always: name, price + priceNote, optional duration, short description, CTA. `full` adds "What's included" (check list), "Who it's for" (dot list), and an italic left-bordered "approach" quote |
| `CredentialCard` | icon tile (fills brand red on hover), title, and `lines[]` |
| `TestimonialCard` | oversized decorative quote glyph, quote, then author + role above a top rule |
| `CtaButton` | see 6.1 |
| `Reveal` | see 6.5 |
| `CalendlyInline` | see 7.3 |
| `Icons` | inline SVGs: Education, Certification, Experience, Focus, Check, Arrow, Instagram, Mail, CreditCard, plus a `CredentialIcon` name-to-icon dispatcher. No icon library dependency |

---

## 6. Dynamic behaviour (the logic a block library must reproduce)

### 6.1 CTA resolution — `src/lib/cta.ts`

Every button on the site is a `{ text, type, target? }` triple resolved at render:

```
booking  -> cta.target || settings.bookingUrl
payment  -> cta.target || settings.primaryPaymentLink || settings.paymentLinks[0]?.url || "#"
link     -> cta.target || "#"
```

`isExternal(cta)` is true for `booking` and `payment`; those render as
`<a target="_blank" rel="noopener noreferrer">`, everything else as a `next/link`.

The resolved settings reach client components through `CtaSettingsProvider`, a React
context populated **once** in the server layout from `siteSettings` — booking URL,
primary payment link, and payment links. This is what lets a CMS edit change every button
on the site with no code change and no redeploy.

Variants: `primary` (brand fill with a red glow shadow), `secondary` (outlined, border
turns brand on hover), `ghost` (bare text, no padding). An optional trailing arrow
translates right on hover.

### 6.2 Post-payment flow — `/welcome?plan=X` and `src/lib/welcome.ts`

The most important path in the app:

```
/services or /  ->  ServiceCard -> CtaButton (type "payment", target = service.paymentLink)
                      -> opens Stripe Payment Link in a new tab (live mode)
                      -> after-payment redirect (configured IN STRIPE, not in this repo)
                    /welcome?plan=essential|premium|in-person
                      -> resolveWelcome(plan, siteSettings)
                    per-plan heading + intro + per-plan Calendly URL
                      -> inline Calendly embed
                    booking lands on Shane's Google Calendar
```

`resolveWelcome(plan, settings)` is pure and total — it never throws and never renders
blank:

| `?plan=` | Heading | Intro mentions | Booking URL | Subscription note |
|---|---|---|---|---|
| `essential` | "Welcome to Essential Coaching" | subscription active, weekly cadence | `essentialBookingUrl` | yes |
| `premium` | "Welcome to Premium Coaching" | subscription active, Shane coordinates | `premiumBookingUrl` | yes |
| `in-person` | "Payment received — let's get you on the calendar" | one-off payment, calendar invite | `inPersonBookingUrl` | **no** |
| unknown or absent | "Payment received — let's get started" | generic | `bookingUrl` | yes |

Each per-plan URL falls back to `settings.bookingUrl` when blank or unset (an empty
string falls back too, not just `undefined`). The `subscription` flag is the only thing
gating the "manage your subscription" footnote — in-person buyers never see it.

**Critical port dependency:** the `?plan=` values are produced by the *Stripe dashboard's*
after-payment redirect URLs, which point at
`https://shane-fitness-site.vercel.app/welcome?plan=<tier>`. They live outside this repo.
**Porting the site to a new URL requires re-editing all three redirects in Stripe**, or
the post-payment step silently breaks while everything else keeps working. This path has
never been verified end-to-end with a real card.

### 6.3 Calendly embed gating — `src/lib/booking.ts`

`isEmbeddableCalendly(url)` returns true only for a real scheduling link: the host must
be `calendly.com` or a `*.calendly.com` subdomain **and** the path must be non-empty
after stripping trailing slashes. The bare `https://calendly.com/` placeholder, a
non-Calendly host, a lookalike host such as `calendly.com.evil.com`, an empty string,
`undefined`, and any unparseable string all return false.

Consequence: when the owner has not yet set a real link, `/contact` hides the booking
section entirely and `/welcome` degrades to a "Choose a time" button — never an empty
broken widget. Behaviour is pinned by `tests/lib/booking.test.ts` (10 cases).

### 6.4 Content gating and ordering

- **Retired services** vanish from both the services page and the home grid
  (`status != "retired"` in GROQ, with `null` treated as active).
- **Featured services** on the home page follow the `featuredServices` reference order,
  and any slug that no longer resolves is silently dropped.
- **Instagram** links render only when a `socialLink` with `platform === "instagram"`
  exists; other platforms are storable but never rendered anywhere.
- **Manage-subscription** links render only when `manageSubscriptionUrl` is set.
- **Services, testimonials, and resources** are otherwise ordered by their `order` field
  ascending.
- The "Most Popular" visual highlight is **hardcoded**: `ServiceCard` uses the primary
  button variant only when `featured && slug === "virtual-coaching"`.

### 6.5 Motion and interaction

- `Reveal` wraps most sections: an `IntersectionObserver` (threshold 0.15, rootMargin
  `0px 0px -40px 0px`) adds `.is-visible` once and then unobserves. Staggering is done by
  passing an increasing `delay` (typically `index * 70–100`ms) which becomes
  `transition-delay`.
- The hero uses a CSS `fade-in` animation rather than the observer.
- `prefers-reduced-motion: reduce` disables reveal transitions and smooth scrolling
  entirely in `globals.css`.
- Header scroll state, mobile menu, and card hover borders are the only other motion.

---

## 7. Integration touchpoints

### 7.1 Sanity CMS

- Project id and dataset in `NEXT_PUBLIC_SANITY_*` env vars; dataset `production`, API
  version `2025-01-01`.
- Studio embedded at `/studio`; the owner signs in with a Google account invited to the
  project. Excluded from `robots.txt` and the sitemap.
- Singleton enforcement lives in `sanity.config.ts`: singleton types are filtered out of
  the global "create new" templates, and their document actions are reduced to
  publish / discardChanges / restore.
- **Webhook:** Sanity publish → `POST /api/revalidate` with an `x-revalidate-secret`
  header matching `SANITY_REVALIDATE_SECRET`. Mismatch or missing secret returns 401. The
  body is optional; when present, `_type` is echoed for debugging. Always calls
  `revalidateTag("sanity")`. **The secret is not set in local `.env.local`, and the
  webhook has never been verified.**
- CORS origins must include the deployed domain and `http://localhost:3000` for the
  embedded Studio.

### 7.2 Stripe — Payment Links only

No Stripe SDK, no webhooks, no server-side Stripe code anywhere. Three live-mode Payment
Links stored as `service.paymentLink` CMS fields (table in 4.4), plus a Customer Portal
login link (`billing.stripe.com/p/login/3cIdR887Q8Mi2UM8MY3sI00`) in
`siteSettings.manageSubscriptionUrl`, which lets clients self-cancel with no account.

The only Stripe configuration that lives outside the CMS is the per-link after-payment
redirect, described in 6.2.

### 7.3 Calendly

Four event types, one per CMS field:

| Purpose | CMS field | Event |
|---|---|---|
| Free consultation / default | `bookingUrl` | `calendly.com/shane12-sb/free-consultation` |
| Essential first session | `essentialBookingUrl` | `calendly.com/shane12-sb/30min` |
| Premium first session | `premiumBookingUrl` | `calendly.com/shane12-sb/weekly-one-on-one` |
| In-person session | `inPersonBookingUrl` | `calendly.com/shane12-sb/in-person-1-1-session` |

`CalendlyInline` renders `<div class="calendly-inline-widget" data-url={url}>` at a
default height of 700px and min-width 320px, appends
`https://assets.calendly.com/assets/external/widget.js` to `<body>` once (guarded by
element id), and links `widget.css`. Used on `/contact` and `/welcome`.

Google Calendar availability and Google Meet links are configured **on the Calendly
side**; nothing in this repo touches Google. The in-person event asks the invitee for the
location.

### 7.4 Vercel

- Push to `main` deploys production; any other branch produces a preview URL.
- Production alias `https://shane-fitness-site.vercel.app`; **no custom domain**, and
  `SITE_URL` falls back to that hostname when `NEXT_PUBLIC_SITE_URL` is unset — it feeds
  `metadataBase`, every canonical, `robots.txt`, and `sitemap.xml`.
- `next.config.mjs` allows remote images from `cdn.sanity.io` only, and enables
  `reactStrictMode`.

### 7.5 Analytics

`<Analytics />` from `@vercel/analytics/next` mounts in the `(site)` layout. Every
`CtaButton` click fires `track("cta_click", { type, text })`, so booking and payment
clicks — the money events — are counted with no extra setup.

The wider attribution plan (a site-unique Calendly link, a UTM scheme, a "how did you
hear about us" intake question, monthly reconciliation) is designed in
`docs/UTM-SCHEME.md` but **not implemented**.

### 7.6 Outbound email

There is no email service, CRM, newsletter, forms backend, or error monitoring. The only
email paths are `mailto:` links: the contact form, the contact page card, the footer, and
the `/welcome` fallback card.

---

## 8. Design system

Reproducing the look needs these tokens more than it needs the markup.

**Colour** (Tailwind `theme.extend.colors`)

| Token | Value | Use |
|---|---|---|
| `ink-950` | `#0A0A0A` | page background |
| `ink-900` | `#111111` | alternating section bands, footer |
| `ink-850 / 800 / 700` | `#161616` / `#171717` / `#1f1f1f` | reserved, lightly used |
| `brand` | `#D62828` | primary buttons, eyebrows, accents, active nav |
| `brand-dark` | `#C1121F` | reserved |
| `brand-light` | `#E5383B` | primary button hover |
| `cream-100` | `#F5F5F5` | primary text |
| `cream-300` | `#B0B0B0` | body text |
| `cream-500` | `#7A7A7A` | muted text and labels |

**Type** — display font Oswald (weights 400–700) via `--font-oswald`, body font Inter via
`--font-inter`, both `display: swap`. `h1`–`h4` are globally uppercase display with
`tracking-tightish` (`-0.01em`). Eyebrows and buttons use `tracking-wider2` (`0.18em`)
uppercase at `text-sm`/`text-xs`.

**Layout and surfaces**

- `.container-x` — centred, `max-width: 1200px`, `px-6` (`md:px-8`).
- `.section` — `py-20`, `md:py-28`.
- `.card-surface` — `rgba(255,255,255,0.03)` fill, `rgba(255,255,255,0.08)` border,
  rounded-lg, slight backdrop blur; border becomes `rgba(214,40,40,0.4)` on hover.
- `.accent-rule` — the 40px × 2px red rule that precedes every eyebrow.
- Primary buttons carry a coloured drop shadow: `0 8px 30px -12px rgba(214,40,40,0.7)`.
- Section separation is a mix of `border-white/10` hairlines and `ink-900` bands.

**Motion** — keyframes `fade-up` (0.7s, `cubic-bezier(0.16, 1, 0.3, 1)`) and `fade-in`
(0.9s ease); the `.reveal` transition uses the same easing over 0.7s with a 20px
translate. `html { scroll-behavior: smooth }`. Everything above is disabled under
`prefers-reduced-motion`.

**Static assets** (`/public/images`)

| File | Use |
|---|---|
| `hero-dumbbell.jpg` | seeded as the CMS hero image; also the hardcoded OG/Twitter image (2500×1667) |
| `plan-paper.jpg` | hardcoded in the home philosophy block — **not** a CMS field |
| `logo.webp` | seeded as the CMS logo |
| `about-portrait-square.png` | seeded as the CMS portrait |
| `about-composite.png` | **unused** |

---

## 9. SEO and metadata surface

- `metadataBase` = `SITE_URL`; title default from `siteSettings.seo.title` with template
  `"%s · {businessName}"`; description from `siteSettings.seo.description`.
- OpenGraph: title, description, `type: website`, `url`, `siteName`, and the static
  `/images/hero-dumbbell.jpg` (2500×1667). Twitter: `summary_large_image` with the same
  image. Favicon comes from the CMS logo.
- Per-page `title` and `description` overrides on `/about`, `/services`,
  `/success-stories`, `/resources`, `/contact`. The home page inherits both from the CMS.
- **Canonicals are per-page.** Each page declares `alternates: { canonical: <its own path> }`;
  the `(site)` layout declares none, because route-group metadata is inherited by every
  child (this was finding F2 — a single canonical in the layout made all five pages claim
  to be the homepage). `tests/app/canonical.test.ts` enforces the rule.
- `robots.ts`: allow `/`, disallow `/studio`, advertise the sitemap.
- `sitemap.ts`: `PUBLIC_ROUTES` only, `changeFrequency: monthly`, priority 1.0 for home
  and 0.7 for the rest.
- `/welcome` is `robots: { index: false, follow: false }`, canonicalises to itself, and is
  absent from the sitemap.

---

## 10. Configuration surface

| Variable | Purpose | Notes |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project | required |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | required |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2025-01-01` | defaults if unset |
| `SANITY_API_READ_TOKEN` | reserved for draft/preview | **not used today** |
| `SANITY_API_WRITE_TOKEN` | one-time `scripts/seed.ts` only | not in `.env.example` |
| `SANITY_REVALIDATE_SECRET` | shared secret for the publish webhook | **missing locally** |
| `NEXT_PUBLIC_SITE_URL` | overrides the hardcoded canonical host | unset; falls back to the Vercel alias |

Booking, payment, and billing-portal URLs deliberately do **not** live in env vars — they
are CMS fields, so the owner can change them without a redeploy. Keep this split.

---

## 11. Behaviour pinned by tests

The port should keep equivalents of these green; they encode decisions, not just code.

| Suite | What it pins |
|---|---|
| `tests/lib/booking.test.ts` (10) | Calendly embed gating, including the lookalike-host and placeholder cases |
| `tests/lib/cta.test.ts` (11) | the full CTA resolution and fallback chain, and external-vs-internal rendering |
| `tests/lib/welcome.test.ts` (13) | every plan-to-copy and plan-to-booking-URL mapping, both fallback paths, and the subscription flag |
| `tests/lib/contact.test.ts` (8) | the contact form always mails the configured business address, whatever the visitor types |
| `tests/app/canonical.test.ts` (10) | each route's canonical matches its own path, no two pages share one, the layout declares none, and `/welcome` stays noindex |

E2E (`e2e/`, Playwright — browsers not installed): `welcome.spec.ts` covers the four
`?plan=` headings and the embed-or-fallback branch; `services.spec.ts` asserts the
service CTAs point outward to Stripe/Calendly rather than collapsing to `"#"`.

---

## 12. Known gaps to carry into the port deliberately

Things that are true of the site today. Reproducing them faithfully would be a mistake.

1. **Placeholder content is live.** Two "Sample Client" testimonials and three
   "Coming soon" resource teasers are on production, each under a visible dashed
   "this is demo content" notice. Real content, or removing the sections, is a launch
   blocker independent of the port.
2. **The Stripe redirect is external and unverified.** See 6.2 — the three after-payment
   redirect URLs must be re-pointed at the new platform URL, and the path should finally
   be tested end-to-end with a real card.
3. **Fragile service slugs.** Premium Coaching's slug is `"virtual-coaching "` with a
   trailing space, distinguished from Essential's `"virtual-coaching"` only by that
   space. The home page's featured-service lookup and its React keys both depend on the
   exact string. Clean slugs in the port.
4. **"Most Popular" is hardcoded** to `slug === "virtual-coaching"` in `ServiceCard`.
   It should be a CMS boolean.
5. **`siteSettings.phone` is a dead field** — editable in the Studio, rendered nowhere.
6. **`aboutPage.heading` is a dead field** — the About `<h1>` is hardcoded "About Me".
7. **Payment-link fallbacks are now empty.** With `primaryPaymentLink` null and
   `paymentLinks` empty, any future `payment` CTA without its own link resolves to `"#"`.
   Either populate a real default or make the empty case fail loudly.
8. **A CMS outage 500s the site** — every page throws on a missing settings document.
   Consider degrading instead.
9. **Resources are teasers with nowhere to go.** If the port keeps the section, it needs
   either a body field plus a detail route, or an honest external link.
10. **No CI**, and the Sanity revalidation webhook has never been confirmed firing.
11. **Attribution is designed, not built** (`docs/UTM-SCHEME.md`): no UTMs are appended
    to outbound booking or payment links today.
