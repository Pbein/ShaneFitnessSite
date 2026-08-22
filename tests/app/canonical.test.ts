import { describe, it, expect, beforeAll, vi } from "vitest";
import type { Metadata } from "next";
import { PUBLIC_ROUTES } from "@/lib/seo";

/**
 * Regression guard for the canonical-URL bug (F2).
 *
 * `alternates: { canonical: "/" }` used to live in the (site) route-group
 * layout. Route-group metadata is inherited by every child, so all five
 * marketing pages declared the homepage as their canonical URL. The rule these
 * tests pin down:
 *
 *   - the route-group layout declares NO canonical, and
 *   - every page under (site) declares its own, matching its own path.
 *
 * The page modules are imported for real, so this asserts on the metadata Next
 * actually emits rather than on source text.
 */

// next/font/google and the Sanity client both need the Next build/runtime; stub
// them so the metadata exports can be imported in a plain Node test process.
vi.mock("next/font/google", () => ({
  Oswald: () => ({ variable: "--font-oswald" }),
  Inter: () => ({ variable: "--font-inter" }),
}));

vi.mock("@/lib/sanity/fetch", () => ({
  getSiteSettings: async () => ({
    businessName: "Train Shane",
    tagline: "Realistic. Sustainable. Results.",
    email: "shane@example.com",
    serviceArea: "DC / MD / VA",
    socialLinks: [],
    bookingUrl: "https://calendly.com/shane/main",
    paymentLinks: [],
    logo: "/images/logo.webp",
    seo: { title: "Train Shane", description: "d" },
  }),
}));

beforeAll(() => {
  // src/sanity/env.ts asserts these at import time.
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||= "test";
  process.env.NEXT_PUBLIC_SANITY_DATASET ||= "production";
});

/** Route path -> page module directory under src/app/(site). */
const ROUTE_TO_MODULE: Record<string, string> = {
  "": "../../src/app/(site)/page",
  "/about": "../../src/app/(site)/about/page",
  "/services": "../../src/app/(site)/services/page",
  "/success-stories": "../../src/app/(site)/success-stories/page",
  "/resources": "../../src/app/(site)/resources/page",
  "/contact": "../../src/app/(site)/contact/page",
  "/privacy": "../../src/app/(site)/privacy/page",
  "/terms": "../../src/app/(site)/terms/page",
};

async function metadataOf(modulePath: string): Promise<Metadata> {
  const mod = (await import(modulePath)) as { metadata?: Metadata };
  expect(mod.metadata, `${modulePath} exports no metadata`).toBeDefined();
  return mod.metadata as Metadata;
}

describe("canonical URLs", () => {
  it("every public route in the sitemap has a page module mapped here", () => {
    // Keeps this test honest when a route is added to PUBLIC_ROUTES.
    expect(Object.keys(ROUTE_TO_MODULE).sort()).toEqual([...PUBLIC_ROUTES].sort());
  });

  it.each(PUBLIC_ROUTES.map((r) => [r || "/ (home)", r] as const))(
    "%s declares its own canonical",
    async (_label, route) => {
      const metadata = await metadataOf(ROUTE_TO_MODULE[route]);
      expect(metadata.alternates?.canonical).toBe(route === "" ? "/" : route);
    },
  );

  it("no two pages share a canonical", async () => {
    const canonicals = await Promise.all(
      PUBLIC_ROUTES.map(async (route) => {
        const metadata = await metadataOf(ROUTE_TO_MODULE[route]);
        return String(metadata.alternates?.canonical);
      }),
    );
    expect(new Set(canonicals).size).toBe(PUBLIC_ROUTES.length);
  });

  it("the (site) route-group layout declares no canonical for children to inherit", async () => {
    const mod = await import("../../src/app/(site)/layout");
    const metadata = await mod.generateMetadata();
    expect(metadata.alternates?.canonical).toBeUndefined();
  });

  it("the welcome page is noindex and canonicalises to itself", async () => {
    const metadata = await metadataOf("../../src/app/(site)/welcome/page");
    expect(metadata.alternates?.canonical).toBe("/welcome");
    expect(metadata.robots).toMatchObject({ index: false });
    // Post-payment page — must never be in the sitemap.
    expect(PUBLIC_ROUTES).not.toContain("/welcome");
  });
});
