/**
 * Seeds Shane's articles (`post`).
 *
 *   node scripts/seed-posts.mjs
 *
 * Same contract as seed-owner-tasks.mjs and seed-owner-guides.mjs:
 * `createIfNotExists` with stable ids, so re-running adds what is missing and
 * never overwrites a word Shane has edited since. He owns this text — once it
 * exists in the CMS, the CMS is the source of truth and this file is history.
 *
 * Two encoding notes, both learned from the existing seeded documents, which
 * contain "â€"" where an em dash should be:
 *
 *   1. Every non-ASCII character here is written as a \u escape rather than as a
 *      literal, so the bytes cannot be mangled by whatever encoding a shell,
 *      editor or pipe decides to apply on the way to the API.
 *   2. The request sets an explicit `charset=utf-8` on the content type.
 *
 * Verify after seeding by reading the document back, not by looking at this file.
 *
 * THE ID MUST NOT CONTAIN A DOT, and this is not a style preference.
 *
 * The dataset's public read grant is `_id in path("*")` — a single path segment.
 * Sanity treats a dot as a path separator, so `post.some-slug` is two segments and
 * falls outside the grant: readable with a token, invisible to anonymous readers.
 * The website's Sanity client deliberately carries no token (it only ever reads
 * published content), so a dotted id publishes an article that the website itself
 * cannot see — the page stays 404 with no error anywhere to explain why.
 *
 * That is exactly why `ownerTask.*` and `ownerGuide.*` DO use dots: Shane's
 * private to-do list and guides live in the same public dataset, and the dot is
 * what keeps them out of anonymous reach. Private docs: dots. Public docs: dashes.
 */
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};

const projectId = get("NEXT_PUBLIC_SANITY_PROJECT_ID");
const dataset = get("NEXT_PUBLIC_SANITY_DATASET");
const apiVersion = get("NEXT_PUBLIC_SANITY_API_VERSION") ?? "2025-01-01";
const token = get("SANITY_API_WRITE_TOKEN");

if (!projectId || !dataset || !token) {
  console.error("Missing Sanity config in .env.local.");
  process.exit(1);
}

const EM = "—"; // em dash

/* Portable Text builders. `_key` must be unique within the array; deriving it
   from the block index keeps it stable across re-runs. */
let n = 0;
const key = () => `b${(n += 1).toString(36)}`;

const block = (text, extra = {}) => {
  const k = key();
  return {
    _type: "block",
    _key: k,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${k}s`, text, marks: [] }],
    ...extra,
  };
};

const bullet = (text) => block(text, { listItem: "bullet", level: 1 });

const posts = [
  {
    _id: "post-why-most-workout-programs-fail",
    _type: "post",
    title: "The Reason Most Workout Programs Fail",
    slug: { _type: "slug", current: "why-most-workout-programs-fail" },
    excerpt:
      "Most programs don't fail because they're ineffective. They fail because people can't stick with them. Here's how to train for real results without giving up the rest of your life.",
    category: "Training",
    publishedAt: "2026-08-24T15:00:00Z",
    published: true,
    keyword: "why workout programs fail / sustainable workout routine",
    seoDescription:
      "The best training program isn't the one that looks perfect on paper - it's the one you can stick to. Why compound lifts and 2-3 days a week beat an unsustainable plan.",
    body: [
      block(
        "Most workout programs don't fail because they're ineffective. They fail because people can't stick with them.",
      ),
      block(
        "The best training program isn't the one that looks perfect on paper. It's the one you can consistently follow through the inevitable ups and downs of life.",
      ),
      block("Your workout routine should enhance your life, not take away from it."),
      block(
        `Fitness should make special occasions, travel, dating, social events, hobbies, and time with loved ones more enjoyable${EM}not force you to sacrifice them. While health deserves to be a priority, it shouldn't come at the expense of living a fulfilling life.`,
      ),
      block("That's why efficiency matters."),
      block(
        "Every workout should deliver the greatest return on your investment of time and effort. By focusing on the exercises that produce the most results, you can continue making progress while leaving more time and energy for the people and experiences that matter most.",
      ),
      block(
        `The highest ROI exercises are compound movements${EM}multi-joint exercises that train several muscle groups at once.`,
      ),
      block("Examples include:"),
      bullet("Bench Press"),
      bullet("Pull-ups"),
      bullet("Rows"),
      bullet("Squats"),
      bullet("Overhead Press"),
      block(
        "These exercises allow you to build strength and muscle far more efficiently than relying primarily on isolation exercises.",
      ),
      block(
        `Isolation movements${EM}such as bicep curls, triceps pushdowns, and leg extensions${EM}certainly have their place in a well-designed program, but they shouldn't be the foundation for most people.`,
      ),
      // Shane's draft says "(covered in Blog Post #2)". Post #2 does not exist
      // yet, and a live page that points at nothing is worse than one that
      // promises it. Reworded to survive on its own; turn it into a real link
      // once the progressive-overload article ships.
      block(
        "Combine compound lifts with progressive overload (covered in the next article), and you've built the framework for long-term success.",
      ),
      block(
        `Training three days per week${EM}and even two days per week for many people${EM}isn't settling for the bare minimum. It's a sustainable approach that allows you to build an impressive physique while maintaining balance in the rest of your life.`,
      ),
    ],
  },
];

const mutations = posts.map((doc) => ({ createIfNotExists: doc }));

const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnIds=true`;

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ mutations }),
});

const json = await res.json();

if (!res.ok) {
  console.error("Seed failed:", JSON.stringify(json, null, 2));
  process.exit(1);
}

console.log(`Seeded ${posts.length} article(s).`);
for (const r of json.results ?? []) console.log(`  ${r.operation.padEnd(8)} ${r.id}`);
