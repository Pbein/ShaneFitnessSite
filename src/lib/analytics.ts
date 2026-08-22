/**
 * Google Ads conversion tracking.
 *
 * Shane pastes a Conversion ID and one or two Conversion Labels into Site
 * Settings; the tag then loads on every page and fires a conversion when
 * something worth paying for actually happens. Nothing loads at all until the
 * ID is set, so the site carries no Google tracking until he chooses to add it.
 *
 * ## Why these values are validated rather than trusted
 *
 * The Conversion ID is interpolated into an **inline `<script>`** — that is how
 * gtag is initialised, and there is no way around it. A CMS field that reaches
 * an inline script is a script-injection vector: anyone who can edit Site
 * Settings could otherwise paste `'); doSomething(); //` and run arbitrary
 * JavaScript on every page of the site, for every visitor.
 *
 * So the format is enforced here, in one pure function, and the tag component
 * refuses to render anything it does not recognise. Sanity also validates the
 * field on the way in, but that is a convenience for Shane, not the defence —
 * Studio validation can be bypassed by writing to the API directly, and a value
 * that predates the rule would never be re-checked. This is the defence.
 */

/** e.g. `AW-123456789`. Google issues 9–11 digits; the range is deliberately loose. */
const CONVERSION_ID_RE = /^AW-\d{6,15}$/;

/** e.g. `abcDEfGhIjKlMnOpQrS`. Base64-ish, no punctuation that could break out. */
const CONVERSION_LABEL_RE = /^[A-Za-z0-9_-]{5,60}$/;

export function isValidConversionId(value: string | undefined | null): value is string {
  return typeof value === "string" && CONVERSION_ID_RE.test(value.trim());
}

export function isValidConversionLabel(value: string | undefined | null): value is string {
  return typeof value === "string" && CONVERSION_LABEL_RE.test(value.trim());
}

/**
 * Build the `send_to` value Google expects: `AW-123456789/AbC-D_efGh`.
 * Returns null unless *both* halves are present and well-formed — a malformed
 * conversion silently reports nothing, so it is better not to fire at all than
 * to fire something that looks like it worked.
 */
export function conversionSendTo(
  conversionId: string | undefined | null,
  label: string | undefined | null,
): string | null {
  if (!isValidConversionId(conversionId) || !isValidConversionLabel(label)) return null;
  return `${conversionId.trim()}/${label.trim()}`;
}

type GtagWindow = Window & {
  gtag?: (command: string, event: string, params: Record<string, unknown>) => void;
};

/**
 * Fire a conversion. Safe to call when tracking is unconfigured, when the
 * script has not loaded, or when an ad blocker removed it — all of which are
 * normal and none of which should break the page the visitor is looking at.
 *
 * `dedupeKey` guards against a conversion being counted twice when the visitor
 * refreshes or navigates back — most relevant on /welcome, which someone may
 * well reload while booking their session. sessionStorage is per-tab and
 * per-origin, which matches the lifetime we want; it can throw in private
 * browsing, hence the try/catch.
 */
export function reportConversion(sendTo: string | null, dedupeKey?: string): void {
  if (!sendTo || typeof window === "undefined") return;

  if (dedupeKey) {
    try {
      const key = `conv:${dedupeKey}`;
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable (private mode, blocked cookies). Fire anyway —
      // an occasional double-count is a smaller problem than never counting.
    }
  }

  const gtag = (window as GtagWindow).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", "conversion", { send_to: sendTo });
}
