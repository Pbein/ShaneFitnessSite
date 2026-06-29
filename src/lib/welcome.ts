import type { SiteSettings } from "@/content/site";

/** Per-plan copy. `subscription` controls whether the "manage subscription"
 *  note is shown. Unknown/missing plans fall back to `DEFAULT_COPY`. */
export const PLAN_COPY: Record<
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

export const DEFAULT_COPY = {
  heading: "Payment received — let's get started",
  intro:
    "Thanks for your payment — a receipt is on its way to your email. Pick a time for your first session below and you'll get a calendar invite to confirm.",
  subscription: true,
};

export type ResolvedWelcome = {
  heading: string;
  intro: string;
  subscription: boolean;
  bookingUrl: string;
};

/**
 * Pure resolution for the post-payment welcome page: maps the `?plan=` query
 * param + CMS site settings to the copy and the per-plan Calendly booking URL.
 *
 * Each plan books its own Calendly event type: Essential → monthly first session,
 * Premium → weekly first session, In-Person → in-person (invitee picks location).
 * Each falls back to the main booking link so the page never breaks if one isn't set.
 */
export function resolveWelcome(
  plan: string | undefined,
  settings: SiteSettings,
): ResolvedWelcome {
  const copy = (plan && PLAN_COPY[plan]) || DEFAULT_COPY;

  const planBookingUrl: Record<string, string | undefined> = {
    essential: settings.essentialBookingUrl,
    premium: settings.premiumBookingUrl,
    "in-person": settings.inPersonBookingUrl,
  };
  const bookingUrl = (plan && planBookingUrl[plan]) || settings.bookingUrl;

  return {
    heading: copy.heading,
    intro: copy.intro,
    subscription: copy.subscription,
    bookingUrl,
  };
}
