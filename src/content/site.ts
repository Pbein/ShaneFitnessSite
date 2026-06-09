/**
 * Hardcoded content for the visual demo.
 *
 * This module intentionally mirrors the planned Sanity schema (siteSettings,
 * homepage, aboutPage, service, testimonial, galleryImage). When the CMS is
 * wired in, each export here is replaced by a typed GROQ fetch returning the
 * same shape — components consuming this data won't change.
 *
 * ⚠️ Stubs to replace with real values via the CMS later:
 *   - bookingUrl (Calendly / Google scheduling link)
 *   - paymentLinks (Stripe Payment Link URLs)
 *   - instagram handle/url, phone
 *   - real testimonials & gallery photos
 */

export type CtaType = "booking" | "payment" | "link";

export interface Cta {
  text: string;
  type: CtaType;
  /** For type "link" this is an href; booking/payment resolve from settings. */
  target?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface PaymentLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  email: string;
  phone?: string;
  serviceArea: string;
  socialLinks: SocialLink[];
  /** Calendly / Google scheduling URL — STUB. */
  bookingUrl: string;
  primaryPaymentLink?: string;
  paymentLinks: PaymentLink[];
  logo: string;
  seo: { title: string; description: string };
}

export const siteSettings: SiteSettings = {
  businessName: "Train Shane",
  tagline: "Realistic. Sustainable. Results.",
  email: "Shane12.sb@gmail.com",
  serviceArea: "Serving Washington, DC · Maryland · Virginia — and virtually, anywhere.",
  socialLinks: [
    // ⚠️ Replace with the real Instagram URL.
    { platform: "instagram", url: "https://instagram.com" },
  ],
  // ⚠️ STUB booking link — swap for the real Calendly/Google scheduling URL in the CMS.
  bookingUrl: "https://calendly.com/",
  paymentLinks: [
    // ⚠️ STUB Stripe Payment Links.
    { label: "In-Person Session", url: "https://buy.stripe.com/" },
    { label: "Virtual Coaching", url: "https://buy.stripe.com/" },
  ],
  logo: "/images/logo.webp",
  seo: {
    title: "Train Shane — Evidence-Based Personal Training",
    description:
      "NASM-certified personal training and virtual coaching for busy professionals, beginners, and athletes. Build sustainable habits and lasting results — realistic, simple, and built for your life.",
  },
};

/* ------------------------------------------------------------------ */
/* Credentials & focus areas (rendered as native cards)               */
/* ------------------------------------------------------------------ */

export interface Credential {
  icon: "education" | "certification" | "experience" | "focus";
  title: string;
  lines: string[];
}

export const credentials: Credential[] = [
  {
    icon: "education",
    title: "Education",
    lines: ["M.S. Health Promotion Management", "American University"],
  },
  {
    icon: "certification",
    title: "Certification",
    lines: ["NASM Certified", "Personal Trainer"],
  },
  {
    icon: "experience",
    title: "Experience",
    lines: ["General population, busy", "professionals & athletes of all levels"],
  },
  {
    icon: "focus",
    title: "Areas of Focus",
    lines: [
      "Strength & Conditioning",
      "Body Composition",
      "Chronic Pain & Movement",
      "Health Behavior Change",
    ],
  },
];

export interface Interest {
  title: string;
  detail: string;
}

export const interests: Interest[] = [
  { title: "Brazilian Jiu-Jitsu", detail: "Purple Belt" },
  { title: "Improving My Spanish", detail: "A lifelong student" },
  { title: "Mental Health", detail: "Passionate about mindset & well-being" },
];

/* ------------------------------------------------------------------ */
/* Homepage                                                            */
/* ------------------------------------------------------------------ */

export interface Homepage {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    image: string;
    primaryCta: Cta;
    secondaryCta: Cta;
  };
  whoHeading: string;
  whoIntro: string;
  whoFor: string[];
  philosophy: { heading: string; body: string[] };
  featuredServiceSlugs: string[];
  mission: string;
}

