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

  // While the full-screen menu is open, the page behind it must not scroll —
  // otherwise closing the menu drops you somewhere you never chose to be.
  // overflow:hidden (rather than the position:fixed trick) keeps the sticky bar
  // pinned where it is, but it does clamp the scroll offset to 0, so the
  // position has to be captured on open and put back on close.
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
    // the containing block for the `fixed` mobile panel below and break it.
    <header className="sticky top-0 z-50">
      <div
        className={`border-b transition-colors duration-300 ${
          scrolled || open
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

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 items-center justify-center lg:hidden"
          >
            <span className="sr-only">Menu</span>
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
          </button>
        </div>
      </div>

      {/* Mobile menu — fills everything below the bar down to the bottom of the
          viewport (top-20 matches the h-20 bar), so there is no strip of page
          showing through underneath it. `invisible` when closed also keeps the
          links out of the tab order. */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto overscroll-contain border-t border-white/10 bg-ink-950 transition-opacity duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="container-x flex min-h-full flex-col gap-1 py-4">
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
    </header>
  );
}
