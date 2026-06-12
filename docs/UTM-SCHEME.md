# UTM & Attribution Scheme — Train Shane

How we tell which bookings/payments came from the website. Supports the future
revenue-share (see the private ops brain: DR-2026-0015 / shane-authentic-voice).

## 1. Conversion events (already live)

Vercel Analytics is enabled site-wide. Every CTA fires a custom event:

- **Event:** `cta_click`
- **Props:** `{ type: "booking" | "payment" | "link", text: "<button label>" }`

So booking/payment clicks (the money events) are counted in the Vercel Analytics
dashboard with no extra setup. Filter by `type=booking` / `type=payment`.

## 2. Site-unique booking link (set up with Shane in Phase 2B)

The strongest attribution signal: a **dedicated Calendly event link used only on
this website**. Every booking through it is provably site-originated.

- In Calendly, create an event type (e.g. "Free Consultation — Web") and use that
  link as `siteSettings.bookingUrl` in the CMS.
- Keep any non-website booking links (DMs, in-person referrals) separate.

## 3. UTM tags on outbound links

When the site links out to Calendly/Stripe, append UTMs so they show up in
Calendly's "where did this booking come from" and in analytics:

```
?utm_source=trainshane-site&utm_medium=web&utm_campaign=<page>&utm_content=<cta>
```

- `utm_source` = `trainshane-site` (constant — identifies the website)
- `utm_medium` = `web`
- `utm_campaign` = page the click came from (`home`, `services`, `contact`, …)
- `utm_content` = CTA label/slug (`book-free-consult`, `start-coaching`, …)

> Note: the booking/payment URLs live in the CMS, so UTMs can be baked into those
> URLs by Shane, or appended in code later. For Stripe Payment Links, prefer
> **separate link IDs per site** over query params (Stripe ignores unknown params).

## 4. "How did you hear about us?" (intake)

Add this as a question on the Calendly booking form — a cheap human-confirmed
cross-check against the UTM/analytics data.

## 5. Monthly reconciliation (post-launch)

Combine: site-unique-link bookings + `cta_click` conversions + intake answers →
the monthly site-attributed report. Requires the signed revenue-share agreement
first (do not invoice before that exists).
