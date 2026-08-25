import { defineField, defineType } from "sanity";

/**
 * An article Shane writes and publishes himself — the first content type on this
 * site with a body and a URL of its own.
 *
 * Why it exists as a separate type from `resource`: a resource is a *teaser* that
 * links somewhere else (an Instagram post, a PDF). It has no body and no route,
 * so it can never rank for anything — the traffic it earns goes to whoever hosts
 * the actual writing. A post lives at /resources/<slug> on Shane's own domain,
 * which is the entire point: he is writing to be found, and pages he does not own
 * cannot do that for him.
 *
 * Field descriptions here are doing double duty as SEO coaching. Shane has never
 * done this before, so each field says *why* it matters, not just what to type —
 * the Studio is the only place he will read the advice at the moment he needs it.
 */
export const post = defineType({
  name: "post",
  title: "Article",
  type: "document",
  groups: [
    { name: "content", title: "The article", default: true },
    { name: "search", title: "Getting found (SEO)" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description:
        "Write it the way a client would say the problem out loud — \"The reason most workout programs fail\" beats \"Programming principles\". People search in plain language, and this becomes the big blue link in Google.",
      validation: (r) =>
        r
          .required()
          .max(70)
          .warning("Google cuts titles off around 60–70 characters. Shorter usually wins."),
    }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 72 },
      description:
        "The end of the link — trainshane.com/resources/THIS-BIT. Click Generate and leave it alone. Changing it later breaks every link anyone has shared and throws away whatever ranking the page has earned.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Summary",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "One or two sentences. Shows on the Resources page card and, unless you fill in the SEO description below, is what Google shows under the title. Say what the reader gets out of it.",
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Training", value: "Training" },
          { title: "Nutrition", value: "Nutrition" },
          { title: "Mindset", value: "Mindset" },
          { title: "Online Coaching", value: "Online Coaching" },
        ],
        layout: "dropdown",
      },
      initialValue: "Training",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Date",
      type: "datetime",
      group: "content",
      description:
        "The date shown on the article and given to Google. Newest appears first on the Resources page.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "The article",
      type: "articleBody",
      group: "content",
      description:
        "Break it up with section headings every few paragraphs — people scan before they read, and headings are what search engines use to work out what the page covers. Aim for 600+ words; below about 300 there usually isn't enough on the page to rank for anything.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      group: "content",
      initialValue: false,
      description:
        "This is the switch that puts the article on the live website — separate from the blue Publish button, which only saves your work in here. Leave it off while you're still writing; turn it on and the site updates within a minute.",
    }),

    /* ---- Getting found (SEO) ---------------------------------------- */

    defineField({
      name: "seoTitle",
      title: "Google title",
      type: "string",
      group: "search",
      description:
        "Optional. Leave empty and your title above is used, which is usually right. Only fill this in when you want Google to show something different from the headline on the page.",
      validation: (r) =>
        r.max(60).warning("Google cuts this off around 60 characters."),
    }),
    defineField({
      name: "seoDescription",
      title: "Google description",
      type: "text",
      rows: 3,
      group: "search",
      description:
        "Optional. The grey text under the link in Google. It doesn't affect ranking, but it decides whether anyone clicks. Leave empty to use your summary. Around 150 characters.",
      validation: (r) =>
        r.max(160).warning("Google cuts this off around 155–160 characters."),
    }),
    defineField({
      name: "shareImage",
      title: "Share image",
      type: "image",
      group: "search",
      options: { hotspot: true },
      description:
        "Optional. The picture that appears when this article is shared to Instagram, Facebook or in a text message. Landscape, roughly 1200×630. Without one, the site's default card is used.",
    }),
    defineField({
      name: "keyword",
      title: "What are you trying to be found for?",
      type: "string",
      group: "search",
      description:
        "Not published anywhere — it's a note to yourself. Write the phrase you'd want to rank for (\"online personal trainer for busy professionals\", \"how many days a week should I lift\"). Then check it actually appears in your title, your first paragraph and at least one heading. That check is most of on-page SEO.",
    }),
    defineField({
      name: "order",
      title: "Pin to top",
      type: "number",
      group: "content",
      description:
        "Leave blank. Only set this to force an article above the newest one on the Resources page — lower numbers come first.",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", category: "category", published: "published", date: "publishedAt" },
    prepare: ({ title, category, published, date }) => ({
      title,
      subtitle: `${published ? "🟢 Live" : "⚪ Draft"}  ·  ${category ?? "—"}${
        date ? `  ·  ${new Date(date).toLocaleDateString("en-US")}` : ""
      }`,
    }),
  },
});
