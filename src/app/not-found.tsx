import Link from "next/link";
import "./globals.css";

/**
 * Global 404. Lives at the app root (not inside the `(site)` group) because
 * that's the only not-found Next uses for unmatched URLs.
 *
 * Deliberately makes no CMS call and renders no header/footer: this page has to
 * work when something else already didn't. It carries its own styling via
 * globals.css and falls back to system fonts, since the `(site)` layout's font
 * variables aren't in scope here.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center">
      <p className="flex items-center gap-3 font-display text-sm uppercase tracking-wider2 text-brand">
        <span className="accent-rule" />
        404
      </p>
      <h1 className="mt-5 text-4xl uppercase leading-[1.05] tracking-tightish text-cream-100 md:text-5xl">
        This page took a rest day
      </h1>
      <p className="mt-5 max-w-md text-cream-300">
        The page you&apos;re looking for doesn&apos;t exist — or it moved. Let&apos;s get
        you back to something useful.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-brand px-7 py-3.5 font-display text-sm uppercase tracking-wider2 text-cream-100 transition-colors hover:bg-brand-light"
        >
          Back to home
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center justify-center rounded-md border border-white/20 px-7 py-3.5 font-display text-sm uppercase tracking-wider2 text-cream-100 transition-colors hover:border-brand"
        >
          See coaching options
        </Link>
      </div>
    </main>
  );
}
