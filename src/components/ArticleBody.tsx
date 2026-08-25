import { PortableText, type PortableTextComponents } from "next-sanity";

/**
 * Renders an article's Portable Text body.
 *
 * Everything is styled by the `.article-prose` wrapper in globals.css rather than
 * by per-element class props, for the same reason `.legal-prose` exists: the CMS
 * emits bare semantic HTML, and keeping the type scale in one CSS block means an
 * article can never carry its own spacing decisions. The only element that needs
 * a real component here is the link, because internal and external links must
 * behave differently.
 */
const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = String(value?.href ?? "");
      // Relative hrefs are Shane's own pages — those stay in the tab, and adding
      // rel="noopener" to them would be noise. Anything off-site opens in a new
      // tab and gets the noopener/noreferrer pair.
      const isInternal = href.startsWith("/") || href.startsWith("#");
      if (isInternal) return <a href={href}>{children}</a>;
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
};

export function ArticleBody({ value }: { value: unknown }) {
  return (
    <div className="article-prose">
      {/* The schema's `body` is typed `unknown[]` at the content-model boundary
          so nothing outside this component depends on Portable Text internals. */}
      <PortableText
        value={value as Parameters<typeof PortableText>[0]["value"]}
        components={components}
      />
    </div>
  );
}
