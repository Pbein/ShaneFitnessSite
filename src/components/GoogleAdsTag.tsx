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
 * the tag is in the initial HTML and there is no client-side round trip to
 * decide whether tracking exists.
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
