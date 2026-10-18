"use client";

import { useEffect } from "react";
import { reportConversion } from "@/lib/analytics";
import { reportRedditEvent, type RedditEvent } from "@/lib/reddit";

/**
 * Fires an ad conversion once, when the page it sits on is reached — to Google
 * Ads (if `sendTo` is set) and to Reddit (if `reddit` is set and the pixel is
 * configured).
 *
 * Used on /welcome, which a visitor only lands on after Stripe has taken
 * payment — so arriving there *is* the conversion. That makes it one of the
 * few cases where firing on page load is correct rather than lazy.
 *
 * `dedupeKey` matters here more than anywhere else on the site: /welcome asks
 * the visitor to book a session via an embedded Calendly, so a refresh or a
 * back-navigation is entirely likely. Without the guard, one payment could
 * report as several conversions, and the ad platform would then bid up
 * whichever ad "produced" them.
 *
 * Renders nothing.
 */
export function ConversionOnMount({
  sendTo,
  reddit,
  dedupeKey,
}: {
  sendTo: string | null;
  reddit?: { event: RedditEvent; value?: number; conversionId?: string };
  dedupeKey?: string;
}) {
  const redditEvent = reddit?.event;
  const redditValue = reddit?.value;
  const redditConversionId = reddit?.conversionId;

  useEffect(() => {
    reportConversion(sendTo, dedupeKey);
    if (redditEvent) {
      reportRedditEvent(redditEvent, {
        dedupeKey,
        value: redditValue,
        conversionId: redditConversionId,
      });
    }
  }, [sendTo, dedupeKey, redditEvent, redditValue, redditConversionId]);

  return null;
}
