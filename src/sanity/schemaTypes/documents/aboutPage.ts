import { defineField, defineType } from "sanity";

/** Singleton — About page: Shane's story, goal, credentials, interests. */
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (r) => r.required() }),
    defineField({ name: "portrait", title: "Portrait", type: "image", options: { hotspot: true } }),
    defineField({ name: "story", title: "Story", type: "plainText" }),
    defineField({ name: "goalHeading", title: "Goal heading", type: "string" }),
    defineField({ name: "goal", title: "Goal", type: "plainText" }),
    defineField({ name: "mission", title: "Mission statement", type: "text", rows: 3 }),
    defineField({
      name: "credentials",
      title: "Credentials & focus areas",
      type: "array",
      of: [{ type: "credential" }],
    }),
    defineField({
      name: "interests",
      title: "Personal interests",
      type: "array",
      of: [{ type: "interest" }],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "About Page" }) },
});
