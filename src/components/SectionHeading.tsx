import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className = "",
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
      <h2 className="text-3xl leading-[1.05] text-cream-100 md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {intro && (
        <p className="mt-5 text-base leading-relaxed text-cream-300 md:text-lg">
          {intro}
        </p>
      )}
    </Reveal>
  );
}
