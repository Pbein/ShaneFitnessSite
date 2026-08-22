import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/sanity/fetch";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms for coaching with Train Shane: sessions, scheduling, payment, cancellation and refunds, and the health and safety terms you're agreeing to.",
  alternates: { canonical: "/terms" },
};

/** Bump when the terms change. */
const LAST_UPDATED = "21 August 2026";

export default async function TermsPage() {
  const siteSettings = await getSiteSettings();
  if (!siteSettings) {
    throw new Error("Missing siteSettings document in the CMS");
  }
  const email = siteSettings.email;

  return (
    <>
      <section className="section border-b border-white/10 pt-32">
        <div className="container-x">
          <SectionHeading
            as="h1"
            eyebrow="Terms"
            title="The agreement between us"
            intro="What you're buying, what I'm responsible for, and what you're taking on. Worth two minutes before you book."
          />
          <p className="mt-6 text-sm text-cream-500">Last updated {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <Reveal>
            <div className="legal-prose">
              <h2>Who this is between</h2>
              <p>
                These terms cover Train Shane (&ldquo;I&rdquo;, &ldquo;me&rdquo;) and
                you, the person booking or buying coaching. Booking a session or
                starting a plan means you accept them.
              </p>

              <h2>Health and safety — read this part</h2>
              <p>
                <strong>
                  I am a certified personal trainer, not a doctor. Nothing I provide
                  is medical advice, diagnosis, or treatment.
                </strong>
              </p>
              <p>
                Before starting any training programme, talk to a physician — and do
                that especially if you are pregnant, recovering from injury or
                surgery, managing a chronic condition, taking medication that affects
                exercise, or have been inactive for a long stretch.
              </p>
              <p>
                Exercise carries an inherent risk of injury. By training with me you
                acknowledge that risk and accept it voluntarily. You agree to:
              </p>
              <ul>
                <li>
                  Tell me about any injury, condition, medication, or limitation that
                  could affect your training — before we start, and as soon as
                  anything changes.
                </li>
                <li>
                  Stop immediately and tell me if you feel pain, dizziness,
                  breathlessness, or anything else that isn&apos;t right.
                </li>
                <li>
                  Train within your ability, follow the technique guidance you&apos;re
                  given, and use equipment as instructed.
                </li>
              </ul>
              <p>
                Nutrition guidance provided as part of coaching is general and
                educational. It is not a prescribed diet, and it does not replace
                advice from a registered dietitian or your doctor.
              </p>

              <h2>What&apos;s on offer</h2>
              <p>
                A free consultation, in-person one-to-one sessions in the DC,
                Maryland and Northern Virginia area, and virtual coaching plans.
                What each plan includes is listed on the{" "}
                <a href="/services">Services</a> page, and that listing is the
                definition of what you&apos;re buying.
              </p>
              <p>
                Coaching is a professional service, not a guarantee of a result.
                Outcomes depend on consistency, sleep, nutrition, genetics, and life —
                most of which sit on your side of the table. I&apos;ll give you a
                sound plan and hold you to it; I can&apos;t promise a number on a
                scale or a date by which you&apos;ll hit it.
              </p>

              <h2>Booking, rescheduling, and missed sessions</h2>
              <p>
                Sessions are booked through the scheduling links on this site. Please
                give at least 24 hours&apos; notice to reschedule or cancel a session.
                Sessions cancelled with less notice, or missed without notice, may be
                treated as used.
              </p>
              <p>
                If I have to cancel, you get the session back — rescheduled at a time
                that works for you, or refunded if you&apos;d rather.
              </p>
              <p>
                For in-person sessions, arriving late shortens the session rather than
                extending it, so the next client isn&apos;t pushed back.
              </p>

              <h2>Payment</h2>
              <p>
                Prices are shown on the <a href="/services">Services</a> page in US
                dollars. Payment is handled by Stripe; card details never reach this
                website.
              </p>
              <p>
                In-person sessions are paid per session. Coaching plans are monthly
                subscriptions that renew automatically on the same day each month
                until you cancel. Prices may change with at least 30 days&apos; notice
                before your next renewal — never mid-cycle.
              </p>

              <h2>Cancelling a plan, and refunds</h2>
              <p>
                You can cancel a coaching plan at any time through the Stripe customer
                portal — the &ldquo;Manage subscription&rdquo; link in the footer. No
                notice period, no cancellation fee, no phone call to talk you out of
                it.
              </p>
              <p>
                Cancelling stops the next payment. Your access continues to the end of
                the month you&apos;ve already paid for. Part-months aren&apos;t
                refunded as a matter of course.
              </p>
              <p>
                If something has genuinely gone wrong — you were charged in error,
                charged after cancelling, or I failed to deliver what the plan says —
                email me and I&apos;ll put it right. I&apos;d rather sort it out
                directly than have you dispute it with your bank.
              </p>

              <h2>Your programme is yours; the materials are mine</h2>
              <p>
                Programmes, written guidance, videos, and other materials I provide
                are for your personal use. Please don&apos;t redistribute, resell, or
                publish them.
              </p>

              <h2>Limits</h2>
              <p>
                To the fullest extent the law allows, I am not liable for indirect or
                consequential losses, and my total liability in connection with
                coaching is limited to what you paid me for the service in question.
                Nothing here limits liability for death or personal injury caused by
                negligence, or for anything else that cannot lawfully be limited.
              </p>

              <h2>Ending the arrangement</h2>
              <p>
                Either of us can end the coaching relationship. I may end it — with a
                pro-rated refund of any unused prepaid time — if continuing would be
                unsafe, if health information was withheld, or in the case of abusive
                behaviour.
              </p>

              <h2>Changes to these terms</h2>
              <p>
                If these terms change, the date at the top changes with them. Active
                clients get told by email rather than expected to notice.
              </p>

              <h2>Questions</h2>
              <p>
                Anything unclear, ask before you book:{" "}
                <a href={`mailto:${email}`}>{email}</a>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
