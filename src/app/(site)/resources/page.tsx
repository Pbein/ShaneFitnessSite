import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosts, getResources } from "@/lib/sanity/fetch";
import { Reveal } from "@/components/Reveal";
import { CtaButton } from "@/components/CtaButton";
import { SectionHeading } from "@/components/SectionHeading";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Practical, evidence-based guidance on training, nutrition, and mindset — written for real life.",
  alternates: { canonical: "/resources" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export default async function ResourcesPage() {
  // Two kinds of thing live here. `posts` are articles Shane wrote that live on
  // this domain; `resources` are the older link-out teasers that point somewhere
  // else. Both are published-only, so this page is empty — and 404s — until he
  // publishes at least one of either. Same reasoning as /success-stories.
  const [posts, resources] = await Promise.all([getPosts(), getResources()]);
  if (posts.length === 0 && resources.length === 0) notFound();

  return (
    <>
      <section className="section border-b border-white/10 pt-32">
        <div className="container-x">
          <SectionHeading
            as="h1"
            eyebrow="Resources"
            title="Cut through the noise"
            intro="Short, practical reads on training, nutrition, and mindset — grounded in evidence, written for people with real lives and limited time."
          />
        </div>
      </section>

      {posts.length > 0 && (
        <section className="section">
          <div className="container-x grid gap-6 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                {/* The whole card is the link. A card that only responds on its
                    title is a smaller target than it looks, which matters most
                    on a phone. */}
                <Link href={`/resources/${p.slug}`} className="group block h-full">
                  <article className="card-surface flex h-full flex-col p-7">
                    <span className="font-display text-xs uppercase tracking-wider2 text-brand">
                      {p.category}
                    </span>
                    <h2 className="mt-3 text-xl leading-snug tracking-tightish text-cream-100">
                      {p.title}
                    </h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-cream-300">
                      {p.excerpt}
                    </p>
                    <p className="mt-6 font-display text-[11px] uppercase tracking-wider2 text-cream-500">
                      <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time>
                      <span aria-hidden="true"> · </span>
                      {p.readingMinutes} min read
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 font-display text-xs uppercase tracking-wider2 text-cream-300 transition-colors group-hover:text-brand">
                      Read it
                      <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Link-out resources. Kept below the articles and given their own heading
          so it is obvious these leave the site — and so the section disappears
          entirely rather than rendering an empty band when there are none. */}
      {resources.length > 0 && (
        <section className={posts.length > 0 ? "section border-t border-white/10" : "section"}>
          <div className="container-x">
            {posts.length > 0 && (
              <h2 className="mb-8 font-display text-sm uppercase tracking-wider2 text-cream-500">
                Elsewhere
              </h2>
            )}
            <div className="grid gap-6 md:grid-cols-3">
              {resources.map((r, i) => (
                <Reveal key={i} delay={i * 90}>
                  <article className="card-surface group flex h-full flex-col p-7">
                    <span className="font-display text-xs uppercase tracking-wider2 text-brand">
                      {r.category}
                    </span>
                    <h3 className="mt-3 text-xl leading-snug tracking-tightish text-cream-100">
                      {r.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-cream-300">
                      {r.summary}
                    </p>
                    {/* A published resource should go somewhere. Without a link the
                        card is honest about it rather than pretending to be
                        clickable. */}
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 font-display text-xs uppercase tracking-wider2 text-cream-300 transition-colors group-hover:text-brand"
                      >
                        Read it
                        <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    ) : (
                      <span className="mt-6 inline-flex items-center gap-2 font-display text-xs uppercase tracking-wider2 text-cream-500">
                        Coming soon
                      </span>
                    )}
                  </article>
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
              Want guidance tailored to you?
            </h2>
            <p className="mt-4 max-w-xl text-cream-300">
              Articles are a start — coaching is the shortcut. Let&apos;s build a plan
              around your goals.
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
