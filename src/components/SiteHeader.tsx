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

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-ink-950/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
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

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-white/10 bg-ink-950 transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-[28rem]" : "max-h-0 border-transparent"
        }`}
      >
        <nav className="container-x flex flex-col gap-1 py-4">
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
