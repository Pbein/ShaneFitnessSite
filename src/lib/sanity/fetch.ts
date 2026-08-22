import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import type {
  SiteSettings,
  Homepage,
  AboutPage,
  Service,
  Testimonial,
  Resource,
  Credential,
  Interest,
  Cta,
  CtaType,
  NavVisibility,
} from "@/content/site";

import { client } from "./client";
import { imageUrl } from "./image";
import {
  siteSettingsQuery,
  homepageQuery,
  aboutPageQuery,
  servicesQuery,
  serviceBySlugQuery,
  testimonialsQuery,
  resourcesQuery,
  navVisibilityQuery,
} from "./queries";

/* ------------------------------------------------------------------ */
/* Raw shapes + helpers                                                */
/* ------------------------------------------------------------------ */

type PortableBlock = { _type?: string; children?: { text?: string }[] };

/** Flatten locked-plain Portable Text to one string per paragraph block. */
function paragraphs(blocks?: PortableBlock[] | null): string[] {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .filter((b) => b?._type === "block" && Array.isArray(b.children))
    .map((b) => (b.children ?? []).map((c) => c?.text ?? "").join("").trim())
    .filter((t) => t.length > 0);
}

function cta(raw: { text?: string; type?: string; target?: string } | undefined, fallback: Cta): Cta {
  if (!raw?.text || !raw?.type) return fallback;
  return { text: raw.text, type: raw.type as CtaType, target: raw.target };
}

// All reads are cached, tagged "sanity", and revalidated on a 60s fallback interval.
// A Sanity publish hits /api/revalidate, which calls revalidateTag("sanity") to
// refresh every CMS-backed page immediately (no waiting for the 60s interval).
const fetchOpts = { next: { revalidate: 60, tags: ["sanity"] } };

/* ------------------------------------------------------------------ */
/* Typed fetchers — each returns the same shape as the site.ts export  */
/* ------------------------------------------------------------------ */

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const r = await client.fetch<RawSiteSettings | null>(siteSettingsQuery, {}, fetchOpts);
  if (!r) return null;
  return {
    businessName: r.businessName,
    tagline: r.tagline,
    email: r.email,
    phone: r.phone,
    serviceArea: r.serviceArea,
    socialLinks: (r.socialLinks ?? []).map((s) => ({ platform: s.platform, url: s.url })),
    bookingUrl: r.bookingUrl,
    essentialBookingUrl: r.essentialBookingUrl,
    premiumBookingUrl: r.premiumBookingUrl,
    inPersonBookingUrl: r.inPersonBookingUrl,
    primaryPaymentLink: r.primaryPaymentLink,
    paymentLinks: (r.paymentLinks ?? []).map((p) => ({ label: p.label, url: p.url })),
    manageSubscriptionUrl: r.manageSubscriptionUrl,
    logo: imageUrl(r.logo),
    seo: { title: r.seo?.title ?? "", description: r.seo?.description ?? "" },
  };
}

export async function getHomepage(): Promise<Homepage | null> {
  const r = await client.fetch<RawHomepage | null>(homepageQuery, {}, fetchOpts);
  if (!r) return null;
  return {
    hero: {
      eyebrow: r.hero?.eyebrow ?? "",
      headline: r.hero?.headline ?? "",
      subheadline: r.hero?.subheadline ?? "",
      image: imageUrl(r.hero?.image),
      primaryCta: cta(r.hero?.primaryCta, { text: "", type: "link" }),
      secondaryCta: cta(r.hero?.secondaryCta, { text: "", type: "link" }),
    },
    whoHeading: r.whoHeading ?? "",
    whoIntro: r.whoIntro ?? "",
    whoFor: r.whoFor ?? [],
    philosophy: {
      heading: r.philosophy?.heading ?? "",
      body: paragraphs(r.philosophy?.body),
    },
    featuredServiceSlugs: r.featuredServiceSlugs ?? [],
    mission: r.mission ?? "",
  };
}

export async function getAboutPage(): Promise<AboutPage | null> {
  const r = await client.fetch<RawAboutPage | null>(aboutPageQuery, {}, fetchOpts);
  if (!r) return null;
  return {
    heading: r.heading,
    portrait: imageUrl(r.portrait),
    story: paragraphs(r.story),
    goalHeading: r.goalHeading ?? "",
    goal: paragraphs(r.goal),
    mission: r.mission ?? "",
  };
}

