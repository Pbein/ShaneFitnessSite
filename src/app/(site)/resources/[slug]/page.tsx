import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPost, getPosts, getPostSlugs, getSiteSettings } from "@/lib/sanity/fetch";
import { SITE_URL } from "@/lib/seo";
import { ArticleBody } from "@/components/ArticleBody";
import { Reveal } from "@/components/Reveal";
import { CtaButton } from "@/components/CtaButton";
import { ArrowIcon } from "@/components/Icons";

type Params = { slug: string };

/**
 * Prerender every published article at build time. `dynamicParams` stays at its
 * default (true) on purpose: an article Shane publishes after a deploy is not in
 * this list, and without it he would have to wait for a rebuild to see his own
 * work. With it, the first request renders the page and it joins the ISR cycle
 * like every other route.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  // An unpublished or deleted slug must not advertise itself. Returning bare
  // metadata here keeps the eventual 404 clean rather than emitting a canonical
  // for a page that does not exist.
  if (!post) return { title: "Not found", robots: { index: false } };

  const description = post.seoDescription || post.excerpt;
  const url = `${SITE_URL}/resources/${post.slug}`;

  return {
    title: post.seoTitle || post.title,
    description,
    alternates: { canonical: `/resources/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [`${SITE_URL}/about`],
      // Only override the site-wide card when the article carries its own image;
      // omitting the key lets the layout's default OG image be inherited.
      ...(post.shareImage
        ? { images: [{ url: post.shareImage, width: 1200, height: 630, alt: post.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description,
      ...(post.shareImage ? { images: [post.shareImage] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSiteSettings()]);
  if (!post) notFound();

  // Three more articles to read next. Internal links are the cheapest SEO this
  // site has — they spread authority between articles and give search engines a
  // route to a new post that nothing else links to yet.
  const others = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    articleSection: post.category,
    inLanguage: "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/resources/${post.slug}` },
    author: { "@type": "Person", name: "Shane", url: `${SITE_URL}/about` },
    publisher: { "@type": "Organization", name: settings?.businessName ?? "Train Shane" },
    ...(post.shareImage ? { image: [post.shareImage] } : {}),
  };

  return (
    <>
      {/* Structured data. Google does not need it to index the page, but without
          it an article is just text — with it, it is an Article with an author, a
          date and a section, which is what earns the richer search result. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <header className="section border-b border-white/10 pt-32">
          <div className="container-x">
            <Reveal className="max-w-[68ch]">
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-wider2 text-cream-500 transition-colors hover:text-brand"
              >
                <ArrowIcon className="h-4 w-4 rotate-180" />
                All articles
              </Link>

              <p className="mt-8 flex items-center gap-3 font-display text-sm uppercase tracking-wider2 text-brand">
                <span className="accent-rule" />
                {post.category}
              </p>

              <h1 className="mt-4 text-3xl leading-[1.05] text-cream-100 md:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              <p className="mt-6 font-display text-xs uppercase tracking-wider2 text-cream-500">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span aria-hidden="true"> · </span>
                {post.readingMinutes} min read
              </p>
            </Reveal>
          </div>
        </header>

        <div className="section">
          <div className="container-x">
            <Reveal>
              <ArticleBody value={post.body} />
            </Reveal>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="border-t border-white/10 section">
          <div className="container-x">
            <h2 className="font-display text-sm uppercase tracking-wider2 text-cream-500">
              Keep reading
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {others.map((p, i) => (
                <Reveal key={p.slug} delay={i * 90}>
                  <Link href={`/resources/${p.slug}`} className="group block h-full">
                    <article className="card-surface flex h-full flex-col p-7">
                      <span className="font-display text-xs uppercase tracking-wider2 text-brand">
                        {p.category}
                      </span>
                      <h3 className="mt-3 text-lg leading-snug tracking-tightish text-cream-100">
                        {p.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-cream-300">
                        {p.excerpt}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 font-display text-xs uppercase tracking-wider2 text-cream-300 transition-colors group-hover:text-brand">
                        Read it
                        <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-white/10 bg-ink-900 py-20 md:py-28">
        <div className="container-x flex flex-col items-center gap-8 text-center">
          <Reveal>
            <h2 className="text-3xl text-cream-100 md:text-4xl">
              Want this built around your life?
            </h2>
            <p className="mt-4 max-w-xl text-cream-300">
              Reading about it is a start. A plan written for your schedule, your
              equipment and your goals is the shortcut.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <CtaButton
              cta={{ text: "Book a Free Consultation", type: "booking" }}
              variant="primary"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
