import { groq } from "next-sanity";

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  businessName, tagline, email, phone, serviceArea,
  socialLinks[]{ platform, url },
  bookingUrl, essentialBookingUrl, premiumBookingUrl, inPersonBookingUrl, primaryPaymentLink,
  paymentLinks[]{ label, url },
  manageSubscriptionUrl,
  logo,
  seo{ title, description }
}`;

export const homepageQuery = groq`*[_type == "homepage"][0]{
  hero{
    eyebrow, headline, subheadline, image,
    primaryCta{ text, type, target },
    secondaryCta{ text, type, target }
  },
  whoHeading, whoIntro, whoFor,
  philosophy{ heading, body },
  "featuredServiceSlugs": featuredServices[]->slug.current,
  mission
}`;

export const aboutPageQuery = groq`*[_type == "aboutPage"][0]{
  heading, portrait, story, goalHeading, goal, mission,
  credentials[]{ icon, title, lines },
  interests[]{ title, detail }
}`;

// Retired services (status == "retired") are excluded everywhere on the live site.
// Services authored before the status field exist with status == null, which
// `status != "retired"` correctly treats as active.
export const servicesQuery = groq`*[_type == "service" && status != "retired"] | order(order asc){
  "slug": slug.current, name, shortDescription, price, priceNote, duration,
  ctaType, ctaText, paymentLink, included, whoFor, approach, featured
}`;

export const serviceBySlugQuery = groq`*[_type == "service" && slug.current == $slug && status != "retired"][0]{
  "slug": slug.current, name, shortDescription, price, priceNote, duration,
  ctaType, ctaText, paymentLink, included, whoFor, approach, featured
}`;

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(order asc){
  quote, author, role
}`;

export const resourcesQuery = groq`*[_type == "resource" && published == true] | order(order asc){
  title, summary, category, url
}`;

/**
 * Drives which pages exist in the nav, the footer and the sitemap.
 *
 * Both pages are content-gated rather than toggled: Success Stories appears the
 * moment a testimonial is published, Resources the moment a resource is. A
 * boolean the owner could tick independently of the content would let an empty
 * page back onto the live site, which is exactly what this replaced.
 */
export const navVisibilityQuery = groq`{
  "testimonials": count(*[_type == "testimonial"]),
  "resources": count(*[_type == "resource" && published == true])
}`;
