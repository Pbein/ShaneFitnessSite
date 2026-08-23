import { defineField, defineType } from "sanity";

/**
 * Plain-English answers to the questions Shane is actually asking — LLC or not,
 * insurance or not, how to get a first client — as distinct from `ownerTask`,
 * which is things to *do*.
 *
 * The split is deliberate. He said he felt overwhelmed, and the fastest way to
 * make that worse is to answer a question by adding six more items to a to-do
 * list. These are things to *understand*, and most of them end with "so you can
 * ignore this for now", which a checklist cannot express.
 *
 * Like `ownerTask`, this is never queried by the website — no route, component
 * or fetcher references it. /studio needs a Sanity login and is disallowed in
 * robots.txt.
 */
export const ownerGuide = defineType({
  name: "ownerGuide",
  title: "Guide",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "The question",
      type: "string",
      description: "Phrase it the way you'd actually ask it out loud.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Start here", value: "start-here" },
          { title: "Business setup (LLC, registration)", value: "business-setup" },
          { title: "Insurance & safety", value: "insurance" },
          { title: "Getting your first clients", value: "getting-clients" },
          { title: "Money, pricing & tax", value: "money" },
        ],
        layout: "dropdown",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Reading order",
      type: "number",
      initialValue: 50,
      description: "Lower numbers appear first. Read them in order if unsure.",
    }),
    defineField({
      name: "shortAnswer",
      title: "The short answer",
      type: "text",
      rows: 3,
      description:
        "Two or three sentences. If you only read one field, this is the one — it should be enough to act on by itself.",
    }),
    defineField({
      name: "theDetail",
      title: "The longer version",
      type: "text",
      rows: 10,
      description: "For when the short answer raises more questions.",
    }),
    defineField({
      name: "doNow",
      title: "What to actually do",
      type: "array",
      of: [{ type: "string" }],
      description: "Concrete steps, in order. One per line. Often this is empty on purpose.",
    }),
    defineField({
      name: "ignoreForNow",
      title: "What you can ignore for now",
      type: "text",
      rows: 4,
      description:
        "Just as important as what to do. Names the things that feel urgent but aren't yet.",
    }),
    defineField({
      name: "revisitWhen",
      title: "Come back to this when…",
      type: "string",
      description:
        'A specific trigger rather than a date — e.g. "you have 3 paying clients" or "before your first in-person session".',
    }),
    defineField({
      name: "links",
      title: "Useful links",
      type: "array",
      of: [
        {
          type: "object",
          name: "guideLink",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        },
      ],
    }),
    defineField({
      name: "notes",
      title: "Your notes",
      type: "text",
      rows: 3,
      description: "Questions this raises, what you decided, anything to raise with Philip.",
    }),
  ],
  orderings: [
    { title: "Reading order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", category: "category", order: "order" },
    prepare: ({ title, category, order }) => {
      const labels: Record<string, string> = {
        "start-here": "⭐ Start here",
        "business-setup": "Business setup",
        insurance: "Insurance & safety",
        "getting-clients": "Getting clients",
        money: "Money & pricing",
      };
      return { title, subtitle: `${labels[category] ?? category}  ·  #${order ?? "—"}` };
    },
  },
});
