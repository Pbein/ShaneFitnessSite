import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Read-only client for published content on the public dataset.
 * useCdn=false reads from the live API so SSG/ISR builds always get fresh
 * content (the CDN can serve a stale cached query result right after an edit).
 * Next.js caching (fetch revalidate) handles performance. No token needed for
 * published reads; SANITY_API_READ_TOKEN is reserved for future draft/preview.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});
