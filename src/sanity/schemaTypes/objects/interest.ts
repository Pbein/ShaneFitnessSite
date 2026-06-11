import { defineField, defineType } from "sanity";

export const interest = defineType({
  name: "interest",
  title: "Personal interest",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "detail",
      title: "Detail",
      type: "string",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "title", subtitle: "detail" } },
});
