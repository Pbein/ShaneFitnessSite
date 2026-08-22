import { defineField, defineType } from "sanity";

/**
 * Shane's private to-do list. Lives in the Studio and is **never queried by the
 * website** — there is no route, no component and no fetcher for it, so nothing
 * here can leak onto a public page even by accident. /studio requires a Sanity
 * login and is disallowed in robots.txt.
 *
 * The fields are deliberately verbose. This is read by someone who did not build
 * any of this and should not have to ask what "GBP" or "negative keyword" means,
 * so every task carries what it is, why it is worth doing, and the actual clicks.
 */
export const ownerTask = defineType({
  name: "ownerTask",
  title: "To-Do",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Task",
      type: "string",
      description: "Short name for the task — what you'd call it out loud.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "done",
      title: "Done",
      type: "boolean",
      initialValue: false,
      description: "Tick when finished. Done tasks move to the Done list on the left.",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Google Business Profile", value: "gbp" },
          { title: "Google Ads", value: "ads" },
          { title: "Reviews", value: "reviews" },
          { title: "Instagram & Social", value: "social" },
          { title: "Website", value: "website" },
          { title: "Business admin", value: "admin" },
        ],
        layout: "dropdown",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      options: {
        list: [
          { title: "1 — Do this first", value: "1" },
          { title: "2 — Soon", value: "2" },
          { title: "3 — When you have time", value: "3" },
        ],
        layout: "radio",
      },
      initialValue: "2",
      description:
        "Priority 1 items are the ones costing you money or clients right now. " +
        "If you only have twenty minutes, do a 1.",
    }),
    defineField({
      name: "timeNeeded",
      title: "Roughly how long",
      type: "string",
      description: 'Plain estimate, e.g. "10 minutes" or "an hour, once".',
    }),
    defineField({
      name: "whatItIs",
      title: "What this is",
      type: "text",
      rows: 3,
      description: "Assume no background knowledge. Explain the thing itself.",
    }),
    defineField({
      name: "whyItMatters",
      title: "Why it's worth doing",
      type: "text",
      rows: 3,
      description: "What you gain, or what it costs you to skip it.",
    }),
    defineField({
      name: "steps",
      title: "How to do it",
      type: "array",
      of: [{ type: "string" }],
      description: "The actual clicks, in order. One step per line.",
    }),
    defineField({
      name: "link",
      title: "Where to go",
      type: "url",
      description: "The page you start on.",
    }),
    defineField({
      name: "watchOutFor",
      title: "Watch out for",
      type: "text",
      rows: 3,
      description: "The mistake people usually make here.",
    }),
    defineField({
      name: "notes",
      title: "Your notes",
      type: "text",
      rows: 3,
      description:
        "Yours to scribble in — questions, what you tried, anything to raise with Philip.",
    }),
  ],
  orderings: [
    {
      title: "Priority",
      name: "priorityAsc",
      by: [
        { field: "priority", direction: "asc" },
        { field: "category", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", done: "done", category: "category", priority: "priority" },
    prepare: ({ title, done, category, priority }) => {
      const labels: Record<string, string> = {
        gbp: "Google Business Profile",
        ads: "Google Ads",
        reviews: "Reviews",
        social: "Instagram & Social",
        website: "Website",
        admin: "Business admin",
      };
      return {
        title: `${done ? "✅" : "⬜"}  ${title}`,
        subtitle: [labels[category] ?? category, priority ? `Priority ${priority}` : null]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
