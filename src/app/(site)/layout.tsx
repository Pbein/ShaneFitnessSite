import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import { getSiteSettings } from "@/lib/sanity/fetch";
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
  return {
    title: {
      default: settings.seo.title,
      template: `%s · ${settings.businessName}`,
    },
    description: settings.seo.description,
    openGraph: {
      title: settings.seo.title,
      description: settings.seo.description,
      type: "website",
    },
    icons: {
      icon: settings.logo,
    },
  };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
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
        <SiteHeader settings={{ logo: settings.logo, businessName: settings.businessName }} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
      </CtaSettingsProvider>
      <Analytics />
    </div>
  );
}
