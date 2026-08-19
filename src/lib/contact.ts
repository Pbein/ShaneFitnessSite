/**
 * Pure construction of the contact-form mailto: link.
 *
 * The single invariant this exists to protect: the *recipient* is always the
 * configured business address. The visitor's address is payload — it goes in the
 * body (and Reply-To semantics are the mail client's job), never in the target.
 * Getting these two backwards silently mails every inquiry back to the sender,
 * so the logic lives here as a pure function with a regression test rather than
 * inline in the component's submit handler.
 */
export type InquiryFields = {
  firstName: string;
  lastName: string;
  /** The visitor's own email — content, not destination. */
  visitorEmail: string;
  message: string;
};

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
