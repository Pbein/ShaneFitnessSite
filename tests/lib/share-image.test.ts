import { describe, it, expect, vi } from "vitest";
import type { Metadata } from "next";

/**
 * The link-preview card is the one image nobody sees on the site itself, so a
 * broken URL here fails silently — the tag is present, the picture just never
 * loads when someone shares the link. Two things are pinned:
 *
 *   - the CDN URL is the exact 1200x630 JPEG crop scrapers expect (`auto=format`
 *     would hand back WebP, which Facebook and iMessage still reject), and
 *   - the layout falls back to the shipped card when Shane has not uploaded one.
 */

// src/sanity/env.ts asserts these at import time, so they have to be set before
// the module graph is pulled in — hence the dynamic import below.
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||= "test";
process.env.NEXT_PUBLIC_SANITY_DATASET ||= "production";

const { shareImageUrl } = await import("@/lib/sanity/image");

describe("shareImageUrl", () => {
  const image = {
    _type: "image" as const,
    asset: {
      _type: "reference" as const,
      _ref: "image-abc123def456abc123def456abc123def456abc1-2400x1260-png",
    },
  };

  it("crops to the 1200x630 every social network expects", () => {
    const url = shareImageUrl(image);
    expect(url).toContain("w=1200");
    expect(url).toContain("h=630");
    expect(url).toContain("fit=crop");
  });

  it("forces JPEG rather than letting the CDN negotiate WebP", () => {
    expect(shareImageUrl(image)).toContain("fm=jpg");
  });

  it("returns empty for a missing image, so callers fall back", () => {
    expect(shareImageUrl(undefined)).toBe("");
    expect(shareImageUrl(null)).toBe("");
  });
});

// next/font/google needs the Next build/runtime; stub it so the layout's
// metadata export can be imported in a plain Node test process.
vi.mock("next/font/google", () => ({
  Oswald: () => ({ variable: "--font-oswald" }),
  Inter: () => ({ variable: "--font-inter" }),
}));

const settings = (shareImage?: string) => ({
  businessName: "Train Shane",
  tagline: "Realistic. Sustainable. Results.",
  email: "shane@example.com",
  serviceArea: "DC / MD / VA",
  socialLinks: [],
  bookingUrl: "https://calendly.com/shane/main",
  paymentLinks: [],
  logo: "/images/logo.webp",
  seo: { title: "Train Shane", description: "d", shareImage },
});

async function layoutMetadata(shareImage?: string): Promise<Metadata> {
  vi.resetModules();
  vi.doMock("@/lib/sanity/fetch", () => ({
    getSiteSettings: async () => settings(shareImage),
  }));
  const mod = (await import("../../src/app/(site)/layout")) as {
    generateMetadata: () => Promise<Metadata>;
  };
  return mod.generateMetadata();
}

/** OG images can be a string, an object, or an array of either. */
function firstOgImageUrl(meta: Metadata): string {
  const images = meta.openGraph?.images;
  const first = Array.isArray(images) ? images[0] : images;
  if (typeof first === "string") return first;
  return String((first as { url?: unknown })?.url ?? "");
}

describe("share card in page metadata", () => {
  it("uses the CMS image when Site Settings has one", async () => {
    const cdn = "https://cdn.sanity.io/images/p/production/x-2400x1260.jpg?w=1200";
    expect(firstOgImageUrl(await layoutMetadata(cdn))).toBe(cdn);
  });

  it("falls back to the shipped card, versioned to bust scraper caches", async () => {
    const url = firstOgImageUrl(await layoutMetadata(undefined));
    expect(url).toMatch(/^\/images\/og-card\.jpg\?v=\d+$/);
  });

  it("gives Twitter the same image as Open Graph", async () => {
    const meta = await layoutMetadata(undefined);
    expect(meta.twitter?.images).toEqual([firstOgImageUrl(meta)]);
  });
});
