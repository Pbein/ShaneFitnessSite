import type { Metadata } from "next";
import Image from "next/image";
import { aboutPage, credentials, interests, siteSettings } from "@/content/site";
import { Reveal } from "@/components/Reveal";
import { CtaButton } from "@/components/CtaButton";
import { SectionHeading } from "@/components/SectionHeading";
import { CredentialCard } from "@/components/CredentialCard";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Shane — NASM-certified personal trainer with an M.S. in Health Promotion Management. Evidence-based, sustainable coaching built around your life.",
};

export default function AboutPage() {
  const [intro, ...rest] = aboutPage.story;

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="section border-b border-white/10">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Reveal>
              <p className="mb-4 flex items-center gap-3 font-display text-sm uppercase tracking-wider2 text-brand">
                <span className="accent-rule" />
                About Shane
              </p>
              <h1 className="text-4xl leading-[1] text-cream-100 md:text-5xl lg:text-6xl">
                An educator coach, not a drill sergeant.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 text-lg leading-relaxed text-cream-300">{intro}</p>
            </Reveal>
            <Reveal delay={220} className="mt-8">
              <CtaButton
                cta={{ text: "Book a Free Consultation", type: "booking" }}
                variant="primary"
              />
            </Reveal>
          </div>

          <Reveal delay={150}>
            <div className="card-surface overflow-hidden p-2">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded">
                <Image
                  src={aboutPage.portrait}
                  alt="Shane — NASM Certified Personal Trainer"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Story ---------------- */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="My Story" title="A non-linear journey to a simple idea" />
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:gap-12">
            {rest.map((p, i) => (
              <Reveal key={i} delay={i * 70}>
                <p className="text-base leading-relaxed text-cream-300 md:text-lg">{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Credentials ---------------- */}
      <section className="section bg-ink-900">
        <div className="container-x">
          <SectionHeading
            eyebrow="Credentials"
            title="The foundation behind the coaching"
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

      {/* ---------------- My goal for you ---------------- */}
      <section className="section">
        <div className="container-x grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading eyebrow="My Philosophy" title={aboutPage.goalHeading} />
          <div className="space-y-5">
            {aboutPage.goal.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <p className="text-base leading-relaxed text-cream-300 md:text-lg">{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Interests ---------------- */}
      <section className="section bg-ink-900">
        <div className="container-x">
          <SectionHeading
            eyebrow="Beyond Coaching"
            title="Health is more than appearance"
            intro="The interests that keep me growing — and remind me that resilience, enjoyment, and confidence matter as much as any number on a scale."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {interests.map((interest, i) => (
              <Reveal key={interest.title} delay={i * 90}>
                <div className="card-surface h-full p-7">
                  <span className="font-display text-sm uppercase tracking-wider2 text-brand">
                    0{i + 1}
                  </span>
                  <h3 className="mt-3 text-xl tracking-tightish text-cream-100">
                    {interest.title}
                  </h3>
                  <p className="mt-2 text-sm text-cream-300">{interest.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Mission / CTA ---------------- */}
      <section className="border-t border-white/10 py-24 md:py-32">
        <div className="container-x text-center">
          <Reveal>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-cream-100 md:text-2xl">
              {aboutPage.mission}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-10 font-display text-3xl uppercase tracking-wide text-brand md:text-5xl">
              Realistic. Sustainable. Results.
            </p>
          </Reveal>
          <Reveal delay={220} className="mt-12 flex justify-center">
            <CtaButton
              cta={{ text: "Start the Conversation", type: "booking" }}
              variant="primary"
            />
          </Reveal>
          <p className="mt-6 text-sm text-cream-500">{siteSettings.serviceArea}</p>
        </div>
      </section>
    </>
  );
}
