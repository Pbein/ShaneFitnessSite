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

  return (
    <>
      <section className="section border-b border-white/10 pt-32">
        <div className="container-x">
          <SectionHeading
            eyebrow="Coaching Options"
            title="Find the right way to train"
            intro="Whether you want hands-on sessions or flexible coaching from anywhere, every option is built around the same idea: simple, sustainable progress you'll actually enjoy."
          />
        </div>
      </section>

      <section className="section">
        <div className="container-x grid items-start gap-6 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 100}>
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
