/**
 * Pure logic for the contact form: validation, email rendering, and the
 * (still-used) mailto: fallback link.
 *
 * The single invariant this file exists to protect: the *recipient* is always
 * the configured business address. The visitor's address is payload — it goes in
 * the body and in Reply-To, never in the target. Getting these two backwards
 * silently mails every inquiry back to the sender, which is exactly what
 * happened once already (F1). The server action never accepts a recipient from
 * the client at all; it reads Shane's address from the CMS itself.
 *
 * Everything here is pure so it can be unit-tested without a network or a
 * running server. The actual send lives in app/(site)/contact/actions.ts.
 */
export type InquiryFields = {
  firstName: string;
  lastName: string;
  /** The visitor's own email — content and Reply-To, never the destination. */
  visitorEmail: string;
  message: string;
};

export type InquiryErrors = Partial<Record<keyof InquiryFields, string>>;

/**
 * The Server Action's return shape, and its initial value.
 *
 * These live here rather than next to the action itself for a hard reason: a
 * `"use server"` module may only export async functions. Exporting this object
 * from actions.ts builds and typechecks cleanly, then throws at runtime the
 * first time the module is loaded — "A 'use server' file can only export async
 * functions, found object" — which is a 500 on submit, in production, from a
 * green build. Types are erased so they would be harmless, but they travel with
 * the constant to keep the whole contract in one place.
 *
 * tests/lib/server-actions.test.ts guards this.
 */
export type ContactState = {
  status: "idle" | "success" | "error";
  /** Shown above the form when status is "error". */
  formError?: string;
  errors?: InquiryErrors;
  /** Echoed back so a failed submit doesn't wipe what the visitor typed. */
  values?: InquiryFields;
};

export const EMPTY_STATE: ContactState = { status: "idle" };

/* ------------------------------------------------------------------ */
/* Limits                                                              */
/* ------------------------------------------------------------------ */

export const LIMITS = {
  name: 80,
  /** RFC 5321 caps an address at 254 characters. */
  email: 254,
  messageMin: 10,
  messageMax: 5000,
} as const;

/**
 * Deliberately permissive. Server-side email validation exists to catch typos
 * and obvious junk, not to adjudicate RFC 5322 — a regex strict enough to do
 * that rejects real addresses, and the only true test of an address is sending
 * to it. Requires a local part, an @, a dotted domain, and no whitespace.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

/** Returns a field->message map. Empty object means the payload is valid. */
export function validateInquiry(fields: InquiryFields): InquiryErrors {
  const errors: InquiryErrors = {};
  const firstName = fields.firstName.trim();
  const lastName = fields.lastName.trim();
  const visitorEmail = fields.visitorEmail.trim();
  const message = fields.message.trim();

  if (!firstName) errors.firstName = "Please enter your first name.";
  else if (firstName.length > LIMITS.name)
    errors.firstName = `Please keep this under ${LIMITS.name} characters.`;

  if (!lastName) errors.lastName = "Please enter your last name.";
  else if (lastName.length > LIMITS.name)
    errors.lastName = `Please keep this under ${LIMITS.name} characters.`;

  if (!visitorEmail) errors.visitorEmail = "Please enter your email address.";
  else if (visitorEmail.length > LIMITS.email || !EMAIL_RE.test(visitorEmail))
    errors.visitorEmail = "That doesn't look like a valid email address.";

  if (!message) errors.message = "Please tell me a bit about your goals.";
  else if (message.length < LIMITS.messageMin)
    errors.message = "Could you add a little more detail?";
  else if (message.length > LIMITS.messageMax)
    errors.message = `Please keep this under ${LIMITS.messageMax} characters.`;

  return errors;
}

/** Trimmed copy of the fields. Call after validating. */
export function normalizeInquiry(fields: InquiryFields): InquiryFields {
  return {
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
    visitorEmail: fields.visitorEmail.trim(),
    message: fields.message.trim(),
  };
}

/* ------------------------------------------------------------------ */
/* Email rendering                                                     */
/* ------------------------------------------------------------------ */

/**
 * Escape for interpolation into an HTML email body.
 *
 * Every value passed here is attacker-controlled: anyone on the internet can
 * type anything into this form. Without escaping, a message containing markup
 * would render as markup in Shane's mail client.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type RenderedInquiry = { subject: string; text: string; html: string };

/**
 * The notification Shane receives. Subject leads with the name so the inbox
 * list is scannable; the body leads with the address so replying is one glance.
 * A `text` part ships alongside the HTML because a plain-text alternative
 * measurably helps deliverability and is what some mobile clients preview.
 */
export function renderInquiryEmail(fields: InquiryFields): RenderedInquiry {
  const f = normalizeInquiry(fields);
  const name = `${f.firstName} ${f.lastName}`.trim();

  const subject = `New inquiry from ${name}`;

  const text = [
    `New inquiry from the Train Shane website.`,
    ``,
    `Name:  ${name}`,
    `Email: ${f.visitorEmail}`,
    ``,
    `Message:`,
    f.message,
    ``,
    `--`,
    `Reply directly to this email to reach ${f.firstName}.`,
  ].join("\n");

  // Inline styles only: Gmail strips <style> blocks, and this is a plain
  // notification rather than a designed marketing email.
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">
  <p style="margin:0 0 16px">New inquiry from the Train Shane website.</p>
  <table cellpadding="0" cellspacing="0" style="margin:0 0 16px">
    <tr><td style="padding:2px 12px 2px 0;color:#666">Name</td><td style="padding:2px 0"><strong>${escapeHtml(name)}</strong></td></tr>
    <tr><td style="padding:2px 12px 2px 0;color:#666">Email</td><td style="padding:2px 0"><a href="mailto:${escapeHtml(f.visitorEmail)}">${escapeHtml(f.visitorEmail)}</a></td></tr>
  </table>
  <div style="border-left:3px solid #D62828;padding:4px 0 4px 14px;margin:0 0 20px;white-space:pre-wrap">${escapeHtml(f.message)}</div>
  <p style="margin:0;color:#666;font-size:13px">Reply directly to this email to reach ${escapeHtml(f.firstName)}.</p>
</div>`;

  return { subject, text, html };
}

/* ------------------------------------------------------------------ */
/* mailto: fallback                                                    */
/* ------------------------------------------------------------------ */

/**
 * Still used — but only as the "email him directly" escape hatch shown when a
 * send fails, never as the submit path. It was the submit path until 2026-08-22,
 * which meant anyone without an OS mail handler got silence plus a false
 * success message.
 */
export function buildInquiryMailto(
  /** Shane's address, from CMS siteSettings.email. */
  recipient: string,
  fields: InquiryFields,
): string {
  const name = `${fields.firstName} ${fields.lastName}`.trim();
  const subject = encodeURIComponent(`New inquiry from ${name}`.trim());
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${fields.visitorEmail}\n\n${fields.message}`,
  );
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}
