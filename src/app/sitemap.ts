import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_ROUTES } from "@/lib/seo";
import { getNavVisibility, getPostSlugs } from "@/lib/sanity/fetch";

/**
 * PUBLIC_ROUTES lists every route that has a page module. Two of them are
 * content-gated and 404 when empty, so they are filtered out here rather than
 * advertised to search engines while they are hidden.
 *
 * Articles are appended separately because they are not fixed routes — each one
 * is a document in the CMS, so the list changes whenever Shane publishes. They
 * carry a real `lastModified` (the document's own mtime) and a higher change
 * frequency than the marketing pages, which is the honest signal: an article is
 * the only thing on this site that gets edited after it ships.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [nav, posts] = await Promise.all([getNavVisibility(), getPostSlugs()]);

  const hidden = new Set(
    [
      nav.successStories ? null : "/success-stories",
      nav.resources ? null : "/resources",
    ].filter(Boolean) as string[],
  );

  const pages: MetadataRoute.Sitemap = PUBLIC_ROUTES.filter(
    (route) => !hidden.has(route),
  ).map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const articles: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/resources/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...pages, ...articles];
}
