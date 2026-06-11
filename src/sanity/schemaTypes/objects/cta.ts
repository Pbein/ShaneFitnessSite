import { defineField, defineType } from "sanity";

/** A call-to-action whose destination resolves at render time (lib/cta.ts). */
export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Button text",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      title: "Destination type",
      type: "string",
      options: {
        list: [
          { title: "Booking link (from Site Settings)", value: "booking" },
          { title: "Payment link (from Site Settings)", value: "payment" },
          { title: "Internal / external link", value: "link" },
        ],
        layout: "radio",
      },
      initialValue: "link",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "target",
      title: "Target (link type only)",
      type: "string",
      description:
        "Href for the 'link' type (e.g. /services). Booking/payment resolve from Site Settings unless you set an override here.",
    }),
  ],
  preview: { select: { title: "text", subtitle: "type" } },
});
