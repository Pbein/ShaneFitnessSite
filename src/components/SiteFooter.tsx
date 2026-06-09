import Link from "next/link";
import Image from "next/image";
import { siteSettings } from "@/content/site";
import { InstagramIcon, MailIcon } from "./Icons";

export function SiteFooter() {
  const instagram = siteSettings.socialLinks.find((s) => s.platform === "instagram");

  return (
    <footer className="border-t border-white/10 bg-ink-900">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src={siteSettings.logo}
                alt={siteSettings.businessName}
                width={56}
                height={56}
                className="h-14 w-14 rounded-md object-contain"
              />
              <span className="font-display text-xl uppercase tracking-wider2">
                Train<span className="text-brand">Shane</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-300">
              {siteSettings.serviceArea}
            </p>
            <p className="mt-4 font-display text-sm uppercase tracking-wider2 text-brand">
              {siteSettings.tagline}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-4 text-sm tracking-wider2 text-cream-500">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "About", href: "/about" },
                { label: "Services", href: "/services" },
                { label: "Success Stories", href: "/success-stories" },
                { label: "Resources", href: "/resources" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream-300 transition-colors hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm tracking-wider2 text-cream-500">Get in touch</h4>
            <a
              href={`mailto:${siteSettings.email}`}
              className="flex items-center gap-2 text-sm text-cream-300 transition-colors hover:text-brand"
            >
              <MailIcon className="h-4 w-4" />
              {siteSettings.email}
            </a>
            {instagram && (
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 text-sm text-cream-300 transition-colors hover:text-brand"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-cream-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {/* year set at build */}
            {new Date().getFullYear()} {siteSettings.businessName}. All rights reserved.
          </p>
          <p>NASM Certified Personal Trainer · M.S. Health Promotion Management</p>
        </div>
      </div>
    </footer>
  );
}
