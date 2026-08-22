import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import { getSiteSettings, getNavVisibility } from "@/lib/sanity/fetch";
import { SITE_URL } from "@/lib/seo";
import { CtaSettingsProvider } from "@/components/CtaSettingsProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  if (!settings) return {};
  // Purpose-built 1200x630 share card. The old value was the 2500x1667 hero
  // photo at 514KB — the wrong aspect ratio for every social preview, so it got
  // cropped unpredictably, and heavy for something fetched by a scraper.
  const ogImage = { url: "/images/og-card.jpg", width: 1200, height: 630 };
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.seo.title,
      template: `%s · ${settings.businessName}`,
    },
    description: settings.seo.description,
    // No `alternates` here on purpose: metadata declared in a route-group layout
    // is inherited by every child, so a canonical set here makes all five pages
    // claim to be the homepage. Each page declares its own canonical instead.
    openGraph: {
      title: settings.seo.title,
      description: settings.seo.description,
      type: "website",
      url: SITE_URL,
      siteName: settings.businessName,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo.title,
      description: settings.seo.description,
      images: [ogImage.url],
    },
    // No `icons` here on purpose: declaring one overrides Next's file convention,
    // which is what serves src/app/icon.png and src/app/apple-icon.png. Pointing
    // the favicon at the Sanity CDN also meant an unsized remote fetch for a
    // 16px tab icon, and gave bookmarks/home-screen saves nothing to use.
  };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, nav] = await Promise.all([getSiteSettings(), getNavVisibility()]);
  if (!settings) throw new Error("Missing siteSettings document in the CMS");

  return (
    <div className={`${oswald.variable} ${inter.variable} min-h-screen flex flex-col`}>
      <CtaSettingsProvider
        value={{
          bookingUrl: settings.bookingUrl,
          primaryPaymentLink: settings.primaryPaymentLink,
          paymentLinks: settings.paymentLinks,
        }}
      >
        <SiteHeader
          settings={{ logo: settings.logo, businessName: settings.businessName }}
          nav={nav}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} nav={nav} />
      </CtaSettingsProvider>
      <Analytics />
    </div>
  );
}
