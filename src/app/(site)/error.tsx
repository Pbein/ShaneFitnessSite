"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Error boundary for the marketing pages. Catches a failure inside any `(site)`
 * page — most likely a Sanity read failing, since every page throws when its
 * content documents are missing.
 *
 * Hardcodes the contact address rather than reading it from the CMS: the whole
 * reason this component is on screen may be that the CMS is unreachable, so a
 * fetch here would fail alongside it. Note this boundary sits *inside* the
 * `(site)` layout, so it does not catch a failure in the layout itself — that
 * one falls through to global-error.tsx.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Site render error:", error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="flex items-center gap-3 font-display text-sm uppercase tracking-wider2 text-brand">
        <span className="accent-rule" />
        Something went wrong
      </p>
      <h1 className="mt-5 text-3xl uppercase leading-[1.05] tracking-tightish text-cream-100 md:text-4xl">
        This page didn&apos;t load
      </h1>
      <p className="mt-5 max-w-md text-cream-300">
        A temporary problem on our end — not you. Try again, and if it keeps
        happening, email me directly and I&apos;ll sort it out.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-brand px-7 py-3.5 font-display text-sm uppercase tracking-wider2 text-cream-100 transition-colors hover:bg-brand-light"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-white/20 px-7 py-3.5 font-display text-sm uppercase tracking-wider2 text-cream-100 transition-colors hover:border-brand"
        >
          Back to home
        </Link>
      </div>
      <a
        href="mailto:Shane12.sb@gmail.com"
        className="mt-8 text-sm text-cream-500 underline transition-colors hover:text-brand"
      >
        Shane12.sb@gmail.com
      </a>
    </section>
  );
}
