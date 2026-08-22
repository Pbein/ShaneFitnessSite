import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_ROUTES } from "@/lib/seo";
import { getNavVisibility } from "@/lib/sanity/fetch";

/**
 * PUBLIC_ROUTES lists every route that has a page module. Two of them are
 * content-gated and 404 when empty, so they are filtered out here rather than
 * advertised to search engines while they are hidden.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const nav = await getNavVisibility();
  const hidden = new Set(
    [
      nav.successStories ? null : "/success-stories",
      nav.resources ? null : "/resources",
    ].filter(Boolean) as string[],
  );

  return PUBLIC_ROUTES.filter((route) => !hidden.has(route)).map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
