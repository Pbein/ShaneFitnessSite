import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTestimonials } from "@/lib/sanity/fetch";
import { Reveal } from "@/components/Reveal";
import { CtaButton } from "@/components/CtaButton";
import { SectionHeading } from "@/components/SectionHeading";
import { TestimonialCard } from "@/components/TestimonialCard";

export const metadata: Metadata = {
  title: "Success Stories",
  description:
    "Real results from real people — sustainable strength, confidence, and habits that last.",
  alternates: { canonical: "/success-stories" },
};

export default async function SuccessStoriesPage() {
  const testimonials = await getTestimonials();

  // The page exists only while there is something on it. Hiding it from the nav
  // but leaving it reachable would still let a search result or an old link land
  // someone on an empty page — and it comes back on its own, with no code
  // change, the moment Shane publishes a testimonial.
  if (testimonials.length === 0) notFound();

  return (
    <>
      <section className="section border-b border-white/10 pt-32">
        <div className="container-x">
          <SectionHeading
            as="h1"
            eyebrow="Success Stories"
            title="Results that last beyond the program"
            intro="The goal isn't a quick before-and-after. It's building habits and systems that keep working long after our coaching ends."
          />
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 90}>
              <TestimonialCard testimonial={t} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-ink-900 py-20 md:py-28">
        <div className="container-x flex flex-col items-center gap-8 text-center">
          <Reveal>
            <h2 className="text-3xl text-cream-100 md:text-4xl">
              Your story could be next.
            </h2>
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
