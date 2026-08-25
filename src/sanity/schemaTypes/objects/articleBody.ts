import { defineArrayMember, defineType } from "sanity";

/**
 * The writing surface for articles — deliberately wider than `plainText` and
 * deliberately narrower than Sanity's default block editor.
 *
 * `plainText` (used for the About story and the homepage philosophy) allows
 * paragraphs and nothing else, because those sit inside a designed layout where
 * a stray heading would break the composition. An article is different: it is a
 * page of prose that needs subheads to be readable and scannable, and subheads
 * are also the single biggest on-page SEO lever Shane controls. Shane's first
 * post already contains a bulleted list of five lifts, so lists are not optional
 * either.
 *
 * What is still withheld: image blocks, tables, custom embeds, and any style
 * that would let the article set its own type scale. Everything here renders
 * through ArticleBody with fixed classes, so the page cannot be visually broken
 * from the CMS — only written badly, which is a different problem.
 *
 * Note the missing H1. The article's `title` field is the page's only h1; an
 * editor-inserted second one would compete with it for the same keyword and is
 * the most common self-inflicted SEO wound on a blog. Headings start at H2.
 */
export const articleBody = defineType({
  name: "articleBody",
  title: "The article",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Section heading (H2)", value: "h2" },
        { title: "Sub-heading (H3)", value: "h3" },
        { title: "Pull quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bulleted", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
                description:
                  "Link to your own pages where it's natural — /services, /contact, another article. Search engines read internal links as a map of what your site is about, and they keep readers moving instead of leaving.",
                validation: (r) =>
                  r.uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }),
              },
            ],
          },
        ],
      },
    }),
  ],
});
