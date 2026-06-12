/**
 * One-time seed (T6): recreate the current src/content/site.ts content as CMS
 * documents so the site can switch to CMS reads (T5) with nothing lost.
 *
 * Run: npx tsx scripts/seed.ts
 * Needs SANITY_API_WRITE_TOKEN (Editor) in .env.local.
 *
 * Idempotent on documents (createOrReplace with fixed _ids). Re-running uploads
 * fresh image assets each time — fine for a one-off seed.
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";

import {
  siteSettings,
  homepage,
  aboutPage,
  services,
  testimonials,
  resources,
  credentials,
  interests,
  type Cta,
} from "../src/content/site";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN in .env.local");
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

/** Upload a /public image and return an image field value referencing the asset. */
async function uploadImage(publicPath: string) {
  const abs = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  const buf = await readFile(abs);
  const asset = await client.assets.upload("image", buf, { filename: path.basename(abs) });
  console.log(`  ↑ uploaded ${path.basename(abs)} -> ${asset._id}`);
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

/** string[] paragraphs -> Portable Text blocks (plain, no marks). */
function blocks(paras: string[], prefix: string) {
  return paras.map((text, i) => ({
    _type: "block" as const,
    _key: `${prefix}${i}`,
    style: "normal" as const,
    markDefs: [],
    children: [{ _type: "span" as const, _key: `${prefix}s${i}`, text, marks: [] }],
  }));
}

function cta(c: Cta) {
  return { _type: "cta" as const, text: c.text, type: c.type, target: c.target };
}

async function run() {
  console.log(`Seeding ${projectId}/${dataset} ...`);

  // Services first (homepage references them).
  console.log("• services");
  for (const [i, s] of services.entries()) {
    await client.createOrReplace({
      _id: `service-${s.slug}`,
      _type: "service",
      name: s.name,
      slug: { _type: "slug", current: s.slug },
      shortDescription: s.shortDescription,
      price: s.price,
      priceNote: s.priceNote,
      duration: s.duration,
      ctaType: s.ctaType,
      ctaText: s.ctaText,
      paymentLink: s.paymentLink,
      included: s.included,
      whoFor: s.whoFor,
      approach: s.approach,
      featured: s.featured ?? false,
      order: i,
    });
  }

  console.log("• siteSettings");
  const logo = siteSettings.logo ? await uploadImage(siteSettings.logo) : undefined;
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    businessName: siteSettings.businessName,
    tagline: siteSettings.tagline,
    email: siteSettings.email,
    phone: siteSettings.phone,
    serviceArea: siteSettings.serviceArea,
    socialLinks: siteSettings.socialLinks.map((s, i) => ({
      _type: "socialLink",
      _key: `sl${i}`,
      platform: s.platform,
      url: s.url,
    })),
    bookingUrl: siteSettings.bookingUrl,
    primaryPaymentLink: siteSettings.primaryPaymentLink,
    paymentLinks: siteSettings.paymentLinks.map((p, i) => ({
      _type: "paymentLink",
      _key: `pl${i}`,
      label: p.label,
      url: p.url,
    })),
    logo,
    seo: siteSettings.seo,
  });

  console.log("• homepage");
  const heroImage = await uploadImage(homepage.hero.image);
  await client.createOrReplace({
    _id: "homepage",
    _type: "homepage",
    hero: {
      eyebrow: homepage.hero.eyebrow,
      headline: homepage.hero.headline,
      subheadline: homepage.hero.subheadline,
      image: heroImage,
      primaryCta: cta(homepage.hero.primaryCta),
      secondaryCta: cta(homepage.hero.secondaryCta),
    },
    whoHeading: homepage.whoHeading,
    whoIntro: homepage.whoIntro,
    whoFor: homepage.whoFor,
    philosophy: {
      heading: homepage.philosophy.heading,
      body: blocks(homepage.philosophy.body, "ph"),
    },
    featuredServices: homepage.featuredServiceSlugs.map((slug, i) => ({
      _type: "reference",
      _key: `fs${i}`,
      _ref: `service-${slug}`,
    })),
    mission: homepage.mission,
  });

  console.log("• aboutPage");
  const portrait = await uploadImage(aboutPage.portrait);
  await client.createOrReplace({
    _id: "aboutPage",
    _type: "aboutPage",
    heading: aboutPage.heading,
    portrait,
    story: blocks(aboutPage.story, "st"),
    goalHeading: aboutPage.goalHeading,
    goal: blocks(aboutPage.goal, "go"),
    mission: aboutPage.mission,
    credentials: credentials.map((c, i) => ({
      _type: "credential",
      _key: `cr${i}`,
      icon: c.icon,
      title: c.title,
      lines: c.lines,
    })),
    interests: interests.map((it, i) => ({
      _type: "interest",
      _key: `in${i}`,
      title: it.title,
      detail: it.detail,
    })),
  });

  console.log("• testimonials");
  for (const [i, t] of testimonials.entries()) {
    await client.createOrReplace({
      _id: `testimonial-${i + 1}`,
      _type: "testimonial",
      quote: t.quote,
      author: t.author,
      role: t.role,
      order: i,
    });
  }

  console.log("• resources");
  for (const [i, r] of resources.entries()) {
    await client.createOrReplace({
      _id: `resource-${i + 1}`,
      _type: "resource",
      title: r.title,
      summary: r.summary,
      category: r.category,
      order: i,
    });
  }

  console.log("✓ seed complete");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
