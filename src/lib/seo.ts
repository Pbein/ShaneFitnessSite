/**
 * Canonical site URL for metadata/OG/sitemap. Swap to the custom domain in
 * Phase 3 (or set NEXT_PUBLIC_SITE_URL). Used by metadataBase, robots, sitemap.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shane-fitness-site.vercel.app";

/** Marketing routes (drives the sitemap). /studio is intentionally excluded. */
export const PUBLIC_ROUTES = [
  "",
  "/about",
  "/services",
  "/success-stories",
  "/resources",
  "/contact",
  "/privacy",
  "/terms",
] as const;
