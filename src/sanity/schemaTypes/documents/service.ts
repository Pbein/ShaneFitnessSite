import { defineField, defineType } from "sanity";

/** Repeatable — a coaching service / offer. */
export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "shortDescription", title: "Short description", type: "text", rows: 3 }),
    defineField({ name: "price", title: "Price", type: "string", description: "e.g. 'Free', '$100', '$200'" }),
    defineField({ name: "priceNote", title: "Price note", type: "string", description: "e.g. 'per month', 'per 1-hour session'" }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({
      name: "ctaType",
      title: "CTA type",
      type: "string",
      options: {
        list: [
          { title: "Booking", value: "booking" },
          { title: "Payment", value: "payment" },
          { title: "Link", value: "link" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "ctaText", title: "CTA text", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "paymentLink",
      title: "Payment link override",
      type: "url",
      description: "Stripe Payment Link for this service (for 'payment' CTA type).",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "included", title: "What's included", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "whoFor", title: "Who it's for", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "approach", title: "Approach", type: "text", rows: 3 }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description:
        "Retired services stay in the CMS with all their copy preserved but stop showing on the site. Flip back to Active to bring an old offer back instead of rebuilding it.",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Retired", value: "retired" },
        ],
        layout: "radio",
      },
      initialValue: "active",
    }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "price", status: "status" },
    prepare: ({ title, subtitle, status }) => ({
      title: status === "retired" ? `${title} (retired)` : title,
      subtitle,
    }),
  },
});
