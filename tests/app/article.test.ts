import { describe, it, expect, vi, beforeAll } from "vitest";

/**
 * Guards for the article route, which is the first page on this site whose URL
 * comes from the CMS rather than from the filesystem. Three things are pinned:
 *
 *   - each article canonicalises to its OWN path. The canonical bug this repo
 *     already fixed once (F2, see tests/app/canonical.test.ts) was every page
 *     claiming to be the homepage; a dynamic route is the easiest place to
 *     reintroduce it, because one wrong template string does it for every
 *     article at once.
 *   - a slug that is unpublished or deleted returns noindex metadata rather than
 *     a canonical, so a 404 never advertises itself to search engines.
 *   - the sitemap lists every published article. The sitemap is the only way
 *     Google finds a new post quickly — nothing else links to it on the day it
 *     ships — so an article missing from it is an article nobody reads.
 */

const PUBLISHED = {
  title: "The Reason Most Workout Programs Fail",
  slug: "why-most-workout-programs-fail",
  excerpt: "Most programs don't fail because they're ineffective.",
  category: "Training",
  publishedAt: "2026-08-24T15:00:00Z",
  updatedAt: "2026-08-25T03:00:00Z",
  readingMinutes: 2,
  body: [],
};

vi.mock("@/lib/sanity/fetch", () => ({
  getPost: async (slug: string) => (slug === PUBLISHED.slug ? PUBLISHED : undefined),
  getPosts: async () => [PUBLISHED],
  getPostSlugs: async () => [
    { slug: PUBLISHED.slug, updatedAt: PUBLISHED.updatedAt, publishedAt: PUBLISHED.publishedAt },
  ],
  getSiteSettings: async () => ({ businessName: "Train Shane" }),
  getNavVisibility: async () => ({ successStories: false, resources: true }),
}));

beforeAll(() => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||= "test";
  process.env.NEXT_PUBLIC_SANITY_DATASET ||= "production";
});

describe("article metadata", () => {
  it("canonicalises to its own slug, not to /resources", async () => {
    const { generateMetadata } = await import("../../src/app/(site)/resources/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: PUBLISHED.slug }),
    });
    expect(metadata.alternates?.canonical).toBe(`/resources/${PUBLISHED.slug}`);
  });

  it("marks an unknown slug noindex and gives it no canonical", async () => {
    const { generateMetadata } = await import("../../src/app/(site)/resources/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "never-published" }),
    });
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates?.canonical).toBeUndefined();
  });

  it("prerenders every published article", async () => {
    const { generateStaticParams } = await import("../../src/app/(site)/resources/[slug]/page");
    expect(await generateStaticParams()).toEqual([{ slug: PUBLISHED.slug }]);
  });
});

describe("sitemap", () => {
  it("lists each published article with its own lastModified", async () => {
    const sitemap = (await import("../../src/app/sitemap")).default;
    const entries = await sitemap();
    const article = entries.find((e) => e.url.endsWith(`/resources/${PUBLISHED.slug}`));

    expect(article, "the article is missing from the sitemap").toBeDefined();
    expect(article?.lastModified).toEqual(new Date(PUBLISHED.updatedAt));
  });

  it("still lists /resources itself when an article is published", async () => {
    const sitemap = (await import("../../src/app/sitemap")).default;
    const entries = await sitemap();
    expect(entries.some((e) => e.url.endsWith("/resources"))).toBe(true);
  });
});
