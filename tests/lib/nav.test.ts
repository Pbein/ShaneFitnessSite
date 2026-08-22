import { describe, it, expect } from "vitest";
import { visibleNavLinks } from "@/components/SiteHeader";

/**
 * Success Stories and Resources are content-gated rather than toggled: they
 * leave the nav when there is nothing to show and return on their own when
 * content is published. That restore path can't be exercised against the live
 * CMS (the `production` dataset is frozen read-only), so it is pinned here.
 */
describe("visibleNavLinks", () => {
  const hrefs = (nav: { successStories: boolean; resources: boolean }) =>
    visibleNavLinks(nav).map((l) => l.href);

  it("hides both pages when neither has content", () => {
    expect(hrefs({ successStories: false, resources: false })).toEqual([
      "/",
      "/about",
      "/services",
      "/contact",
    ]);
  });

  it("brings Success Stories back when a testimonial is published", () => {
    expect(hrefs({ successStories: true, resources: false })).toContain(
      "/success-stories",
    );
  });

  it("brings Resources back when a resource is published", () => {
    expect(hrefs({ successStories: false, resources: true })).toContain("/resources");
  });

  it("restores the original order when both have content", () => {
    expect(hrefs({ successStories: true, resources: true })).toEqual([
      "/",
      "/about",
      "/services",
      "/success-stories",
      "/resources",
      "/contact",
    ]);
  });

  it("never hides the pages that always exist", () => {
    for (const nav of [
      { successStories: false, resources: false },
      { successStories: true, resources: false },
      { successStories: false, resources: true },
      { successStories: true, resources: true },
    ]) {
      expect(hrefs(nav)).toEqual(expect.arrayContaining(["/", "/about", "/services", "/contact"]));
    }
  });
});
