import { defineField, defineType } from "sanity";

export const credential = defineType({
  name: "credential",
  title: "Credential / focus area",
  type: "object",
  fields: [
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: [
          { title: "Education", value: "education" },
          { title: "Certification", value: "certification" },
          { title: "Experience", value: "experience" },
          { title: "Focus", value: "focus" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "lines",
      title: "Lines",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.min(1),
    }),
  ],
  preview: { select: { title: "title", subtitle: "icon" } },
});
