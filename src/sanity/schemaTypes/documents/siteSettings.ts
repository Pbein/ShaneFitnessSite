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
      title: "Consultation / default booking URL",
      type: "url",
      description:
        "Calendly link for the free-consultation 'Book a Consultation' CTAs across the site (home, services, contact). Also the fallback the welcome page uses for any paid tier whose own booking URL is left blank.",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "essentialBookingUrl",
      title: "Essential first-session booking URL (monthly / Meet)",
      type: "url",
      description:
        "Calendly link to the 'first session' event for Essential (e.g. the Monthly Meeting, Google Meet) shown on the welcome page after an Essential purchase. Falls back to the main Booking URL if blank.",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "premiumBookingUrl",
      title: "Premium first-session booking URL (weekly / Meet)",
      type: "url",
      description:
        "Calendly link to the 'first session' event for Premium (e.g. the Weekly One-on-One, Google Meet) shown on the welcome page after a Premium purchase. Falls back to the main Booking URL if blank.",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "inPersonBookingUrl",
      title: "In-person session booking URL",
      type: "url",
      description:
        "Calendly link to the in-person session event shown on the welcome page after an In-Person purchase. Set that event's location to 'Ask invitee' so the client enters where they want to meet. Falls back to the main Booking URL if blank.",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
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
      name: "manageSubscriptionUrl",
      title: "Manage subscription URL (Stripe customer portal)",
      type: "url",
      description:
        "Stripe Customer Portal login link (https://billing.stripe.com/p/login/...). Lets clients update or cancel their subscription with no account. Shown in the footer and on the welcome page when set.",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
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
        defineField({
          name: "shareImage",
          title: "Share image (link preview)",
          type: "image",
          options: { hotspot: true },
          description:
            "The picture that shows up when your site gets shared — texted to a friend, " +
            "posted on Facebook or Instagram, or linked in an ad. Upload a wide image, " +
            "ideally 1200 x 630 pixels; anything wider or taller gets cropped to that " +
            "shape, and you can drag the hotspot to choose what stays in frame. " +
            "Leave this empty and the site uses the Train Shane card it ships with. " +
            "Note: Facebook and LinkedIn remember the old picture for a while — after " +
            "changing it, paste your site's address into Facebook's Sharing Debugger " +
            "and click \"Scrape Again\" to make them pick up the new one.",
          validation: (r) =>
            r.custom((value?: { asset?: { _ref?: string } }) => {
              // Sanity encodes the dimensions in the asset id, so this reads the
              // real size without fetching the file: image-<hash>-1200x630-jpg.
              const dims = value?.asset?._ref?.match(/-(\d+)x(\d+)-/);
              if (!dims) return true;
              const ratio = Number(dims[1]) / Number(dims[2]);
              if (Number(dims[1]) < 600)
                return "This image is quite small and will look blurry in a link preview — 1200 pixels wide or more is best.";
              if (ratio < 1.5 || ratio > 2.3)
                return "This is not a wide image, so it will be cropped hard in link previews. A roughly 1200 x 630 picture works best.";
              return true;
            }).warning(),
        }),
      ],
    }),
    defineField({
      name: "googleAds",
      title: "Google Ads conversion tracking",
      type: "object",
      description:
        "Tells Google Ads when an ad click actually turned into an inquiry or a sale. " +
        "Until the Conversion ID below is filled in, no Google tracking code loads on " +
        "the site at all. Changes go live within about a minute — no rebuild needed. " +
        "Full instructions are in your To-Do List under \"Set up conversion tracking\".",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "conversionId",
          title: "Conversion ID",
          type: "string",
          description:
            "Starts with AW- followed by numbers, e.g. AW-123456789. Find it in Google Ads " +
            "under Goals → Conversions → Summary: click a conversion action, open " +
            "\"Tag setup\" → \"Use Google tag manually\", and it is the ID shown there. " +
            "It is the same for every conversion action in your account. " +
            "Leave this empty and nothing else on this panel does anything.",
          validation: (r) =>
            r.regex(/^AW-\d{6,15}$/, {
              name: "Google Ads Conversion ID",
              invert: false,
            }).warning(
              "This should look like AW-123456789. If it does not match, the site will " +
                "ignore it and no tracking will run — better than loading a broken tag.",
            ),
        }),
        defineField({
          name: "contactLabel",
          title: "Conversion Label — contact form",
          type: "string",
          description:
            "The label for the conversion action you named something like \"Contact form " +
            "submitted\". It is a short jumble of letters and numbers shown right next to " +
            "the Conversion ID on the same screen, e.g. AbC-D_efGhIjKlM. Paste only the " +
            "label, not the whole 'AW-123/AbC' line. This fires when someone actually " +
            "sends the contact form successfully — not when they merely open the page.",
          validation: (r) =>
            r.regex(/^[A-Za-z0-9_-]{5,60}$/, { name: "Conversion Label" }).warning(
              "Labels are letters, numbers, dashes and underscores only. If you pasted " +
                "something like AW-123456789/AbC-Def, remove the AW- part and the slash.",
            ),
        }),
        defineField({
          name: "purchaseLabel",
          title: "Conversion Label — purchase (optional)",
          type: "string",
          description:
            "Optional, and more valuable than the one above. Create a second conversion " +
            "action in Google Ads named something like \"Purchase\", and paste its label " +
            "here. It fires when someone lands on the welcome page after paying through " +
            "Stripe — so Google learns which ads produce paying clients, not just " +
            "inquiries. Leave empty if you have not set one up.",
          validation: (r) =>
            r.regex(/^[A-Za-z0-9_-]{5,60}$/, { name: "Conversion Label" }).warning(
              "Labels are letters, numbers, dashes and underscores only.",
            ),
        }),
      ],
    }),
  ],
  preview: { select: { title: "businessName", subtitle: "tagline" } },
});
