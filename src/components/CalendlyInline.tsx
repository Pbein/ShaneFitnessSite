"use client";

import { useEffect } from "react";

/**
 * Inline Calendly embed. The URL comes from CMS siteSettings.bookingUrl, so Shane
 * can change his scheduling link without a redeploy. Loads Calendly's widget
 * script once on mount; the stylesheet is hoisted to <head> by React.
 */
export function CalendlyInline({
  url,
  className = "",
  height = 700,
}: {
  url: string;
  className?: string;
  height?: number;
}) {
  useEffect(() => {
    const id = "calendly-widget-script";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
      <div
        className={`calendly-inline-widget ${className}`}
        data-url={url}
        style={{ minWidth: "320px", height: `${height}px` }}
      />
    </>
  );
}
