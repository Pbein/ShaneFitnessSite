import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function EducationIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  );
}

export function CertificationIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9" r="6" />
      <path d="m9 14-1.5 7L12 19l4.5 2L15 14" />
    </svg>
  );
}

export function ExperienceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 6.5h11M6.5 17.5h11" />
      <rect x="4" y="4" width="2.5" height="16" rx="1" />
      <rect x="17.5" y="4" width="2.5" height="16" rx="1" />
      <path d="M2 9v6M22 9v6" />
    </svg>
  );
}

export function FocusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </svg>
  );
}

const iconMap = {
  education: EducationIcon,
  certification: CertificationIcon,
  experience: ExperienceIcon,
  focus: FocusIcon,
} as const;

export function CredentialIcon({
  name,
  ...props
}: { name: keyof typeof iconMap } & IconProps) {
  const Cmp = iconMap[name];
  return <Cmp {...props} />;
}