export async function getCredentials(): Promise<Credential[]> {
  const r = await client.fetch<RawAboutPage | null>(aboutPageQuery, {}, fetchOpts);
  return (r?.credentials ?? []).map((c) => ({
    icon: c.icon,
    title: c.title,
    lines: c.lines ?? [],
  }));
}

export async function getInterests(): Promise<Interest[]> {
  const r = await client.fetch<RawAboutPage | null>(aboutPageQuery, {}, fetchOpts);
  return (r?.interests ?? []).map((i) => ({ title: i.title, detail: i.detail }));
}

/** Trim CMS free-text. Stray trailing spaces are easy to type and show up in
 *  the layout as odd gaps (e.g. "$100 " next to its price note). */
const t = (s?: string) => s?.trim();

function toService(r: RawService): Service {
  return {
    slug: r.slug,
    name: t(r.name) ?? "",
    shortDescription: t(r.shortDescription) ?? "",
    price: t(r.price) ?? "",
    priceNote: t(r.priceNote),
    duration: t(r.duration),
    ctaType: (r.ctaType ?? "link") as CtaType,
    ctaText: t(r.ctaText) ?? "",
    paymentLink: r.paymentLink,
    included: r.included,
    whoFor: r.whoFor,
    approach: r.approach,
    featured: r.featured,
  };
}

export async function getServices(): Promise<Service[]> {
  const r = await client.fetch<RawService[]>(servicesQuery, {}, fetchOpts);
  return (r ?? []).map(toService);
}

export async function getService(slug: string): Promise<Service | undefined> {
  const r = await client.fetch<RawService | null>(serviceBySlugQuery, { slug }, fetchOpts);
  return r ? toService(r) : undefined;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const r = await client.fetch<RawTestimonial[]>(testimonialsQuery, {}, fetchOpts);
  return (r ?? []).map((t) => ({ quote: t.quote, author: t.author, role: t.role ?? "" }));
}

export async function getResources(): Promise<Resource[]> {
  const r = await client.fetch<RawResource[]>(resourcesQuery, {}, fetchOpts);
  return (r ?? []).map((x) => ({
    title: x.title,
    summary: x.summary ?? "",
    category: x.category ?? "",
    url: x.url,
  }));
}

export async function getNavVisibility(): Promise<NavVisibility> {
  const r = await client.fetch<{ testimonials: number; resources: number } | null>(
    navVisibilityQuery,
    {},
    fetchOpts,
  );
  return {
    successStories: (r?.testimonials ?? 0) > 0,
    resources: (r?.resources ?? 0) > 0,
  };
}

/* ------------------------------------------------------------------ */
/* Raw query result types (CMS-side shapes before mapping)             */
/* ------------------------------------------------------------------ */

type RawSiteSettings = {
  businessName: string;
  tagline: string;
  email: string;
  phone?: string;
  serviceArea: string;
  socialLinks?: { platform: string; url: string }[];
  bookingUrl: string;
  essentialBookingUrl?: string;
  premiumBookingUrl?: string;
  inPersonBookingUrl?: string;
  primaryPaymentLink?: string;
  paymentLinks?: { label: string; url: string }[];
  manageSubscriptionUrl?: string;
  logo?: SanityImageSource;
  seo?: { title?: string; description?: string };
};

type RawHomepage = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    image?: SanityImageSource;
    primaryCta?: { text?: string; type?: string; target?: string };
    secondaryCta?: { text?: string; type?: string; target?: string };
  };
  whoHeading?: string;
  whoIntro?: string;
  whoFor?: string[];
  philosophy?: { heading?: string; body?: PortableBlock[] };
  featuredServiceSlugs?: string[];
  mission?: string;
};

type RawAboutPage = {
  heading: string;
  portrait?: SanityImageSource;
  story?: PortableBlock[];
  goalHeading?: string;
  goal?: PortableBlock[];
  mission?: string;
  credentials?: { icon: Credential["icon"]; title: string; lines?: string[] }[];
  interests?: { title: string; detail: string }[];
};

type RawService = {
  slug: string;
  name: string;
  shortDescription?: string;
  price?: string;
  priceNote?: string;
  duration?: string;
  ctaType?: string;
  ctaText?: string;
  paymentLink?: string;
  included?: string[];
  whoFor?: string[];
  approach?: string;
  featured?: boolean;
};

type RawTestimonial = { quote: string; author: string; role?: string };
type RawResource = { title: string; summary?: string; category?: string; url?: string };
