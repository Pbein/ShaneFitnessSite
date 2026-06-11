import { defineField, defineType } from "sanity";

/** Singleton — global business info, booking/payment destinations, SEO defaults. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "businessName",
      title: "Business name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "email",
      title: "Contact email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Phone (optional, public)",
      type: "string",
    }),
    defineField({
      name: "serviceArea",
      title: "Service area",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [{ type: "socialLink" }],
    }),
    defineField({
      name: "bookingUrl",
      title: "Booking URL (Calendly / scheduling)",
      type: "url",
      description: "Public booking link used by all 'booking' CTAs.",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "primaryPaymentLink",
      title: "Primary payment link (optional)",
      type: "url",
      description: "Default Stripe Payment Link for 'payment' CTAs without an override.",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "paymentLinks",
      title: "Payment links",
      type: "array",
      of: [{ type: "paymentLink" }],
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "seo",
      title: "SEO defaults",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Default title", type: "string" }),
        defineField({ name: "description", title: "Default description", type: "text", rows: 3 }),
      ],
    }),
  ],
  preview: { select: { title: "businessName", subtitle: "tagline" } },
});
