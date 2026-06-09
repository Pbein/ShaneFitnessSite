import { siteSettings, type Cta } from "@/content/site";

/**
 * Resolves a CMS-style CTA into an href. Booking/payment targets come from
 * site settings (or an explicit override on the CTA), so the owner can change
 * the destination without a code change.
 */
export function resolveCtaHref(cta: Cta): string {
  switch (cta.type) {
    case "booking":
      return cta.target || siteSettings.bookingUrl;
    case "payment":
      return cta.target || siteSettings.primaryPaymentLink || siteSettings.paymentLinks[0]?.url || "#";
    case "link":
    default:
      return cta.target || "#";
  }
}

/** External links (booking/payment) should open in a new tab. */
export function isExternal(cta: Cta): boolean {
  return cta.type === "booking" || cta.type === "payment";
}