export const homepage: Homepage = {
  hero: {
    eyebrow: "Evidence-Based Personal Training",
    headline: "Strength that fits the life you already have.",
    subheadline:
      "Helping busy professionals, beginners, and athletes build strength, confidence, and sustainable habits — without extreme diets or complicated plans.",
    image: "/images/hero-dumbbell.jpg",
    primaryCta: { text: "Book a Free Consultation", type: "booking" },
    secondaryCta: { text: "View Coaching Options", type: "link", target: "/services" },
  },
  whoHeading: "Too much information. Not enough direction.",
  whoIntro:
    "Most people don't fall short because they lack motivation or information — they have too much of it. Social media, podcasts, trends, and conflicting advice make it hard to know where to begin. My job is to cut through the noise and give you a clear, simple path you'll actually enjoy.",
  whoFor: [
    "Busy professionals with limited time",
    "People looking to lose fat and build muscle",
    "Beginners who feel overwhelmed and don't know where to start",
    "Anyone seeking a simple, sustainable approach to health",
  ],
  philosophy: {
    heading: "Sustainable results beat extreme solutions",
    body: [
      "After years of working toward my own goals — and helping others reach theirs — I learned that lasting results rarely come from extremes. They come from building simple habits and systems that fit into everyday life.",
      "No extreme diets. No spending hours in the gym. No fitness-industry gimmicks. Just a personalized plan, expert guidance, and accountability.",
    ],
  },
  featuredServiceSlugs: ["free-consultation", "in-person-session", "virtual-coaching"],
  mission:
    "My mission is simple: help you build sustainable habits, improve your health, and become the strongest version of yourself — physically and mentally.",
};

/* ------------------------------------------------------------------ */
/* About page                                                          */
/* ------------------------------------------------------------------ */

export interface AboutPage {
  heading: string;
  portrait: string;
  story: string[];
  goalHeading: string;
  goal: string[];
  mission: string;
}

export const aboutPage: AboutPage = {
  heading: "About Shane",
  portrait: "/images/about-portrait-inclusive.png",
  story: [
    "I'm a NASM Certified Personal Trainer with a Master of Science in Health Promotion Management from American University. My background combines evidence-based health education, behavior-change research, and hands-on coaching experience working with a wide range of individuals — including beginners, busy professionals, recreational athletes, and those looking to improve their overall health and quality of life.",
    "My passion for health and wellness began more than a decade ago through my own fitness journey. Over the years, I've spent countless hours learning through both formal education and personal trial and error, exploring different training methods, nutrition strategies, recovery techniques, and approaches to long-term health. That experience taught me that sustainable results rarely come from extremes. Instead, they come from building simple habits and systems that fit into everyday life.",
    "Through my graduate studies, I developed a strong interest in health behavior change and the psychology behind lasting lifestyle transformation. My research focused on understanding how people build healthy habits, overcome barriers, and create meaningful change that can be maintained long-term. This perspective continues to shape my coaching philosophy today.",
    "I also have a particular interest in chronic pain, movement, and the relationship between physical and mental well-being. I understand that many people face challenges that extend beyond simply knowing what exercises to do. Stress, pain, previous injuries, confidence, and daily life demands all play a role in long-term success, and I strive to help clients navigate those challenges with a realistic and sustainable approach.",
    "Outside of coaching, my other interests include Brazilian Jiu-Jitsu, continually improving my Spanish, and a strong interest in mental health, personal growth, and overall well-being. These passions have reinforced my belief that health is about much more than appearance. It's about building resilience, enjoyment, confidence, physical capability, and a lifestyle that supports the life you want to live.",
    "Whether you're looking to improve your body composition, gain strength, establish a consistent exercise routine, or simply feel healthier and more confident, my goal is to help you create a clear, practical path forward that fits your lifestyle and produces lasting results.",
  ],
  goalHeading: "My Goal for You",
  goal: [
    "Both my journey and relationship with all things health and exercise have been anything but linear.",
    "My initial interest in health and wellness began more than 15 years ago. Since then, I've explored many concepts, trends, routines, diets, supplements, and so on — all for better or for worse — each taking me down a unique path of learning and understanding.",
    "After years of working toward my own fitness goals, and working with others to achieve their own, I gathered the following:",
    "People's inability to reach their goals isn't from a lack of information, nor a lack of motivation. It's typically the opposite — there's too much information nowadays, from social media, podcasts, societal trends, medical advice, and more, that people become confused and overwhelmed about where to begin, and never even take the first step forward.",
    "My goal is to provide you with a foundation to begin or enhance an exercise routine specific to you — one that is simple and sustainable, and above all, that you ENJOY!",
    "I want to teach you enough that eventually you don't need me at all!",
  ],
  mission:
    "My mission is simple: help you build sustainable habits, improve your health, and become the strongest version of yourself — physically and mentally.",
};

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export interface Service {
  slug: string;
  name: string;
  shortDescription: string;
  price: string;
  priceNote?: string;
  duration?: string;
  /** "booking" → uses settings.bookingUrl; "payment" → uses payment link. */
  ctaType: CtaType;
  ctaText: string;
  paymentLink?: string;
  included?: string[];
  whoFor?: string[];
  approach?: string;
  featured?: boolean;
}

