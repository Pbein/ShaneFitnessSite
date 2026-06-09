import type { Testimonial } from "@/content/site";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="card-surface flex h-full flex-col p-7">
      <span className="font-display text-5xl leading-none text-brand/40" aria-hidden>
        &ldquo;
      </span>
      <blockquote className="-mt-3 flex-1 text-base leading-relaxed text-cream-100">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-6 border-t border-white/10 pt-4">
        <p className="font-display text-sm uppercase tracking-wider2 text-cream-100">
          {testimonial.author}
        </p>
        <p className="mt-1 text-xs text-cream-500">{testimonial.role}</p>
      </figcaption>
    </figure>
  );
}
