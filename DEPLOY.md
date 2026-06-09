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
`http://localhost:3000` so the embedded Studio can talk to the dataset.

---

## 4. Custom Domain
**Vercel → Project → Settings → Domains** → add the domain → follow the DNS records
Vercel shows. SSL is automatic.

---

## 5. Gotchas
- Node 18.18+ required (Vercel uses a compatible version automatically).
- `SquareSpaceDemo/` is reference material only; it ships in the repo but is ignored by Next's build.
- If a build fails on Vercel but works locally, check the Node version in **Project → Settings → General → Node.js Version**.
