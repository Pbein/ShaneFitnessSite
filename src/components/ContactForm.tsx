"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { track } from "@vercel/analytics";
import { submitInquiry } from "@/app/(site)/contact/actions";
import { LIMITS, EMPTY_STATE } from "@/lib/contact";
import { ArrowIcon, CheckIcon } from "./Icons";

/**
 * The contact form. Posts to a Server Action that actually sends an email
 * (Resend) and returns a real result.
 *
 * It used to set `window.location.href` to a mailto: link and then show
 * "your email app should have opened" unconditionally — it could not know. On
 * webmail with no OS mail handler, that was silence plus a false confirmation,
 * and Shane never learned the person existed. Every state below now reflects
 * something that actually happened on the server.
 *
 * `action={formAction}` rather than an onSubmit handler is what makes this work
 * with JavaScript disabled or still loading: the browser posts the form and
 * React reconciles the returned state. The `email` prop is display-only, for
 * the "email me directly" fallback — the send target is read from the CMS
 * server-side and is never accepted from the client.
 */
export function ContactForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(submitInquiry, EMPTY_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      track("contact_submit");
      formRef.current?.reset();
    }
    // Move focus to the error summary so a screen reader announces the failure
    // rather than leaving the user to discover it.
    if (state.status === "error" && state.formError) errorRef.current?.focus();
  }, [state]);

  const fieldClass =
    "w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-cream-100 placeholder:text-cream-500 transition-colors focus:border-brand focus:outline-none focus:ring-0";
  const labelClass =
    "mb-1 block font-display text-xs uppercase tracking-wider2 text-cream-500";
  const errorClass = "mt-2 text-sm text-brand-light";

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 py-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/15">
          <CheckIcon className="h-6 w-6 text-brand" />
        </span>
        <div>
          <h3 className="text-xl text-cream-100">Message sent</h3>
          <p className="mt-2 text-sm leading-relaxed text-cream-300">
            Thanks for reaching out — it landed in Shane&apos;s inbox and
            you&apos;ll hear back within one business day.
          </p>
        </div>
      </div>
    );
  }

  const err = state.errors ?? {};
  const v = state.values;

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-6">
      {state.formError && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md border border-brand/40 bg-brand/10 px-4 py-3 text-sm leading-relaxed text-cream-100 focus:outline-none"
        >
          {state.formError}{" "}
          <a href={`mailto:${email}`} className="text-brand-light underline">
            {email}
          </a>
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="firstName">
            First name <span className="text-brand">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            maxLength={LIMITS.name}
            autoComplete="given-name"
            defaultValue={v?.firstName}
            aria-invalid={!!err.firstName}
            aria-describedby={err.firstName ? "firstName-error" : undefined}
            className={fieldClass}
          />
          {err.firstName && (
            <p id="firstName-error" className={errorClass}>
              {err.firstName}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="lastName">
            Last name <span className="text-brand">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            maxLength={LIMITS.name}
            autoComplete="family-name"
            defaultValue={v?.lastName}
            aria-invalid={!!err.lastName}
            aria-describedby={err.lastName ? "lastName-error" : undefined}
            className={fieldClass}
          />
          {err.lastName && (
            <p id="lastName-error" className={errorClass}>
              {err.lastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          Email <span className="text-brand">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={LIMITS.email}
          autoComplete="email"
          defaultValue={v?.visitorEmail}
          aria-invalid={!!err.visitorEmail}
          aria-describedby={err.visitorEmail ? "email-error" : undefined}
          className={fieldClass}
        />
        {err.visitorEmail && (
          <p id="email-error" className={errorClass}>
            {err.visitorEmail}
          </p>
        )}
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
          maxLength={LIMITS.messageMax}
          defaultValue={v?.message}
          aria-invalid={!!err.message}
          aria-describedby={err.message ? "message-error" : undefined}
          className={`${fieldClass} resize-none`}
          placeholder="Tell me a bit about your goals…"
        />
        {err.message && (
          <p id="message-error" className={errorClass}>
            {err.message}
          </p>
        )}
      </div>

      {/* Honeypot. Hidden from people (including screen readers, via
          aria-hidden + tabIndex) but present in the DOM for bots that fill
          every input they find. Anything here and the submission is dropped.
          Not `display:none` on the input alone — some bots skip those. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <SubmitButton />
    </form>
  );
}

/**
 * Split out because useFormStatus only reports the pending state of the form
 * it is rendered *inside* — calling it in ContactForm itself would always
 * return false.
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex items-center justify-center gap-2 rounded-md bg-brand px-7 py-3.5 font-display text-sm uppercase tracking-wider2 text-cream-100 shadow-[0_8px_30px_-12px_rgba(214,40,40,0.7)] transition-all duration-300 hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send Message"}
      {!pending && (
        <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </button>
  );
}
