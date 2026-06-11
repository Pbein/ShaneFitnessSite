import { defineField, defineType } from "sanity";

/** Singleton — homepage hero + intro sections. */
export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "headline", title: "Headline", type: "string", validation: (r) => r.required() }),
        defineField({ name: "subheadline", title: "Subheadline", type: "text", rows: 3 }),
        defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
        defineField({ name: "primaryCta", title: "Primary CTA", type: "cta" }),
        defineField({ name: "secondaryCta", title: "Secondary CTA", type: "cta" }),
      ],
    }),
    defineField({ name: "whoHeading", title: "“Who” heading", type: "string" }),
    defineField({ name: "whoIntro", title: "“Who” intro", type: "text", rows: 4 }),
    defineField({
      name: "whoFor",
      title: "Who it's for (bullets)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "philosophy",
      title: "Philosophy",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "body", title: "Body", type: "plainText" }),
      ],
    }),
    defineField({
      name: "featuredServices",
      title: "Featured services",
      type: "array",
      of: [{ type: "reference", to: [{ type: "service" }] }],
      description: "Services to feature on the homepage (order here is preserved).",
    }),
    defineField({ name: "mission", title: "Mission statement", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "hero.headline" }, prepare: ({ title }) => ({ title: title || "Homepage" }) },
});
