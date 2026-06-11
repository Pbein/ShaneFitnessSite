import { groq } from "next-sanity";

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  businessName, tagline, email, phone, serviceArea,
  socialLinks[]{ platform, url },
  bookingUrl, primaryPaymentLink,
  paymentLinks[]{ label, url },
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

export const servicesQuery = groq`*[_type == "service"] | order(order asc){
  "slug": slug.current, name, shortDescription, price, priceNote, duration,
  ctaType, ctaText, paymentLink, included, whoFor, approach, featured
}`;

export const serviceBySlugQuery = groq`*[_type == "service" && slug.current == $slug][0]{
  "slug": slug.current, name, shortDescription, price, priceNote, duration,
  ctaType, ctaText, paymentLink, included, whoFor, approach, featured
}`;

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(order asc){
  quote, author, role
}`;

export const resourcesQuery = groq`*[_type == "resource"] | order(order asc){
  title, summary, category
}`;
