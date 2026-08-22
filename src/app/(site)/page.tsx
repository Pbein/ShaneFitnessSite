import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/content/site";
import {
  getHomepage,
  getServices,
  getCredentials,
  getTestimonials,
  getSiteSettings,
} from "@/lib/sanity/fetch";
import { Reveal } from "@/components/Reveal";
import { CtaButton } from "@/components/CtaButton";
import { SectionHeading } from "@/components/SectionHeading";
import { CredentialCard } from "@/components/CredentialCard";
import { ServiceCard } from "@/components/ServiceCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { CheckIcon } from "@/components/Icons";

// Title/description come from the CMS via the route-group layout; only the
// canonical is page-specific.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [homepage, services, credentials, testimonials, siteSettings] =
    await Promise.all([
      getHomepage(),
      getServices(),
      getCredentials(),
      getTestimonials(),
      getSiteSettings(),
    ]);
  if (!homepage || !siteSettings) {
    throw new Error("Missing homepage/siteSettings documents in the CMS");
  }

  const featured = homepage.featuredServiceSlugs
    .map((slug) => services.find((s) => s.slug === slug))
    .filter(Boolean) as Service[];

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative isolate overflow-hidden">
        {/* Hero photo. Deliberately NOT `homepage.hero.image` for now: the Sanity
            `production` dataset is frozen read-only while the Spiderweb port keeps
            it as a fallback, so this ships from /public instead. Move it back to
            the CMS field once that freeze lifts, so Shane can swap it himself.

            A room rather than a portrait, so there is no subject to crop badly at
            any width, and it is branded — the TRAIN SHANE sign is in frame. */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-gym-room.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center] md:object-center"
          />
          {/* The lit wall on the left averages ~140/255, and the headline is
              near-white, so brightening the whole frame would leave the text
              sitting at roughly 2.4:1 — unreadable. Instead the darkening is
              spent where the words are and withdrawn everywhere else: held to
              55% of the width (the headline ends around 64% on desktop), then
              released so the rack, the plant and the TRAIN SHANE sign come
              through at full strength. Narrow screens put text over the middle
              of the room, so they keep a flat scrim as well — held to `lg` and
              not `md`, because at exactly 768 the measured worst-pixel contrast
              behind the headline dropped to 3.7:1, the weakest of any width.
              45% is the floor, not a guess: at 32% the cream-300 subheadline
              fell under 4.5:1 on every phone width. */}
          <div className="absolute inset-0 bg-ink-950/45 lg:bg-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 from-0% via-ink-950/80 via-55% to-transparent to-92%" />
          {/* The previous hero ended in a hard horizontal line where the section
              stopped, because the fade had gone transparent by halfway up.
              Carrying ink-950 further lands the bottom edge on the page's own
              background, so there is no seam to see. */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 from-4% via-ink-950/45 via-38% to-transparent" />
        </div>

        <div className="container-x flex min-h-[88vh] flex-col justify-center py-28">
          <div className="max-w-3xl animate-fade-in">
            <p className="mb-5 flex items-center gap-3 font-display text-sm uppercase tracking-wider2 text-brand">
              <span className="accent-rule" />
              {homepage.hero.eyebrow}
            </p>
            <h1 className="text-4xl leading-[0.98] text-cream-100 sm:text-5xl md:text-6xl lg:text-7xl">
              {homepage.hero.headline}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream-300">
              {homepage.hero.subheadline}
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <CtaButton cta={homepage.hero.primaryCta} variant="primary" />
              <CtaButton cta={homepage.hero.secondaryCta} variant="secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Credentials ---------------- */}
      <section className="section border-t border-white/10">
        <div className="container-x">
          <SectionHeading
            eyebrow="Credentials"
            title="Education and experience you can trust"
            intro="Evidence-based coaching grounded in graduate-level training and real-world experience with people at every level."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <CredentialCard credential={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Who I help ---------------- */}
      <section className="section bg-ink-900">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Who I Help"
            title={homepage.whoHeading}
            intro={homepage.whoIntro}
          />
          <Reveal delay={120}>
            <ul className="space-y-4">
              {homepage.whoFor.map((item, i) => (
                <li
                  key={i}
                  className="card-surface flex items-center gap-4 px-5 py-4 text-cream-100"
                >
                  <CheckIcon className="h-5 w-5 shrink-0 text-brand" />
                  <span className="text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section className="section border-t border-white/10">
        <div className="container-x">
          <SectionHeading
            eyebrow="Coaching Options"
            title="A path that fits your life"
            intro="Start with a free conversation, train in person, or coach with me from anywhere. Every option is built around simple, sustainable progress."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featured.map((s, i) => (
              <Reveal key={s.slug} delay={i * 90}>
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <CtaButton
              cta={{
                text: "See full details",
                type: "link",
                target: "/services",
              }}
              variant="ghost"
            />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Philosophy ---------------- */}
      <section className="section bg-ink-900">
        <div className="container-x grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <Reveal className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10">
              <Image
                src="/images/plan-paper.jpg"
                alt="A blank page and pen — your personalized plan starts here"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
              <p className="absolute bottom-6 left-6 right-6 font-display text-2xl uppercase leading-tight tracking-tightish text-cream-100">
                Your plan starts
                <br />
                with a blank page.
              </p>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Coaching Philosophy"
              title={homepage.philosophy.heading}
            />
            <div className="mt-6 space-y-5">
              {homepage.philosophy.body.map((p, i) => (
                <Reveal key={i} delay={i * 80}>
                  <p className="text-base leading-relaxed text-cream-300 md:text-lg">
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-8" delay={200}>
              <CtaButton
                cta={{
                  text: "More about Shane",
                  type: "link",
                  target: "/about",
                }}
                variant="ghost"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Testimonials ----------------
          Rendered only when there are real testimonials to show. With none
          published, this band was a heading over an empty grid and a "Read more
          stories" link to an empty page. Data-driven rather than commented out,
          so the section returns by itself the moment Shane publishes a quote. */}
      {testimonials.length > 0 && (
        <section className="section border-t border-white/10">
          <div className="container-x">
            <SectionHeading
              eyebrow="Success Stories"
              title="Real people. Lasting results."
              align="center"
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={i} delay={i * 90}>
                  <TestimonialCard testimonial={t} />
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10 text-center">
              <Link
                href="/success-stories"
                className="font-display text-sm uppercase tracking-wider2 text-cream-300 transition-colors hover:text-brand"
              >
                Read more stories →
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------------- Mission / CTA band ---------------- */}
      <section className="relative isolate overflow-hidden border-t border-white/10 py-24 md:py-32">
        <div className="container-x text-center">
          <Reveal>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-cream-100 md:text-2xl">
              {homepage.mission}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-10 font-display text-3xl uppercase tracking-wide text-brand md:text-5xl">
              Realistic. Sustainable. Results.
            </p>
          </Reveal>
          <Reveal delay={220} className="mt-12 flex justify-center">
            <CtaButton
              cta={{ text: "Book a Free Consultation", type: "booking" }}
              variant="primary"
            />
          </Reveal>
          <p className="mt-6 text-sm text-cream-500">
            {siteSettings.serviceArea}
          </p>
        </div>
      </section>
    </>
  );
}
