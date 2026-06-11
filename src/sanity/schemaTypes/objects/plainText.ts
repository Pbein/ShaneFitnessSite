import { defineArrayMember, defineType } from "sanity";

/**
 * Long-form body content locked to plain paragraphs — no bold/italic/links/lists
 * and no custom blocks. Gives a proper multi-paragraph editor in the Studio while
 * staying "safe formatting" (Shane can't break the design). The fetch layer
 * flattens this to string[] so components keep consuming plain paragraphs.
 */
export const plainText = defineType({
  name: "plainText",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Normal", value: "normal" }],
      lists: [],
      marks: { decorators: [], annotations: [] },
    }),
  ],
});
