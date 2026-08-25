# Deployment Guide (Developer)

This is the developer-facing guide for getting the site onto Vercel and, later, wiring up Sanity. The owner never needs any of this.

---

## 1. GitHub → Vercel (Phase 1, current)

The site is a standard Next.js app and deploys to Vercel with zero config.

### One-time setup
1. Push this repo to GitHub (already wired to `https://github.com/Pbein/ShaneFitnessSite`):
   ```bash
   git add .
   git commit -m "Phase 1: visual demo"
   git push -u origin main
   ```
2. Go to **vercel.com → Add New → Project**, import `Pbein/ShaneFitnessSite`.
3. Framework preset: **Next.js** (auto-detected). Build command `next build`, output handled automatically. Click **Deploy**.

### The flow from here on
- Every push to `main` → Vercel builds and deploys to **production**.
- Every push to any other branch / every PR → Vercel creates a **preview URL** (great for showing the client work-in-progress without touching production).

No environment variables are required for Phase 1 — all content is in the repo.

---

## 2. Environment Variables (Phase 2 — when Sanity is added)

Set these in **Vercel → Project → Settings → Environment Variables** (and in a local `.env.local`):

| Variable | Purpose | Example |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project id (public) | `abcd1234` |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset name (public) | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | API date string | `2024-01-01` |
| `SANITY_API_READ_TOKEN` | Read token for draft/preview (server-only, **not** `NEXT_PUBLIC`) | `sk...` |
| `SANITY_REVALIDATE_SECRET` | Shared secret for the Sanity → Next revalidation webhook (server-only) | 32 random bytes |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Feeds `metadataBase`, every canonical, `robots.txt`, `sitemap.xml` and the OG image URLs | `https://trainshane.com` |

> ⚠️ Adding or changing an env var does nothing to the running site on its own — **the
> project must be redeployed afterwards.** `vercel redeploy <production-url>` rebuilds
> the current commit with the current variables, which is safer than `vercel --prod`
> (that deploys your local working tree, git or no git).

> ⚠️ Booking URLs and Stripe Payment Links do **NOT** go in env vars. They live as fields in the CMS so the owner can change them himself without a redeploy.

---

## 3. Sanity Setup (Phase 2)

1. `npm create sanity@latest` (or add `sanity`, `next-sanity`, `@sanity/image-url`).
2. Create the project, note the **Project ID** and dataset (`production`).
3. Define schemas exactly as specified in `content-map.md` §5 / the project brief:
   `siteSettings` (singleton), `homepage` (singleton), `aboutPage` (singleton),
   `service`, `testimonial`, `galleryImage`.
4. Embed the Studio at `/studio` (route group `src/app/studio/[[...tool]]/page.tsx`).
5. Add the Sanity client (`src/lib/sanity.ts`) + GROQ queries. Replace the exports in
   `src/content/site.ts` with typed fetches returning the same shapes — components are
   already written against those shapes, so no component changes are needed.
6. In Vercel, add `cdn.sanity.io` to `next.config.mjs` `images.remotePatterns` (already done).
7. Seed the dataset from `content-map.md`.

### CORS
In **sanity.io/manage → API → CORS origins**, add your Vercel production domain and
`http://localhost:3000` so the embedded Studio can talk to the dataset. Tick **Allow
credentials** or the Studio login loops. This is a hostname-change step that hides from
every normal check — public pages render server-side where CORS does not apply, so
status codes, canonicals and a full Playwright audit all pass while `/studio` is dead.

### Instant publishing (the revalidation webhook)

Live since 2026-08-25. Without it every CMS edit waits for the 60s ISR fallback; with it
the live site updates in about 3 seconds.

- **Vercel:** `SANITY_REVALIDATE_SECRET`, Production, marked Sensitive.
- **Sanity:** a GROQ-powered webhook named `next-revalidate` (id `pDfrkKIle0mp3TOM`)
  POSTing to `https://trainshane.com/api/revalidate`, sending the same value as the
  `x-revalidate-secret` header, `includeDrafts: false`, filtered to the document types
  the website actually reads:

  ```
  _type in ["siteSettings","homepage","aboutPage","service","testimonial","resource","post"]
  ```

  The filter matters — `ownerTask` and `ownerGuide` are Shane's private to-do list and
  guides. They are rendered by no route, so ticking one off should not fire a site-wide
  cache purge.

**Verifying it, in increasing order of how much the answer is worth.** The endpoint
answers the first question by itself: with no header it returns `401 Invalid secret`, and
a `500` means the env var is missing on the server (the route distinguishes the two
deliberately — one 401 for both once hid an unconfigured server as "working, just slowly").

Config being present is not evidence of delivery. Read the webhook's own attempt log:

```
GET https://api.sanity.io/v2021-10-04/hooks/projects/gze75bpb/pDfrkKIle0mp3TOM/attempts
```

with a token that has `sanity.project.webhooks/read` — the `SANITY_API_READ_TOKEN`
and `SANITY_API_WRITE_TOKEN` robots do **not** (401, missing grant). The Sanity CLI's own
login does; it is in `~/.config/sanity/config.json` as `authToken`.

And delivery is still not evidence the page changed. The only complete test is a real
publish: change a rendered field, poll the live page for it, then change it back.

---

## 4. Custom Domain
**Vercel → Project → Settings → Domains** → add the domain → follow the DNS records
Vercel shows. SSL is automatic.

---

## 5. Gotchas
- Node 18.18+ required (Vercel uses a compatible version automatically).
- `SquareSpaceDemo/` is reference material only; it ships in the repo but is ignored by Next's build.
- If a build fails on Vercel but works locally, check the Node version in **Project → Settings → General → Node.js Version**.
