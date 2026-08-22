import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/sanity/fetch";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Train Shane collects, why, who it's shared with, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
};

/** Bump when the policy text changes. */
const LAST_UPDATED = "21 August 2026";

export default async function PrivacyPage() {
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
            eyebrow="Privacy"
            title="What I collect, and what I don't"
            intro="Plain English, because a policy nobody can read protects nobody. If anything here is unclear, email me and I'll explain it."
          />
          <p className="mt-6 text-sm text-cream-500">Last updated {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <Reveal>
            <div className="legal-prose">
              <h2>The short version</h2>
              <p>
                I collect the information you choose to give me — your name, email
                and message when you get in touch, and the details you enter when
                you book a session or buy coaching. I use it to reply to you and to
                deliver the coaching you paid for. I don&apos;t sell it, I don&apos;t
                rent it, and I don&apos;t send marketing you didn&apos;t ask for.
              </p>

              <h2>What I collect</h2>
              <h3>When you use the contact form</h3>
              <p>
                Your first name, last name, email address, and whatever you write in
                the message. That&apos;s it — there are no hidden fields.
              </p>
              <h3>When you book a session</h3>
              <p>
                Booking runs through Calendly. When you pick a time you give Calendly
                your name, email, time zone, and any answers to the questions on the
                booking form. I see that booking; Calendly also holds it under{" "}
                <a
                  href="https://calendly.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  its own privacy policy
                </a>
                .
              </p>
              <h3>When you pay</h3>
              <p>
                Payments are processed by Stripe. <strong>Card details never touch
                this website</strong> — you enter them on Stripe&apos;s own checkout
                page. I can see that a payment succeeded, which plan it was for, and
                the name and email attached to it. I cannot see your card number.
                Stripe&apos;s handling is covered by{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  its privacy policy
                </a>
                .
              </p>
              <h3>When you just browse</h3>
              <p>
                The site uses Vercel Analytics, which counts page views without
                cookies and without building a profile of you. I can see that a page
                was visited and roughly where from — not who you are.
              </p>
              <h3>Google Ads</h3>
              <p>
                I advertise on Google. To see whether that advertising is worth
                paying for, the site loads Google&apos;s tag, which sets cookies and
                lets Google tell that someone who clicked an ad later sent the
                contact form or completed a purchase. Google receives that signal;
                what I see is a count, not a list of people.
              </p>
              <p>
                If you would rather not be measured this way, you can{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  turn off ad personalisation in your Google account
                </a>
                , or use a browser or extension that blocks it — the site works
                exactly the same either way, and blocking it costs you nothing.
              </p>

              <h2>Third parties, and one you should know about</h2>
              <p>
                The services behind this site are Vercel (hosting and analytics),
                Sanity (the content system — it stores the site&apos;s words and
                images, no visitor data), Stripe (payments), Calendly (scheduling),
                Resend (which delivers the contact form to my inbox), and Google
                (advertising measurement).
              </p>
              <p>
                One thing worth being upfront about: <strong>the embedded Calendly
                scheduler loads its own third-party scripts</strong>, which have
                included reCAPTCHA and advertising and analytics tools such as the
                Meta (Facebook) pixel. Those are Calendly&apos;s, not mine, and they
                may set cookies in your browser when the scheduler loads. If
                you&apos;d rather avoid them, email me instead and we&apos;ll arrange
                a time by hand.
              </p>

              <h2>What I use it for</h2>
              <ul>
                <li>Replying to you and answering your questions.</li>
                <li>Scheduling, running, and following up on sessions.</li>
                <li>Delivering and supporting the coaching you paid for.</li>
                <li>Taking payment and handling refunds or cancellations.</li>
                <li>Understanding, in aggregate, which pages people find useful.</li>
              </ul>

              <h2>What I don&apos;t do</h2>
              <ul>
                <li>I don&apos;t sell or rent your information to anyone.</li>
                <li>I don&apos;t add you to a mailing list because you filled in the contact form.</li>
                <li>I don&apos;t share your health or training details with anyone without your say-so.</li>
                <li>I don&apos;t run advertising trackers of my own on this site.</li>
              </ul>

              <h2>How long I keep it</h2>
              <p>
                Enquiries stay in my email for as long as they&apos;re useful for
                answering you and picking up the conversation later. Client records —
                programmes, check-ins, notes — are kept while you&apos;re coaching
                with me and for a reasonable period afterwards, so that if you come
                back we&apos;re not starting from nothing. Payment records are held by
                Stripe for as long as the law requires them to be.
              </p>

              <h2>Your choices</h2>
              <p>
                Email me at{" "}
                <a href={`mailto:${email}`}>{email}</a> and you can ask me to send you
                a copy of what I hold about you, correct anything that&apos;s wrong,
                or delete it. I&apos;ll do it — I may have to keep payment records
                where the law requires, and I&apos;ll tell you if that applies.
              </p>
              <p>
                You can cancel a subscription yourself at any time through the Stripe
                customer portal — the &ldquo;Manage subscription&rdquo; link in the
                footer.
              </p>

              <h2>Children</h2>
              <p>
                This site isn&apos;t intended for anyone under 18, and I don&apos;t
                knowingly collect information from children. Coaching for a minor is
                arranged with a parent or guardian directly.
              </p>

              <h2>Changes</h2>
              <p>
                If this policy changes, the date at the top changes with it. Material
                changes will be flagged to active clients by email rather than
                quietly swapped in.
              </p>

              <h2>Getting in touch</h2>
              <p>
                Questions about any of this go to{" "}
                <a href={`mailto:${email}`}>{email}</a>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
