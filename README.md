# Train Shane — Personal Training Website

A custom, premium marketing site for **Train Shane Personal Training**, built to look intentional and hand-crafted while staying easy for a non-technical owner to manage.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**, deployed on **Vercel**.

> **Status: Phase 1 — Visual Demo.** The full site design, copy, and pages are live with content hardcoded in a single typed module (`src/content/site.ts`). Booking and payment buttons point at placeholder links. The Sanity CMS, real Calendly/Stripe links, and live testimonials/photos come in Phase 2 — see [Roadmap](#roadmap).

## Pages
- `/` — Home (hero, credentials, who-I-help, services, philosophy, testimonials, mission)
- `/about` — About Shane (story, credentials, philosophy, interests)
- `/services` — Coaching options with full detail
- `/success-stories` — Testimonials (sample content)
- `/resources` — Articles (placeholder content)
- `/contact` — Contact form (mailto) + booking CTA

## Local development
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```
Requires Node 18.18+ (developed on Node 23).

## Project structure
```
src/
  app/                 # App Router pages (one folder per route)
  components/          # Hand-built, reusable UI (Hero, ServiceCard, etc.)
  content/site.ts      # ALL content — typed, mirrors the planned Sanity schema
  lib/cta.ts           # Resolves booking/payment/link CTAs to hrefs
public/images/         # Brand assets (logo, portrait, etc.)
```

## The core principle — Controlled Content Zones
Content (text, prices, images, links) is isolated in `src/content/site.ts` and mapped into hand-built components. Design (layout, spacing, motion) lives in the components and is **not** something the owner edits. In Phase 2, `site.ts` is replaced by typed reads from Sanity — the components stay identical, so the owner edits named fields in a friendly Studio while the design stays protected.

## Roadmap
- [x] Phase 1 — Design system, components, all pages, content migrated, Vercel deploy
- [ ] Phase 2 — Sanity CMS at `/studio`, seed dataset, swap `site.ts` for GROQ reads
- [ ] Phase 3 — Real Calendly booking link + Stripe Payment Links (entered via CMS)
- [ ] Phase 4 — Real testimonials, gallery photos, published resources

See [`content-map.md`](./content-map.md) for the full content inventory, [`DEPLOY.md`](./DEPLOY.md) for deployment, and [`OWNER-GUIDE.md`](./OWNER-GUIDE.md) for the owner walkthrough.
