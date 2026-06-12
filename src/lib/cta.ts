import type { Cta } from "@/content/site";

/** The settings a CTA needs to resolve its destination (booking/payment URLs). */
export type CtaSettings = {
  bookingUrl: string;
  primaryPaymentLink?: string;
  paymentLinks: { label: string; url: string }[];
};

/**
 * Resolves a CMS-style CTA into an href. Booking/payment targets come from site
 * settings (or an explicit override on the CTA), so the owner can change the
 * destination in the CMS without a code change or redeploy.
 */
export function resolveCtaHref(cta: Cta, settings: CtaSettings): string {
  switch (cta.type) {
    case "booking":
      return cta.target || settings.bookingUrl;
    case "payment":
      return (
        cta.target || settings.primaryPaymentLink || settings.paymentLinks[0]?.url || "#"
      );
    case "link":
    default:
      return cta.target || "#";
  }
}

/** External links (booking/payment) should open in a new tab. */
export function isExternal(cta: Cta): boolean {
  return cta.type === "booking" || cta.type === "payment";
}
