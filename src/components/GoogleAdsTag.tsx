import Script from "next/script";
import { isValidConversionId } from "@/lib/analytics";

/**
 * The Google tag (gtag.js), loaded only when a valid Conversion ID is set in
 * Site Settings. With the field empty this renders nothing at all — no script,
 * no request to Google, no cookie — which is the correct default for a site
 * that otherwise ships no advertising trackers of its own.
 *
 * `afterInteractive` rather than `beforeInteractive`: conversion tracking must
 * not sit on the critical path of a page whose job is to load fast on a phone.
 * The tag only needs to exist by the time someone submits a form or lands on
 * /welcome, both of which are many seconds after first paint.
 *
 * Server component on purpose — the ID comes from the CMS via the layout, so
 * whether tracking exists at all is decided on the server, with no client-side
 * round trip and nothing shipped when it is switched off.
 *
 * Note what that does *not* mean: with `afterInteractive`, the served HTML
 * carries a preload hint plus the script's description in the RSC payload, and
 * React injects the real element after hydration. There is no literal
 * `<script src="...googletagmanager...">` in the raw HTML. That is fine —
 * Google's site scanner executes JavaScript and reports the tag as "Installed
 * on site" (confirmed in the Ads UI on 2026-08-22). Rendering plain `<script>`
 * tags from this server component was tried as an alternative and produced the
 * same RSC-payload output, so it bought nothing.
 */
export function GoogleAdsTag({ conversionId }: { conversionId?: string }) {
  // Re-validated here rather than trusted from the caller: this value is
  // interpolated into an inline script, so the check belongs at the point of
  // use, where it cannot be skipped by a future caller that forgot.
  if (!isValidConversionId(conversionId)) return null;
  const id = conversionId.trim();

  return (
    <>
      <Script
        id="gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
