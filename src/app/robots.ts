import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/studio", // keep the CMS out of search results
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
