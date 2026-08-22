"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CtaButton } from "./CtaButton";

type HeaderSettings = { logo: string; businessName: string };

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

/** The three bars, shown as a hamburger or an X. Shared by the open and close controls. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <div className="space-y-1.5">
      <span
        className={`block h-0.5 w-6 bg-cream-100 transition-transform duration-300 ${
          open ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-6 bg-cream-100 transition-opacity duration-300 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-6 bg-cream-100 transition-transform duration-300 ${
          open ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </div>
  );
}

export function SiteHeader({ settings }: { settings: HeaderSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While the menu is open the page behind it must not scroll, or closing drops
  // you somewhere you never chose to be. overflow:hidden also clamps the scroll
  // offset to 0, so the position is captured on open and put back on close.
  //
  // Nothing here moves the layout: the bar stays in flow and stays `sticky`.
  // An earlier attempt switched it to `fixed` so it would stay on screen, which
  // pulled its 80px out of the document and left the restored scroll ~50px off.
  // The overlay carries its own logo and close button instead — see below.
  useEffect(() => {
    if (!open) return;
    const { documentElement: html, body } = document;
    const y = window.scrollY;
    const from = window.location.pathname;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      // Only when the menu closed in place. Closing because a nav link was
      // tapped means a new page, which belongs at the top.
      if (window.location.pathname === from) window.scrollTo(0, y);
    };
  }, [open]);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    // No filter/transform on <header> itself: a backdrop-blur here would become
    // the containing block for the `fixed` overlay below and break it.
    <header className="sticky top-0 z-50">
      {/* Mobile menu — a full-viewport overlay anchored at `inset-0`, not below
          the bar. Locking the page with overflow:hidden removes the scrollport
          that `position: sticky` depends on, so the bar silently reverts to its
          static position at the top of the document. A panel that started at
          `top-20` therefore left a strip of the underlying page showing at the
          top of the screen on iOS, and the bar itself scrolled out of view.

          Covering the whole viewport makes the overlay independent of whatever
          the bar does, and the overlay carries its own logo and close button so
          there is always something to dismiss it with. `invisible` when closed
          keeps the links out of the tab order. */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 min-h-[100dvh] overflow-y-auto overscroll-contain bg-ink-950 transition-opacity duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Safe-area padding goes on the CONTENT, never on the black itself:
            insetting the overlay would recreate the exposed strip. */}
        <div className="flex min-h-full flex-col pt-[env(safe-area-inset-top)]">
          <div className="container-x flex h-20 shrink-0 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label={settings.businessName}
            >
              <Image
                src={settings.logo}
                alt=""
                width={48}
                height={48}
                className="h-11 w-11 rounded-md object-contain"
              />
              <span className="font-display text-lg uppercase tracking-wider2 text-cream-100">
                Train<span className="text-brand">Shane</span>
              </span>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center"
            >
              <MenuIcon open />
            </button>
          </div>

          <nav className="container-x flex flex-col gap-1 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-2">
            {navLinks.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-3 font-display text-base uppercase tracking-wider2 transition-colors ${
                    active ? "bg-white/5 text-brand" : "text-cream-300 hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <CtaButton
              cta={{ text: "Book Now", type: "booking" }}
              variant="primary"
              withArrow={false}
              className="mt-3"
            />
          </nav>
        </div>
      </div>

      <div
        className={`border-b transition-colors duration-300 ${
          scrolled
            ? "border-white/10 bg-ink-950/90 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="container-x flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label={settings.businessName}>
            <Image
              src={settings.logo}
              alt={settings.businessName}
              width={48}
              height={48}
              className="h-11 w-11 rounded-md object-contain"
              priority
            />
            <span className="font-display text-lg uppercase tracking-wider2 text-cream-100">
              Train<span className="text-brand">Shane</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-display text-sm uppercase tracking-wider2 transition-colors ${
                    active ? "text-brand" : "text-cream-300 hover:text-cream-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <CtaButton
              cta={{ text: "Book Now", type: "booking" }}
              variant="primary"
              withArrow={false}
              className="!px-5 !py-2.5"
            />
          </div>

          {/* Mobile toggle — opens the overlay; the overlay's own button closes it. */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <MenuIcon open={false} />
          </button>
        </div>
      </div>
    </header>
  );
}
