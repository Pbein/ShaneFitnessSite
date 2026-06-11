import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "../globals.css";
import { siteSettings } from "@/content/site";
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

export const metadata: Metadata = {
  title: {
    default: siteSettings.seo.title,
    template: `%s · ${siteSettings.businessName}`,
  },
  description: siteSettings.seo.description,
  openGraph: {
    title: siteSettings.seo.title,
    description: siteSettings.seo.description,
    type: "website",
  },
  icons: {
    icon: siteSettings.logo,
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${oswald.variable} ${inter.variable} min-h-screen flex flex-col`}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
