import type { Service } from "@/content/site";
import { CtaButton } from "./CtaButton";
import { CheckIcon } from "./Icons";

interface ServiceCardProps {
  service: Service;
  /** Compact = home grid; full = services page detail. */
  variant?: "compact" | "full";
}

export function ServiceCard({ service, variant = "compact" }: ServiceCardProps) {
  const isFull = variant === "full";

  return (
    <div
      className={`card-surface flex h-full flex-col p-7 ${
        isFull ? "md:p-9" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-xl tracking-tightish text-cream-100 md:text-2xl">
          {service.name}
        </h3>
      </div>

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

      <div className="mt-7 pt-1">
        <CtaButton
          cta={{
            text: service.ctaText,
            type: service.ctaType,
            target: service.ctaType === "payment" ? service.paymentLink : undefined,
          }}
          variant={service.featured && service.slug === "virtual-coaching" ? "primary" : "secondary"}
          className="w-full"
        />
      </div>
    </div>
  );
}
