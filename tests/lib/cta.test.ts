import { describe, it, expect } from "vitest";
import { resolveCtaHref, isExternal, type CtaSettings } from "@/lib/cta";
import type { Cta } from "@/content/site";

const settings: CtaSettings = {
  bookingUrl: "https://calendly.com/shane/intro",
  primaryPaymentLink: "https://buy.stripe.com/primary",
  paymentLinks: [
    { label: "First", url: "https://buy.stripe.com/first" },
    { label: "Second", url: "https://buy.stripe.com/second" },
  ],
};

describe("resolveCtaHref", () => {
  describe("booking", () => {
    it("returns settings.bookingUrl by default", () => {
      const cta: Cta = { text: "Book", type: "booking" };
      expect(resolveCtaHref(cta, settings)).toBe(settings.bookingUrl);
    });

    it("uses cta.target when provided as an override", () => {
      const cta: Cta = { text: "Book", type: "booking", target: "https://calendly.com/override" };
      expect(resolveCtaHref(cta, settings)).toBe("https://calendly.com/override");
    });
  });

  describe("payment", () => {
    it("returns cta.target when provided", () => {
      const cta: Cta = { text: "Pay", type: "payment", target: "https://buy.stripe.com/explicit" };
      expect(resolveCtaHref(cta, settings)).toBe("https://buy.stripe.com/explicit");
    });

    it("falls back to settings.primaryPaymentLink when no target", () => {
      const cta: Cta = { text: "Pay", type: "payment" };
      expect(resolveCtaHref(cta, settings)).toBe(settings.primaryPaymentLink);
    });

    it("falls back to paymentLinks[0].url when no target or primary", () => {
      const cta: Cta = { text: "Pay", type: "payment" };
      const s: CtaSettings = { ...settings, primaryPaymentLink: undefined };
      expect(resolveCtaHref(cta, s)).toBe("https://buy.stripe.com/first");
    });

    it("returns '#' when nothing is configured", () => {
      const cta: Cta = { text: "Pay", type: "payment" };
      const s: CtaSettings = { bookingUrl: settings.bookingUrl, paymentLinks: [] };
      expect(resolveCtaHref(cta, s)).toBe("#");
    });
  });

  describe("link", () => {
    it("returns cta.target when provided", () => {
      const cta: Cta = { text: "Go", type: "link", target: "/services" };
      expect(resolveCtaHref(cta, settings)).toBe("/services");
    });

    it("returns '#' when no target", () => {
      const cta: Cta = { text: "Go", type: "link" };
      expect(resolveCtaHref(cta, settings)).toBe("#");
    });
  });
});

describe("isExternal", () => {
  it("is true for booking", () => {
    expect(isExternal({ text: "Book", type: "booking" })).toBe(true);
  });

  it("is true for payment", () => {
    expect(isExternal({ text: "Pay", type: "payment" })).toBe(true);
  });

  it("is false for link", () => {
    expect(isExternal({ text: "Go", type: "link", target: "/services" })).toBe(false);
  });
});
