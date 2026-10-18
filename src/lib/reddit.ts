/**
 * Reddit Ads conversion tracking (the Reddit Pixel).
 *
 * Shane pastes his Pixel ID into Site Settings; the pixel then loads on every
 * page and reports the same two moments Google Ads gets — a contact form that
 * actually sent, and a landing on /welcome after Stripe took payment. Nothing
 * loads at all until the ID is set.
 *
 * Browser pixel only. Reddit also offers a server-side Conversions API (CAPI),
 * which recovers events that ad blockers drop, but it needs a secret token, an
 * endpoint, hashed email matching and pixel/CAPI deduplication. Not worth it
 * at this ad spend; revisit if Reddit becomes a real line item.
 *
 * Like the Google Conversion ID, the Pixel ID is interpolated into an inline
 * `<script>`, so the format check below is the security boundary — see the
 * long note at the top of `analytics.ts`.
 */

/** e.g. `a2_juobbt1jcd11`. Older accounts issue `t2_` IDs. */
const PIXEL_ID_RE = /^(a2|t2)_[A-Za-z0-9]{5,20}$/;

export function isValidRedditPixelId(value: string | undefined | null): value is string {
  return typeof value === "string" && PIXEL_ID_RE.test(value.trim());
}

/** Reddit's standard event names — only the ones this site fires. */
export type RedditEvent = "PageVisit" | "Lead" | "Purchase";

type RedditWindow = Window & {
  rdt?: (...args: unknown[]) => void;
  /** Events reported before the pixel's init script ran; it flushes these. */
  __rdtPending?: unknown[][];
};

export type RedditEventOptions = {
  /** Guards against a refresh double-counting; see reportConversion. */
  dedupeKey?: string;
  /**
   * Unique per conversion. Unused by the pixel alone, but it is the field
   * Reddit matches on to dedupe pixel and CAPI copies of the same event, so
   * setting it now means CAPI can be added later without re-instrumenting.
   */
  conversionId?: string;
  /** Dollars, as a decimal (init sets `useDecimalCurrencyValues`). */
  value?: number;
  currency?: string;
};

/**
 * Report an event. Safe to call when the pixel is unconfigured, still loading,
 * or blocked — the visitor's page must never break over tracking.
 *
 * Why the pending queue: the pixel is initialised by an `afterInteractive`
 * script, and React runs a page's effects before that script is guaranteed to
 * have executed. /welcome reports its Purchase from an effect on first render,
 * so without the queue that one event — the most valuable one — would usually
 * be lost. The init script drains `__rdtPending` straight after `init`.
 *
 * The cost: when no Pixel ID is set, a reported event sits in an array that
 * nothing ever reads. That is a few bytes for the life of the tab.
 *
 * `dedupeKey` works as in `reportConversion`, with its own storage prefix so
 * the Google and Reddit guards don't swallow each other's events.
 */
export function reportRedditEvent(
  event: RedditEvent,
  { dedupeKey, conversionId, value, currency }: RedditEventOptions = {},
): void {
  if (typeof window === "undefined") return;

  if (dedupeKey) {
    try {
      const key = `rdt:${dedupeKey}`;
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable — fire anyway, as in reportConversion.
    }
  }

  const meta: Record<string, unknown> = {};
  if (conversionId) meta.conversionId = conversionId;
  if (typeof value === "number") {
    meta.value = value;
    meta.currency = currency ?? "USD";
  }
  const args = Object.keys(meta).length ? ["track", event, meta] : ["track", event];

  const w = window as RedditWindow;
  if (typeof w.rdt === "function") {
    w.rdt(...args);
  } else {
    (w.__rdtPending ??= []).push(args);
  }
}

/** A fresh id for conversions with no natural one (e.g. a contact form send). */
export function newConversionId(): string | undefined {
  try {
    return crypto.randomUUID();
  } catch {
    return undefined; // Very old browser, or non-secure context. Optional field.
  }
}

/**
 * The inline init script. Reddit's published base snippet (stub + async load
 * of pixel.js), then `init`, the first PageVisit, and a drain of anything
 * queued by `reportRedditEvent` before this ran.
 *
 * No advanced matching (email/phone) is passed to `init`: the site has no
 * logged-in users, and sending visitor contact details to Reddit is not
 * something to do without a reason. `useDecimalCurrencyValues` makes `value`
 * mean dollars (199) rather than cents. pixel.js already defaults it to true
 * when omitted (checked in the shipped bundle, 2026-10-17); it is explicit here
 * so a change of default cannot silently turn $199 into $1.99.
 *
 * Note: Reddit's *auto*-advanced matching (scraping emails/phones off the page)
 * is not controlled here. It is a toggle in Reddit Events Manager, delivered to
 * pixel.js in the pixel's remote config, and it ignores what `init` says.
 */
export function redditPixelInitScript(pixelId: string): string {
  return (
    `!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=${pixelId}";t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);` +
    `rdt('init','${pixelId}',{optOut:false,useDecimalCurrencyValues:true});rdt('track','PageVisit');` +
    `(window.__rdtPending||[]).forEach(function(a){rdt.apply(null,a)});window.__rdtPending=[];`
  );
}
