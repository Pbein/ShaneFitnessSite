"use client";

import { useState, type FormEvent } from "react";
import { ArrowIcon } from "./Icons";

/**
 * Demo contact form. For the visual demo it composes a mailto: link (no backend,
 * no database). When the CMS/real backend is wired in, swap the submit handler
 * for a form action — the markup stays the same.
 */
export function ContactForm({ email }: { email: string }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const first = String(data.get("firstName") || "");
    const last = String(data.get("lastName") || "");
    const email = String(data.get("email") || "");
    const message = String(data.get("message") || "");

    const subject = encodeURIComponent(`New inquiry from ${first} ${last}`.trim());
    const body = encodeURIComponent(
      `Name: ${first} ${last}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  const fieldClass =
    "w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-cream-100 placeholder:text-cream-500 transition-colors focus:border-brand focus:outline-none focus:ring-0";
  const labelClass =
    "mb-1 block font-display text-xs uppercase tracking-wider2 text-cream-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="firstName">
            First name <span className="text-brand">*</span>
          </label>
          <input id="firstName" name="firstName" required className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="lastName">
            Last name <span className="text-brand">*</span>
          </label>
          <input id="lastName" name="lastName" required className={fieldClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          Email <span className="text-brand">*</span>
        </label>
        <input id="email" name="email" type="email" required className={fieldClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="message">
          Message <span className="text-brand">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className={`${fieldClass} resize-none`}
          placeholder="Tell me a bit about your goals…"
        />
      </div>

      <button
        type="submit"
        className="group inline-flex items-center justify-center gap-2 rounded-md bg-brand px-7 py-3.5 font-display text-sm uppercase tracking-wider2 text-cream-100 shadow-[0_8px_30px_-12px_rgba(214,40,40,0.7)] transition-all duration-300 hover:bg-brand-light"
      >
        Send Message
        <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>

      {sent && (
        <p className="text-sm text-cream-300">
          Your email app should have opened with your message ready to send. If not,
          email{" "}
          <a href={`mailto:${email}`} className="text-brand underline">
            {email}
          </a>{" "}
          directly.
        </p>
      )}
    </form>
  );
}
