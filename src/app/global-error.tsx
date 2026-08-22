"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Last line of defence. Replaces the root layout entirely, so it must render its
 * own <html> and <body> — and it is the only thing that catches a throw in the
 * `(site)` layout, which is exactly what a missing siteSettings document causes.
 * Before this existed, a Sanity outage took every page to a bare 500.
 *
 * No CMS reads, no fonts, no shared chrome: the point is that it renders when
 * nothing else does.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center">
          <p className="flex items-center gap-3 font-display text-sm uppercase tracking-wider2 text-brand">
            <span className="accent-rule" />
            Train Shane
          </p>
          <h1 className="mt-5 text-3xl uppercase leading-[1.05] tracking-tightish text-cream-100 md:text-4xl">
            The site is having a moment
          </h1>
          <p className="mt-5 max-w-md text-cream-300">
            We&apos;re having trouble loading the site right now. Please try again in
            a minute — or reach out directly and I&apos;ll help you straight away.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md bg-brand px-7 py-3.5 font-display text-sm uppercase tracking-wider2 text-cream-100 transition-colors hover:bg-brand-light"
            >
              Try again
            </button>
            <a
              href="mailto:Shane12.sb@gmail.com"
              className="inline-flex items-center justify-center rounded-md border border-white/20 px-7 py-3.5 font-display text-sm uppercase tracking-wider2 text-cream-100 transition-colors hover:border-brand"
            >
              Email Shane
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
