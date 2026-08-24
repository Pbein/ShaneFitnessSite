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

/**
 * Resolve a Sanity image to a 1200x630 JPEG — the size every social network
 * wants for a link preview. Cropped rather than letterboxed (hotspot-aware, so
 * the focal point set in the CMS survives the crop), and forced to JPEG because
 * some scrapers still refuse WebP, which `auto=format` would otherwise serve.
 * Returns "" when there is no image, so callers can fall back to the shipped file.
 */
export function shareImageUrl(source?: SanityImageSource | null): string {
  if (!source) return "";
  try {
    return urlFor(source).width(1200).height(630).fit("crop").format("jpg").quality(85).url();
  } catch {
    return "";
  }
}
