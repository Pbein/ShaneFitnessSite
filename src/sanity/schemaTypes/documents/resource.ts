import { defineField, defineType } from "sanity";

/** Repeatable — a resource / article teaser. */
export const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({
      name: "url",
      title: "Link",
      type: "url",
      description:
        "Where this resource opens — an article, a PDF, an Instagram post. Without a link the card reads \"Coming soon\" and goes nowhere.",
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: false,
      description:
        "The Resources page appears in the site menu only when at least one resource is published. Tick this once the resource has a link — publishing one that goes nowhere puts a dead page back in the menu.",
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "title", subtitle: "category" } },
});
