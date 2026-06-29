import { describe, it, expect } from "vitest";
import { resolveWelcome, PLAN_COPY, DEFAULT_COPY } from "@/lib/welcome";
import type { SiteSettings } from "@/content/site";

/** Minimal full SiteSettings fixture; tests override the booking fields. */
function makeSettings(overrides: Partial<SiteSettings> = {}): SiteSettings {
  return {
    businessName: "Train Shane",
    tagline: "Realistic. Sustainable. Results.",
    email: "shane@example.com",
    serviceArea: "DC / MD / VA",
    socialLinks: [],
    bookingUrl: "https://calendly.com/shane/main",
    essentialBookingUrl: "https://calendly.com/shane/essential",
    premiumBookingUrl: "https://calendly.com/shane/premium",
    inPersonBookingUrl: "https://calendly.com/shane/in-person",
    paymentLinks: [],
    logo: "/logo.webp",
    seo: { title: "t", description: "d" },
    ...overrides,
  };
}

describe("resolveWelcome — plan -> booking URL", () => {
  it("essential picks essentialBookingUrl", () => {
    const r = resolveWelcome("essential", makeSettings());
    expect(r.bookingUrl).toBe("https://calendly.com/shane/essential");
  });

  it("premium picks premiumBookingUrl", () => {
    const r = resolveWelcome("premium", makeSettings());
    expect(r.bookingUrl).toBe("https://calendly.com/shane/premium");
  });

  it("in-person picks inPersonBookingUrl", () => {
    const r = resolveWelcome("in-person", makeSettings());
    expect(r.bookingUrl).toBe("https://calendly.com/shane/in-person");
  });

  it("essential falls back to bookingUrl when its field is undefined", () => {
    const r = resolveWelcome("essential", makeSettings({ essentialBookingUrl: undefined }));
    expect(r.bookingUrl).toBe("https://calendly.com/shane/main");
  });

  it("premium falls back to bookingUrl when its field is empty", () => {
    const r = resolveWelcome("premium", makeSettings({ premiumBookingUrl: "" }));
    expect(r.bookingUrl).toBe("https://calendly.com/shane/main");
  });

  it("in-person falls back to bookingUrl when its field is empty", () => {
    const r = resolveWelcome("in-person", makeSettings({ inPersonBookingUrl: "" }));
    expect(r.bookingUrl).toBe("https://calendly.com/shane/main");
  });

  it("unknown plan uses bookingUrl", () => {
    const r = resolveWelcome("mystery", makeSettings());
    expect(r.bookingUrl).toBe("https://calendly.com/shane/main");
  });

  it("undefined plan uses bookingUrl", () => {
    const r = resolveWelcome(undefined, makeSettings());
    expect(r.bookingUrl).toBe("https://calendly.com/shane/main");
  });
});

describe("resolveWelcome — copy + subscription flag", () => {
  it("essential uses essential copy and subscription true", () => {
    const r = resolveWelcome("essential", makeSettings());
    expect(r.heading).toBe(PLAN_COPY.essential.heading);
    expect(r.heading).toBe("Welcome to Essential Coaching");
    expect(r.intro).toBe(PLAN_COPY.essential.intro);
    expect(r.subscription).toBe(true);
  });

  it("premium uses premium copy and subscription true", () => {
    const r = resolveWelcome("premium", makeSettings());
    expect(r.heading).toBe("Welcome to Premium Coaching");
    expect(r.subscription).toBe(true);
  });

  it("in-person uses in-person copy and subscription false", () => {
    const r = resolveWelcome("in-person", makeSettings());
    expect(r.heading).toBe("Payment received — let's get you on the calendar");
    expect(r.subscription).toBe(false);
  });

  it("unknown plan uses DEFAULT_COPY (subscription true)", () => {
    const r = resolveWelcome("mystery", makeSettings());
    expect(r.heading).toBe(DEFAULT_COPY.heading);
    expect(r.intro).toBe(DEFAULT_COPY.intro);
    expect(r.subscription).toBe(true);
  });

  it("undefined plan uses DEFAULT_COPY (subscription true)", () => {
    const r = resolveWelcome(undefined, makeSettings());
    expect(r.heading).toBe(DEFAULT_COPY.heading);
    expect(r.subscription).toBe(true);
  });
});
