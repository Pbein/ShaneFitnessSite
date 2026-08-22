import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
  /**
   * Heading level. Sections are h2 (the default); pass "h1" when this heading
   * is the page's own title, so every route has exactly one h1.
   */
  as?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className = "",
  as: Heading = "h2",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <Reveal
      className={`${isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow && (
        <p
          className={`mb-4 flex items-center gap-3 font-display text-sm uppercase tracking-wider2 text-brand ${
            isCenter ? "justify-center" : ""
          }`}
        >
          <span className="accent-rule" />
          {eyebrow}
        </p>
      )}
      <Heading className="text-3xl leading-[1.05] text-cream-100 md:text-4xl lg:text-5xl">
        {title}
      </Heading>
      {intro && (
        <p className="mt-5 text-base leading-relaxed text-cream-300 md:text-lg">
          {intro}
        </p>
      )}
    </Reveal>
  );
}
