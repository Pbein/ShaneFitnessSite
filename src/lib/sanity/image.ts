import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { client } from "./client";

const builder = imageUrlBuilder(client);

/** Build a Sanity CDN image URL builder (chain .width(), .url(), etc.). */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/** Resolve an image (or undefined) to a plain CDN URL string, or "" if absent. */
export function imageUrl(source?: SanityImageSource | null): string {
  if (!source) return "";
  try {
    return urlFor(source).auto("format").fit("max").url();
  } catch {
    return "";
  }
}
