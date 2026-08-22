import type { Metadata } from "next";
import { getServices, getSiteSettings } from "@/lib/sanity/fetch";
import { Reveal } from "@/components/Reveal";
import { CtaButton } from "@/components/CtaButton";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Coaching options with Train Shane: a free consultation, in-person 1-on-1 training in DC/MD/VA, and personalized virtual coaching for busy professionals.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [services, siteSettings] = await Promise.all([getServices(), getSiteSettings()]);
  if (!siteSettings) {
    throw new Error("Missing siteSettings document in the CMS");
  }

  // The consultation is the only service you book rather than buy. Splitting on
  // that (not on a slug) keeps working if it is renamed in the CMS; if the shape
  // ever changes — no booking service, or several — everything falls back into
  // the one grid rather than silently dropping a service.
  const bookable = services.filter((s) => s.ctaType === "booking");
  const consultation = bookable.length === 1 ? bookable[0] : undefined;
  const plans = consultation ? services.filter((s) => s !== consultation) : services;

  return (
    <>
      <section className="section border-b border-white/10 pt-32">
        <div className="container-x">
          <SectionHeading
            as="h1"
            eyebrow="Coaching Options"
            title="Find the right way to train"
            intro="Whether you want hands-on sessions or flexible coaching from anywhere, every option is built around the same idea: simple, sustainable progress you'll actually enjoy."
          />
        </div>
      </section>

      <section className="section">
        {/* The free consultation is the way in, not a tier you weigh against the
            paid ones — so it leads as a wide strip and the three plans sit
            side by side underneath. Three across also means no orphan card
            alone on a second row, and dropping `items-start` lets the cards in
            a row match height instead of ending at ragged depths. */}
        {consultation && (
          <div className="container-x mb-10">
            <Reveal>
              <div className="card-surface flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-9">
                <div className="max-w-xl">
                  <p className="font-display text-xs uppercase tracking-wider2 text-brand">
                    Start here
                  </p>
                  <h3 className="mt-2 text-xl tracking-tightish text-cream-100 md:text-2xl">
                    {consultation.name} —{" "}
                    <span className="text-brand">{consultation.price}</span>
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream-300">
                    {consultation.shortDescription}
                  </p>
                </div>
                <div className="shrink-0">
                  {consultation.duration && (
                    <p className="mb-3 text-xs uppercase tracking-wider2 text-cream-500 md:text-right">
                      {consultation.duration}
                    </p>
                  )}
                  <CtaButton
                    cta={{ text: consultation.ctaText, type: consultation.ctaType }}
                    variant="secondary"
                    className="w-full md:w-auto"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        )}
        <div className="container-x grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((s, i) => (
            <Reveal key={s.slug} delay={i * 100} className="h-full">
              <ServiceCard service={s} variant="full" />
            </Reveal>
          ))}
        </div>
        <div className="container-x mt-10">
          <p className="text-sm text-cream-500">
            Payment is handled securely via Stripe; booking links open your scheduling
            calendar.{" "}
            <span className="text-cream-300">{siteSettings.serviceArea}</span>
          </p>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-white/10 bg-ink-900 py-20 md:py-28">
        <div className="container-x flex flex-col items-center gap-8 text-center">
          <Reveal>
            <h2 className="text-3xl text-cream-100 md:text-4xl">
              Not sure which is right for you?
            </h2>
            <p className="mt-4 max-w-xl text-cream-300">
              Start with a free consultation. We&apos;ll talk through your goals and figure
              out the best fit together — no pressure.
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
