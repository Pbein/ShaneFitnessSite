import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/sanity/fetch";
import { Reveal } from "@/components/Reveal";
import { CalendlyInline } from "@/components/CalendlyInline";
import { isEmbeddableCalendly } from "@/lib/booking";
import { CheckIcon } from "@/components/Icons";

// Post-payment landing page — not meant to be found via search.
export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

/** Per-plan copy. `subscription` controls whether the "manage subscription"
 *  note is shown. Unknown/missing plans fall back to `DEFAULT_COPY`. */
const PLAN_COPY: Record<
  string,
  { heading: string; intro: string; subscription: boolean }
> = {
  essential: {
    heading: "Welcome to Essential Coaching",
    intro:
      "Your subscription is active — a receipt is on its way to your email. Let's lock in your first session below, then Shane will take it from there each week.",
    subscription: true,
  },
  premium: {
    heading: "Welcome to Premium Coaching",
    intro:
      "Your subscription is active — a receipt is on its way to your email. Pick a time for your first session below; Shane will coordinate your ongoing weekly sessions with you directly.",
    subscription: true,
  },
  "in-person": {
    heading: "Payment received — let's get you on the calendar",
    intro:
      "Thanks for your payment — a receipt is on its way to your email. Choose a time for your session below and you'll get a calendar invite to confirm.",
    subscription: false,
  },
};

const DEFAULT_COPY = {
  heading: "Payment received — let's get started",
  intro:
    "Thanks for your payment — a receipt is on its way to your email. Pick a time for your first session below and you'll get a calendar invite to confirm.",
  subscription: true,
};

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const [{ plan }, siteSettings] = await Promise.all([searchParams, getSiteSettings()]);
  if (!siteSettings) {
    throw new Error("Missing siteSettings document in the CMS");
  }

  const copy = (plan && PLAN_COPY[plan]) || DEFAULT_COPY;

  // Prefer the dedicated "first session" link; fall back to the main booking link.
  const bookingUrl = siteSettings.onboardingBookingUrl || siteSettings.bookingUrl;
  const canEmbed = isEmbeddableCalendly(bookingUrl);

  return (
    <section className="section pt-32">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/15 text-brand">
            <CheckIcon className="h-7 w-7" />
          </span>
          <p className="mt-6 flex items-center justify-center gap-3 font-display text-sm uppercase tracking-wider2 text-brand">
            <span className="accent-rule" />
            Payment confirmed
          </p>
          <h1 className="mt-4 text-3xl leading-[1.05] text-cream-100 md:text-4xl lg:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-cream-300 md:text-lg">
            {copy.intro}
          </p>
          <p className="mt-3 text-sm text-cream-500">
            Only times Shane is free are shown, so whatever you pick is confirmed
            automatically.
          </p>
        </Reveal>

        {/* Booking */}
        {canEmbed ? (
          <Reveal delay={120} className="mt-12">
            <CalendlyInline url={bookingUrl} />
          </Reveal>
        ) : (
          <Reveal delay={120} className="mx-auto mt-12 max-w-2xl">
            <div className="card-surface p-8 text-center md:p-10">
              <h2 className="text-xl text-cream-100">Book your first session</h2>
              <p className="mt-3 text-sm leading-relaxed text-cream-300">
                Use the link below to choose a time that works for you. If you have any
                trouble, just reply to your receipt email or reach out at{" "}
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="text-brand underline"
                >
                  {siteSettings.email}
                </a>
                .
              </p>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-brand px-7 py-3.5 font-display text-sm uppercase tracking-wider2 text-cream-100 shadow-[0_8px_30px_-12px_rgba(214,40,40,0.7)] transition-all duration-300 hover:bg-brand-light"
              >
                Choose a time
              </a>
            </div>
          </Reveal>
        )}

        {/* Footnotes */}
        <Reveal delay={200} className="mx-auto mt-12 max-w-2xl text-center">
          {copy.subscription && siteSettings.manageSubscriptionUrl && (
            <p className="text-sm text-cream-500">
              Need to update your card or cancel later? You can{" "}
              <a
                href={siteSettings.manageSubscriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-300 underline transition-colors hover:text-brand"
              >
                manage your subscription
              </a>{" "}
              anytime — no account needed.
            </p>
          )}
          <p className="mt-4 text-sm text-cream-500">
            <Link href="/" className="underline transition-colors hover:text-brand">
              Back to home
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
