import { defineField, defineType } from "sanity";

export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: {
        list: [
          { title: "Instagram", value: "instagram" },
          { title: "Facebook", value: "facebook" },
          { title: "YouTube", value: "youtube" },
          { title: "TikTok", value: "tiktok" },
          { title: "X / Twitter", value: "x" },
          { title: "LinkedIn", value: "linkedin" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "visible",
      title: "Show on the website",
      type: "boolean",
      initialValue: true,
      description:
        "Untick to hide this link from the site without deleting it — the footer and " +
        "contact page simply stop showing it, and the address is kept here so you can " +
        "switch it back on with one tick. Use this while an account is still being set " +
        "up: sending visitors to an empty profile is worse than showing no link at all. " +
        "Changes appear on the live site within about a minute.",
    }),
  ],
  preview: {
    select: { title: "platform", subtitle: "url", visible: "visible" },
    prepare: ({ title, subtitle, visible }) => ({
      // Existing links predate this field, so undefined means visible.
      title: visible === false ? `${title} — hidden` : title,
      subtitle,
    }),
  },
});
