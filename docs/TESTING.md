# Testing

This project has two automated suites plus a manual checklist for the parts that
depend on third-party services (Stripe, Calendly, Google Calendar, email).

## Automated suites

### Unit tests (Vitest)

Pure-logic coverage of the booking/payment resolution. Fast, deterministic, no
network or browser.

```bash
npm test         # watch mode
npm run test:run # one-off run (CI)
```

Covers:

- `src/lib/booking.ts` — `isEmbeddableCalendly`
- `src/lib/cta.ts` — `resolveCtaHref`, `isExternal`
- `src/lib/welcome.ts` — `resolveWelcome` (plan -> Calendly URL + copy + subscription flag)

Config: `vitest.config.ts`. `include` is scoped to `tests/**` and `src/**` and
`node_modules` is excluded, so Vitest never tries to run the test files bundled
inside dependencies. The `@/` import alias mirrors `tsconfig.json`.

### E2E tests (Playwright)

Render-level smoke of the real pages. The config boots the Next dev server
(`npm run dev`) as its `webServer` against `http://localhost:3000`.

```bash
npx playwright install chromium   # first time only
npm run test:e2e
```

Specs live in `e2e/`. They assert on deterministic copy and structure (headings,
anchor schemes) — **not** on exact CMS URL values — so they stay green as Shane
edits content.

- `e2e/welcome.spec.ts` — per-plan headings (`essential` / `premium` /
  `in-person` / default), the Calendly-embed-or-fallback-card invariant, and the
  manage-subscription link (asserted only when the CMS field is set).
- `e2e/services.spec.ts` — service cards render and their CTAs point outward to
  `buy.stripe.com` / `calendly.com` / `billing.stripe.com` (never `#`).

> **Requires CMS connectivity.** `/welcome` and `/services` fetch `siteSettings`
> from Sanity and throw if it's missing. The dev server reads `.env.local` for
> the Sanity project/dataset. If Sanity is unreachable in your environment, those
> routes return 500 and the E2E specs will fail by design — run them where the
> dev server can reach the CMS.

## Manual test checklist

These flows cross into Stripe / Calendly / Google Calendar / email and can't be
automated here. Run through them after any change to pricing, payment links, or
booking URLs. Use the **Stripe test card `4242 4242 4242 4242`** (any future
expiry, any CVC, any ZIP) while Stripe is in test mode.

### Per-plan happy path

For **each** of the three paid plans:

**Essential (subscription, virtual, Google Meet)**

- [ ] Click the Essential payment CTA -> Stripe Checkout opens
- [ ] Pay with `4242 4242 4242 4242` -> redirected to `/welcome?plan=essential`
- [ ] Welcome page shows "Welcome to Essential Coaching" copy
- [ ] Calendly embed (or fallback "Choose a time") loads the **Essential** event
- [ ] Book a slot -> Calendly confirms
- [ ] Event appears on Shane's Google Calendar with a **Google Meet** link
- [ ] Stripe receipt email received by the client

**Premium (subscription, virtual, Google Meet)**

- [ ] Premium payment CTA -> Stripe Checkout
- [ ] Pay with test card -> redirected to `/welcome?plan=premium`
- [ ] Welcome page shows "Welcome to Premium Coaching" copy
- [ ] Calendly loads the **Premium** event; booking confirms
- [ ] Event on Shane's Google Calendar with a **Google Meet** link
- [ ] Stripe receipt email received

**In-Person (one-time, invitee-entered location)**

- [ ] In-Person payment CTA -> Stripe Checkout
- [ ] Pay with test card -> redirected to `/welcome?plan=in-person`
- [ ] Welcome page shows "Payment received — let's get you on the calendar"
- [ ] Calendly loads the **In-Person** event; booking confirms
- [ ] Event on Shane's Google Calendar with the **invitee-entered location**
      (no Google Meet link)
- [ ] Stripe receipt email received
- [ ] No "manage your subscription" link shown (in-person is not a subscription)

### Subscription cancellation path

- [ ] On `/welcome?plan=essential` (or premium), click "manage your subscription"
- [ ] Stripe Customer Portal opens (no account/login required)
- [ ] Cancel the subscription
- [ ] Subscription shows as canceled in Stripe
- [ ] Shane receives a cancellation alert (email/notification)
