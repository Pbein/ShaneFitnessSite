import type { Metadata } from "next";
import { testimonials } from "@/content/site";
import { Reveal } from "@/components/Reveal";
import { CtaButton } from "@/components/CtaButton";
import { SectionHeading } from "@/components/SectionHeading";
import { TestimonialCard } from "@/components/TestimonialCard";

export const metadata: Metadata = {
  title: "Success Stories",
  description:
    "Real results from real people — sustainable strength, confidence, and habits that last.",
};

export default function SuccessStoriesPage() {
  return (
    <>
      <section className="section border-b border-white/10 pt-32">
        <div className="container-x">
          <SectionHeading
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

        {/* Placeholder note for the demo */}
        <div className="container-x mt-12">
          <p className="rounded-md border border-dashed border-white/15 px-5 py-4 text-sm text-cream-500">
            Sample stories shown for the demo. Real client testimonials will be added
            and managed through the CMS.
          </p>
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
