"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import type { Cta } from "@/content/site";
import { resolveCtaHref, isExternal } from "@/lib/cta";
import { useCtaSettings } from "./CtaSettingsProvider";
import { ArrowIcon } from "./Icons";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-cream-100 hover:bg-brand-light shadow-[0_8px_30px_-12px_rgba(214,40,40,0.7)]",
  secondary:
    "bg-transparent text-cream-100 border border-white/20 hover:border-brand hover:text-white",
  ghost: "bg-transparent text-cream-100 hover:text-brand p-0",
};

interface CtaButtonProps {
  cta: Cta;
  variant?: Variant;
  className?: string;
  withArrow?: boolean;
}

/**
 * Renders a CMS-driven CTA. The destination is resolved from the CTA type
 * (booking / payment / link) against site settings (provided via context from
 * the server layout), so a non-technical owner can change where any button
 * points in the CMS without touching code.
 */
export function CtaButton({
  cta,
  variant = "primary",
  className = "",
  withArrow = true,
}: CtaButtonProps) {
  const settings = useCtaSettings();
  const href = resolveCtaHref(cta, settings);
  const external = isExternal(cta);

  // Conversion signal: booking/payment clicks are the money events.
  const onClick = () => track("cta_click", { type: cta.type, text: cta.text });

  const baseClasses =
    variant === "ghost"
      ? "group inline-flex items-center gap-2 font-display uppercase tracking-wider2 text-sm transition-colors"
      : "group inline-flex items-center justify-center gap-2 rounded-md px-7 py-3.5 font-display uppercase tracking-wider2 text-sm transition-all duration-300";

  const content = (
    <>
      <span>{cta.text}</span>
      {withArrow && (
        <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={`${baseClasses} ${variants[variant]} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {content}
    </Link>
  );
}