export const services: Service[] = [
  {
    slug: "free-consultation",
    name: "Free Consultation",
    shortDescription:
      "Let's talk through your goals, your current routine, and whether coaching is the right fit for you. No pressure, no obligation.",
    price: "Free",
    duration: "~30 minutes",
    ctaType: "booking",
    ctaText: "Book Your Consultation",
    featured: true,
  },
  {
    slug: "in-person-session",
    name: "In-Person 1-on-1 Session",
    shortDescription:
      "A focused, one-hour personal training session for clients local to DC, Maryland, and Virginia. Hands-on coaching, technique, and a plan you can repeat.",
    price: "$100",
    priceNote: "per 1-hour session",
    duration: "1 hour",
    ctaType: "payment",
    ctaText: "Book a Session",
    paymentLink: "https://buy.stripe.com/", // ⚠️ STUB
    featured: true,
  },
  {
    slug: "virtual-coaching",
    name: "Virtual Coaching",
    shortDescription:
      "Personalized coaching designed for busy professionals, beginners, and anyone looking to improve their body composition — without spending hours in the gym.",
    price: "$200",
    priceNote: "per month",
    ctaType: "payment",
    ctaText: "Start Coaching",
    paymentLink: "https://buy.stripe.com/", // ⚠️ STUB
    featured: true,
    included: [
      "Customized workout program tailored to your goals, schedule, experience, and equipment",
      "Sustainable nutrition guidance for fat loss, muscle gain, and long-term success",
      "Weekly check-ins to review progress and make adjustments",
      "Unlimited messaging support for accountability throughout the week",
      "Exercise technique and form feedback through video review",
      "Ongoing program modifications as your goals and fitness evolve",
      "Progress tracking — weight, measurements, strength, habits, and consistency",
      "Behavior-change coaching grounded in evidence-based principles",
    ],
    whoFor: [
      "Busy professionals with limited time",
      "People looking to lose fat and build muscle",
      "Beginners who feel overwhelmed and don't know where to start",
      "Anyone seeking a simple, sustainable approach to health and fitness",
    ],
    approach:
      "No extreme diets. No spending hours in the gym. No fitness-industry gimmicks. Just a personalized plan, expert guidance, and accountability to help you build sustainable habits and achieve lasting results.",
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Testimonials (⚠️ SAMPLE content — replace with real client quotes)  */
/* ------------------------------------------------------------------ */

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Shane helped me stop chasing every new diet and finally build a routine I actually stick to. I'm stronger than I've ever been and it fits around a full-time job.",
    author: "Sample Client",
    role: "Busy Professional · Virtual Coaching",
  },
  {
    quote:
      "I came in overwhelmed and not knowing where to start. Shane made it simple, explained the why behind everything, and kept me accountable. Game-changer.",
    author: "Sample Client",
    role: "Beginner · In-Person Training",
  },
  {
    quote:
      "What I appreciate most is how realistic the approach is. No extremes, no gimmicks — just steady progress I can actually maintain.",
    author: "Sample Client",
    role: "Body Composition · Virtual Coaching",
  },
];

/* ------------------------------------------------------------------ */
/* Resources (⚠️ SAMPLE — placeholder articles)                        */
/* ------------------------------------------------------------------ */

export interface Resource {
  title: string;
  summary: string;
  category: string;
}

export const resources: Resource[] = [
  {
    title: "Why sustainable beats extreme — every time",
    summary:
      "The science behind why crash diets fail and how small, consistent habits compound into lasting change.",
    category: "Mindset",
  },
  {
    title: "The busy professional's guide to strength training",
    summary:
      "How to build real strength in three focused sessions a week — even with a packed calendar.",
    category: "Training",
  },
  {
    title: "Eating for fat loss without tracking every calorie",
    summary:
      "Simple, flexible nutrition principles that work in the real world, with no food off-limits.",
    category: "Nutrition",
  },
];
