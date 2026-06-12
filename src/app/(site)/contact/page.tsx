import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/sanity/fetch";
import { Reveal } from "@/components/Reveal";
import { CtaButton } from "@/components/CtaButton";
import { ContactForm } from "@/components/ContactForm";
import { SectionHeading } from "@/components/SectionHeading";
import { CalendlyInline } from "@/components/CalendlyInline";
import { MailIcon, InstagramIcon } from "@/components/Icons";
import { isEmbeddableCalendly } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell me how I can help. Send a quick message and I'll get back to you within one business day.",
};

export default async function ContactPage() {
  const siteSettings = await getSiteSettings();
  if (!siteSettings) {
    throw new Error("Missing siteSettings document in the CMS");
  }
  const instagram = siteSettings.socialLinks.find((s) => s.platform === "instagram");

  return (
    <>
    <section className="section pt-32">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* Left: intro + details */}
        <div>
          <Reveal>
            <p className="mb-4 flex items-center gap-3 font-display text-sm uppercase tracking-wider2 text-brand">
              <span className="accent-rule" />
              Contact
            </p>
            <h1 className="text-4xl leading-[1] text-cream-100 md:text-5xl">
              Tell me how I can help
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-cream-300">
              Send me a quick message and I&apos;ll get back to you within one business
              day. Prefer to talk it through? Book a free consultation.
            </p>
          </Reveal>

          <Reveal delay={150} className="mt-10 space-y-4">
            <a
              href={`mailto:${siteSettings.email}`}
              className="card-surface flex items-center gap-4 px-5 py-4 text-cream-100"
            >
              <MailIcon className="h-5 w-5 text-brand" />
              <span className="text-sm">{siteSettings.email}</span>
            </a>
            {instagram && (
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-surface flex items-center gap-4 px-5 py-4 text-cream-100"
              >
                <InstagramIcon className="h-5 w-5 text-brand" />
                <span className="text-sm">Follow on Instagram</span>
              </a>
            )}
          </Reveal>

          <Reveal delay={250} className="mt-8">
            <p className="mb-3 text-sm text-cream-500">{siteSettings.serviceArea}</p>
            <CtaButton
              cta={{ text: "Book a Free Consultation", type: "booking" }}
              variant="secondary"
            />
          </Reveal>
        </div>

        {/* Right: form */}
        <Reveal delay={120}>
          <div className="card-surface p-8 md:p-10">
            <h2 className="text-2xl text-cream-100">Send a message</h2>
            <p className="mt-2 text-sm text-cream-500">
              Fill out the form below to get started.
            </p>
            <div className="mt-8">
              <ContactForm email={siteSettings.email} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>

      {isEmbeddableCalendly(siteSettings.bookingUrl) && (
        <section className="section border-t border-white/10">
          <div className="container-x">
            <SectionHeading
              eyebrow="Booking"
              title="Or pick a time right now"
              align="center"
            />
            <div className="mt-10">
              <CalendlyInline url={siteSettings.bookingUrl} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
