"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Resend } from "resend";

import {
  validateInquiry,
  normalizeInquiry,
  renderInquiryEmail,
  type InquiryErrors,
  type InquiryFields,
} from "@/lib/contact";
import { rateLimit } from "@/lib/rate-limit";
import { getSiteSettings } from "@/lib/sanity/fetch";

export type ContactState = {
  status: "idle" | "success" | "error";
  /** Shown above the form when status is "error". */
  formError?: string;
  errors?: InquiryErrors;
  /** Echoed back so a failed submit doesn't wipe what the visitor typed. */
  values?: InquiryFields;
};

export const EMPTY_STATE: ContactState = { status: "idle" };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/**
 * A generic failure message. Deliberately identical for every server-side
 * failure mode — an unverified domain, a Resend outage, a missing API key —
 * because the visitor can act on none of them, and the mailto: fallback the
 * form shows alongside it is the same either way. The specifics go to the
 * server log, where they are actionable.
 */
const GENERIC_ERROR =
  "Something went wrong sending your message. Please email me directly instead — I'd hate to miss you.";

export async function submitInquiry(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values: InquiryFields = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    visitorEmail: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Honeypot. A field hidden from people but visible to naive form-filling
  // bots. Anything in it means a bot, so report success and drop the message
  // silently — telling a bot it was caught only teaches it to try again.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { status: "success" };
  }

  const errors = validateInquiry(values);
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values };
  }

  const fields = normalizeInquiry(values);

  const hdrs = await headers();
  // x-forwarded-for is a comma-separated chain; the client is the first entry.
  // On Vercel this header is set by the platform and cannot be spoofed past it.
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  const limit = rateLimit(`contact:${ip}`, {
    limit: MAX_PER_WINDOW,
    windowMs: WINDOW_MS,
  });
  if (!limit.ok) {
    return {
      status: "error",
      formError:
        "That's a few messages in a short time. Give it a few minutes and try again — or just email me directly.",
      values: fields,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const domain = process.env.RESEND_EMAIL_DOMAIN;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set — cannot send inquiry.");
    return { status: "error", formError: GENERIC_ERROR, values: fields };
  }

  // The recipient is read from the CMS on the server, never accepted from the
  // client. A recipient in the payload would be an open relay: anyone could
  // POST this endpoint and have Shane's domain send mail to an address of their
  // choosing. This also structurally prevents the F1 recipient/sender swap.
  const settings = await getSiteSettings();
  const recipient = settings?.email;
  if (!recipient) {
    console.error("[contact] No siteSettings.email in the CMS — nowhere to send.");
    return { status: "error", formError: GENERIC_ERROR, values: fields };
  }

  // `from` must be on a domain verified in Resend or the API returns 403.
  // onboarding@resend.dev is the sandbox fallback and only delivers to the
  // Resend account owner's own address — fine as a stopgap, not for launch.
  const from = domain
    ? `Train Shane <noreply@${domain}>`
    : "Train Shane <onboarding@resend.dev>";

  const { subject, text, html } = renderInquiryEmail(fields);

  // Same payload within 24h returns the original send instead of a duplicate,
  // which turns a double-click or a retry into one email rather than two.
  const idempotencyKey = `contact-inquiry/${createHash("sha256")
    .update(`${fields.visitorEmail}|${fields.firstName}|${fields.lastName}|${fields.message}`)
    .digest("hex")
    .slice(0, 32)}`;

  const resend = new Resend(apiKey);
  // The SDK resolves with { data, error } rather than throwing on API errors,
  // so `error` must be checked explicitly. try/catch is still needed for the
  // transport itself (DNS, timeouts), which does throw.
  try {
    const { data, error } = await resend.emails.send(
      {
        from,
        to: [recipient],
        // Shane hits Reply and reaches the visitor, not himself.
        replyTo: fields.visitorEmail,
        subject,
        text,
        html,
      },
      { idempotencyKey },
    );

    if (error) {
      console.error("[contact] Resend rejected the send:", error.name, error.message);
      return { status: "error", formError: GENERIC_ERROR, values: fields };
    }

    console.log("[contact] Inquiry sent:", data?.id);
    return { status: "success" };
  } catch (err) {
    console.error("[contact] Send threw:", err);
    return { status: "error", formError: GENERIC_ERROR, values: fields };
  }
}
