"use client";

import { useEffect } from "react";
import { calendlyScheduledId } from "@/lib/booking";
import { reportRedditEvent } from "@/lib/reddit";

/**
 * Inline Calendly embed. The URL comes from CMS siteSettings.bookingUrl, so Shane
 * can change his scheduling link without a redeploy. Loads Calendly's widget
 * script once on mount; the stylesheet is hoisted to <head> by React.
 *
 * `reportLead` reports a Reddit Lead when someone books through this embed.
 * Booking happens inside Calendly's iframe — nothing navigates, so no page load
 * can observe it. The only signal is the `calendly.event_scheduled` message
 * Calendly posts to this window (inline widget only; a bare iframe sends none).
 * Off by default: on /welcome the visitor has already paid, so a booking there
 * is not a lead.
 */
export function CalendlyInline({
  url,
  className = "",
  height = 700,
  reportLead = false,
}: {
  url: string;
  className?: string;
  height?: number;
  reportLead?: boolean;
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

  useEffect(() => {
    if (!reportLead) return;
    const onMessage = (e: MessageEvent) => {
      const scheduled = calendlyScheduledId(e.origin, e.data);
      if (scheduled === null) return;
      // Keyed on the invitee URI, so one booking is one Lead even if Calendly
      // re-posts. Doubles as the conversionId for future CAPI dedup.
      reportRedditEvent("Lead", {
        dedupeKey: scheduled ? `lead:${scheduled}` : undefined,
        conversionId: scheduled || undefined,
      });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [reportLead]);

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
