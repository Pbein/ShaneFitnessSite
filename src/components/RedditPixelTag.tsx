import Script from "next/script";
import { isValidRedditPixelId, redditPixelInitScript } from "@/lib/reddit";
import { RedditPageVisits } from "./RedditPageVisits";

/**
 * The Reddit Pixel, loaded only when a valid Pixel ID is set in Site Settings.
 * With the field empty this renders nothing — no script, no request to Reddit,
 * no cookie. Same shape and reasoning as `GoogleAdsTag`; see the notes there
 * on `afterInteractive` and on why this is a server component.
 */
export function RedditPixelTag({ pixelId }: { pixelId?: string }) {
  // Re-validated at the point of use: this value reaches an inline script.
  if (!isValidRedditPixelId(pixelId)) return null;

  return (
    <>
      <Script id="reddit-pixel" strategy="afterInteractive">
        {redditPixelInitScript(pixelId.trim())}
      </Script>
      <RedditPageVisits />
    </>
  );
}
