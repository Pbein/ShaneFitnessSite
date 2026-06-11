import { defineField, defineType } from "sanity";

export const paymentLink = defineType({
  name: "paymentLink",
  title: "Payment link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "e.g. 'In-Person Session'",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "Stripe Payment Link URL",
      type: "url",
      description: "Public Stripe Payment Link (https://buy.stripe.com/...).",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
  ],
  preview: { select: { title: "label", subtitle: "url" } },
});
