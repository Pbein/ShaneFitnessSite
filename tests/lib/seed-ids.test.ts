import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * A dot in a seeded document `_id` decides whether the public website can see
 * the document, and nothing in the type system or the build says so.
 *
 * The Sanity dataset is public, and its public read grant is `_id in path("*")`
 * — one path segment. Sanity treats "." as a path separator, so `post.my-slug`
 * is two segments and falls outside the grant. The site's Sanity client
 * deliberately carries no token, so such a document is readable in the Studio
 * and by every seed script, and invisible to the website. The article publishes,
 * and /resources stays 404 with no error anywhere to explain it.
 *
 * This was not theoretical: the first seed of Shane's article used
 * `post.why-most-workout-programs-fail` and the site could not see it.
 *
 * The same mechanism is load-bearing in the other direction. `ownerTask.*` and
 * `ownerGuide.*` are Shane's private to-do list and guides, living in the same
 * public dataset — the dot is the only thing keeping them out of anonymous
 * reach. Removing it would publish his private notes to anyone who asks the API.
 *
 * So: public document types must use dashes, private ones must use dots. Both
 * halves are asserted, because both failures are silent.
 */

const SCRIPTS = join(process.cwd(), "scripts");

/** Types the website reads with an anonymous client — must be dot-free. */
const PUBLIC_TYPES = ["post", "resource", "testimonial", "service", "siteSettings", "homepage", "aboutPage"];

/** Types that exist only inside the Studio — the dot is what keeps them private. */
const PRIVATE_TYPES = ["ownerTask", "ownerGuide"];

/**
 * Every `_id:` value in the seed scripts, as written (quoted or template).
 *
 * Template holes are collapsed to a single token first. `service-${s.slug}`
 * contains a dot that belongs to the *expression*, not to the id it produces —
 * left in, it reads as a violation of exactly the rule this file exists to check.
 */
function seededIds(): { file: string; id: string }[] {
  const files = readdirSync(SCRIPTS).filter((f) => f.startsWith("seed"));
  return files.flatMap((file) => {
    const src = readFileSync(join(SCRIPTS, file), "utf8");
    const matches = src.matchAll(/_id:\s*(["'`])([^"'`]*)\1/g);
    return [...matches].map((m) => ({ file, id: m[2].replace(/\$\{[^}]*\}/g, "SLUG") }));
  });
}

describe("seeded document ids", () => {
  const ids = seededIds();

  it("finds the seed scripts (guards against this test silently passing on nothing)", () => {
    expect(ids.length).toBeGreaterThan(5);
  });

  it.each(PUBLIC_TYPES)("%s ids contain no dot, or the website cannot read them", (type) => {
    const offenders = ids.filter(
      ({ id }) => id.startsWith(`${type}.`) || (id.startsWith(`${type}-`) && id.includes(".")),
    );
    expect(offenders, `dotted public id(s): ${JSON.stringify(offenders)}`).toEqual([]);
  });

  it.each(PRIVATE_TYPES)("%s ids keep their dot, which is what keeps them private", (type) => {
    const forType = ids.filter(({ id }) => id.startsWith(type));
    expect(forType.length, `no ${type} ids found`).toBeGreaterThan(0);
    for (const { file, id } of forType) {
      expect(id, `${file} seeds a publicly-readable ${type}`).toContain(`${type}.`);
    }
  });
});
