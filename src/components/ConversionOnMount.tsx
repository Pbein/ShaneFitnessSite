"use client";

import { useEffect } from "react";
import { reportConversion } from "@/lib/analytics";

/**
 * Fires a Google Ads conversion once, when the page it sits on is reached.
 *
 * Used on /welcome, which a visitor only lands on after Stripe has taken
 * payment — so arriving there *is* the conversion. That makes it one of the
 * few cases where firing on page load is correct rather than lazy.
 *
 * `dedupeKey` matters here more than anywhere else on the site: /welcome asks
 * the visitor to book a session via an embedded Calendly, so a refresh or a
 * back-navigation is entirely likely. Without the guard, one payment could
 * report as several conversions, and Google would then bid up whichever ad
 * "produced" them.
 *
 * Renders nothing.
 */
export function ConversionOnMount({
  sendTo,
  dedupeKey,
}: {
  sendTo: string | null;
  dedupeKey?: string;
}) {
  useEffect(() => {
    reportConversion(sendTo, dedupeKey);
  }, [sendTo, dedupeKey]);

  return null;
}
