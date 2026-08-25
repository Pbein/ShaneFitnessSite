import { groq } from "next-sanity";

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  businessName, tagline, email, phone, serviceArea,
  // Hidden links are filtered here rather than in the component, so a link that
  // is switched off never reaches the browser at all. \`visible\` is absent on
  // links created before the field existed, and \`null != false\` is true in
  // GROQ, so those keep showing — the field only ever hides on an explicit no.
  socialLinks[visible != false]{ platform, url },
  bookingUrl, essentialBookingUrl, premiumBookingUrl, inPersonBookingUrl, primaryPaymentLink,
  paymentLinks[]{ label, url },
  manageSubscriptionUrl,
  logo,
  seo{ title, description, shareImage },
  googleAds{ conversionId, contactLabel, purchaseLabel }
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
 * Articles, newest first.
 *
 * Two gates, both required: `published == true` (Shane's switch) and a slug,
 * without which there is no URL to link the card to. `order` is the optional
 * "pin to top" override and is almost always null, so it sorts behind a large
 * coalesce default and the real ordering is by date.
 *
 * The body is deliberately NOT selected here — the index only needs a word count
 * for the reading estimate, and `pt::text` gives that without shipping every
 * article's full text to a page that renders none of it.
 */
export const postsQuery = groq`*[_type == "post" && published == true && defined(slug.current)]
  | order(coalesce(order, 9999) asc, publishedAt desc){
  title, excerpt, category, publishedAt,
  "slug": slug.current,
  "words": length(string::split(pt::text(body), " "))
}`;

export const postBySlugQuery = groq`*[_type == "post" && published == true && slug.current == $slug][0]{
  title, excerpt, category, publishedAt, body, seoTitle, seoDescription, shareImage,
  "slug": slug.current,
  "words": length(string::split(pt::text(body), " ")),
  "updatedAt": _updatedAt
}`;

/** Drives generateStaticParams and the per-article sitemap entries. */
export const postSlugsQuery = groq`*[_type == "post" && published == true && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt,
  publishedAt
}`;

/**
 * Drives which pages exist in the nav, the footer and the sitemap.
 *
 * Both pages are content-gated rather than toggled: Success Stories appears the
 * moment a testimonial is published, Resources the moment an article or a
 * link-out resource is. A boolean the owner could tick independently of the
 * content would let an empty page back onto the live site, which is exactly
 * what this replaced.
 */
export const navVisibilityQuery = groq`{
  "testimonials": count(*[_type == "testimonial"]),
  "resources": count(*[_type == "post" && published == true && defined(slug.current)])
    + count(*[_type == "resource" && published == true])
}`;
