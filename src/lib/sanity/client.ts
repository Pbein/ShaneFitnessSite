import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Read-only client for published content on the public dataset.
 * useCdn=true serves cached, published documents (fast, no token needed).
 * The SANITY_API_READ_TOKEN is reserved for future draft/preview mode.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
