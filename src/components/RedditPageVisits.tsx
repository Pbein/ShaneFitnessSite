"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { reportRedditEvent } from "@/lib/reddit";

/**
 * Reports a PageVisit on each client-side navigation. The init script only
 * covers the first, full page load; after that Next swaps pages without
 * reloading, and Reddit would otherwise see every visit as one page.
 *
 * The first render is skipped because the init script already counted it.
 * Rendered only by `RedditPixelTag`, so it does nothing when tracking is off.
 */
export function RedditPageVisits() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    reportRedditEvent("PageVisit");
  }, [pathname]);

  return null;
}
