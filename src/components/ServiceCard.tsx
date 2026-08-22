import type { Service } from "@/content/site";
import { CtaButton } from "./CtaButton";
import { CheckIcon } from "./Icons";

interface ServiceCardProps {
  service: Service;
  /** Compact = home grid; full = services page detail. */
  variant?: "compact" | "full";
}

/**
 * "Most Popular" is a badge, not part of the product name — but it was typed
 * into the CMS name field as a parenthetical. Strip it on the way out so the
 * card doesn't say it twice, and so the heading stays one line on desktop.
 */
function displayName(name: string): string {
  return name.replace(/\s*\(\s*most popular\s*\)\s*$/i, "").trim();
}

export function ServiceCard({ service, variant = "compact" }: ServiceCardProps) {
  const isFull = variant === "full";
  // `featured` is the CMS flag for the tier to push. It used to be ANDed with a
  // hardcoded slug that no longer exists, so no card ever rendered as featured.
  const featured = Boolean(service.featured);

  return (
    <div
      className={`card-surface relative flex h-full flex-col p-7 ${
        isFull ? "md:p-9" : ""
      } ${featured ? "border-brand/50 ring-1 ring-brand/30" : ""}`}
    >
      {featured && (
        <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 font-display text-[11px] uppercase tracking-wider2 text-cream-100">
          Most Popular
        </span>
      )}

      <h3 className="text-xl tracking-tightish text-cream-100 md:text-2xl">
        {displayName(service.name)}
      </h3>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl text-brand">{service.price}</span>
        {service.priceNote && (
          <span className="text-sm text-cream-500">{service.priceNote}</span>
        )}
      </div>
      {service.duration && (
        <p className="mt-1 text-xs uppercase tracking-wider2 text-cream-500">
          {service.duration}
        </p>
      )}

      <p className="mt-4 text-sm leading-relaxed text-cream-300">
        {service.shortDescription}
      </p>

      {isFull && service.included && (
        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-wider2 text-cream-500">
            What&apos;s included
          </p>
          <ul className="space-y-2.5">
            {service.included.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-cream-300">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isFull && service.whoFor && (
        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-wider2 text-cream-500">
            Who it&apos;s for
          </p>
          <ul className="space-y-2">
            {service.whoFor.map((item, i) => (
              <li key={i} className="text-sm text-cream-300">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isFull && service.approach && (
        <p className="mt-6 border-l-2 border-brand/60 pl-4 text-sm italic leading-relaxed text-cream-300">
          {service.approach}
        </p>
      )}

      {/* mt-auto pins every CTA to the bottom of the card, so buttons line up
          across a row even when the cards above them differ in length. */}
      <div className="mt-auto pt-7">
        <CtaButton
          cta={{
            text: service.ctaText,
            type: service.ctaType,
            target: service.ctaType === "payment" ? service.paymentLink : undefined,
          }}
          variant={featured ? "primary" : "secondary"}
          className="w-full"
        />
      </div>
    </div>
  );
}
